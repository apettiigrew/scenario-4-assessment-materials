# Shipium Professional Services Interview Scenario 2 Assessment Materials - Solution Design & Abstract Thinking

## Overview

This package contains all materials needed to complete **Scenario 2: Solution Design & Abstract Thinking** for the Professional Services Developer role at Shipium.

## Scenario Summary

You are designing an integration between a major retail chain (RetailCo) and Shipium's shipping platform. The customer has a legacy Order Management System with performance limitations, vague requirements, and an aggressive 8-week timeline. Your job is to gather requirements, design an appropriate architecture, identify risks, and create a phased implementation plan.

## Package Contents

1. **scenario_2_instructions.md** - Main scenario document with context, requirements, and assessment tasks
2. **customer_requirements_notes.md** - Detailed notes from initial customer meetings
3. **customer_oms_api_docs.md** - RetailCo's Order Management System API documentation
4. **sample_order_data.json** - Example order structures from RetailCo's system
5. **shipium_api_reference.md** - Relevant Shipium API endpoints for integration
6. **technical_constraints.md** - Known technical limitations and requirements
7. **SCENARIO_2_README.md** - This file

## Getting Started

### Step 1: Read the Instructions (15 minutes)
Start with `scenario_2_instructions.md` to understand:
- The customer (RetailCo) and their business
- Initial requirements (which are intentionally vague)
- The 5 assessment tasks you need to complete
- Evaluation criteria

### Step 2: Review Customer Context (30 minutes)
Read through the supporting materials in this order:

1. **customer_requirements_notes.md** - Understanding the customer's situation
   - What was discussed in meetings
   - Pain points and goals
   - Red flags and opportunities
   - Open questions

2. **customer_oms_api_docs.md** - Understanding what you have to work with
   - Available API endpoints
   - Performance characteristics
   - Known issues and limitations

3. **sample_order_data.json** - Understanding the data
   - Different order types
   - Data structure and quality
   - Common patterns

4. **shipium_api_reference.md** - Understanding Shipium's capabilities
   - Available endpoints for integration
   - Webhook support
   - Batch operations
   - Best practices

5. **technical_constraints.md** - Understanding the constraints
   - Performance limitations
   - Infrastructure constraints
   - Business requirements
   - Success criteria

### Step 3: Complete the Assessment (2-3 hours)

Work through each task:

**Task 1: Requirements Gathering (45 minutes)**
- Identify the most important clarifying questions
- Think about what's missing or ambiguous
- Consider business, technical, and operational aspects

**Task 2: Architecture Design (60-90 minutes)**
- Sketch out component architecture
- Choose appropriate technologies
- Design data flows
- Address the "slow OMS" constraint

**Task 3: Edge Cases & Challenges (30 minutes)**
- Think about what could go wrong
- Consider technical failures, data issues, scale
- Propose mitigation strategies

**Task 4: Phased Implementation (30-45 minutes)**
- Break down into MVP and enhancements
- Consider the 8-week timeline
- Prioritize based on risk and value

**Task 5: Trade-offs (15-30 minutes)**
- Document key decisions
- Explain your reasoning
- Be honest about implications

## Tips for Success

### What Makes a Strong Submission

**Requirements Analysis:**
- Questions that uncover hidden complexity
- Focus on high-impact unknowns
- Balance business and technical concerns
- Demonstrate understanding of integration patterns

**Architecture Design:**
- Pragmatic solutions over ideal solutions
- Clear reasoning for technology choices
- Explicit handling of constraints (especially slow OMS)
- Consideration of operational concerns
- Good documentation and diagrams

**Problem-Solving:**
- Comprehensive identification of edge cases
- Realistic mitigation strategies
- Understanding of distributed systems challenges
- Consideration of failure modes

**Planning:**
- Realistic timelines given constraints
- Clear prioritization logic
- Risk-based approach
- Acknowledgment of what's being deferred

### Common Pitfalls to Avoid

❌ **Over-Engineering:**
- Don't design a perfect system that takes 6 months to build
- The timeline is 8 weeks - be pragmatic
- MVP first, perfect later

❌ **Ignoring Constraints:**
- The OMS is slow and can't be changed - work around it
- Rate limits are real - design accordingly
- Budget is limited - justify any additional tools

❌ **Vague Solutions:**
- "Use microservices" isn't enough - which services?
- "Implement caching" - cache what, where, for how long?
- Be specific in your recommendations

❌ **Forgetting Operations:**
- Who monitors this integration?
- How do we debug issues?
- What happens at 2am when something breaks?

❌ **Missing the Business Context:**
- This is about reducing shipping costs and improving delivery accuracy
- Technical elegance doesn't matter if it doesn't solve the business problem
- Consider the customer's perspective

### Key Themes to Address

1. **Dealing with Legacy Systems:**
   - How do you integrate with slow, inflexible systems?
   - Async patterns, caching, batching
   - Circuit breakers and fallbacks

2. **Requirements Ambiguity:**
   - What order types go to Shipium?
   - What are the business rules?
   - How do you handle uncertainty?

3. **Operational Concerns:**
   - Small team needs to support this
   - Must be maintainable and debuggable
   - Clear error messages and monitoring

4. **Time Pressure:**
   - 8 weeks is aggressive
   - What's must-have vs nice-to-have?
   - How do you de-risk the timeline?

5. **Scale & Performance:**
   - 50K orders/day, peak 150K
   - Multiple downstream systems
   - Real-time tracking updates

## Recommended Time Allocation

**Total Time:** 3-4 hours

- **Reading & Understanding** (45 min)
  - Instructions: 15 min
  - Supporting materials: 30 min

- **Task 1: Requirements** (30-45 min)
  - Brainstorm questions: 20 min
  - Document with reasoning: 15-25 min

- **Task 2: Architecture** (60-90 min)
  - Sketch architecture: 30 min
  - Create diagrams: 20-30 min
  - Document decisions: 20-30 min

- **Task 3: Edge Cases** (30 min)
  - Identify scenarios: 15 min
  - Document mitigation: 15 min

- **Task 4: Phased Plan** (30-45 min)
  - Break down phases: 20 min
  - Document plan: 10-25 min

- **Task 5: Trade-offs** (15-30 min)
  - Identify key decisions: 10 min
  - Document reasoning: 5-20 min

## Submission Format

Please submit:

1. **Written Document** (required)
   - Answers to all 5 tasks
   - Format: Markdown, PDF, or Word
   - Well-organized and clearly written

2. **Architecture Diagrams** (required)
   - Component/system architecture
   - Data flow diagrams
   - Tool: Your choice (draw.io, Lucidchart, hand-drawn, etc.)

3. **Phased Implementation Plan** (required)
   - Timeline visualization
   - Format: Table, Gantt chart, or detailed text

## Evaluation Criteria

Your submission will be evaluated on:

- **Requirements Analysis** (20%): Quality and relevance of questions
- **Architectural Thinking** (30%): Soundness of design, appropriate choices
- **Problem-Solving** (20%): Identification and handling of edge cases
- **Practical Planning** (20%): Realistic phased approach, proper prioritization
- **Communication** (10%): Clarity of explanation, quality of documentation

## What We're Looking For

**Strong candidates will:**
- Ask insightful questions that reveal hidden complexity
- Design pragmatic, maintainable architectures
- Make explicit trade-offs with clear reasoning
- Think about real-world operations, not just happy paths
- Balance ideal solutions with practical constraints
- Communicate technical decisions clearly to both technical and non-technical audiences

**This is not about:**
- Finding the "perfect" solution (there isn't one)
- Demonstrating knowledge of every technology
- Creating the most complex architecture
- Spending days on elaborate diagrams

**This is about:**
- Your thought process and problem-solving approach
- How you handle ambiguity and gather requirements
- Your ability to design practical, maintainable solutions
- How you communicate technical decisions
- Your understanding of real-world integration challenges

## Questions?

If you need clarification:
- For take-home: Email the hiring team
- For live interview: Ask the interviewer

## Good Luck!

We're excited to see how you approach this real-world integration challenge. Remember:
- There's no single "right" answer
- Show your thinking process
- Be pragmatic over perfect
- Consider the full picture: technical, business, and operational

This scenario reflects the type of work you'd actually do in this role - designing integrations for customers with legacy systems, tight timelines, and evolving requirements. Have fun with it!

---

**Note:** All company names, data, and scenarios are fictional but based on real-world integration challenges we face regularly.
