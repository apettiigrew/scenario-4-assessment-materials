# Task 3: Edge Cases & Challenges

---

## Edge Case 1: OMS Returns HTTP 200 with an Error Embedded in the Response Body

**Category:** Technical failure

**Scenario:**
The OMS API documentation explicitly warns: *"Error messages are inconsistent. Some errors return 200 with error in body. Always check response body for error indicators."* This means the Order Processor fetches order details via `GET /orders/{order_id}`, receives an HTTP 200, and treats the response as valid order data. But the body actually contains an error payload — perhaps a partial response, a database timeout message wrapped in JSON, or a malformed record. The service parses this garbage data, constructs a malformed rate request, and sends it to Shipium. Shipium either rejects it (best case) or processes it with wrong data (worst case — wrong weight, wrong address, wrong carrier selection).

This is especially dangerous because standard HTTP client retry logic and circuit breakers are designed to trigger on 4xx/5xx status codes. A 200-with-error slips through every standard safeguard.

**Impact if not handled:**

- Shipments created with incorrect addresses, weights, or dimensions — leading to carrier surcharges, misrouted packages, or delivery failures.
- Phantom shipments where labels are generated for orders that don't actually exist or have already been cancelled.
- Silent data corruption: the pipeline appears healthy (no error metrics firing) while producing bad shipments. The problem is only discovered when customers complain or when carrier invoices don't match.
- At 50K orders/day, even a 0.1% false-200 rate means 50 bad shipments per day.

**How to address it:**

1. **Schema validation on every OMS response.** Before accepting any response body, validate it against a strict JSON schema (required fields: `order_id`, `type`, `status`, `shipping_address`, `items` with at least one entry). If the payload doesn't match, treat it as a failed request regardless of HTTP status code.
2. **Semantic validation layer.** Check for known error indicators in the response body — fields like `"error"`, `"exception"`, `"message"` at the top level, or null values in required fields (`shipping_address.postal_code`, `items[].weight_oz`). Log and reject these.
3. **Checksum/hash comparison.** When an order is re-fetched (e.g., during retry), compare the hash of key fields against the previously cached version. If critical fields have changed unexpectedly (address, item count), flag for human review.
4. **Dedicated metric: `oms_response_validation_failures`.** Alert when this rate exceeds baseline so operations can investigate whether the OMS is degrading in a way that doesn't show up as HTTP errors.

---

## Edge Case 2: Order Cancelled in OMS After Shipment Already Created in Shipium

**Category:** Business logic / race condition

**Scenario:**
The OMS Poller discovers order `ORD-2026-005432` at 10:00:00 with status `pending`. The order enters the pipeline: Order Processor fetches details, Rate Shopping selects a carrier, Shipment Creator calls Shipium `POST /shipments` and receives a tracking number and label at 10:04:30. Meanwhile, at 10:02:00 — while the order was mid-pipeline — a customer service rep cancels the order in the OMS, changing its status to `cancelled`. The OMS Writer attempts to write shipping info back to the OMS at 10:05:00 and either succeeds (OMS doesn't validate status transitions) or fails (OMS rejects writes to cancelled orders).

Either way, a real shipment now exists in the carrier network for an order the customer cancelled. A label has been generated. The carrier may pick up the package.

This race condition is inherent to poll-based architectures with multi-minute processing pipelines and no webhook notifications from the OMS.

**Impact if not handled:**

- Packages shipped to customers who cancelled — requiring costly return logistics and refund processing.
- Wasted carrier spend on labels and shipments that should never have been created.
- Customer frustration: they cancelled an order and then receive the package anyway.
- Inventory discrepancy: the item leaves the warehouse but the OMS shows it as cancelled/available.
- At ~2-3% cancellation rate (industry average) on 50K orders/day, this could affect 1,000-1,500 orders daily if the timing window overlaps.

**How to address it:**

1. **Pre-shipment status recheck.** Immediately before the Shipment Creator calls Shipium `POST /shipments`, make one final `GET /orders/{order_id}` call to the OMS to verify the order is still in a shippable status (`pending`, `processing`, or `ready_to_ship`). This narrows the race window from minutes to seconds. This call is cache-bypassing (force a fresh read) but only happens once per order.
2. **Shipium void/cancel API.** If a cancellation is detected after shipment creation, immediately call Shipium to void the shipment and cancel the label before the carrier picks up the package. Build a reconciliation job that polls recently shipped orders and cross-references their OMS status every 15 minutes.
3. **State machine enforcement in PostgreSQL.** Track each order's pipeline state (`discovered → processing → rated → shipped → written_back`). If the reconciliation job detects a cancellation, transition the state to `cancelled_post_ship` and trigger an alert + void workflow.
4. **Cancellation polling.** Add a secondary poll query (`GET /orders?status=cancelled&updated_after={cursor}`) on a 60-second interval to proactively discover cancellations. When a cancelled order is found that's already in the pipeline, remove it from the queue (RabbitMQ message rejection) or void the shipment.

---

## Edge Case 3: Peak Season API Budget Exhaustion (150K Orders/Day)

**Category:** Performance / scale

**Scenario:**
During November-December peak season, order volume triples from 50K to 150K orders/day. The OMS API budget is fixed at 100 requests/minute (144,000/day). The steady-state budget math for 50K orders/day shows ~82 req/min — workable but not generous. At 150K orders/day, the math breaks:


| Operation           | 50K/day (req/min) | 150K/day (req/min) |
| ------------------- | ----------------- | ------------------ |
| Poll new orders     | 2                 | 2                  |
| Fetch order details | 35                | 104                |
| Write shipping info | 35                | 104                |
| Tracking milestones | 10                | 30                 |
| Warehouse config    | <1                | <1                 |
| **Total**           | **~82**           | **~240**           |


At 240 req/min needed against a 100 req/min limit, the system cannot process orders as fast as they arrive. Queues grow unboundedly. Orders age past their carrier pickup cutoffs. Marketplace SLAs are violated. The backlog compounds daily until peak season ends.

This is not a transient spike — it's a sustained 6-8 week period where demand exceeds capacity.

**Impact if not handled:**

- Orders queued for hours or days, missing ship-by dates and SLA deadlines.
- Amazon Prime orders (must ship within 24h) systematically violated, risking RetailCo's marketplace seller account.
- Carrier pickup windows missed, pushing next-day deliveries to two-day, two-day to three-day.
- Customer satisfaction collapse during the most revenue-critical period of the year.
- 68% on-time delivery rate (the current pain point) gets *worse* instead of better.

**How to address it:**

1. **Negotiate a peak-season API key or rate limit increase** with RetailCo's OMS team. This is the most impactful mitigation. Even doubling the limit to 200 req/min would make peak feasible. Surface this as a formal requirement during the January 15 follow-up meeting.
2. **Eliminate redundant detail fetches.** During peak, the poller's `GET /orders?status=pending&limit=500` response already contains partial order data (order_id, type, status, customer, shipping_address, items summary). If the list endpoint returns enough data to classify eligibility and construct a rate request, skip the individual `GET /orders/{id}` call entirely for standard orders. This cuts the largest budget item nearly in half.
3. **Extend cache TTLs during peak.** Increase order detail cache to 4 hours and rate cache to 4 hours. Accept slightly staler data in exchange for dramatically fewer OMS calls.
4. **Prioritize by order type.** When the queue backlog exceeds a threshold, prioritize marketplace orders (SLA deadlines) and rush orders over standard retail/ecommerce. Standard orders can tolerate a longer processing delay without SLA consequences.
5. **Pre-season load test.** In September-October, run a load test simulating 150K orders/day against the OMS test environment to identify the actual breaking point and validate that mitigations are sufficient.

---

## Edge Case 4: Missing or Incorrect Weight and Dimensions on Order Items

**Category:** Data quality

**Scenario:**
The data quality notes from the OMS documentation state: *"Weight/dimensions occasionally estimated"* and *"Dimensions occasionally missing or incorrect."* The sample data shows items with weight in ounces and dimensions in inches, but these values are sometimes approximations entered by merchandising teams, not measured from the physical product. A "Winter Jacket" listed at 32oz and 16×14×4 inches might actually weigh 24oz when packed and measure 12×10×3 folded. A "Spray Paint Set (6 cans)" has accurate individual can dimensions but the set ships in a box that's a different size entirely.

When the Rate Shopping Service calls Shipium `POST /rates`, incorrect weight/dimensions produce incorrect rates. The carrier charges based on actual package measurements (dimensional weight), not what the OMS says. The rate Shipium quoted at $12.45 becomes a $19.80 carrier surcharge after dimensional weight adjustment.

**Impact if not handled:**

- Systematic underestimation of shipping costs, undermining the 15% cost reduction goal. If dimensional weight surcharges apply to even 10% of orders, the "savings" from carrier optimization are eaten by correction fees.
- Carrier disputes and invoice reconciliation failures. RetailCo's logistics team spends time investigating why carrier invoices don't match Shipium's quoted rates.
- Incorrect delivery estimates: weight affects transit time for ground shipments.
- Over time, the Shipium analytics data becomes unreliable because cost-per-shipment metrics are based on quoted rates, not actual charges.

**How to address it:**

1. **Validation bounds in the Order Processor.** Define min/max weight and dimension thresholds per product category. A fashion item (clothing, accessories) shouldn't weigh more than 10 lbs; a home goods item shouldn't exceed 50 lbs. Flag outliers for review before sending to rate shopping.
2. **Dimensional weight sanity check.** Calculate the dimensional weight (`L × W × H / carrier_dim_factor`) and compare it to the stated weight. If dimensional weight exceeds stated weight by more than 2x, the dimensions are likely wrong. Log a warning and either use the stated weight with a safety buffer or flag the order for manual verification.
3. **Product master data enrichment.** Propose that RetailCo build a product weight/dimension lookup table (keyed by SKU) sourced from actual warehouse measurements rather than merchandising estimates. This is a Phase 2 effort, but it's the root-cause fix.
4. **Carrier invoice reconciliation report.** Build a weekly reconciliation job that compares Shipium-quoted costs against actual carrier invoices (once RetailCo provides invoice data). This surfaces SKUs with chronic discrepancies so the product data can be corrected at the source.

---

## Edge Case 5: Marketplace Order SLA Deadline Expires While Queued

**Category:** Business logic / operational

**Scenario:**
Amazon marketplace orders carry an `sla_deadline` field (e.g., `"2026-01-09T17:00:00Z"` — "must ship within 24h"). These orders enter the pipeline with `priority: "high"`, but during a period of OMS degradation (peak hours, 10am-2pm EST) or Shipium API issues, the order sits in the `rate-req` or `ship-req` queue longer than expected. By the time the Shipment Creator processes it, the SLA deadline has passed. The package can still be shipped, but it's now a late shipment per Amazon's metrics.

Amazon tracks late shipment rate as a seller performance metric. Exceeding their threshold (currently 4%) can result in account warnings, listing suppression, or account suspension. RetailCo processes ~8,000 marketplace orders/day — a bad afternoon could produce hundreds of late shipments.

**Impact if not handled:**

- Amazon seller performance violations, potentially leading to account suspension and loss of the entire marketplace channel (~8,000 orders/day in revenue).
- eBay and other marketplace similar penalties.
- Customer-facing delivery promise broken for the most time-sensitive order category.
- RetailCo loses trust in the Shipium integration if marketplace orders perform worse than the manual process they replaced.

**How to address it:**

1. **SLA-aware queue priority.** The Order Processor calculates a `time_to_deadline` value for every marketplace order and publishes to `rate-req-priority` instead of the standard `rate-req` queue. The Rate Shopping Service processes the priority queue first, always.
2. **Deadline monitoring and escalation.** A lightweight monitoring job checks the `rate-req-priority` and `ship-req` queues every 60 seconds for messages whose SLA deadline is within 2 hours. If found, it triggers a PagerDuty alert so operations can intervene (manually process the order or investigate the bottleneck).
3. **Hard deadline cutoff.** If an order's SLA deadline has already passed when the Shipment Creator picks it up, don't silently ship it late. Instead, route it to a `manual-review` queue and alert the marketplace operations team. They can decide whether to expedite (upgrade to overnight shipping to partially recover) or contact the marketplace to update the promise.
4. **SLA dashboard.** A real-time Grafana dashboard showing marketplace orders by `time_to_deadline` bucket (>4h, 2-4h, <2h, expired). This gives the operations team visibility before deadlines are missed, not after.

---

## Edge Case 6: Duplicate Shipments from OMS Duplicate Orders

**Category:** Data quality / technical failure

**Scenario:**
The OMS data quality notes state: *"Duplicate orders can occur."* The same order might appear twice in a poll response — either as two records with the same `order_id` or, more insidiously, as two records with different `order_id` values but identical content (same customer, same items, same address). Additionally, the integration's own retry logic can create duplicates: if the Order Processor fetches and publishes an order to `rate-req`, then crashes before acknowledging the RabbitMQ message, the message is redelivered and the order is processed again. The result is two shipments created in Shipium for the same order — two labels, two tracking numbers, two packages sent to the same customer.

**Impact if not handled:**

- Customer receives two identical packages, requiring return logistics for the duplicate.
- Double carrier charges for the same order.
- Inventory shrinkage: twice the product leaves the warehouse for a single sale.
- At even 0.05% duplicate rate across 50K orders/day, that's 25 duplicate shipments daily — ~750/month in wasted cost and returns.

**How to address it:**

1. **Idempotency key in PostgreSQL.** Before the Shipment Creator calls Shipium, it checks a `shipments` table for an existing record with the same `order_id`. If a shipment already exists, the message is acknowledged and discarded. The idempotency key is the OMS `order_id`, which is unique per legitimate order.
2. **Content-hash deduplication for same-content/different-ID duplicates.** The Order Processor computes a hash of (`customer_id` + `shipping_address` + sorted `line_item_id` list + `created_at` date). If two orders within a 24-hour window produce the same hash, the second one is flagged for manual review rather than auto-processed.
3. **RabbitMQ manual acknowledgment.** All queue consumers use manual ack mode. A message is only acknowledged after the downstream action (Shipium API call, database write) has fully succeeded. This prevents data loss but makes redelivery possible, which is why the idempotency check at the shipment creation stage is essential.
4. **Shipium `external_order_id` uniqueness.** The Shipium `POST /shipments` request includes `external_order_id` set to the OMS `order_id`. If Shipium rejects the request because a shipment with that external ID already exists, the duplicate is caught at the last line of defense.

---

## Edge Case 7: VPN Tunnel Failure Between AWS and On-Prem OMS

**Category:** Technical failure / infrastructure

**Scenario:**
The OMS runs on-premises; the integration layer runs on AWS Kubernetes. All OMS API traffic traverses a VPN tunnel. The technical constraints note: *"VPN required for on-prem access"* and *"VPN has bandwidth limitations."* If the VPN tunnel drops (network equipment failure, ISP issue, certificate expiry, MTU mismatch), every service that communicates with the OMS loses connectivity simultaneously: the Poller can't discover new orders, the Order Processor can't fetch details, and the OMS Writer can't push back shipping or tracking data.

Unlike an OMS application-level failure (which returns errors or timeouts), a VPN failure manifests as TCP connection timeouts at the network layer — typically 30-60 seconds per attempt before failing. Services burn through their connection pools and goroutines waiting on dead connections.

**Impact if not handled:**

- Complete pipeline stall: no new orders discovered, no shipping info written back, no tracking updates pushed to OMS.
- Connection pool exhaustion cascading into Kubernetes pod health check failures, triggering unnecessary pod restarts that make recovery slower.
- If the VPN is down for 2 hours during peak, ~12,500 orders accumulate on the OMS side. When VPN recovers, the burst of polling + detail fetches + write-backs overwhelms the 100 req/min limit.
- Operations team can't distinguish between "OMS is slow" and "VPN is down" without explicit instrumentation.

**How to address it:**

1. **Dedicated OMS health-check probe.** A lightweight goroutine in the OMS Poller pings a known-fast OMS endpoint (e.g., `GET /warehouses` with a 5-second timeout) every 15 seconds. Track three states: `healthy`, `degraded` (slow but responding), `unreachable` (no response). Publish the state to a Redis key and emit a Datadog metric. All OMS-calling services check this state before attempting calls.
2. **Distinct alerting for network vs. application failure.** If the health probe gets TCP connection refused or timeout (not an HTTP error), classify it as a network/VPN issue and page the network operations team — not the application development team. Different root cause, different responder.
3. **Connection pool limits and fast-fail.** Set aggressive connection timeouts (5 seconds connect, 15 seconds read) and cap the HTTP connection pool to the OMS at 10 concurrent connections. This prevents a slow network from consuming all available goroutines/threads.
4. **Graceful backlog drain on recovery.** When the health probe transitions from `unreachable` back to `healthy`, don't immediately unleash the full backlog. Ramp up OMS call volume gradually: 25 req/min for the first 5 minutes, 50 req/min for the next 5, then full 90 req/min. This prevents a recovery-triggered rate limit storm.

---

## Edge Case 8: Gift Order Shipped with Non-Gift Packaging or Exposed Pricing

**Category:** Business logic

**Scenario:**
Gift orders (`type: "gift"`, `is_gift: true`) require special handling: gift messaging, gift wrapping, gift receipts (no prices shown), and — per the meeting notes — "gift orders can't combine with other items." The sample data shows a gift order with `gift_wrap_requested: true` and `gift_message: "Happy Birthday! Love, Sarah"`, where the billing address (Sarah in New York) differs from the shipping address (Michael in Boston).

If the integration treats gift orders identically to standard ecommerce orders when creating Shipium shipments, the carrier label may display the sender's billing information, the packing slip may include item prices, or the order may be combined with other items going to the same address. The Shipium `POST /shipments` request includes item details with `value` fields — if these appear on documentation inside the package, the gift is ruined.

**Impact if not handled:**

- Gift recipient sees the price paid, ruining the gift experience. This is a high-emotion customer service scenario that generates complaints and negative reviews disproportionate to the order value.
- Gift orders combined with non-gift orders in the same shipment, despite the business rule prohibiting this.
- Billing address (gift buyer) printed on packing materials instead of a gift message, revealing the sender's personal information to the recipient.
- RetailCo's brand promise around gift-quality service is broken.

**How to address it:**

1. **Gift order enrichment in Order Processor.** When `is_gift: true`, the Order Processor applies a distinct set of transformations before publishing to the rate queue:
  - Set `options.signature_required: false` (gifts should be deliverable without the recipient being home, unless the value exceeds the $500 threshold).
  - Include `gift_message` in the shipment metadata for the warehouse packing system.
  - Set a `no_price_on_docs` flag that the label/packing slip generation respects.
  - Mark the order as `no_combine` in the shipment creation request to prevent multi-order consolidation.
2. **Shipment creation validation.** Before calling Shipium, validate that gift orders are not batched with other orders to the same address. The Shipment Creator should check: if this destination address already has a non-gift shipment in the current batch, create a separate shipment for the gift order.
3. **Address handling.** For gift orders, use only the shipping address (recipient) on the label and packing slip. Suppress the billing address (buyer) from all carrier-facing documentation.
4. **QA test case.** Include a dedicated gift order in the integration test suite that verifies: separate shipment, no pricing on packing slip, gift message included, billing address suppressed.

