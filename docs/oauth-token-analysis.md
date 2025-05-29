!!! warning "Under Construction"
    This page is under construction. Please check back later for comprehensive guidance

# OAuth Token Analysis and Authentication Audit Log Interpretation

This guide provides security professionals with detailed techniques for analyzing OAuth tokens and interpreting authentication audit logs in Google Workspace environments to detect and respond to security threats.

## OAuth Token Security Fundamentals

### Understanding OAuth Token Architecture in Google Workspace

OAuth tokens serve as the foundation for service-to-service and third-party application authentication in Google Workspace. Their compromise can lead to persistent access without requiring user credentials.

#### Token Types and Security Implications

| Token Type | Description | Security Considerations |
|------------|-------------|-------------------------|
| **Access Tokens** | Short-lived tokens (1-hour typical lifespan) that grant immediate access | Theft allows temporary access; limited persistence value |
| **Refresh Tokens** | Long-lived tokens that can obtain new access tokens | Primary persistence mechanism; theft enables long-term access |
| **ID Tokens** | JWT tokens containing identity information | Can leak user identity information if intercepted |
| **Service Account Keys** | JSON credentials for service accounts | Highest risk; equivalent to permanent credentials |
| **Authorization Codes** | Short-lived codes exchanged for tokens | Vulnerable during exchange process; MITM attack target |

#### OAuth Scope Security Classification

Develop a risk-based classification system for OAuth scopes:

**Critical Risk Scopes:**
- `https://www.googleapis.com/auth/admin.directory.user` (User management)
- `https://mail.google.com/` (Full Gmail access)
- `https://www.googleapis.com/auth/drive` (Full Drive access)
- `https://www.googleapis.com/auth/cloud-platform` (GCP access)
- `https://www.googleapis.com/auth/admin.directory.*` (Any admin directory access)

**High Risk Scopes:**
- `https://www.googleapis.com/auth/gmail.modify` (Gmail modification)
- `https://www.googleapis.com/auth/drive.file` (Access to files created/opened by app)
- `https://www.googleapis.com/auth/calendar` (Full calendar access)
- `https://www.googleapis.com/auth/contacts` (Contact access)

**Moderate Risk Scopes:**
- `https://www.googleapis.com/auth/gmail.readonly` (Read-only Gmail)
- `https://www.googleapis.com/auth/drive.readonly` (Read-only Drive)
- `https://www.googleapis.com/auth/calendar.readonly` (Read-only Calendar)

## Token Abuse Detection Techniques

### Analyzing Token Audit Logs

Google Workspace provides token-related audit events that can reveal suspicious activity. Key events to monitor:

#### Critical Token Events

| Event Type | Description | Suspicious Indicators |
|------------|-------------|----------------------|
| `AUTHORIZE` | User authorization of OAuth application | First-time appearance of application, unusual scope combinations, authorization outside business hours |
| `REVOKE` | Token revocation | Immediate reauthorization after revocation, selective token revocation |
| `TOKEN_REVOKE` | Admin revocation of tokens | Revocation followed by suspicious auth attempts |
| `AUTHENTICATION` | Service account token issuance | Unusual service account activity, excessive token generation |
| `SERVICE_ACCOUNT_KEY_CREATED` | Creation of service account key | Unauthorized creation, excessive key creation |

### Behavioral Analysis for Token Activity

Implement detection rules based on token behavior patterns:

#### Token Velocity Analysis
- **Baseline**: Establish normal token request patterns per user/application
- **Detection**: Alert on significant deviations in token request frequency
- **Implementation**: 
  ```sql
  SELECT user_email, application_name, COUNT(token_id) as token_count
  FROM token_audit_logs
  WHERE timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
  GROUP BY user_email, application_name
  HAVING token_count > 
    (SELECT AVG(daily_tokens) + 3*STDDEV(daily_tokens) 
     FROM token_baselines 
     WHERE app_category = 'same_category')
  ```

#### Token Usage Analysis
- **Baseline**: Document normal resource access patterns per token
- **Detection**: Identify tokens accessing unusual resource combinations
- **Implementation**: Track API endpoint access patterns and look for anomalies

#### Cross-User Token Pattern Analysis
- **Baseline**: Identify normal application adoption patterns
- **Detection**: Alert on applications obtaining authorization from unusual user combinations
- **Example**: Application suddenly authorized by finance, HR, and executive users in short timeframe

## Authentication Log Analysis Framework

### Key Authentication Event Types

| Event Type | Description | Security Value |
|------------|-------------|---------------|
| `login_success` | Successful login event | Establish authentication baseline, detect account takeover |
| `login_failure` | Failed login attempt | Identify brute force, password spraying, credential stuffing |
| `login_verification` | Second factor verification | Track MFA usage, detect MFA bypass attempts |
| `login_challenge` | Additional verification prompted | Monitor risk-based challenges, detect unusual auth patterns |
| `password_edit` | Password change event | Detect unauthorized credential changes, potential persistence |
| `2sv_disable` | Two-step verification disabled | Critical security control modification, potential account takeover |
| `reauth` | Re-authentication event | Track session management, detect session hijacking attempts |
| `account_disabled` | Account suspension or disabling | Monitor administrative actions, detect unauthorized changes |
| `recovery_email_edit` | Change to recovery email | Critical security control modification, potential account takeover |

### Advanced Authentication Analysis Techniques

#### Frequency-Based Detection
- **Login Velocity**: Alert on rapid authentication attempts exceeding normal patterns
- **Failed Attempt Patterns**: Identify distributed credential stuffing through pattern recognition
- **Successful/Failed Ratio Analysis**: Detect credential testing through changing success ratio

#### Location-Based Detection
- **Impossible Travel**: Alert on authentications from geographically distant locations
- **First-Time Location**: Identify first-time access from new countries/regions
- **Location-Role Mismatch**: Detect authentications from locations inappropriate for role

#### Time-Based Detection
- **After-Hours Authentication**: Alert on access during unusual hours for specific user roles
- **Authentication Gap Analysis**: Identify unusual gaps or changes in authentication patterns
- **Time of Day Shift**: Detect gradual shifts in authentication timing (potential compromise)

#### Device-Based Detection
- **Device Switching**: Alert on rapid changes between multiple devices
- **New Device + Sensitive Access**: Detect new devices immediately accessing sensitive resources
- **Device Factor Changes**: Monitor changes in device identification factors

## Practical Token Attack Detection

### OAuth Phishing Detection

OAuth phishing involves tricking users into authorizing malicious applications. Detection techniques:

1. **Application Reputation Analysis**
   - Maintain database of known-good applications with expected scopes
   - Alert on first-time appearance of applications in your environment
   - Implement application risk scoring based on developer reputation, user base

2. **Scope Mismatch Detection**
   - Document expected scope combinations for application types
   - Alert on applications requesting scope combinations that don't match their declared purpose
   - Example: A document viewer requesting Gmail modification scopes

3. **Authorization Timing Analysis**
   - Monitor for authorizations that occur immediately after suspicious email clicks
   - Correlate phishing email reports with OAuth authorization events
   - Track authorizations that follow unusual login patterns

### Token Theft Detection

Detect scenarios where valid tokens are stolen and used by unauthorized parties:

1. **Access Pattern Changes**
   - Establish baseline API call patterns per token/application
   - Alert on sudden changes in API call patterns or accessed resources
   - Monitor for tokens suddenly accessing sensitive data they haven't before

2. **Client Fingerprint Analysis**
   - Track client attributes associated with token usage (IP, user agent, TLS fingerprint)
   - Alert on token usage from new client fingerprints
   - Detect simultaneous token usage from multiple client fingerprints

3. **Usage Timing Analysis**
   - Document normal token usage time patterns
   - Alert on token usage outside expected hours/days
   - Detect unusual gaps followed by high-activity periods

### Service Account Token Abuse

Service accounts present special security challenges due to their privileged access:

1. **Service Account Inventory Management**
   - Maintain complete inventory of authorized service accounts
   - Document expected usage patterns, access needs, and owners
   - Regularly audit service account permissions

2. **Key Creation and Usage Monitoring**
   - Alert on new service account key creation
   - Monitor service account key age and implement rotation policies
   - Track key usage patterns and alert on deviations

3. **Domain-Wide Delegation Monitoring**
   - Document service accounts with domain-wide delegation
   - Strictly limit and monitor scope assignments
   - Implement additional monitoring for delegated access activities

## Real-World Attack Scenario Analysis

### Case Study 1: Targeted OAuth Phishing Campaign

**Attack Scenario:**
1. Attacker sends convincing document sharing email appearing to come from a colleague
2. Link leads to a fake document viewer requiring OAuth authorization
3. Application requests Gmail and Drive access scopes
4. Upon authorization, attacker uses access to:
   - Search emails for sensitive information
   - Exfiltrate targeted documents
   - Set up mail forwarding rules for persistence

**Detection Opportunities:**
- Application authorization from multiple users in short timeframe
- Unusual scope combinations for document viewer application
- Suspicious API call patterns following authorization
- Mail rule creation after OAuth authorization

**Detection Rule Example:**
```sql
SELECT user_email, application_name, requested_scopes, timestamp
FROM token_audit_logs
WHERE event_type = 'AUTHORIZE'
  AND timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
  AND application_name NOT IN (SELECT app_name FROM approved_applications)
  AND (
    requested_scopes LIKE '%gmail.modify%' OR
    requested_scopes LIKE '%gmail.compose%' OR
    requested_scopes LIKE '%gmail.settings%'
  )
  AND EXISTS (
    SELECT 1 FROM mail_rule_logs
    WHERE created_by = user_email
      AND rule_creation_time BETWEEN timestamp AND TIMESTAMP_ADD(timestamp, INTERVAL 1 HOUR)
      AND rule_action = 'forward'
  )
ORDER BY timestamp;
```

### Case Study 2: Refresh Token Persistence

**Attack Scenario:**
1. Attacker initially gains access through phishing or other means
2. Creates OAuth application requesting Drive and Gmail access
3. Tricks legitimate user into authorizing application
4. Attacker maintains access through refresh token even after credential changes
5. Uses access intermittently to avoid detection

**Detection Opportunities:**
- Unusual application authorization patterns
- API calls from application continuing after password reset
- Sporadic access patterns inconsistent with legitimate use
- Access from unusual geographic locations for the application

**Response Procedure:**
1. Identify all tokens issued to the suspicious application
2. Review access logs to determine data exposure
3. Revoke all tokens for the identified application
4. Block application by client ID at the organizational level
5. Search for similar applications using pattern matching
6. Scan for any persistence mechanisms established during access

### Case Study 3: Service Account Key Compromise

**Attack Scenario:**
1. Attacker gains access to development environment or code repository
2. Extracts embedded service account key with broad permissions
3. Uses service account access to extract data across multiple users
4. Creates additional service accounts for persistence

**Detection Opportunities:**
- Service account usage from unusual IP addresses
- Access pattern changes for the service account
- Unusual API call volume or resource access
- New service account creation or key generation

**Detection Rule Example:**
```sql
SELECT sa_email, client_ip, COUNT(DISTINCT accessed_resource) as resource_count
FROM service_account_logs
WHERE timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
  AND sa_email = 'compromised-service@project-id.iam.gserviceaccount.com'
  AND client_ip NOT IN (SELECT allowed_ip FROM service_account_allow_list WHERE sa_email = 'compromised-service@project-id.iam.gserviceaccount.com')
GROUP BY sa_email, client_ip
HAVING resource_count > 10
ORDER BY resource_count DESC;
```

## Implementation of Token-Focused Security Controls

### Preventative Controls

1. **OAuth App Whitelisting**
   - Implement domain-wide app access control in Google Admin Console
   - Configure API access control settings
   - Create an application approval process

2. **Sensitive Scope Restrictions**
   - Limit access to sensitive scopes (Gmail, Drive, Admin)
   - Require advanced verification for apps requesting sensitive scopes
   - Implement additional approval for critical scopes

3. **Service Account Governance**
   - Implement service account key rotation requirements
   - Configure service account access boundaries
   - Establish approval process for domain-wide delegation

### Detective Controls

1. **Token Activity Monitoring**
   - Create alerts for critical scope authorizations
   - Monitor application usage across users
   - Track token usage patterns and anomalies

2. **Authorization Analytics**
   - Develop risk scoring for application authorizations
   - Create dashboards for OAuth application visibility
   - Implement anomaly detection for authorization patterns

3. **Authentication Correlation**
   - Link authentication events with token activities
   - Correlate MFA changes with token issuance
   - Track relationship between password changes and token usage

### Responsive Controls

1. **Token Revocation Capabilities**
   - Implement bulk token revocation procedures
   - Create automated response playbooks
   - Test token revocation impact before implementation

2. **Application Blocking**
   - Establish procedures for blacklisting malicious applications
   - Implement client ID blocking mechanisms
   - Create application block list with known malicious apps

3. **User Communication Procedures**
   - Develop template for notifying users of suspicious authorizations
   - Create self-service token review capabilities
   - Implement automated notifications for high-risk authorizations

## Advanced Token Forensic Analysis

### Extracting Intelligence from Token Metadata

Token-related logs contain valuable metadata for forensic analysis:

1. **Client Analysis**
   - Extract and analyze user agent patterns
   - Identify anomalous client fingerprints
   - Correlate client information across multiple token uses

2. **Developer Identity Analysis**
   - Extract application developer information
   - Research developer reputation and history
   - Identify patterns of suspicious developer activities

3. **Token Lifecycle Analysis**
   - Map complete token lifecycle from issuance to use to revocation
   - Identify unusual gaps or patterns in usage
   - Correlate token usage with other user activities

### Reverse Engineering Token Usage

When investigating suspicious token activity:

1. **API Call Reconstruction**
   - Map sequence of API calls made using the token
   - Reconstruct attacker methodologies and targets
   - Identify data potentially accessed or exfiltrated

2. **Access Pattern Analysis**
   - Determine temporal patterns in resource access
   - Identify search patterns indicating targeting
   - Map potential data exfiltration pathways

3. **Cross-Service Correlation**
   - Track lateral movement between Google services
   - Identify relationships between token access and other activities
   - Correlate token usage with authentication events

## Token Security Roadmap for MSPs

### Implementation Phases

**Phase 1: Visibility and Baseline**
- Implement comprehensive token logging
- Establish application inventory and baseline
- Develop token usage baselines for clients

**Phase 2: Monitoring and Detection**
- Deploy basic token monitoring alerts
- Implement critical scope authorization approval
- Develop application risk assessment methodology

**Phase 3: Advanced Controls**
- Deploy machine learning for token anomaly detection
- Implement automated response for suspicious tokens
- Develop cross-tenant token threat intelligence

### Cross-Tenant Token Threat Intelligence

MSPs should leverage insights across multiple tenants:

1. **Anonymous Threat Sharing**
- Share suspicious application indicators across clients
- Develop common IOCs for token-based attacks
- Create centralized risk scoring for OAuth applications

2. **Common Detection Content**
- Develop standardized detection rules deployable across tenants
- Create common response playbooks
- Establish consistent security standards for token governance

3. **Collective Defense Strategy**
- Implement rapid blocking of known malicious applications
- Share anonymized attack pattern information
- Develop joint incident response capabilities

## Resources and Tools

### Google Workspace Security Tools

- **Token Audit API**: https://developers.google.com/admin-sdk/reports/v1/guides/manage-audit-tokens
- **OAuth Application Verification**: https://support.google.com/cloud/answer/7454865
- **Service Account Best Practices**: https://cloud.google.com/iam/docs/best-practices-for-managing-service-accounts

### Open Source Analysis Tools

- **Token Analyzer**: Tools for parsing and analyzing OAuth token structure
- **JWT Decoder**: https://jwt.io/ for analyzing token contents
- **OAuth Scanner**: Tools for identifying risky OAuth applications

### Additional Resources

- **Google API Explorer**: https://developers.google.com/apis-explorer
- **OAuth 2.0 Security Best Practices**: https://tools.ietf.org/html/draft-ietf-oauth-security-topics
- **MITRE ATT&CK for OAuth Abuse**: https://attack.mitre.org/techniques/T1550/001/

---

**Note**: This guide should be adapted to your specific environment and integrated with your broader security monitoring strategy.