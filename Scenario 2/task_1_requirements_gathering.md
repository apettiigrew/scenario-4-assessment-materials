# Task 1: Requirements Gathering — Top 7 Clarifying Questions

---

## Question 1: Which order types are eligible for Shipium, and what is the exact classification logic?

**Why it's important:**
The OMS tracks eight distinct order types (retail, ecommerce, b2b, marketplace, gift, store_transfer, return_to_stock, drop_ship). Three are clearly ineligible (store_transfer, return_to_stock, drop_ship), but the remaining five — representing roughly 50,500 orders/day — are all marked "TBD" in the OMS documentation. During the meeting, the answer was only "probably retail and ecommerce for now," but marketplace orders (8,000/day with tight Amazon Prime SLAs), gift orders (2,000/day with special handling), and B2B orders (500/day using LTL freight) were all left unresolved. The classification logic must be deterministic and machine-readable, not a human judgment call at the warehouse.

**What it affects:**

- **Volume sizing and capacity planning**: Ecommerce + retail alone is ~40,000 orders/day. Adding marketplace and gift brings it to ~50,000. This directly determines polling frequency, queue depth, API call budget, and infrastructure cost.
- **Architecture complexity**: Marketplace orders carry external SLA deadlines (`sla_deadline` field), require tracking pushed back to Amazon/eBay, and may have carrier restrictions dictated by the marketplace. Gift orders require distinct packaging rules ("gift orders can't combine with other items"). B2B orders use LTL freight, which is a different carrier/service category entirely. Each eligible type may need its own processing path.
- **Business rules engine scope**: The carrier selection rules, rate shopping strategy, and routing logic all depend on which types are in scope. We cannot design the rules engine without knowing the input domain.
- **MVP scoping**: If all five TBD types are in scope for go-live, the integration surface area nearly doubles compared to ecommerce-only. This directly impacts whether the 8-week timeline is achievable.

**Risks mitigated:**

- Building an integration that handles the wrong order types, requiring rework after go-live.
- Under-provisioning infrastructure because volume estimates excluded marketplace or gift orders.
- Missing marketplace SLA violations (Amazon can suspend seller accounts for late shipments) because marketplace orders weren't routed through Shipium's optimized carrier selection.
- Scope creep mid-project when stakeholders realize they also need B2B or gift orders — destabilizing the timeline.

---

## Question 2: Can you provide the complete business rules spreadsheet, and who is the authoritative owner for rule changes going forward?

**Why it's important:**
Tom mentioned "a spreadsheet with like 200 rules... somewhere" that governs carrier selection, routing restrictions, and special handling. Six rules were mentioned casually during the meeting (no ground to AK/HI, hazmat only via UPS/FedEx Ground, signature required over $500, rush orders ship same-day, gift orders can't combine, restricted zip codes for fraud). Additionally, each of the 30 shipping-eligible DCs has its own preferred carrier list with location-specific overrides (e.g., "Chicago DC won't use FedEx for residential deliveries"). These rules are the core logic of the integration — without them codified, automated carrier selection is impossible.

**What it affects:**

- **Carrier selection engine design**: The rules must be translated into Shipium's Carrier Selection Rules API (`POST /carrier-rules`), which supports condition-based routing (origin/destination state, weight, hazmat flags, etc.). We need to know whether the 200 rules can be expressed through Shipium's existing rule schema or if custom middleware logic is required.
- **Rule management workflow**: Today these rules live in a spreadsheet and are executed by humans reading printed checklists. The integration needs a mechanism for non-developers to update rules without code deployments — this affects whether we build an admin UI, use Shipium's rule management, or define a file-based config approach.
- **Testing strategy**: Each rule is a test case. Without the full rule set, we cannot build a comprehensive test suite, and untested rules will cause carrier selection failures in production.
- **Timeline**: If the spreadsheet can't be found or is incomplete, reconstructing the rules from tribal knowledge is a multi-week effort that sits on the critical path.

**Risks mitigated:**

- Automating carrier selection without encoding all existing rules, leading to invalid carrier assignments (e.g., shipping hazmat via air, sending ground shipments to Alaska).
- Discovering missing rules after go-live when warehouse staff notice the system making selections that violate their established processes.
- No governance model for rule changes, leading to stale rules and carrier selection drift over time.
- Blocking the project timeline because the rules can't be located or reconciled.

---

## Question 3: What is the fallback process when Shipium is unavailable, and how long can orders queue before business impact occurs?

**Why it's important:**
The success criteria require "zero order processing delays during migration" and the CTO stated the solution must be "bulletproof." However, no discussion occurred about what happens if Shipium's API is unreachable, returns errors, or experiences degraded performance. The current manual process (warehouse staff selecting carriers from printed checklists) is the implicit fallback, but we need to know if that's acceptable and how quickly it needs to activate. The technical constraints document specifies a 99.5% uptime SLA during business hours and a 1-hour RTO, which means the integration must have a well-defined degraded mode.

**What it affects:**

- **Architecture pattern**: Determines whether we need a circuit breaker pattern that gracefully falls back to a local cache of recent rates, a manual override queue, or a secondary rate-shopping path. This is a fundamental architectural decision.
- **Queue design**: If Shipium is down for 30 minutes during peak, that's roughly 3,125 orders (150K/day ÷ 24h ÷ 2) queuing up. We need to know the maximum acceptable queue depth and the maximum time an order can sit unprocessed before it misses its ship-by date or SLA.
- **Operational runbook**: The Tier 1 operations team (24/7) needs clear procedures for what to do when Shipium is unavailable. Do they manually process? Do they wait? Do they escalate immediately? Without this defined, a 2am outage becomes a crisis without a playbook.
- **Data consistency**: Orders processed through the fallback path need to eventually reconcile with Shipium for tracking and analytics. The reconciliation mechanism must be designed upfront.

**Risks mitigated:**

- Complete order processing halt during any Shipium outage, violating the "zero delays" requirement.
- Orders missing carrier pickup windows because no fallback was available, resulting in delayed deliveries and customer complaints.
- Operations team making ad-hoc decisions during an outage, leading to inconsistent handling and potential SLA violations on marketplace orders.
- No reconciliation path for orders that bypassed Shipium, creating gaps in analytics and tracking data.

---

## Question 4: What defines an "expensive item" that requires real-time rate shopping, and what is the acceptable latency for all other orders?

**Why it's important:**
During the meeting, when asked whether rates should be real-time or cached, the response was: "Real-time is ideal but... our system is slow. Maybe batch for most and real-time for expensive items?" This is a critical architectural fork. The OMS rate limit (100 requests/minute) combined with 3-5 second response times means we can only process ~~20-33 orders per minute through the OMS synchronously. At 50,000 orders/day (~~35/minute average, but bursty), even simple polling consumes most of the API budget. Rate shopping adds Shipium API calls on top. We need a clear threshold and SLA for each tier.

**What it affects:**

- **Processing architecture**: Two-tier rate shopping (real-time for high-value, batch for standard) requires different code paths, queue priorities, and monitoring. The threshold (order value? product category? customer tier?) determines how traffic splits between these paths.
- **OMS API budget allocation**: With only 100 requests/minute, we must carefully allocate between: (a) polling for new orders, (b) fetching order details, (c) writing back shipping info, and (d) tracking updates. Real-time rate shopping for a subset of orders consumes additional budget. The math must work.
- **Shipium batch API usage**: Shipium supports batch rate requests (up to 100 per call). Standard orders can be batched efficiently, but the batching interval determines how long an order waits before getting a carrier assignment. A 5-minute batch window is different from a 30-minute one.
- **Customer experience**: If the customer-facing website promises a delivery estimate at checkout, that estimate must come from somewhere. If rates aren't fetched in real-time, how stale can the estimate be before it damages trust?

**Risks mitigated:**

- Over-calling the OMS API, exhausting the rate limit, and blocking all order processing.
- Under-optimizing high-value shipments because they were batched with standard orders and got stale rates.
- Setting expectations for "real-time" rates without defining what that means, leading to scope disagreement later.
- Building a one-size-fits-all solution that either wastes API budget on low-value orders or under-serves high-value ones.

---

## Question 5: For each of the five downstream systems that need tracking data, what are the specific integration interfaces, data formats, and latency requirements?

**Why it's important:**
Five systems need tracking updates: customer-facing website, customer service platform (Zendesk), warehouse management system, returns processing system, and analytics/reporting platform. The technical constraints document notes that the analytics platform can accept daily batch loads, while the customer website needs real-time updates supporting 100,000+ concurrent users. But we don't know the APIs, formats, or SLAs for the other three. Shipium supports webhooks that can push tracking events, but each downstream system needs its own integration — and the fan-out architecture, retry logic, and error handling differ based on each system's capabilities.

**What it affects:**

- **Fan-out architecture**: If all five systems expose REST APIs, we can build a webhook receiver that fans out to all of them. If some use file drops, SOAP, or MuleSoft ESB, the integration layer is significantly more complex. The existing middleware landscape (MuleSoft for some, custom middleware for others) suggests this won't be uniform.
- **Latency-tier design**: Grouping systems by latency requirement (real-time: website + customer service; near-real-time: WMS + returns; batch: analytics) lets us design efficient processing pipelines instead of treating all five as equally urgent.
- **Error handling and retry**: Each downstream system needs its own retry policy. A failed update to the analytics platform can retry hourly; a failed update to the customer-facing website needs immediate retry. Without knowing the interfaces, we can't design appropriate error handling.
- **Scope for MVP**: If two downstream integrations are straightforward and three are complex, we can prioritize the high-value ones for Phase 1 and defer the rest.

**Risks mitigated:**

- Discovering mid-project that a downstream system uses SOAP or file-based integration, requiring unexpected development effort.
- Building a tracking fan-out that doesn't meet the latency SLA for the customer website, resulting in stale tracking data visible to customers.
- Underestimating the total integration effort by treating "push to downstream systems" as a single task rather than five separate integrations.
- Ignoring the MuleSoft ESB question — if some systems must be reached through MuleSoft, we need to factor in MuleSoft license limits and developer familiarity.

---

## Question 6: What is the cutover and rollout strategy — will this be a big-bang go-live or a gradual migration, and which DCs or order types go first?

**Why it's important:**
The requirement is "zero order processing delays during migration" with a March 15 go-live. But there's a vast difference between flipping all 30 shipping DCs to Shipium on March 15 versus rolling out to one DC at a time over several weeks. The technical constraints document mentions "gradual rollout preferred" and "feature flags for gradual enablement," but no specifics were discussed. With 30 DCs, each with its own carrier preferences and business rules, a phased geographic rollout dramatically reduces risk — but it also means running dual systems (old manual process + new Shipium integration) in parallel, which has its own complexity.

**What it affects:**

- **Feature flag architecture**: A DC-by-DC rollout requires feature flags or configuration that routes orders from specific warehouses to Shipium while leaving others on the current manual process. This must be built into the integration layer from day one.
- **Testing strategy**: Starting with a single low-volume DC (e.g., a store fulfillment location with ~100 orders/day) provides a safe proving ground before expanding to high-volume regional DCs. The rollout order determines the testing sequence.
- **Timeline planning**: If Phase 1 targets 2-3 DCs and Phase 2 expands to all 30, the 8-week timeline becomes much more realistic. If it's a big-bang go-live across all DCs, the risk is substantially higher and testing scope multiplies.
- **Parallel operations**: During the migration period, the operations team needs visibility into which orders are going through Shipium and which are still manual. The monitoring and dashboard design depends on this dual-mode operation.
- **Success criteria**: "95% of eligible orders routed through Shipium" — by March 15, or by some later date? The answer changes whether Phase 1 needs to cover all DCs or just a subset.

**Risks mitigated:**

- A big-bang go-live failure that disrupts all 30 DCs simultaneously, with no rollback path.
- Insufficient testing because we tried to validate all DCs at once instead of iterating on a small set.
- Operations team overwhelmed by supporting two parallel processes across all locations without clear guidance on which system to use.
- Unclear success criteria if the 95% target is measured at go-live versus at the end of a gradual rollout.

---

## Question 7: What are the OMS maintenance windows, and how should the integration handle planned and unplanned OMS downtime?

**Why it's important:**
The OMS is a legacy monolithic Java 8 application that requires periodic maintenance. The meeting notes list "What happens during OMS maintenance windows?" as an open question, but it was never answered. Given that the OMS has no webhook support (all communication is pull-based polling), any OMS downtime means the integration cannot discover new orders, fetch order details, or write back shipping/tracking information. With 50,000 orders/day, even a 2-hour maintenance window means ~4,167 orders that need to be processed after the OMS comes back online. During peak season, that number triples.

**What it affects:**

- **Queue and backlog management**: The integration must queue outbound tracking updates and carrier assignments during OMS downtime and replay them when the OMS recovers — in the correct order and without duplicates. This requires idempotent writes and a durable queue.
- **Polling strategy**: The polling mechanism needs to distinguish between "OMS is down for maintenance" (expected, don't alarm) and "OMS is timing out unexpectedly" (unexpected, alert on-call). This requires either a maintenance calendar integration or health-check endpoint awareness.
- **Order processing SLA**: The technical constraints require orders to be processed within 5 minutes of creation. If the OMS is down for 2 hours, the first orders created after maintenance began are now 2+ hours old when discovered. Is this acceptable? Does the SLA pause during maintenance?
- **Coordination with Shipium**: If the OMS is down and orders are queuing on the OMS side, the burst of new orders when it comes back online could overwhelm both the 100 req/min OMS rate limit and the integration's processing capacity. A backpressure mechanism is needed.

**Risks mitigated:**

- Lost or duplicated orders during OMS maintenance because the integration had no strategy for handling downtime.
- False alerts flooding the operations team every time the OMS undergoes scheduled maintenance.
- Post-maintenance order burst overwhelming the integration and causing cascading failures across the polling, rate shopping, and tracking pipelines.
- Missing carrier pickup cutoff times for orders that were delayed by OMS downtime, resulting in next-day shipping delays.