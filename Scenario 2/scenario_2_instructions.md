# Shipium Professional Services Interview Scenario 2: Solution Design & Abstract Thinking

## Overview
This scenario assesses your ability to gather requirements, design system architectures, identify edge cases, and create implementation plans for complex integration projects.

**Time Estimate:** 3-4 hours (take-home) or 60-90 minutes (whiteboarding session)

## Context

You are meeting with a new customer, **RetailCo** - a major retail chain with 200+ stores nationwide. They want to integrate their proprietary Order Management System (OMS) with Shipium to optimize their shipping operations.

The initial meeting has been scheduled, and the customer has provided some high-level requirements, but many details are unclear or ambiguous. Your job is to understand their needs, design an appropriate solution, and plan the implementation.

## Customer Profile

**Company:** RetailCo
**Industry:** Retail (Fashion & Home Goods)
**Scale:** 
- 200+ physical stores
- E-commerce platform processing 50,000+ orders/day
- 50 distribution centers nationwide
- Peak season: 150,000+ orders/day

**Technical Environment:**
- Legacy monolithic Java OMS (custom-built, 10+ years old)
- Mix of Oracle databases and some MongoDB
- Kubernetes infrastructure for newer services
- REST APIs available but performance varies
- Multiple middleware systems in place

## Initial Customer Requirements

During the kickoff call, the customer's technical lead provided these requirements:

1. **"We need to send orders to Shipium, but only certain order types"**
   - Didn't specify which order types or how they're classified

2. **"We want to use our own business rules to determine when to request shipping rates"**
   - Mentioned "complex rules" but didn't elaborate
   - Something about "regional holidays" and "warehouse capacity"

3. **"We need the tracking information back in our system in real-time"**
   - Updates must be "immediate"
   - Multiple downstream systems need tracking data

4. **"Our OMS is a monolithic Java application with a REST API, but it's very slow"**
   - Response times often 3-5 seconds
   - Sometimes timeouts during peak hours
   - Can't be modified easily (legacy codebase)

5. **"We have 50 distribution centers, each with different carrier preferences"**
   - Some DCs only use specific carriers
   - Carrier preferences change based on destination, order value, product type
   - Different SLAs by DC

## Provided Materials

You have been provided with the following files:
1. `customer_requirements_notes.md` - Detailed notes from initial meetings
2. `customer_oms_api_docs.md` - Available API endpoints from customer's OMS
3. `sample_order_data.json` - Example order structures from their system
4. `shipium_api_reference.md` - Relevant Shipium API endpoints for this integration
5. `technical_constraints.md` - Known technical limitations and constraints

## Assessment Tasks

### Task 1: Requirements Gathering (20 points)

The customer's initial requirements are vague and ambiguous. What are the **top 5-7 clarifying questions** you would ask the customer to better understand their needs?

For each question:
- Explain **why** this question is important
- Describe **what decisions** depend on the answer
- Indicate **what risks** you're trying to mitigate

**Format your response as:**
```
Question 1: [Your question]
Why it's important: [Explanation]
What it affects: [Decisions that depend on this]
Risks mitigated: [What could go wrong without this answer]
```

### Task 2: Architecture Design (30 points)

Based on the information provided, design a high-level technical architecture for this integration.

Your architecture should include:

**A. Component Diagram**
- All major components/services needed
- How they interact with each other
- Data flow through the system
- Where different technologies will be used

**B. Technology Choices**
Specify and justify your choices for:
- Integration pattern (middleware, event-driven, direct API, etc.)
- Message queue/broker (if applicable)
- Data storage (if needed)
- Hosting/infrastructure
- Programming language(s)

**C. Handling the "Slow OMS" Constraint**
How will you handle the customer's slow legacy OMS? Specific techniques you'll use to work around this limitation.

**D. Data Flow Documentation**
Document the complete flow for:
1. Order submission from OMS to Shipium
2. Rate request and response
3. Tracking update from carrier back to OMS

### Task 3: Edge Cases & Challenges (20 points)

Identify and document at least **6 potential edge cases or challenges** this integration might face. For each one:

- Describe the scenario
- Explain the impact if not handled
- Propose how you would address it

Consider:
- Technical failures (timeouts, API errors, network issues)
- Business logic edge cases
- Data quality issues
- Performance/scale challenges
- Operational concerns

### Task 4: Phased Implementation Approach (20 points)

The customer wants this live in **8 weeks** (target go-live date). However, that's an aggressive timeline for the full scope.

Break this project into phases with priorities:

**Phase 1: MVP (Weeks 1-3)**
- What's the minimum viable integration?
- What capabilities must be included?
- What can be deferred?

**Phase 2: Enhancement (Weeks 4-6)**
- What features are added?
- Why weren't these in MVP?

**Phase 3: Full Production (Weeks 7-8)**
- Final features
- Production hardening
- What's left for post-go-live?

For each phase, include:
- Key deliverables
- Success criteria
- Dependencies/blockers
- Risks

### Task 5: Trade-offs & Decisions (10 points)

Document **3-5 key trade-offs** you've made in your design. For each:
- What are the options?
- Which did you choose?
- Why?
- What are the implications?

Examples of trade-offs might include:
- Real-time vs batch processing
- Direct integration vs middleware layer
- Synchronous vs asynchronous communication
- Build vs buy for certain components

## Submission Guidelines

Please submit:

1. **Written Document** (required)
   - Answers to all tasks
   - Format: Markdown, PDF, or Word
   - Include diagrams where helpful

2. **Architecture Diagrams** (required for Task 2)
   - Component/system diagram
   - Data flow diagrams
   - Sequence diagrams (optional but encouraged)
   - Tool: Any tool you prefer (draw.io, Lucidchart, hand-drawn and scanned, etc.)

3. **Phased Implementation Plan** (required for Task 4)
   - Can be a table, Gantt chart, or written description
   - Should clearly show timeline and dependencies

## Evaluation Criteria

Your submission will be evaluated on:

- **Requirements Analysis** (20%): Quality and relevance of clarifying questions
- **Architectural Thinking** (30%): Soundness of design, appropriate technology choices
- **Problem-Solving** (20%): Identification and handling of edge cases
- **Practical Planning** (20%): Realistic phased approach with proper prioritization
- **Communication** (10%): Clarity of explanation, quality of documentation

## What We're Looking For

**Strong Candidates Will:**
- Ask insightful questions that uncover hidden requirements
- Design pragmatic, scalable architectures
- Make explicit trade-offs with clear reasoning
- Think about operational concerns (monitoring, debugging, support)
- Balance ideal solutions with practical constraints
- Communicate technical decisions clearly

**Avoid:**
- Over-engineering for the stated requirements
- Ignoring the technical constraints (slow OMS)
- Proposing solutions without explaining trade-offs
- Vague or generic approaches
- Forgetting about operational/support aspects

## Tips

1. **There's no single "right" answer** - we want to see your thought process
2. **Use the provided materials** - they contain important context
3. **Make reasonable assumptions** - but document them
4. **Think end-to-end** - from order creation to tracking updates
5. **Consider real-world operations** - not just happy path

Good luck! We're excited to see how you approach this integration challenge.
