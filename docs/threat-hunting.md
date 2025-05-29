!!! warning "Under Construction"
    This page is under construction. Please check back later for comprehensive guidance

# Threat Hunting Playbooks for Google Workspace

This guide provides detailed, actionable threat hunting playbooks for Google Workspace environments, enabling security teams to proactively identify potential compromises and adversary activity.

## Understanding Threat Hunting in Google Workspace

Threat hunting in Google Workspace involves proactively searching through logs, settings, and user activities to identify potential security threats that have evaded automated detection. Effective threat hunting:

- Reduces attacker dwell time
- Identifies novel attack techniques
- Uncovers security misconfigurations
- Validates security controls
- Builds institutional security knowledge

## Core Requirements for Effective Threat Hunting

### Data Sources

Effective Google Workspace threat hunting requires access to:

- **Admin console logs**: Configuration changes, admin actions, security settings
- **Login audit logs**: Authentication events, login patterns, session details
- **Access transparency logs**: Google administrator accesses to your content
- **Drive audit logs**: Document sharing, downloads, and modification events
- **Gmail logs**: Mail flow, filtering decisions, and security events
- **API usage logs**: Third-party application activities and integrations
- **Data access logs**: Access to sensitive data and potential exfiltration
- **Mobile device logs**: Device status, security posture, and management events

### Hunting Tools

Leverage these tools for Google Workspace threat hunting:

- **Google Security Center**: Built-in security analytics and alerts
- **Log export to SIEM**: Integration with security information event management systems
- **BigQuery analysis**: Advanced querying and correlation of exported logs
- **Google Workspace APIs**: Programmatic access to security-relevant information
- **Custom scripts**: Purpose-built tools for specific hunting objectives
- **Alert Investigation Tool**: Investigating security alerts in Google Workspace

## Threat Hunting Playbooks

### Playbook 1: OAuth Token Abuse Detection

**Objective**: Identify potentially malicious OAuth tokens with excessive privileges or unusual usage patterns

**Data Sources**: Admin SDK Reports API, Admin logs, Token audit logs

**Hypothesis**: Attackers may be abusing OAuth tokens to maintain persistent access

**Hunt Methodology**:

1. **Baseline Analysis**
   - Identify all authorized OAuth applications in the environment
   - Document normal usage patterns and authorized scopes
   - Establish typical application-to-user relationships

2. **Anomaly Detection**
   - Query tokens with unusual or excessive scope combinations:
     ```sql
     SELECT application_name, scopes, COUNT(user) as user_count
     FROM oauth_token_logs
     WHERE scopes CONTAINS 'https://www.googleapis.com/auth/gmail.send'
     AND scopes CONTAINS 'https://www.googleapis.com/auth/drive'
     GROUP BY application_name, scopes
     ORDER BY user_count ASC
     ```
   - Look for recently authorized applications with sensitive scopes:
     ```sql
     SELECT application_name, scopes, authorize_time, user
     FROM oauth_token_logs
     WHERE authorize_time > DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
     AND (scopes CONTAINS 'https://www.googleapis.com/auth/gmail' OR
          scopes CONTAINS 'https://www.googleapis.com/auth/drive')
     ```

3. **Usage Pattern Analysis**
   - Identify tokens with usage patterns indicating automation:
     ```sql
     SELECT token_id, application_name, COUNT(activity) as activity_count
     FROM token_activity_logs
     WHERE timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
     GROUP BY token_id, application_name
     HAVING activity_count > 1000
     ```
   - Look for tokens active during unusual hours:
     ```sql
     SELECT token_id, application_name, user, HOUR(timestamp) as hour_of_day
     FROM token_activity_logs
     WHERE HOUR(timestamp) BETWEEN 0 AND 5
     AND WEEKDAY(timestamp) BETWEEN 1 AND 5
     ```

4. **Cross-correlation**
   - Correlate suspicious token activity with login anomalies
   - Compare token usage with user behavior baselines
   - Check for tokens authorized during suspicious login sessions

5. **Validation & Response**
   - Manually review suspicious application permissions
   - Verify business justification for questionable tokens
   - Revoke unauthorized tokens and document findings

### Playbook 2: Account Takeover Hunting

**Objective**: Identify compromised accounts through login behavior and post-compromise activities

**Data Sources**: Login audit logs, Admin logs, Gmail logs, Drive audit logs

**Hypothesis**: Compromised accounts will exhibit login anomalies followed by suspicious activities

**Hunt Methodology**:

1. **Login Pattern Analysis**
   - Look for impossible travel scenarios:
     ```sql
     SELECT user_email, login_time, ip_address, country
     FROM login_logs
     ORDER BY user_email, login_time
     ```
   - Analyze by pivoting from this data to identify rapid location changes
   
   - Identify unusual authentication methods:
     ```sql
     SELECT user_email, auth_method, COUNT(*) as auth_count
     FROM login_logs
     WHERE timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
     GROUP BY user_email, auth_method
     ```
   - Look for changes in authentication patterns over time

2. **Post-Authentication Activity Analysis**
   - Hunt for password or MFA changes shortly after suspicious logins:
     ```sql
     SELECT user_email, activity_type, timestamp
     FROM admin_logs
     WHERE activity_type IN ('PASSWORD_CHANGE', 'MFA_CHANGE', 'RECOVERY_EMAIL_CHANGE')
     AND timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
     ```
   
   - Look for unusual email processing rules:
     ```sql
     SELECT user_email, rule_created_time, rule_criteria, rule_action
     FROM email_settings_logs
     WHERE rule_action CONTAINS 'FORWARD'
     AND timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY)
     ```

3. **Data Access Pattern Analysis**
   - Look for unusual document access or download spikes:
     ```sql
     SELECT user_email, COUNT(*) as download_count
     FROM drive_activity_logs
     WHERE activity_type = 'DOWNLOAD'
     AND timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
     GROUP BY user_email
     ORDER BY download_count DESC
     ```
   
   - Identify sensitive document access from unusual locations:
     ```sql
     SELECT user_email, document_id, ip_address, country
     FROM drive_activity_logs
     WHERE document_sensitivity = 'HIGH'
     AND timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
     AND ip_address NOT IN (SELECT trusted_ip FROM ip_whitelist)
     ```

4. **Validation & Response**
   - Create timeline of suspicious activities for potential compromises
   - Check endpoint logs for the impacted users if available
   - Verify whether actions were legitimate with users
   - Document findings and implement response procedures if needed

### Playbook 3: Persistence Mechanism Detection

**Objective**: Identify attacker persistence mechanisms established in Google Workspace

**Data Sources**: Admin console logs, Service account logs, Cloud project logs

**Hypothesis**: Attackers establish persistence using service accounts, authorized applications, or delegated access

**Hunt Methodology**:

1. **App Script Persistence Hunt**
   - Identify unusual or recently modified Apps Script triggers:
     ```sql
     SELECT script_id, creator_email, trigger_type, creation_time
     FROM apps_script_logs
     WHERE trigger_type = 'TIME_DRIVEN'
     AND creation_time > DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
     ```
   
   - Hunt for scripts with sensitive scopes:
     ```sql
     SELECT script_id, creator_email, script_scope
     FROM script_scope_logs
     WHERE script_scope CONTAINS 'https://www.googleapis.com/auth/gmail'
     OR script_scope CONTAINS 'https://www.googleapis.com/auth/drive'
     OR script_scope CONTAINS 'https://www.googleapis.com/auth/admin'
     ```

2. **Delegated Admin Hunt**
   - Identify recent delegation changes:
     ```sql
     SELECT admin_email, delegated_email, privilege, timestamp
     FROM admin_delegation_logs
     WHERE timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)
     ORDER BY timestamp DESC
     ```
   
   - Look for unusual privilege combinations:
     ```sql
     SELECT delegated_email, COUNT(DISTINCT privilege) as privilege_count
     FROM admin_delegation_logs
     GROUP BY delegated_email
     ORDER BY privilege_count DESC
     ```

3. **Service Account Analysis**
   - Hunt for newly created service accounts with unusual permissions:
     ```sql
     SELECT service_account_id, creator_email, creation_time, privilege
     FROM service_account_logs
     WHERE creation_time > DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
     AND privilege IN ('ADMIN_READ', 'ADMIN_WRITE', 'DATA_ACCESS')
     ```
   
   - Identify service accounts with inconsistent usage patterns:
     ```sql
     SELECT service_account_id, api_method, COUNT(*) as api_call_count
     FROM service_account_activity
     WHERE timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY)
     GROUP BY service_account_id, api_method
     ```

4. **Recovery Methods Analysis**
   - Look for recently modified account recovery information:
     ```sql
     SELECT user_email, change_type, old_value, new_value, timestamp
     FROM account_recovery_logs
     WHERE timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
     AND change_type IN ('RECOVERY_PHONE', 'RECOVERY_EMAIL')
     ```
   
   - Hunt for accounts with recovery email domains different from corporate domains:
     ```sql
     SELECT user_email, recovery_email_domain, timestamp
     FROM recovery_settings
     WHERE recovery_email_domain NOT IN ('company.com', 'trusted-partner.com')
     ```

5. **Validation & Response**
   - Verify business purpose for identified persistence mechanisms
   - Check for approval and documentation of delegated access
   - Document findings and escalate suspicious configurations
   - Implement remediation procedures if unauthorized persistence is found

### Playbook 4: Data Exfiltration Detection

**Objective**: Identify potential data exfiltration through authorized or unauthorized channels

**Data Sources**: Drive logs, Gmail logs, DLP logs, Admin logs

**Hypothesis**: Data exfiltration attempts will exhibit unusual data access or sharing patterns

**Hunt Methodology**:

1. **Unusual Sharing Pattern Analysis**
   - Hunt for mass external sharing activities:
     ```sql
     SELECT user_email, COUNT(*) as external_share_count
     FROM drive_sharing_logs
     WHERE sharing_type = 'EXTERNAL'
     AND timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
     GROUP BY user_email
     ORDER BY external_share_count DESC
     ```
   
   - Identify sensitive document external sharing:
     ```sql
     SELECT document_id, user_email, recipient_email, document_sensitivity, timestamp
     FROM drive_sharing_logs
     WHERE document_sensitivity IN ('HIGH', 'RESTRICTED')
     AND sharing_type = 'EXTERNAL'
     AND timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY)
     ```

2. **Download Activity Analysis**
   - Look for mass download behaviors:
     ```sql
     SELECT user_email, COUNT(*) as download_count
     FROM drive_activity_logs
     WHERE activity_type = 'DOWNLOAD'
     AND timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
     GROUP BY user_email
     HAVING download_count > 50
     ORDER BY download_count DESC
     ```
   
   - Identify off-hours download activity:
     ```sql
     SELECT user_email, document_id, timestamp
     FROM drive_activity_logs
     WHERE activity_type = 'DOWNLOAD'
     AND HOUR(timestamp) NOT BETWEEN 8 AND 18
     AND WEEKDAY(timestamp) BETWEEN 1 AND 5
     AND timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
     ```

3. **Email Exfiltration Analysis**
   - Hunt for emails with suspicious attachments:
     ```sql
     SELECT sender_email, recipient_email, attachment_count, attachment_size, timestamp
     FROM gmail_logs
     WHERE recipient_domain NOT IN ('company.com', 'trusted-partner.com')
     AND attachment_count > 0
     AND attachment_size > 5000000
     AND timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
     ```
   
   - Look for emails with unusual volume to external domains:
     ```sql
     SELECT sender_email, recipient_domain, COUNT(*) as email_count
     FROM gmail_logs
     WHERE recipient_domain NOT IN ('company.com', 'trusted-partner.com')
     AND timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
     GROUP BY sender_email, recipient_domain
     ORDER BY email_count DESC
     ```

4. **DLP Alert Correlation**
   - Correlate DLP alerts with user activities:
     ```sql
     SELECT user_email, alert_type, COUNT(*) as alert_count
     FROM dlp_alert_logs
     WHERE timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY)
     GROUP BY user_email, alert_type
     ORDER BY alert_count DESC
     ```
   
   - Look for patterns in DLP rule violations:
     ```sql
     SELECT dlp_rule, user_email, document_id, timestamp
     FROM dlp_violation_logs
     WHERE timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY)
     ORDER BY user_email, timestamp
     ```

5. **Validation & Response**
   - Verify business justification for identified activities
   - Create a timeline of suspicious data movements
   - Cross-reference with approved data handling procedures
   - Document findings and escalate as appropriate

### Playbook 5: Admin Privilege Abuse Detection

**Objective**: Identify potential abuse of administrative privileges

**Data Sources**: Admin console logs, User privilege logs, Admin API audit logs

**Hypothesis**: Malicious actors with admin access will perform suspicious administrative actions

**Hunt Methodology**:

1. **Privilege Escalation Analysis**
   - Hunt for unusual privilege assignments:
     ```sql
     SELECT admin_email, target_user, assigned_role, timestamp
     FROM admin_privilege_logs
     WHERE assigned_role IN ('SUPER_ADMIN', 'USER_MANAGEMENT_ADMIN', 'SECURITY_ADMIN')
     AND timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
     ORDER BY timestamp DESC
     ```
   
   - Look for self-promotion activities:
     ```sql
     SELECT admin_email, target_user, assigned_role, timestamp
     FROM admin_privilege_logs
     WHERE admin_email = target_user
     AND timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
     ```

2. **Sensitive Setting Modification Analysis**
   - Identify changes to security-critical settings:
     ```sql
     SELECT admin_email, setting_name, old_value, new_value, timestamp
     FROM admin_setting_logs
     WHERE setting_category IN ('SECURITY', 'AUTHENTICATION', 'DATA_ACCESS')
     AND timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
     ORDER BY timestamp DESC
     ```
   
   - Hunt for MFA requirement changes:
     ```sql
     SELECT admin_email, setting_name, old_value, new_value, timestamp
     FROM admin_setting_logs
     WHERE setting_name LIKE '%MFA%'
     OR setting_name LIKE '%TWO_FACTOR%'
     OR setting_name LIKE '%2SV%'
     AND timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)
     ```

3. **User Management Analysis**
   - Look for unusual account creation patterns:
     ```sql
     SELECT admin_email, COUNT(*) as creation_count
     FROM user_creation_logs
     WHERE timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
     GROUP BY admin_email
     ORDER BY creation_count DESC
     ```
   
   - Identify suspicious password resets:
     ```sql
     SELECT admin_email, target_user, timestamp
     FROM password_reset_logs
     WHERE timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY)
     ORDER BY admin_email, timestamp
     ```

4. **Admin API Usage Analysis**
   - Hunt for unusual API patterns:
     ```sql
     SELECT admin_email, api_method, COUNT(*) as api_call_count
     FROM admin_api_logs
     WHERE timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
     GROUP BY admin_email, api_method
     ORDER BY api_call_count DESC
     ```
   
   - Look for sensitive API usage off-hours:
     ```sql
     SELECT admin_email, api_method, timestamp
     FROM admin_api_logs
     WHERE api_method IN ('Directory.Users.delete', 'Directory.Users.update', 'Groups.Members.delete')
     AND HOUR(timestamp) NOT BETWEEN 8 AND 18
     AND WEEKDAY(timestamp) BETWEEN 1 AND 5
     AND timestamp > DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY)
     ```

5. **Validation & Response**
   - Verify changes against approved change management processes
   - Check for documentation of administrative actions
   - Create timeline of suspicious administrative activities
   - Escalate unexplained administrative actions for further investigation

## Threat Hunting Program Development

### Maturity Model for Google Workspace Threat Hunting

**Level 1: Initial Hunting Capability**
- Ad-hoc hunting based on external intelligence
- Basic log analysis capabilities
- Limited hunting scope focused on known threats
- Minimal documentation of hunting procedures

**Level 2: Developing Hunting Capability**
- Regular hunting cadence established
- Documented hunting procedures for common scenarios
- Basic hypothesis development process
- Limited integration with incident response

**Level 3: Defined Hunting Program**
- Comprehensive playbooks covering major threat categories
- Integration with threat intelligence
- Structured hypothesis development and testing
- Formal documentation of hunting methodologies
- Regular knowledge sharing and training

**Level 4: Managed Hunting Program**
- Metrics to measure hunting effectiveness
- Automated enrichment of hunting findings
- Feedback loop with detection engineering
- Cross-platform hunting capabilities
- Regular program review and improvement

**Level 5: Optimizing Hunting Program**
- Advanced analytics and machine learning support
- Continuous hypothesis refinement
- Automated hunting for common scenarios
- Tight integration with security operations
- Contribution to broader threat intelligence

### Building a Threat Hunting Team

**Core Skills for Google Workspace Threat Hunters:**
- Google Workspace architecture knowledge
- Log analysis expertise
- Data analysis and SQL querying skills
- Understanding of common attack techniques
- Critical thinking and hypothesis development
- Technical documentation capabilities

**Recommended Team Structure:**
- Hunt Lead: Coordinates hunting activities and methodologies
- Data Specialists: Focus on data acquisition and analysis
- Workspace Security Specialists: Provide platform expertise
- Threat Intelligence Analysts: Provide context and emerging threats
- Detection Engineers: Implement persistent detection from findings

### Threat Hunting Cadence

**Recommended Hunting Schedule:**
- Daily: Quick hunts for high-priority threat patterns
- Weekly: Deeper analysis of specific threat categories
- Monthly: Comprehensive hunting across multiple threat vectors
- Quarterly: Advanced hunts incorporating new techniques and intelligence

**Prioritization Framework:**
- Business impact of potential threats
- Current threat landscape and intelligence
- Recent security incidents or near-misses
- Security control changes and gap identification
- Compliance and regulatory requirements

## Resources

- [Google Workspace Admin SDK API](https://developers.google.com/admin-sdk)
- [Google Security Center Documentation](https://support.google.com/a/answer/7492330)
- [Log Export to BigQuery](https://support.google.com/a/answer/7061566)
- [MITRE ATT&CK for Enterprise](https://attack.mitre.org/matrices/enterprise/)
- [Google Workspace Investigation Tool](https://support.google.com/a/answer/7587832)

---

**Note**: Actual SQL queries will vary based on your specific log schema and export configuration. Adapt these examples to match your environment's specific data structure.