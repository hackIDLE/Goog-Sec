!!! warning "Under Construction"
    This page is under construction. Please check back later for comprehensive guidance

# Google Workspace Log Analysis and Threat Hunting Guide

This comprehensive guide provides security professionals with actionable strategies for performing effective log analysis and threat hunting within Google Workspace environments, with a focus on techniques applicable for MSPs managing multiple client environments.

## Understanding Google Workspace Logs

### Key Log Sources

Google Workspace provides several critical log types that security teams should leverage:

| Log Type | Description | Key Use Cases |
|----------|-------------|--------------|
| **Admin Audit Log** | Records administrative changes to Google Workspace configuration | Detecting unauthorized admin actions, privilege escalation, security control changes |
| **Login Audit Log** | Records user authentication events, including successes, failures, and challenges | Identifying account compromise, credential stuffing, phishing attacks |
| **Token Audit Log** | Records OAuth token issuance and usage | Detecting OAuth abuse, unauthorized application access |
| **SAML Audit Log** | Records SAML authentication events | Monitoring SSO implementation, detecting federation attacks |
| **Access Transparency Log** | Records Google staff access to customer content | Ensuring appropriate Google access to customer data |
| **Drive Audit Log** | Records file access, sharing, and modifications | Detecting data exfiltration, unauthorized sharing |
| **Gmail Log** | Records email delivery, processing, and user actions | Identifying email security incidents, data loss via email |
| **Mobile Audit Log** | Records mobile device activities and management actions | Monitoring mobile device security, detecting compromised devices |
| **Rules Log** | Records creation and modification of rules like email routing | Detecting persistence mechanisms, unauthorized mail forwarding |
| **Groups Audit Log** | Records changes to group membership and settings | Monitoring unauthorized access changes, detecting privilege changes |

### Log Collection Strategies

Depending on your environment and requirements, consider these collection approaches:

1. **Google Cloud-Native**
   - **Log Exports to Cloud Logging**: Direct integration with Google Cloud monitoring
   - **BigQuery Export**: For advanced analytics and long-term retention
   - **Pub/Sub Integration**: For real-time processing and custom workflows

2. **Third-Party SIEM Integration**
   - **API-Based Collection**: Regular polling of Admin SDK APIs
   - **Webhook Notifications**: Event-driven collection via push notifications
   - **Pre-built Connectors**: Using vendor-provided Google Workspace integrations

3. **MSP Multi-Tenant Collection**
   - **Aggregation Service**: Central collection point for multiple tenant logs
   - **Tenant Identification**: Ensuring proper segregation and identification
   - **Normalized Schema**: Consistent format across different tenant configurations

### Log Retention Considerations

- **Default Retention**: Understand Google's default retention periods by log type
- **Extended Retention**: Implementation of custom retention policies
- **Compliance Requirements**: Adjusting retention to meet regulatory needs
- **Investigation Support**: Ensuring sufficient history for security investigations
- **Cost Optimization**: Balancing security needs with storage costs

## Log Analysis Framework

### Foundation: The OODA Loop for Log Analysis

Apply the Observe-Orient-Decide-Act framework to Google Workspace logs:

1. **Observe**: Collect comprehensive logs from all relevant sources
2. **Orient**: Contextualize log data with threat intelligence and environment understanding
3. **Decide**: Determine if observed patterns indicate normal behavior or security incidents
4. **Act**: Implement appropriate response actions based on analysis

### Essential Analysis Techniques

#### Baseline Establishment

- **Authentication Patterns**: Understand normal login times, locations, and devices
- **Administrative Actions**: Document expected administrative activity cadence
- **Service Usage**: Establish normal usage patterns for each Google service
- **Data Access**: Identify typical data access and sharing patterns
- **Application Usage**: Document normal third-party application utilization

#### Anomaly Detection Approaches

- **Statistical Deviation**: Identifying activity outside normal standard deviations
- **Peer Group Analysis**: Comparing user activity to similar role peers
- **Temporal Analysis**: Identifying unusual timing of activities
- **Volume Analysis**: Detecting unusual quantities of events
- **Sequence Analysis**: Identifying atypical sequences of actions

#### Context Enhancement

- **User Context**: Enriching logs with HR data, role information, and department
- **Asset Context**: Adding device ownership, management status, and compliance state
- **Location Context**: Enhancing with office locations, remote work status, and travel data
- **Business Context**: Incorporating project assignments, access requirements
- **Threat Context**: Adding known IOCs, threat actor TTPs, and intelligence

## Threat Hunting Playbooks

### 1. Account Compromise Hunt

**Objective**: Identify potentially compromised user accounts

**Log Sources**:
- Login Audit Log
- Token Audit Log
- Admin Audit Log

**Hunt Techniques**:

1. **Authentication Anomaly Detection**
   - Query unusual login times outside user's typical pattern
   - Identify authentications from unusual geographies
   - Detect rapid authentications from distant locations (impossible travel)
   - Monitor for changes in authentication factors or methods

2. **Post-Compromise Activity Analysis**
   - Track password or recovery option changes after suspicious logins
   - Identify mail forwarding rules created after unusual access
   - Detect unusual Drive sharing or download activity following authentication
   - Monitor for OAuth token issuance to new applications

**Sample Hunt Query (SQL-like)**:
```sql
SELECT user_email, login_timestamp, ip_address, country, user_agent
FROM login_audit_logs
WHERE login_success = true
  AND login_timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 14 DAY)
  AND user_email NOT IN ('admin1@example.com', 'service-account@example.com')
GROUP BY user_email, DATE(login_timestamp)
HAVING COUNT(DISTINCT country) > 2
ORDER BY user_email, login_timestamp;
```

### 2. Data Exfiltration Hunt

**Objective**: Identify potential data theft or unauthorized data access

**Log Sources**:
- Drive Audit Log
- Gmail Log
- Admin Audit Log (for Takeout requests)

**Hunt Techniques**:

1. **Excessive Access Detection**
   - Identify users accessing unusually high volumes of documents
   - Detect access to documents outside normal job function
   - Monitor for systematic access to sensitive document categories
   - Track unusual search patterns across document repositories

2. **Suspicious Export Activities**
   - Identify bulk downloads from Drive
   - Detect unusual usage of Google Takeout
   - Monitor for mass printing activities
   - Track unusual email attachment patterns

**Sample Hunt Query (SQL-like)**:
```sql
SELECT actor_email, COUNT(DISTINCT doc_id) as accessed_docs,
       SUM(CASE WHEN visibility = 'private' THEN 1 ELSE 0 END) as private_docs,
       SUM(CASE WHEN doc_type = 'sensitive' THEN 1 ELSE 0 END) as sensitive_docs
FROM drive_audit_logs
WHERE event_type IN ('view', 'download')
  AND timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
GROUP BY actor_email
HAVING COUNT(DISTINCT doc_id) > 
  (SELECT AVG(doc_count) + 2*STDDEV(doc_count) 
   FROM (
     SELECT actor_email, COUNT(DISTINCT doc_id) as doc_count 
     FROM drive_audit_logs 
     WHERE timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
     GROUP BY actor_email
   ))
ORDER BY accessed_docs DESC;
```

### 3. Privilege Escalation Hunt

**Objective**: Identify unauthorized elevation of privileges

**Log Sources**:
- Admin Audit Log
- Groups Audit Log
- SAML Audit Log

**Hunt Techniques**:

1. **Administrative Role Changes**
   - Detect new admin role assignments
   - Identify unusual delegation of administrative privileges
   - Monitor for changes to powerful groups membership
   - Track privilege assignments outside change management windows

2. **Admin Activity Analysis**
   - Identify first-time admin actions by user accounts
   - Detect unusual sequences of administrative actions
   - Monitor for sensitive setting modifications
   - Track changes to security controls or monitoring settings

**Sample Hunt Query (SQL-like)**:
```sql
SELECT actor_email, affected_email, role_name, timestamp
FROM admin_audit_logs
WHERE event_type = 'ADMIN_ROLE_CHANGE'
  AND action = 'ASSIGN'
  AND timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
  AND NOT EXISTS (
    SELECT 1 FROM change_management_records
    WHERE change_type = 'ROLE_ASSIGNMENT'
      AND affected_user = affected_email
      AND planned_date BETWEEN TIMESTAMP_SUB(timestamp, INTERVAL 1 DAY) 
                          AND TIMESTAMP_ADD(timestamp, INTERVAL 1 DAY)
  )
ORDER BY timestamp;
```

### 4. OAuth Application Abuse Hunt

**Objective**: Identify potentially malicious third-party applications

**Log Sources**:
- Token Audit Log
- Admin Audit Log

**Hunt Techniques**:

1. **Suspicious Application Detection**
   - Identify new applications with sensitive scope requests
   - Detect applications with unusual user adoption patterns
   - Monitor for applications accessing unusual combinations of services
   - Track applications with abnormal token usage patterns

2. **Permission Scope Analysis**
   - Identify overprivileged application authorizations
   - Detect scope escalation in existing applications
   - Monitor for sensitive scope approvals (Gmail, Drive, Admin)
   - Track unusual scope usage patterns

**Sample Hunt Query (SQL-like)**:
```sql
SELECT application_name, client_id, requested_scopes, 
       COUNT(DISTINCT user_email) as user_count
FROM token_audit_logs
WHERE event_type = 'AUTHORIZE'
  AND timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 14 DAY)
  AND (
    requested_scopes LIKE '%gmail.modify%' OR
    requested_scopes LIKE '%drive%' OR
    requested_scopes LIKE '%admin%'
  )
  AND client_id NOT IN (SELECT client_id FROM approved_applications)
GROUP BY application_name, client_id, requested_scopes
ORDER BY user_count DESC;
```

### 5. Persistence Mechanism Hunt

**Objective**: Identify attacker persistence techniques

**Log Sources**:
- Admin Audit Log
- Gmail Log
- Rules Log
- Groups Audit Log

**Hunt Techniques**:

1. **Account Manipulation Detection**
   - Identify changes to account recovery options
   - Detect modifications to user authentication settings
   - Monitor for password changes after suspicious events
   - Track MFA disablement or changes

2. **Rule-Based Persistence Identification**
   - Identify creation of suspicious email forwarding rules
   - Detect unusual filter creations in Gmail
   - Monitor for scheduled jobs or triggers in Google environment
   - Track automated script deployment or modification

**Sample Hunt Query (SQL-like)**:
```sql
SELECT user_email, rule_id, rule_criteria, forward_destination, creation_time
FROM mail_rules_logs
WHERE event_type = 'CREATE_RULE'
  AND rule_action = 'FORWARD'
  AND creation_time > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
  AND forward_destination NOT LIKE '%@company.com'
  AND forward_destination NOT IN (SELECT email FROM approved_forwarding_destinations)
ORDER BY creation_time DESC;
```

## Advanced Threat Hunting Techniques

### User Behavior Analytics (UBA)

Implement advanced behavioral analytics:

1. **User Risk Scoring**
   - Develop multi-factor risk scoring based on log patterns
   - Weight different anomalies based on security impact
   - Adjust baselines based on role, department, and activity history
   - Combine multiple low-risk indicators to identify high-risk patterns

2. **Peer Group Analysis**
   - Group users by role, department, and function
   - Establish behavioral norms within each peer group
   - Compare individual activity against peer group
   - Identify significant deviations from peer behavior

3. **Session Analysis**
   - Track full user sessions rather than isolated events
   - Analyze activity sequences within sessions
   - Identify unusual transitions between services
   - Detect abnormal session duration or activity volume

### Threat Intelligence Integration

Enhance log analysis with threat intelligence:

1. **Indicator Matching**
   - Compare observed IP addresses against known threat infrastructure
   - Match user agents against known malicious patterns
   - Identify access from high-risk geographies
   - Detect connections to known command and control domains

2. **TTP Pattern Matching**
   - Create detection rules based on known attacker techniques
   - Match event sequences against documented attack patterns
   - Develop specific detections for Google Workspace attack techniques
   - Adjust detections based on emerging threat intelligence

3. **Custom Threat Feeds**
   - Develop Google Workspace-specific IoC feeds
   - Share intelligence across multiple tenant environments
   - Create MSP-specific intelligence based on cross-client observations
   - Develop vertical-specific threat indicators

## MSP-Specific Considerations

### Multi-Tenant Monitoring Strategies

1. **Cross-Tenant Analysis**
   - Implement normalized logging across all clients
   - Develop cross-tenant correlation capabilities
   - Create consistent detection rules applicable to all environments
   - Enable comparative analysis between similar organizations

2. **Tenant Isolation**
   - Maintain strict data segregation between tenants
   - Implement tenant-specific access controls for logs
   - Create role-based access to log analysis capabilities
   - Ensure client confidentiality in multi-tenant SOC

3. **Scalable Detection Engineering**
   - Develop reusable detection content
   - Implement programmatic rule deployment across tenants
   - Create tenant-specific tuning capabilities
   - Balance standardization with client-specific requirements

### Client Reporting and Dashboards

1. **Executive-Level Reporting**
   - Create high-level security posture dashboards
   - Develop trend analysis for key security metrics
   - Implement comparative benchmarking against industry peers
   - Provide actionable security improvement recommendations

2. **Technical Reporting**
   - Create detailed logs of security events
   - Provide technical indicators for client security teams
   - Implement drill-down capabilities for investigations
   - Offer raw log access for client-directed analysis

3. **Compliance-Focused Reporting**
   - Map log analysis to compliance frameworks
   - Create audit-ready reports for regulatory requirements
   - Provide evidence of security control effectiveness
   - Document security incidents and resolution actions

## Implementation Roadmap

### Phase 1: Foundation
- Implement comprehensive log collection from all critical sources
- Establish baseline visibility and basic alerting
- Develop initial detection use cases for high-risk scenarios
- Create basic reporting capabilities

### Phase 2: Enhancement
- Implement advanced correlation between log sources
- Develop user and entity behavioral baselines
- Create threat hunting program and initial playbooks
- Enhance detection coverage for known attack techniques

### Phase 3: Optimization
- Implement machine learning for anomaly detection
- Develop automated response workflows
- Create advanced threat hunting capabilities
- Establish continuous improvement processes

## Useful Resources

- [Google Workspace Admin SDK](https://developers.google.com/admin-sdk)
- [Google Security Operations](https://cloud.google.com/security-operations)
- [Chronicle Security Operations](https://chronicle.security)
- [MITRE ATT&CK Cloud Matrix](https://attack.mitre.org/matrices/enterprise/cloud/)
- [Google Workspace Security Best Practices](https://support.google.com/a/answer/7587183)

---

**Note**: This guide should be adapted to your organization's specific environment, requirements, and security maturity level.