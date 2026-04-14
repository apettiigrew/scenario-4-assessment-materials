# Shipium Professional Services Interview Customer Requirements Notes - RetailCo Integration

## Meeting Information
**Date:** January 8, 2026
**Attendees:**
- Sarah Chen - RetailCo CTO
- Mike Patterson - RetailCo Director of Logistics
- Jennifer Lopez - RetailCo Lead Software Architect
- Tom Wilson - RetailCo Operations Manager

**Shipium Team:**
- [Your team]

## Meeting Summary

### Business Context

RetailCo is experiencing significant challenges with their current shipping operations:
- Using multiple shipping platforms, leading to inconsistent experiences
- No centralized visibility into shipping costs across carriers
- Manual carrier selection at distribution centers
- Customer complaints about inconsistent delivery estimates
- Difficulty managing peak season volumes

**Business Goals:**
1. Reduce shipping costs by 15-20% through better carrier selection
2. Improve delivery time accuracy (currently 68% on-time, target 90%+)
3. Provide consistent delivery estimates to customers
4. Scale to handle 2x order volume during peak season

### Technical Requirements (as stated)

#### Order Flow
- "We have different types of orders - some go to Shipium, some don't"
- Mike mentioned: "Gift orders need special handling"
- Sarah: "Marketplace orders are different from our own inventory"
- Jennifer: "B2B orders bypass our normal flow entirely"

**[Question during meeting]: Which order types should go to Shipium?**
Response: "Let's figure that out - probably retail and ecommerce orders for now"

#### Rate Shopping
- Currently done manually at warehouse level
- Want to automate but preserve business logic
- Tom: "We don't ship to Alaska on Thursdays from our Phoenix DC"
- Mike: "Some products can't go via certain carriers due to size/weight restrictions"
- Sarah: "We have negotiated rates with carriers that change by quarter"

**[Question: Do you need real-time rates or can we cache?]**
Response: "Real-time is ideal but... our system is slow. Maybe batch for most and real-time for expensive items?"

#### Tracking Updates
- Multiple systems need tracking info:
  - Customer-facing website
  - Customer service platform
  - Warehouse management system
  - Returns processing system
  - Analytics/reporting platform

- Current process: Manual tracking number entry, batch updates overnight
- Desired: Real-time updates pushed to all systems

**[Question: What's your current order volume and tracking update frequency?]**
Response: 
- 50,000 orders/day average
- 150,000 orders/day during peak (Nov-Dec)
- Tracking events: roughly 200,000-300,000 per day

### Technical Environment Details

#### Legacy OMS
- Built in-house starting in 2012
- Monolithic Java application (Java 8!)
- Oracle database backend
- REST API added in 2018, but limited functionality
- Response times: 3-5 seconds for complex queries
- Cannot be modified easily (small team, tight budgets)
- Jennifer: "We call it 'the beast' - nobody wants to touch it"

#### Infrastructure
- Mix of on-prem and cloud
- Kubernetes for newer services
- Some services in AWS, some in private data center
- APIs go through API Gateway (Kong)
- Have experience with message queues (RabbitMQ)

#### Current Integrations
- About 15 other third-party systems integrated
- Mix of batch files, APIs, and custom middleware
- Some integrations go through MuleSoft ESB
- "Integration is our biggest pain point" - Jennifer

### Distribution Center Details

**Regarding 50 DCs:**
- Mike: "Well, we have 50 locations, but only about 30 actually ship direct to customers"
- 20 locations are store backroom fulfillment
- 10 are regional distribution centers
- Geographic spread: heavy in East Coast and West Coast, lighter in middle states

**Carrier Preferences:**
- Each DC has "preferred carrier list" based on negotiated rates
- Some products restricted to certain carriers (hazmat, oversized, etc.)
- Carrier availability varies by DC location and destination
- Tom: "Chicago DC won't use FedEx for residential deliveries anymore - long story"

**Current Process:**
- Warehouse staff manually select carrier based on printed checklists
- No automated validation
- Frequent mistakes leading to shipment delays

### Order Types Mentioned

Heard mentioned during meeting:
1. "Standard retail orders" - most common
2. "E-commerce orders" - online purchases
3. "Gift orders" - need gift messaging, special handling
4. "B2B orders" - wholesale to other retailers
5. "Store transfers" - between stores (not customer-facing)
6. "Return-to-stock" - returns being sent to DC
7. "Marketplace orders" - sold on Amazon/eBay, fulfilled by RetailCo
8. "Drop-ship orders" - vendor ships directly to customer

**NOT CLEAR which should go through Shipium!**

### Business Rules Examples (mentioned casually)

- "Don't ship ground to Alaska or Hawaii"
- "Hazmat can only go via UPS or FedEx Ground"
- "Orders over $500 require signature"
- "Rush orders must ship same-day or next available"
- "Gift orders can't combine with other items"
- "Returns use prepaid labels, different flow"
- "Some zip codes are restricted due to fraud"
- Tom: "We have a spreadsheet with like 200 rules... somewhere"

### Timeline & Constraints

**Target Go-Live:** March 15, 2026 (8 weeks away!)

**Why the rush?**
- Q2 planning deadline
- Current system contract ending
- Peak season preparation (need 6 months lead time before Nov)

**Constraints Mentioned:**
- Limited budget (exact amount not disclosed)
- Small internal dev team (3 developers total)
- Can't disrupt current operations
- Must maintain order processing during migration

**Success Metrics:**
- 95% of eligible orders routed through Shipium
- Average shipping cost reduced by 15%
- Delivery estimate accuracy above 90%
- Zero order processing delays during migration

### Open Questions from Meeting

1. How do we determine which orders are "eligible" for Shipium?
2. What's the fallback if Shipium is unavailable?
3. How do we handle the rate shopping with the slow OMS?
4. What data format does the OMS export? (they promised to send samples)
5. Who will monitor and support the integration?
6. What happens during OMS maintenance windows?
7. How do we test without impacting production?
8. What's the process for updating business rules?

### Next Steps (from meeting)

1. RetailCo will provide:
   - Sample order data structures
   - API documentation (such as it is)
   - Access to test environment
   - Spreadsheet of business rules (if they can find it)

2. Shipium will:
   - Review requirements
   - Propose architecture
   - Provide effort estimate
   - Schedule technical deep-dive

3. Follow-up meeting scheduled for January 15

## Important Quotes

**Sarah (CTO):** "We need this to be bulletproof. Our holiday shopping season depends on smooth shipping operations."

**Mike (Logistics):** "The current system works, but it's held together with duct tape and prayers. We need something modern."

**Jennifer (Architect):** "Whatever solution we build needs to be maintainable by a small team. We can't create another 'beast'."

**Tom (Operations):** "My team needs clear visibility into what's happening. No black boxes."

## Red Flags / Concerns

⚠️ **Timeline is aggressive** - 8 weeks for full integration with legacy system
⚠️ **Vague requirements** - many details unclear or undecided
⚠️ **Slow legacy system** - 3-5 second response times will be challenging
⚠️ **Limited internal resources** - only 3 developers
⚠️ **Complex business rules** - "spreadsheet with 200 rules"
⚠️ **Multiple downstream systems** - integration complexity
⚠️ **Can't modify OMS easily** - must work around limitations
⚠️ **Unclear order classification** - which orders go to Shipium?

## Opportunities

✅ **Motivated stakeholders** - clear business pain points
✅ **Modern infrastructure available** - Kubernetes, message queues
✅ **Realistic about challenges** - acknowledge legacy system issues
✅ **Open to recommendations** - not dictating technical approach
✅ **Clear success metrics** - know what good looks like
