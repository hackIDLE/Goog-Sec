!!! warning "Under Construction"
    This page is under construction. Please check back later for comprehensive guidance

# Automated Detection Rules for Google Workspace

This guide provides detailed, implementable detection rules for identifying suspicious and malicious activities in Google Workspace environments. These rules can be implemented in SIEM systems, Google Security Center, or custom monitoring solutions.

## Understanding Detection Engineering for Google Workspace

Effective detection in Google Workspace environments requires a strategic approach that combines:

- Log data collection from multiple Google services
- Well-crafted detection logic with appropriate thresholds
- Baseline understanding of normal user behavior
- Tuning to reduce false positives while maintaining detection efficacy
- Regular updates to address emerging threats

## Detection Rule Components

Each detection rule in this guide includes:

- **Rule name**: Clear, descriptive name
- **MITRE ATT&CK mapping**: Relevant tactics and techniques
- **Data sources**: Required log sources
- **Detection logic**: Specific conditions to trigger alerts
- **Severity**: Recommended alert priority (Critical, High, Medium, Low)
- **False positive scenarios**: Common benign triggers
- **Validation steps**: How to validate true positives
- **Response actions**: Recommended investigation steps

## Implementation Platforms

These rules can be implemented on:

- **Google Security Center**: Natively in Google Workspace
- **SIEM platforms**: Splunk, Microsoft Sentinel, Elastic, etc.
- **Cloud logging solutions**: Google Cloud Logging, BigQuery
- **Custom detection tools**: Internally developed monitoring solutions
- **Third-party GWS monitoring tools**: Specialized Google Workspace security tools

## Core Detection Rules

### Authentication & Access

#### Impossible Travel Detection

**Rule name**: GWS-AUTH-001: Authentication Impossible Travel

**MITRE ATT&CK**: Initial Access (T1078), Valid Accounts

**Data sources**: Login audit logs

**Detection logic**:
```
SELECT 
  user_email,
  timestamp AS current_login_time,
  ip_address AS current_ip,
  country AS current_country,
  LAG(timestamp) OVER (PARTITION BY user_email ORDER BY timestamp) AS previous_login_time,
  LAG(ip_address) OVER (PARTITION BY user_email ORDER BY timestamp) AS previous_ip,
  LAG(country) OVER (PARTITION BY user_email ORDER BY timestamp) AS previous_country,
  TIMESTAMP_DIFF(timestamp, LAG(timestamp) OVER (PARTITION BY user_email ORDER BY timestamp), MINUTE) AS minutes_between_logins
FROM login_events
WHERE timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
HAVING 
  previous_country IS NOT NULL 
  AND current_country != previous_country 
  AND minutes_between_logins < 240  /* 4 hours */
  AND previous_country NOT IN ('UNKNOWN', '')
  AND current_country NOT IN ('UNKNOWN', '')
```

**Severity**: High

**False positive scenarios**:
- VPN usage causing location changes
- Corporate travel with connections in transit
- Inaccurate IP geolocation data

**Validation steps**:
1. Verify user travel status with HR or manager
2. Check if user is using VPN services
3. Confirm device used for authentication
4. Review activity following the suspicious login

**Response actions**:
1. Reset user password and enforce re-authentication
2. Review account activity for signs of compromise
3. If confirmed suspicious, initiate incident response
4. Consider implementing location-based access restrictions

#### Brute Force Authentication Attempts

**Rule name**: GWS-AUTH-002: Authentication Brute Force Attempt

**MITRE ATT&CK**: Credential Access (T1110), Brute Force

**Data sources**: Login audit logs

**Detection logic**:
```
SELECT 
  user_email,
  ip_address,
  COUNT(*) AS failure_count
FROM login_events
WHERE 
  timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
  AND login_success = false
GROUP BY user_email, ip_address
HAVING failure_count >= 10
```

**Severity**: High

**False positive scenarios**:
- Forgotten password by legitimate user
- Application misconfiguration causing repeated login attempts
- Password manager issues

**Validation steps**:
1. Check if user reports password issues
2. Review IP address reputation and location
3. Examine login attempt patterns (timing, frequency)
4. Check for successful login following failed attempts

**Response actions**:
1. Temporarily lock account if still under attack
2. Reset user password if account was compromised
3. Block suspicious IP address if clearly malicious
4. Contact user to verify if attempts were legitimate

#### MFA Disablement

**Rule name**: GWS-AUTH-003: MFA Disabled for User

**MITRE ATT&CK**: Defense Evasion (T1562), Impair Defenses

**Data sources**: Admin audit logs

**Detection logic**:
```
SELECT 
  admin_email,
  target_user_email,
  timestamp,
  ip_address,
  user_agent
FROM admin_events
WHERE 
  timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
  AND event_type = 'TWO_FACTOR_DISABLE'
  AND (
    target_user_email IN (SELECT email FROM privileged_users)
    OR admin_email != 'scheduled-maintenance@company.com'
  )
```

**Severity**: High

**False positive scenarios**:
- Authorized MFA reset due to lost device
- Scheduled maintenance activities
- Help desk assisting with legitimate MFA issues

**Validation steps**:
1. Verify if change was authorized through proper channels
2. Confirm if admin account was authorized to make change
3. Check for associated help desk ticket
4. Review other activities by the admin account

**Response actions**:
1. Re-enable MFA if unauthorized
2. Reset admin password if admin account was compromised
3. Force password reset for affected user
4. Review admin account activities for other suspicious actions

#### Off-Hours Administrative Actions

**Rule name**: GWS-ADMIN-001: Administrative Actions During Off-Hours

**MITRE ATT&CK**: Privilege Escalation (T1078), Valid Accounts

**Data sources**: Admin audit logs

**Detection logic**:
```
SELECT 
  admin_email,
  event_type,
  target_resource,
  timestamp,
  ip_address
FROM admin_events
WHERE 
  timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
  AND (
    EXTRACT(HOUR FROM timestamp) < 6
    OR EXTRACT(HOUR FROM timestamp) > 22
  )
  AND EXTRACT(DAYOFWEEK FROM timestamp) BETWEEN 2 AND 6  /* Monday to Friday */
  AND event_type IN ('USER_PRIVILEGE_CHANGE', 'SECURITY_SETTING_CHANGE', 'PASSWORD_RESET')
  AND admin_email NOT IN (SELECT email FROM authorized_after_hours_admins)
```

**Severity**: Medium

**False positive scenarios**:
- Authorized emergency maintenance
- Admins in different time zones
- Planned after-hours changes
- Response to security incidents

**Validation steps**:
1. Verify if change was planned and approved
2. Confirm admin's regular working hours
3. Check for associated change management ticket
4. Review nature of the administrative action

**Response actions**:
1. Contact admin to verify if actions were legitimate
2. Review specific settings changed for security impact
3. Revert unauthorized changes
4. Implement approval workflow for off-hours admin actions

### Data Access & Exfiltration

#### Unusual Download Volume

**Rule name**: GWS-DATA-001: Unusual Download Volume

**MITRE ATT&CK**: Exfiltration (T1530), Data from Cloud Storage

**Data sources**: Drive audit logs

**Detection logic**:
```
SELECT 
  user_email,
  COUNT(*) AS download_count,
  SUM(file_size) AS total_download_size_bytes
FROM drive_activity
WHERE 
  timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
  AND activity_type = 'DOWNLOAD'
GROUP BY user_email
HAVING 
  download_count > 50
  OR total_download_size_bytes > 500000000  /* 500MB */
```

**Severity**: Medium

**False positive scenarios**:
- User backing up data for legitimate purposes
- Data migration activities
- New employee downloading relevant documents
- Development activities requiring bulk downloads

**Validation steps**:
1. Check if user is involved in data migration project
2. Verify types of files downloaded
3. Look for business justification for bulk downloads
4. Confirm if user's role typically requires bulk access

**Response actions**:
1. Contact user to verify purpose of downloads
2. Review specific files accessed for sensitivity
3. Examine user's historical download patterns
4. Consider implementing download quotas if unauthorized

#### Sensitive Data Access

**Rule name**: GWS-DATA-002: Sensitive Data Access from Unusual Location

**MITRE ATT&CK**: Exfiltration (T1530), Data from Cloud Storage

**Data sources**: Drive audit logs, DLP classification data

**Detection logic**:
```
SELECT 
  user_email,
  file_id,
  file_name,
  sensitivity_level,
  ip_address,
  country,
  timestamp
FROM drive_activity
JOIN file_sensitivity ON drive_activity.file_id = file_sensitivity.file_id
WHERE 
  timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
  AND sensitivity_level IN ('CONFIDENTIAL', 'RESTRICTED')
  AND country NOT IN (SELECT allowed_country FROM approved_access_locations)
  AND activity_type IN ('VIEW', 'DOWNLOAD', 'COPY')
```

**Severity**: High

**False positive scenarios**:
- Executive traveling internationally
- Approved remote work from non-standard location
- Third-party consultant with legitimate access
- VPN endpoint causing location misidentification

**Validation steps**:
1. Verify user's travel status
2. Confirm if access was from approved device
3. Check if user has history of accessing these files
4. Review business justification for remote access

**Response actions**:
1. Temporarily revoke access if clearly suspicious
2. Contact user to verify legitimacy of access
3. Review nature and sensitivity of data accessed
4. Implement geographic access restrictions if needed

#### Unusual Email Forwarding Rules

**Rule name**: GWS-EMAIL-001: Suspicious Email Forwarding Rule Creation

**MITRE ATT&CK**: Collection (T1114), Email Collection

**Data sources**: Gmail settings logs

**Detection logic**:
```
SELECT 
  user_email,
  rule_id,
  forwarding_address,
  creation_time,
  ip_address
FROM email_settings_changes
WHERE 
  timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
  AND change_type = 'CREATE_FORWARDING_RULE'
  AND (
    SPLIT(forwarding_address, '@')[OFFSET(1)] NOT IN (SELECT domain FROM approved_email_domains)
    OR user_email IN (SELECT email FROM executive_users)
  )
```

**Severity**: High

**False positive scenarios**:
- Employee forwarding to personal address for legitimate work
- Executive assistant setting up approved forwarding
- Temporary forwarding during planned absence
- Integration with ticketing or workflow systems

**Validation steps**:
1. Verify if forwarding was authorized by user
2. Check if forwarding address is known/trusted
3. Review recent login history for the user
4. Determine if user is aware of the forwarding rule

**Response actions**:
1. Remove unauthorized forwarding rules
2. Reset user password if account compromise suspected
3. Review email logs for potential data exfiltration
4. Implement forwarding restrictions if needed

### Administration & Configuration

#### Security Setting Modification

**Rule name**: GWS-ADMIN-002: Critical Security Setting Changed

**MITRE ATT&CK**: Defense Evasion (T1562), Impair Defenses

**Data sources**: Admin audit logs

**Detection logic**:
```
SELECT 
  admin_email,
  setting_name,
  old_value,
  new_value,
  timestamp,
  ip_address
FROM admin_setting_changes
WHERE 
  timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
  AND setting_category = 'SECURITY'
  AND setting_name IN (
    'REQUIRE_MFA',
    'EXTERNAL_SHARING_RESTRICTED',
    'ENFORCE_STRONG_PASSWORD',
    'OAUTH_APP_ACCESS',
    'ALLOW_LESS_SECURE_APPS',
    'LOGIN_CHALLENGES',
    'DATA_LOSS_PREVENTION'
  )
  AND admin_email NOT IN (SELECT email FROM security_administrators)
```

**Severity**: Critical

**False positive scenarios**:
- Authorized security configuration changes
- Temporary adjustments for troubleshooting
- Planned security control modifications
- New admin learning the environment

**Validation steps**:
1. Verify if change was planned and approved
2. Confirm admin is authorized for security settings
3. Check for associated change management documentation
4. Review the specific security impact of the change

**Response actions**:
1. Revert unauthorized security setting changes
2. Revoke admin access if unauthorized
3. Document all impacted settings and potential exposure
4. Review logs for exploitation during reduced security

#### New Administrator Creation

**Rule name**: GWS-ADMIN-003: New Super Admin Created

**MITRE ATT&CK**: Persistence (T1136), Create Account

**Data sources**: Admin audit logs

**Detection logic**:
```
SELECT 
  admin_email AS assigning_admin,
  target_user AS new_admin_user,
  timestamp,
  ip_address,
  user_agent
FROM admin_privilege_changes
WHERE 
  timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
  AND privilege_name = 'SUPER_ADMIN'
  AND change_type = 'ASSIGN'
```

**Severity**: Critical

**False positive scenarios**:
- Legitimate admin succession planning
- Approved expansion of admin team
- Recovery from admin departure
- Temporary admin assignment during project

**Validation steps**:
1. Verify if new admin was approved through proper channels
2. Confirm if assigning admin was authorized to grant Super Admin
3. Check for associated change management documentation
4. Validate new admin's identity and role requirements

**Response actions**:
1. Revoke unauthorized admin privileges
2. Investigate the assigning admin account for compromise
3. Review actions taken by the new admin account
4. Implement admin privilege review process

#### OAuth Application Authorization

**Rule name**: GWS-APPS-001: Suspicious OAuth Application Authorization

**MITRE ATT&CK**: Persistence (T1098), Account Manipulation

**Data sources**: OAuth token logs

**Detection logic**:
```
SELECT 
  user_email,
  application_name,
  application_id,
  scopes,
  timestamp,
  ip_address,
  user_agent
FROM oauth_token_grants
WHERE 
  timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
  AND (
    ARRAY_LENGTH(SPLIT(scopes, ' ')) > 5
    OR scopes LIKE '%https://www.googleapis.com/auth/gmail%'
    OR scopes LIKE '%https://www.googleapis.com/auth/drive%'
  )
  AND application_id NOT IN (SELECT app_id FROM approved_applications)
  AND user_email IN (SELECT email FROM privileged_users)
```

**Severity**: High

**False positive scenarios**:
- New approved application deployment
- User testing legitimate application
- Authorized third-party integration
- Admin testing security controls

**Validation steps**:
1. Review application details and publisher
2. Check if application is widely used in organization
3. Verify if user intended to grant specified permissions
4. Assess the specific permissions (scopes) granted

**Response actions**:
1. Revoke suspicious application access
2. Reset user password if credential theft suspected
3. Block unapproved application at organization level
4. Review logs for data access by the application

### Third-Party Activity

#### API Usage Anomalies

**Rule name**: GWS-API-001: Abnormal API Request Volume

**MITRE ATT&CK**: Exfiltration (T1530), Data from Cloud Storage

**Data sources**: API access logs

**Detection logic**:
```
SELECT 
  user_email,
  api_method,
  COUNT(*) AS api_call_count,
  AVG(COUNT(*)) OVER (
    PARTITION BY user_email, api_method
    ORDER BY DATE_TRUNC(timestamp, DAY)
    ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING
  ) AS daily_average_past_week
FROM api_access_logs
WHERE timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
GROUP BY user_email, api_method, DATE_TRUNC(timestamp, DAY)
HAVING 
  api_call_count > 5 * IFNULL(daily_average_past_week, 10)
  AND api_call_count > 100
```

**Severity**: Medium

**False positive scenarios**:
- New automated system deployment
- Bulk operations for legitimate business purposes
- Migration or backup activities
- System testing or validation

**Validation steps**:
1. Verify if high volume API usage was planned
2. Check specific API methods for sensitivity
3. Determine if user role requires this API access
4. Review historical API usage patterns

**Response actions**:
1. Temporarily restrict API access if clearly abnormal
2. Investigate data accessed through API calls
3. Implement API rate limiting if needed
4. Review service account permissions

#### Service Account Key Creation

**Rule name**: GWS-SVC-001: Service Account Key Created

**MITRE ATT&CK**: Credential Access (T1528), Steal Application Access Token

**Data sources**: Service account audit logs

**Detection logic**:
```
SELECT 
  admin_email,
  service_account_email,
  key_id,
  key_type,
  timestamp,
  ip_address
FROM service_account_key_events
WHERE 
  timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
  AND event_type = 'CREATE'
  AND service_account_email LIKE '%@*.gserviceaccount.com'
  AND admin_email NOT IN (SELECT email FROM authorized_service_account_admins)
```

**Severity**: High

**False positive scenarios**:
- Authorized key rotation
- New service deployment
- Development and testing activities
- Automation setup by authorized personnel

**Validation steps**:
1. Verify if key creation was authorized
2. Check service account permissions and access
3. Confirm admin is authorized for service account management
4. Review the purpose of the service account

**Response actions**:
1. Disable unauthorized service account keys
2. Review service account activity for suspicious usage
3. Implement approval process for key creation
4. Ensure key rotation policies are in place

## Advanced Detection Techniques

### Behavioral Analytics

Implement these more sophisticated detection approaches for mature security programs:

#### User Behavioral Baseline Detection

**Rule name**: GWS-UBA-001: User Behavior Anomaly Detection

**MITRE ATT&CK**: Multiple

**Data sources**: Login logs, Drive logs, Gmail logs, API logs

**Detection approach**:

1. Establish behavioral baselines for each user:
   - Typical working hours
   - Normal device and location patterns
   - Common file access patterns
   - Regular collaboration partners
   - Usual email communication patterns
   - Standard API usage

2. Calculate deviation scores for current activity:
   - Time-of-day anomaly score
   - Location anomaly score
   - Device anomaly score
   - Resource access anomaly score
   - Communication anomaly score
   - Volume anomaly score

3. Generate alerts on significant composite score deviations:
   ```
   SELECT
     user_email,
     activity_date,
     time_anomaly_score,
     location_anomaly_score,
     device_anomaly_score,
     resource_anomaly_score,
     communication_anomaly_score,
     volume_anomaly_score,
     (time_anomaly_score + location_anomaly_score + device_anomaly_score + 
      resource_anomaly_score + communication_anomaly_score + volume_anomaly_score) AS composite_score
   FROM user_daily_anomaly_scores
   WHERE activity_date = CURRENT_DATE()
   AND composite_score > 15  /* Threshold determined through tuning */
   ```

**Severity**: High (based on composite score)

**Implementation considerations**:
- Requires significant historical data (30+ days minimum)
- Machine learning capabilities strongly recommended
- Regular retraining to adapt to changing user behaviors
- Tuning process to minimize false positives

#### Peer Group Analytics

**Rule name**: GWS-UBA-002: Peer Group Anomaly Detection

**MITRE ATT&CK**: Multiple

**Data sources**: Login logs, Drive logs, Gmail logs, API logs

**Detection approach**:

1. Define peer groups based on:
   - Department or organizational unit
   - Job role and responsibilities
   - Access patterns and permissions
   - Location and work schedules

2. Establish peer group behavioral norms:
   - Average document access counts
   - Typical external communication patterns
   - Normal sharing behaviors
   - Common application usage

3. Detect individual deviations from peer group:
   ```
   SELECT
     user_email,
     department,
     user_download_count,
     AVG(download_count) OVER (PARTITION BY department) AS dept_avg_downloads,
     STDDEV(download_count) OVER (PARTITION BY department) AS dept_stddev_downloads,
     (user_download_count - dept_avg_downloads) / NULLIF(dept_stddev_downloads, 0) AS z_score
   FROM user_activity_summary
   WHERE activity_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
   HAVING ABS(z_score) > 3  /* Exceeds 3 standard deviations */
   ```

**Severity**: Medium (requires investigation)

**Implementation considerations**:
- Need accurate and updated organizational structure data
- Regular review of peer group definitions
- Multiple behavioral dimensions for comprehensive analysis
- Adjustment for legitimate role differences within groups

## Detection Rule Management

### Tuning and Optimization

Effective rule tuning requires a structured approach:

1. **Baseline establishment**:
   - Monitor alert volumes initially without taking action
   - Identify normal activity patterns that trigger alerts
   - Document legitimate business processes that may appear suspicious

2. **Threshold adjustment**:
   - Gradually adjust thresholds to reduce false positives
   - Document justification for threshold changes
   - Re-validate detection efficacy after adjustments

3. **Exclusion management**:
   - Create specific, documented exclusions for known good activities
   - Review exclusions periodically (at least quarterly)
   - Implement sunset dates for temporary exclusions
   - Document business justification for each exclusion

4. **Continuous improvement**:
   - Schedule regular rule reviews (quarterly recommended)
   - Adjust rules based on changes to organization and threat landscape
   - Document rule performance metrics over time
   - Test rule modifications in staging environment when possible

### Rule Deployment Framework

Implement a structured approach to rule deployment:

1. **Development phase**:
   - Research threat and create detection hypothesis
   - Document expected behaviors to detect
   - Create initial rule logic
   - Test against historical data if available

2. **Testing phase**:
   - Deploy in "alert only" mode without automated actions
   - Document false positive rate
   - Refine rule logic based on testing results
   - Validate against known good and bad samples

3. **Production deployment**:
   - Document final rule logic and thresholds
   - Create runbook for alert handling
   - Train security team on investigation procedures
   - Set review date for rule effectiveness

4. **Maintenance phase**:
   - Track alert metrics (volume, false positive rate, MTTD, MTTR)
   - Schedule periodic reviews of rule effectiveness
   - Update rules to address emerging threats
   - Document rule version history and changes

## Integration with Security Operations

### Prioritization Framework

Use this framework to prioritize alerts for investigation:

1. **Primary factors**:
   - Asset criticality (user account, data sensitivity)
   - Rule confidence level
   - Attack stage (early reconnaissance vs. active exfiltration)
   - Potential business impact

2. **Secondary factors**:
   - Historical user behavior
   - Correlation with other alerts
   - External threat intelligence
   - Business context (M&A activity, sensitive projects, etc.)

3. **Scoring model**:
   ```
   Alert Priority = 
     (Asset Criticality * 0.3) + 
     (Rule Confidence * 0.2) + 
     (Attack Stage * 0.3) + 
     (Business Impact * 0.2)
   ```

4. **Priority levels**:
   - P1: Critical (SOC response within 15 minutes)
   - P2: High (SOC response within 1 hour)
   - P3: Medium (SOC response within 8 hours)
   - P4: Low (SOC response within 24 hours)

### Automated Response Playbooks

These detection rules can trigger automated response actions:

#### Account Compromise Response

For high-confidence account compromise detections:

1. **Immediate containment**:
   - Force password reset
   - Revoke active sessions
   - Enable MFA or increase MFA strength

2. **Automated investigation**:
   - Collect recent login history
   - Gather OAuth token grants
   - Identify recently accessed sensitive documents
   - Check for email forwarding rules

3. **Threat containment**:
   - Quarantine suspicious emails
   - Restrict access to sensitive applications
   - Block unusual IP addresses
   - Raise authentication requirements

#### Data Exfiltration Response

For potential data theft scenarios:

1. **Access control**:
   - Revoke suspicious sharing permissions
   - Remove unauthorized forwarding rules
   - Temporarily restrict download capabilities
   - Suspend suspicious OAuth applications

2. **Data assessment**:
   - Inventory potentially exposed documents
   - Evaluate sensitivity of accessed information
   - Identify recipients of shared content
   - Document timeline of suspicious access

3. **Evidence preservation**:
   - Capture access logs for investigation
   - Preserve copies of exposed documents
   - Document sharing and access patterns
   - Create timeline of relevant events

## Resources

- [Google Workspace Admin SDK API](https://developers.google.com/admin-sdk)
- [Google Cloud Logging Documentation](https://cloud.google.com/logging/docs)
- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [Google Workspace Security Best Practices](https://support.google.com/a/answer/7587183)
- [Google Workspace Investigation Tool](https://support.google.com/a/answer/7587832)

---

**Note**: Actual implementation details will vary based on your specific environment, log availability, and security tools. Adapt these detection rules to match your organization's requirements and technical capabilities.