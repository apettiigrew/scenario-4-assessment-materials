# Task 5: Trade-offs & Decisions

This document captures five deliberate trade-offs in the RetailCo × Shipium integration design (Tasks 2–4). Each reflects constraints from the scenario: a slow, rate-limited OMS with no webhooks; an 8-week timeline; a small internal team; and mixed on-prem / cloud infrastructure.

---

## Trade-off 1: Direct Integration vs Middleware / Event-Driven Layer

**Options**

| Option | Description |
|---|---|
| **A. Direct integration** | OMS-facing services call Shipium (and downstream systems) in-line whenever the OMS or a warehouse workflow triggers an action — minimal new moving parts. |
| **B. Middleware / ESB** | Route traffic through MuleSoft (already present at RetailCo) with orchestrations, mappings, and retries owned by the integration platform team. |
| **C. Standalone event-driven middleware** | New small services on Kubernetes, RabbitMQ between stages, explicit state in PostgreSQL — Shipium and OMS never call each other directly. |

**Choice:** **C — Standalone event-driven middleware** (with a possible future refactor into MuleSoft only where it clearly pays off).

**Why**

- The OMS is **slow (3–5s)** and **strictly rate-limited (100 req/min)**. A direct, synchronous chain ties Shipium’s responsiveness to OMS latency and multiplies failure modes (timeouts block labels).
- MuleSoft is constrained by **license limits**, **performance issues**, and **uneven team familiarity** — adding the highest-volume, most latency-sensitive path there risks becoming another bottleneck (“integration spaghetti”), which RetailCo’s architect explicitly wants to avoid.
- An 8-week timeline favors **bounded, deployable services** the three-person team can own, test in isolation, and roll back with feature flags.

**Implications**

- **Positive:** Clear ownership, independent scaling of consumers, natural backpressure via queues, easier debugging per stage.
- **Negative:** Another runtime to operate (more services, more dashboards). Possible **duplication** with patterns MuleSoft could provide later.
- **Mitigation:** Document which interfaces might move behind MuleSoft post–go-live; keep boundaries clean (REST in/out) so a future move is a refactor, not a rewrite.

---

## Trade-off 2: Synchronous “Request/Response” Pipelines vs Fully Asynchronous Processing

**Options**

| Option | Description |
|---|---|
| **A. Synchronous pipeline** | After reading an order from the OMS, the same request path rates, buys the label, and writes back — simple mental model, similar to a single workflow engine. |
| **B. Fully asynchronous** | Each step completes independently; work moves via queues; OMS writes are drained by a dedicated, rate-limited writer. |

**Choice:** **B — Fully asynchronous** end-to-end for anything that touches the OMS or aggregates volume.

**Why**

- Technical constraints state the OMS **cannot be relied on for time-sensitive operations** and may **timeout >30s** under load. Blocking on the OMS would violate the **<5 minute processing** success criterion at any real volume.
- Success criteria also require **resilience** (RTO/RPO, no data loss). Queues provide **durability** and **replay** after outages; synchronous chains lose in-flight work on failure unless every hop is heavily engineered.

**Implications**

- **Positive:** Shipium rate shopping and label creation stay fast even when the OMS is degraded; **circuit breakers** can isolate OMS outages without stopping labeling (with agreed business rules for backlog drain).
- **Negative:** **Eventual consistency** — OMS may briefly show stale status vs. Shipium or the warehouse. Operations need a **single order view** (correlation id, pipeline state in PostgreSQL).
- **Mitigation:** Pre-shipment OMS status recheck (Phase 2) narrows the cancellation race; clear SLAs that “OMS is source of truth for order lifecycle, Shipium is source of truth for carrier execution” once handed off.

---

## Trade-off 3: Real-Time Rate Shopping vs Batch / Cached Rates

**Options**

| Option | Description |
|---|---|
| **A. Real-time only** | Every eligible order calls Shipium `POST /rates` immediately; freshest rates and delivery estimates. |
| **B. Batch / cached only** | Accumulate orders, use `POST /rates/batch`, cache aggressively (1–4 hours per Shipium guidance); minimize Shipium and OMS-adjacent work. |
| **C. Hybrid** | **Batch + cache** for the bulk; **real-time** for rush, high-value, and tight marketplace SLAs; priority queues and shorter windows for those cohorts. |

**Choice:** **C — Hybrid.**

**Why**

- Stakeholders asked for **real-time “ideal”** but acknowledged the **OMS is slow** and the business wants **cost reduction** — pure real-time increases churn, cost of API calls, and coupling without guaranteed benefit on low-margin orders.
- Shipium explicitly recommends **caching** and **batch** endpoints; ignoring that would ignore vendor best practices and overload both sides during peak.
- Marketplace and rush orders carry **SLA and customer-expectation** risk where stale rates or slow batching are unacceptable.

**Implications**

- **Positive:** Better **cost/latency** balance; bulk of volume stays efficient; critical cohorts get responsiveness.
- **Negative:** **Two code paths** to build, test, and monitor; mis-tuned thresholds could starve one cohort or over-spend API budget on the other.
- **Mitigation:** Start MVP on **single-order rates** (Phase 1), add **batch** in Phase 2; define “expensive / rush / marketplace” thresholds with RetailCo and measure in shadow mode before flipping priority routing in prod.

---

## Trade-off 4: MuleSoft-First Integration vs Standalone Services First

**Options**

| Option | Description |
|---|---|
| **A. MuleSoft-first** | All new flows built as Mule flows: OMS connectors, Shipium connectors, transformation, error handling in the ESB. |
| **B. Standalone services first** | Build the integration as Kubernetes services + RabbitMQ; integrate downstream systems via REST where possible; revisit MuleSoft for specific hops later. |

**Choice:** **B — Standalone services first.**

**Why**

- **Timeline (8 weeks)** and **small team** favor a stack they already run daily (**K8s, RabbitMQ, GitLab**). MuleSoft adds **licensing**, **specialist skills**, and **performance uncertainty** on a hot path.
- RetailCo already described **integration as the biggest pain point** and middleware as a mix of **batch, API, and legacy point-to-point** — centralizing everything in MuleSoft does not automatically simplify operations.

**Implications**

- **Positive:** Faster path to **working labels** and **clear ownership**; easier **blue-green** and **feature flags** per service.
- **Negative:** **Temporary duplication** of “enterprise bus” patterns (retry, audit) that MuleSoft could centralize; possible **political friction** if integration governance mandates ESB usage.
- **Mitigation:** Use **Kong** and **standard logging/metrics** so traffic is observable; define **integration principles** (when a new hop *must* go through MuleSoft) for post–go-live cleanup.

---

## Trade-off 5: OMS Fidelity (Every Tracking Event) vs API Budget & Operational Simplicity

**Options**

| Option | Description |
|---|---|
| **A. Full fidelity** | Every carrier milestone written to OMS via `PUT /orders/{id}/tracking` as often as received from Shipium webhooks — OMS matches carrier granularity. |
| **B. Milestone-only** | Write **shipped**, **in_transit** (optional), **out_for_delivery** (optional), **delivered**, and **exception** — skip noisy intermediate scans. |
| **C. OMS-minimal** | Only write **shipped** and **delivered** to OMS; push rich event streams only to downstream systems (website, Zendesk, WMS). |

**Choice:** **B — Milestone-only** (tunable per DC/order type), leaning toward **C** for peak if the budget math requires it.

**Why**

- OMS has **no batch APIs** and a **hard 100 req/min** cap shared across **poll, detail fetch, shipping create, and tracking**. At 150K orders/day, **every extra tracking PUT** risks **429s** and stalls the entire integration (Edge Case / scale analysis in Task 3).
- Downstream systems have **different latency needs** (website real-time, analytics batch). The **system of record for rich tracking** does not have to be the OMS for every scan.

**Implications**

- **Positive:** **Protects** the shared OMS budget; reduces blast radius when OMS is slow; still meets **“tracking within 5 minutes”** for meaningful customer-visible events if those events are driven primarily to the website/API path.
- **Negative:** OMS may look **less granular** than the carrier or Shipium UI — CSRs who only look at OMS might miss intermediate scans unless trained to use Zendesk/website.
- **Mitigation:** **Fan-out** full event history to Zendesk + website; OMS carries **summary + latest estimate**; document **which system is canonical** for which question (“Where’s my package?” → website; “Did we invoice correctly?” → OMS shipped/delivered + finance).

---

## Summary Table

| # | Trade-off | Choice | Main benefit | Main cost |
|---|-----------|--------|--------------|-----------|
| 1 | Integration topology | Event-driven middleware | Isolates slow OMS | More services to run |
| 2 | Sync vs async | Fully async to OMS | Resilience, throughput | Eventual consistency |
| 3 | Rates | Hybrid real-time + batch/cache | SLA + cost | Two paths + tuning |
| 4 | MuleSoft vs standalone | Standalone first | Speed, team fit | Possible duplicate platform work |
| 5 | OMS tracking writes | Milestone-only | Stays under rate limits | Less granularity in OMS |

These trade-offs are intentionally **pragmatic**: they favor **ship-on-time**, **operability for a small team**, and **respecting hard OMS constraints** over theoretical elegance. Revisit each after go-live when production metrics and stakeholder feedback justify tightening or relaxing the balance.
