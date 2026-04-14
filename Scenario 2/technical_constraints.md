# Shipium Professional Services Interview Technical Constraints & Considerations - RetailCo Integration

## Customer Environment Constraints

### 1. Legacy OMS Performance

**Issue:** The Order Management System has significant performance limitations.

**Specifics:**
- Average API response time: 3-5 seconds
- Peak hour response time: 5-12 seconds  
- Occasional timeouts (>30 seconds) during high load
- Database queries are slow and unoptimized
- No caching layer exists

**Impact on Integration:**
- Cannot make synchronous calls to OMS for every operation
- Real-time data sync is challenging
- Polling frequency must be limited
- Cannot rely on OMS for time-sensitive operations

**Constraints:**
- OMS codebase cannot be modified (legacy Java 8, small team)
- Database direct access is not allowed (must use API)
- No ability to add indexes or optimize queries
- Architecture cannot be changed

**Recommendations Required:**
- How to work around slow response times
- Caching strategy
- Asynchronous processing approach
- Fallback mechanisms

---

### 2. No Webhook Support

**Issue:** The OMS does not support webhooks or event-driven architecture.

**Specifics:**
- Must poll for order updates
- No real-time notifications of new orders
- No event bus or message queue integration
- All communication must be pull-based

**Impact on Integration:**
- Cannot get instant notifications of new orders
- Must implement polling mechanism
- Increased latency in order processing
- Higher API call volume

**Constraints:**
- Cannot add webhook capability to OMS
- No access to underlying database for change data capture
- No message queue available on OMS side

**Recommendations Required:**
- Optimal polling strategy
- How to minimize API calls
- How to detect changes efficiently
- Balance between latency and API load

---

### 3. Rate Limiting

**Issue:** OMS API has strict rate limits.

**Specifics:**
- 100 requests per minute per API key
- No burst allowance
- Hard cutoff (returns 429 after limit)
- Rate limit applies across all endpoints
- No ability to increase limits

**Impact on Integration:**
- Cannot poll all orders frequently
- Batch operations not supported
- Must carefully manage API quota
- Risk of hitting limits during peak times

**Constraints:**
- Single API key for integration (cannot split across multiple keys)
- No ability to request limit increase
- No priority queue or reserved capacity

**Recommendations Required:**
- How to stay within rate limits
- Prioritization strategy for API calls
- Handling of rate limit errors
- Queue management approach

---

### 4. Infrastructure Limitations

**Issue:** Mixed infrastructure with varying capabilities.

**Specifics:**
- Some systems on-premises, some in cloud
- Network latency varies by system
- No unified service mesh
- Different security policies per environment
- VPN required for on-prem access

**Impact on Integration:**
- Cannot assume consistent network performance
- Must handle variable latency
- Security policies may restrict certain approaches
- Deployment complexity

**Constraints:**
- Cannot move OMS to cloud
- Must work with existing network topology
- VPN has bandwidth limitations
- Some ports/protocols are blocked

---

## Business Constraints

### 1. Timeline

**Hard Deadline:** March 15, 2026 (8 weeks from kickoff)

**Reasoning:**
- Q2 planning deadline
- Current shipping contract ending
- Must have 6 months before peak season (November)

**Implications:**
- Must prioritize MVP features
- Cannot build everything initially
- Need phased rollout approach
- Testing time is limited

**Risk Factors:**
- No buffer for delays
- Holiday/vacation schedules (President's Day)
- Dependency on customer for testing
- Production cutover risk

---

### 2. Resources

**RetailCo Internal Team:**
- 3 full-time developers
- 1 part-time QA engineer
- Limited DevOps support (shared resource)
- No dedicated project manager

**Availability:**
- Developers also supporting current system
- Cannot dedicate 100% time to integration
- On-call rotations affect availability
- Meetings/planning reduce coding time

**Implications:**
- Solution must be maintainable by small team
- Cannot be overly complex
- Documentation is critical
- Handoff/training is essential

---

### 3. Budget

**Constraints:**
- Budget amount not disclosed but described as "limited"
- Must justify any additional costs
- Prefer existing tools/infrastructure
- Minimize operational costs

**Implications:**
- Cannot propose expensive third-party tools without justification
- Must use existing Kubernetes, RabbitMQ where possible
- Should avoid requiring new infrastructure
- License costs must be considered

---

### 4. Risk Tolerance

**Critical Requirement:** Cannot disrupt current operations.

**Specifics:**
- Orders must continue processing during migration
- No downtime allowed during business hours
- Rollback plan required
- Gradual rollout preferred

**Implications:**
- Need parallel running of old and new systems
- Feature flags for gradual enablement
- Comprehensive testing in non-prod
- Monitoring and alerting critical

---

## Technical Requirements

### 1. Order Volume

**Current:**
- Average: 50,000 orders/day
- Peak: 150,000 orders/day (November-December)
- Growth projection: 20% year-over-year

**Performance Requirements:**
- Process orders within 5 minutes of creation
- Handle 3x normal volume without degradation
- Support burst of 500 orders/minute

**Implications:**
- System must scale
- Queue capacity must accommodate peaks
- Database performance critical
- Monitoring for bottlenecks

---

### 2. Availability

**SLA Requirements:**
- 99.5% uptime during business hours (6am-10pm PT)
- 99% uptime overall
- Maximum 4 hours downtime per month

**Recovery Requirements:**
- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): 5 minutes
- Automatic failover where possible

**Implications:**
- Redundancy required
- Health checks and monitoring
- Disaster recovery plan
- Data backup strategy

---

### 3. Security & Compliance

**Requirements:**
- PCI DSS compliance (no card data in integration)
- SOC 2 Type II requirements
- GDPR compliance for customer data
- Data encryption in transit and at rest

**Constraints:**
- Cannot store customer payment information
- PII must be handled according to policy
- Audit logging required
- API keys must be rotated quarterly

**Implications:**
- Secure credential management (vault)
- Audit trail for all operations
- Data retention policies
- Access control and authentication

---

### 4. Data Quality

**Known Issues:**
- Address validation inconsistent
- Phone numbers sometimes missing
- Weight/dimensions occasionally estimated
- Duplicate orders can occur

**Requirements:**
- Validate addresses before shipment creation
- Handle missing data gracefully
- Detect and prevent duplicate shipments
- Log data quality issues

**Implications:**
- Need address validation service
- Business rules for missing data
- Idempotency in API calls
- Data quality monitoring

---

## Integration Points

### 1. Downstream Systems (Need Tracking Updates)

Multiple systems need tracking information:

**Customer Website:**
- Real-time tracking page
- Order status in account section
- Email notifications
- Must support 100,000+ concurrent users

**Customer Service Platform:**
- Zendesk integration
- CSRs need current status
- Historical tracking data
- Must be available 24/7

**Warehouse Management System:**
- Confirmation of shipment
- Return tracking
- Exception handling
- Integrates with scanners

**Analytics Platform:**
- Shipping metrics
- Cost analysis
- Performance reporting
- Daily batch loads acceptable

**Returns Processing System:**
- Return shipment creation
- Return tracking
- Refund triggers
- Must know when delivered

**Implications:**
- Multiple webhook endpoints required
- Different latency requirements per system
- Various data format requirements
- Retry logic and error handling
- Fan-out architecture needed

---

### 2. Existing Middleware

**Current Setup:**
- MuleSoft ESB for some integrations
- Custom middleware for others
- Mix of REST, SOAP, file-based integrations
- Legacy point-to-point connections

**Considerations:**
- Should new integration use MuleSoft or standalone?
- Can we leverage existing patterns?
- Risk of adding to "integration spaghetti"
- Maintenance burden

**Constraints:**
- MuleSoft license has user limits
- Some developers not familiar with MuleSoft
- Existing middleware has performance issues
- Documentation is sparse

---

## Operational Constraints

### 1. Monitoring & Alerting

**Current Tools:**
- Datadog for metrics
- PagerDuty for alerts
- ELK stack for logs
- Grafana for dashboards

**Requirements:**
- Integration must emit metrics
- Structured logging required
- Alert on critical failures
- Dashboard for operations team

**Implications:**
- Instrumentation in code
- Log aggregation setup
- Alert threshold configuration
- Runbook documentation

---

### 2. Deployment

**Environment:**
- Kubernetes in AWS
- GitLab CI/CD
- Helm charts for deployment
- Blue-green deployment capability

**Requirements:**
- Automated deployment pipeline
- Rollback capability
- Environment parity (dev/staging/prod)
- Infrastructure as code

**Constraints:**
- Must follow existing patterns
- Limited DevOps support
- Deployment windows (off-hours)
- Change approval process

---

### 3. Support & Maintenance

**Support Model:**
- Tier 1: Operations team (24/7)
- Tier 2: Development team (business hours)
- Tier 3: Escalation to Shipium

**Requirements:**
- Clear error messages
- Diagnostic endpoints
- Self-healing where possible
- Detailed documentation

**Implications:**
- Operations team needs training
- Runbooks must be comprehensive
- Monitoring must be actionable
- Debugging must be straightforward

---

## Decision Points

The following decisions must be made during solution design:

1. **Architecture Pattern:** 
   - Direct integration vs middleware layer?
   - Synchronous vs asynchronous?
   - Event-driven vs polling?

2. **Technology Stack:**
   - Programming language (Java, Node.js, Python, Go)?
   - Message queue (RabbitMQ, Kafka, SQS)?
   - Database (if needed)?

3. **Data Flow:**
   - Push vs pull from OMS?
   - Real-time vs batch processing?
   - Caching strategy?

4. **Error Handling:**
   - Retry strategy?
   - Circuit breaker pattern?
   - Dead letter queue?

5. **Scaling:**
   - Horizontal vs vertical?
   - Auto-scaling triggers?
   - Load balancing approach?

6. **Testing:**
   - Testing in production traffic?
   - Synthetic testing?
   - Gradual rollout strategy?

---

## Success Criteria

The integration is considered successful when:

1. **Functional:**
   - 95% of eligible orders routed through Shipium
   - Tracking updates received within 5 minutes
   - Accurate delivery estimates >90%

2. **Performance:**
   - Order processing latency <5 minutes
   - Rate API response <500ms P95
   - System handles 3x peak load

3. **Reliability:**
   - 99.5% uptime during business hours
   - <0.1% error rate
   - Zero data loss

4. **Operational:**
   - Operations team can support with minimal escalations
   - Clear dashboards and alerts
   - Runbooks cover common scenarios

5. **Business:**
   - 15% reduction in shipping costs
   - Improved customer satisfaction scores
   - Reduced manual intervention
