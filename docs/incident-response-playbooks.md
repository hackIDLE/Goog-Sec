!!! warning "Under Construction"
    This page is under construction. Please check back later for comprehensive guidance

# Google Workspace Incident Response Playbooks

This document provides comprehensive incident response playbooks for Google Workspace security incidents. These playbooks include detection, investigation, containment, eradication, recovery, and post-incident analysis phases for common Google Workspace security incidents.

## Playbook Structure

Each incident response playbook follows a standardized structure:

1. **Incident Overview**
   - Description and potential impact
   - Common attack vectors and indicators
   - Severity classification

2. **Detection and Analysis**
   - Initial indicators and alerts
   - Investigation procedures
   - Evidence collection guidance

3. **Containment Procedures**
   - Immediate containment actions
   - Secondary containment measures
   - Limiting incident spread

4. **Eradication Steps**
   - Removing attacker access
   - Eliminating persistence mechanisms
   - Validating complete removal

5. **Recovery Guidance**
   - Service restoration
   - Security posture strengthening
   - Return to normal operations

6. **Post-Incident Analysis**
   - Root cause identification
   - Lessons learned documentation
   - Security improvements implementation

## Account Compromise Incident Response

### Incident Overview

**Description:**  
Unauthorized access to one or more Google Workspace user accounts, potentially resulting in data theft, further access, or destructive actions.

**Common Attack Vectors:**
- Phishing campaigns targeting credentials
- Password spraying or brute force attacks
- OAuth token theft/abuse
- Session hijacking
- Recovery email/phone compromise

**Severity Classifications:**
- **Critical**: Admin account, executive, or multiple user compromises
- **High**: Single user with access to sensitive data
- **Medium**: Single user with limited access
- **Low**: Service account with minimal permissions

### Detection and Analysis

**Initial Indicators:**
- Unusual login locations, times, or devices
- Suspicious email forwarding rules or filters
- Unexpected OAuth application authorizations
- Unusual file access or download patterns
- Password reset or recovery setting changes

**Investigation Procedures:**

1. **Login Activity Analysis**
   ```
   Admin Console > Reports > Audit > Login
   - Filter for affected user(s)
   - Identify suspicious login events (locations, devices, times)
   - Check access methods (browser, IMAP, API, mobile)
   - Verify if 2FA challenges succeeded or failed
   ```

2. **Account Setting Changes**
   ```
   Admin Console > Reports > Audit > Account
   - Identify changes to recovery information
   - Check password reset activities
   - Verify 2FA enrollment or configuration changes
   ```

3. **Email Configuration Review**
   ```
   Admin Console > Reports > Audit > Email logs
   - Check for newly created email filters
   - Identify email forwarding rules
   - Look for delegation settings changes
   ```

4. **OAuth Application Assessment**
   ```
   Admin Console > Reports > Audit > Token
   - Review recently authorized applications
   - Check for suspicious or unusual permissions
   - Verify application usage patterns
   ```

5. **User Activity Timeline Construction**
   ```python
   # Python script to create comprehensive user activity timeline
   def create_user_activity_timeline(reports_service, user_email, days_back=7):
       """Create a timeline of all user activities across Google Workspace"""
       # Calculate start time (days back from now)
       start_time = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
       
       # Applications to query
       applications = ['login', 'admin', 'drive', 'token', 'user_accounts', 
                       'groups', 'calendar', 'gmail', 'gcp']
       
       all_activities = []
       
       # Collect activities across all applications
       for app in applications:
           try:
               results = reports_service.activities().list(
                   userKey=user_email,
                   applicationName=app,
                   startTime=start_time,
                   maxResults=1000
               ).execute()
               
               if 'items' in results:
                   for item in results['items']:
                       # Extract basic event info
                       event = {
                           'time': item.get('id', {}).get('time'),
                           'application': app,
                           'event_name': item.get('events', [{}])[0].get('name', 'unknown'),
                           'ip_address': item.get('ipAddress', 'unknown'),
                           'parameters': {}
                       }
                       
                       # Extract parameters
                       parameters = item.get('events', [{}])[0].get('parameters', [])
                       for param in parameters:
                           event['parameters'][param.get('name')] = param.get('value')
                       
                       all_activities.append(event)
           except Exception as e:
               print(f"Error collecting {app} activities: {str(e)}")
       
       # Sort all activities by timestamp
       all_activities.sort(key=lambda x: x['time'])
       
       return all_activities
   ```

6. **Evidence Collection**
   - Capture screenshots of suspicious activities
   - Export relevant logs for preservation
   - Document all detected indicators
   - Record incident timeline based on evidence

### Containment Procedures

**Immediate Actions:**

1. **Account Suspension**
   ```
   Admin Console > Directory > Users
   - Locate compromised user(s)
   - Click "More" > "Suspend user"
   - Document time of suspension
   ```

2. **Password Reset**
   ```
   Admin Console > Directory > Users
   - Select compromised user(s)
   - Click "Reset password"
   - Force password change at next login
   - Uncheck "Send email with reset instructions"
   ```

3. **OAuth Token Revocation**
   ```
   Admin Console > Security > API Controls > Domain-wide delegation
   - Identify and remove suspicious delegations
   
   Admin Console > Security > API Controls > App access control
   - Review and revoke access for suspicious applications
   ```

4. **Session Termination**
   ```
   Admin Console > Directory > Users > [User] > "Security"
   - Scroll to "Your devices"
   - Click "Sign out of all sessions"
   ```

**Secondary Containment:**

1. **Email Security Measures**
   ```
   Admin Console > Apps > Google Workspace > Gmail > Safety
   - Implement temporary email quarantine for affected user(s)
   - Configure additional message scanning
   ```

2. **Access Restrictions**
   ```
   Admin Console > Directory > Users > [User] > "Security"
   - Configure login restrictions (IP, device)
   - Implement geographic login constraints
   ```

3. **Document Access Review**
   ```
   # Via Google Drive audit log analysis
   - Identify documents shared externally
   - Review sensitive content access
   - Temporarily restrict sharing capabilities
   ```

4. **Group Membership Assessment**
   ```
   Admin Console > Directory > Groups
   - Review and adjust group memberships
   - Remove from privileged groups temporarily
   ```

### Eradication Steps

1. **Email Configuration Cleanup**
   ```
   # Manual or via API
   - Remove unauthorized email forwarding
   - Delete suspicious email filters
   - Revoke unauthorized mail delegation
   ```

   ```python
   # Python script to identify and remove suspicious email configurations
   def cleanup_suspicious_email_configs(admin_service, gmail_service, user_email):
       """Remove suspicious email configurations"""
       cleanup_report = {
           'forwarding_removed': [],
           'filters_removed': [],
           'delegates_removed': []
       }
       
       try:
           # Check and remove suspicious forwarding
           forwarding = gmail_service.users().settings().getForwarding(
               userId=user_email
           ).execute()
           
           if forwarding.get('enabled') and not is_authorized_forwarding(forwarding.get('forwardingEmail')):
               gmail_service.users().settings().updateForwarding(
                   userId=user_email,
                   body={'enabled': False}
               ).execute()
               cleanup_report['forwarding_removed'].append(forwarding.get('forwardingEmail'))
           
           # Check and remove suspicious filters
           filters = gmail_service.users().settings().filters().list(
               userId=user_email
           ).execute()
           
           for filter_data in filters.get('filter', []):
               if is_suspicious_filter(filter_data):
                   gmail_service.users().settings().filters().delete(
                       userId=user_email,
                       id=filter_data['id']
                   ).execute()
                   cleanup_report['filters_removed'].append(filter_data)
           
           # Check and remove unauthorized delegates
           delegates = gmail_service.users().settings().delegates().list(
               userId=user_email
           ).execute()
           
           for delegate in delegates.get('delegates', []):
               if not is_authorized_delegate(delegate.get('delegateEmail')):
                   gmail_service.users().settings().delegates().delete(
                       userId=user_email,
                       delegateEmail=delegate.get('delegateEmail')
                   ).execute()
                   cleanup_report['delegates_removed'].append(delegate.get('delegateEmail'))
                   
           return cleanup_report
       
       except Exception as e:
           return {'error': str(e)}
   
   # Helper functions
   def is_authorized_forwarding(email):
       """Check if email is in allowed forwarding list"""
       # Replace with your organization's logic
       allowed_domains = ['company.com', 'trusted-partner.com']
       return any(email.endswith('@' + domain) for domain in allowed_domains)
   
   def is_suspicious_filter(filter_data):
       """Determine if a filter appears suspicious"""
       # Look for common suspicious patterns
       if 'forward' in str(filter_data).lower():
           return True
           
       if any(term in str(filter_data).lower() for term in 
              ['security', 'password', 'verification', 'authenticate']):
           return True
           
       # Add additional detection logic as needed
       return False
       
   def is_authorized_delegate(email):
       """Check if delegate is authorized"""
       # Replace with your organization's logic
       authorized_delegates = ['admin@company.com', 'executive-assistant@company.com']
       return email in authorized_delegates
   ```

2. **2FA Reset and Reconfiguration**
   ```
   Admin Console > Directory > Users > [User] > "Security"
   - Reset 2FA enrollment
   - Force new 2FA enrollment
   - Verify backup codes are regenerated
   ```

3. **Recovery Method Verification**
   ```
   Admin Console > Directory > Users > [User] > "Account"
   - Verify and update recovery email
   - Verify and update recovery phone
   - Ensure all recovery methods are legitimate
   ```

4. **Application Access Review and Cleanup**
   ```
   # For each affected user
   Admin Console > Security > API Controls > App access control
   - Revoke access for all unauthorized applications
   - Document authorized applications for restoration
   ```

5. **Permission Verification**
   ```
   # For each affected user
   - Review admin role assignments
   - Verify appropriate group memberships
   - Check service account permissions
   - Validate resource-specific access rights
   ```

### Recovery Guidance

1. **Account Restoration**
   ```
   Admin Console > Directory > Users
   - Unsuspend affected user(s)
   - Verify account settings are correct
   - Restore appropriate permissions
   ```

2. **Enhanced Security Implementation**
   ```
   Admin Console > Security > Authentication
   - Enforce stronger authentication policies
   - Consider Advanced Protection Program enrollment
   - Implement login challenges
   ```

3. **Service Restoration Verification**
   - Confirm email flow is normal
   - Verify access to necessary applications
   - Validate file access and sharing capabilities
   - Ensure calendar and meeting functionality

4. **User Communication and Education**
   - Provide security awareness refresher
   - Explain incident and response actions
   - Advise on security best practices
   - Schedule follow-up security training

### Post-Incident Analysis

1. **Root Cause Identification**
   - Determine initial access vector
   - Identify security control failures
   - Document complete attack timeline
   - Assess effectiveness of security controls

2. **Security Enhancement Planning**
   - Identify specific control improvements
   - Develop enhancement implementation plan
   - Create timeline for security upgrades
   - Allocate resources for improvements

3. **Documentation and Reporting**
   - Complete incident documentation
   - Prepare executive summary
   - Document lessons learned
   - Create remediation tracking document

4. **Process Improvement**
   - Update detection capabilities
   - Enhance response procedures
   - Improve containment strategies
   - Strengthen recovery processes

## Data Exfiltration Incident Response

### Incident Overview

**Description:**  
Unauthorized extraction of sensitive data from Google Workspace services, including Drive, Gmail, Calendar, or other collaboration tools.

**Common Attack Vectors:**
- Google Takeout exports
- Mass document downloads
- Email forwarding rules
- OAuth applications with extensive access
- Unauthorized API access to data
- Third-party integrations with excessive permissions

**Severity Classifications:**
- **Critical**: Mass exfiltration of regulated or sensitive data
- **High**: Targeted exfiltration of sensitive information
- **Medium**: Limited exposure of internal information
- **Low**: Export of non-sensitive, non-proprietary data

### Detection and Analysis

**Initial Indicators:**
- Unusual volume of file downloads
- Suspicious Google Takeout exports
- Unexpected external sharing of documents
- Unusual API request patterns
- Data access from atypical locations or times

**Investigation Procedures:**

1. **Drive Activity Analysis**
   ```
   Admin Console > Reports > Audit > Drive
   - Filter for download, export activities
   - Identify mass document access patterns
   - Check for unusual sharing changes
   - Look for unusual access times or locations
   ```

2. **Data Access Volume Assessment**
   ```python
   # Python script to detect unusual data access volumes
   def detect_unusual_data_access(reports_service, timeframe_days=3):
       """Identify users with unusually high data access volumes"""
       # Calculate start time
       start_time = (datetime.now() - timedelta(days=timeframe_days)).strftime('%Y-%m-%d')
       
       # Get Drive activities
       drive_activities = reports_service.activities().list(
           userKey='all',
           applicationName='drive',
           eventName='download,view,export',
           startTime=start_time,
           maxResults=1000
       ).execute()
       
       # Aggregate by user
       user_activity = {}
       for activity in drive_activities.get('items', []):
           user = activity['actor']['email']
           if user not in user_activity:
               user_activity[user] = {
                   'download_count': 0,
                   'view_count': 0,
                   'export_count': 0,
                   'files_accessed': set(),
                   'access_ips': set()
               }
               
           # Extract event details
           event = activity.get('events', [{}])[0]
           event_name = event.get('name', '')
           
           # Update counts
           if 'download' in event_name.lower():
               user_activity[user]['download_count'] += 1
           elif 'view' in event_name.lower():
               user_activity[user]['view_count'] += 1
           elif 'export' in event_name.lower():
               user_activity[user]['export_count'] += 1
               
           # Add file ID
           doc_id = next((p.get('value') for p in event.get('parameters', [])
                          if p.get('name') == 'doc_id'), None)
           if doc_id:
               user_activity[user]['files_accessed'].add(doc_id)
               
           # Add IP address
           if activity.get('ipAddress'):
               user_activity[user]['access_ips'].add(activity.get('ipAddress'))
       
       # Convert sets to counts for easier analysis
       for user in user_activity:
           user_activity[user]['unique_files_accessed'] = len(user_activity[user]['files_accessed'])
           user_activity[user]['unique_ips'] = len(user_activity[user]['access_ips'])
           user_activity[user]['ip_list'] = list(user_activity[user]['access_ips'])
           del user_activity[user]['files_accessed']
           del user_activity[user]['access_ips']
       
       # Calculate organizational averages
       org_avg = {
           'download_avg': 0,
           'view_avg': 0,
           'export_avg': 0,
           'files_avg': 0
       }
       
       if user_activity:
           user_count = len(user_activity)
           download_total = sum(u['download_count'] for u in user_activity.values())
           view_total = sum(u['view_count'] for u in user_activity.values())
           export_total = sum(u['export_count'] for u in user_activity.values())
           files_total = sum(u['unique_files_accessed'] for u in user_activity.values())
           
           org_avg = {
               'download_avg': download_total / user_count,
               'view_avg': view_total / user_count,
               'export_avg': export_total / user_count,
               'files_avg': files_total / user_count
           }
       
       # Identify outliers (2x average as simple threshold)
       outliers = []
       for user, stats in user_activity.items():
           if (stats['download_count'] > org_avg['download_avg'] * 2 or
               stats['export_count'] > org_avg['export_avg'] * 2):
               outliers.append({
                   'user': user,
                   'stats': stats,
                   'org_comparison': {
                       'download_ratio': stats['download_count'] / max(org_avg['download_avg'], 1),
                       'export_ratio': stats['export_count'] / max(org_avg['export_avg'], 1)
                   }
               })
       
       return {
           'org_averages': org_avg,
           'outliers': sorted(outliers, key=lambda x: max(
               x['org_comparison']['download_ratio'],
               x['org_comparison']['export_ratio']
           ), reverse=True)
       }
   ```

3. **Google Takeout Analysis**
   ```
   Admin Console > Reports > Audit > User accounts
   - Filter for "download_data" events
   - Identify unusual Takeout exports
   - Check timing and frequency of exports
   ```

4. **External Sharing Review**
   ```
   Admin Console > Reports > Audit > Drive
   - Filter for "change_user_access" events
   - Focus on events with external users
   - Identify documents shared publicly
   ```

5. **OAuth Application Assessment**
   ```
   Admin Console > Security > API Controls > App access control
   - Identify newly authorized applications
   - Review permissions and scopes
   - Check for data access capabilities
   ```

6. **Evidence Collection**
   - Document data access patterns
   - Capture screenshots of relevant logs
   - Create timeline of data access events
   - List potentially exposed documents
   - Preserve original logs for investigation

### Containment Procedures

**Immediate Actions:**

1. **Account Access Restriction**
   ```
   Admin Console > Directory > Users
   - Suspend suspected user accounts
   - Reset passwords for affected accounts
   - Terminate all active sessions
   ```

2. **External Sharing Limitation**
   ```
   Admin Console > Apps > Google Workspace > Drive
   - Restrict external sharing temporarily
   - Block public link creation
   - Disable file download for shared items
   ```

3. **Data Export Restriction**
   ```
   Admin Console > Apps > Google Workspace > Settings for data access
   - Disable Google Takeout for affected users
   - Restrict data download capabilities
   - Block API-based exports
   ```

4. **OAuth Application Blocking**
   ```
   Admin Console > Security > API Controls > App access control
   - Block suspicious applications
   - Revoke tokens for unauthorized apps
   - Restrict new OAuth authorizations
   ```

**Secondary Containment:**

1. **Drive Access Control Review**
   ```
   # For each affected user
   - Identify sensitive shared documents
   - Revoke inappropriate sharing permissions
   - Set more restrictive access controls
   ```

2. **API Access Limitation**
   ```
   Admin Console > Security > API Controls > Domain-wide delegation
   - Review and adjust API access scopes
   - Implement stricter API limitations
   - Monitor API usage for anomalies
   ```

3. **Data Loss Prevention Enhancement**
   ```
   Admin Console > Security > Data protection
   - Deploy additional DLP rules
   - Implement content-aware access restrictions
   - Configure sensitive content controls
   ```

### Eradication Steps

1. **Remove Unauthorized Access**
   ```
   # For each affected document/data source
   - Remove external collaborators
   - Revoke public sharing links
   - Reset access controls to baseline
   ```

   ```python
   # Python script to revert unauthorized sharing
   def revert_unauthorized_sharing(drive_service, start_date):
       """Revert unauthorized document sharing since given date"""
       # Convert date to RFC 3339 timestamp
       time_filter = f"modifiedTime > '{start_date}'"
       
       # Get files with sharing changes
       shared_files = drive_service.files().list(
           q=time_filter,
           spaces='drive',
           fields='files(id,name,permissions)',
           pageSize=1000
       ).execute()
       
       revocation_results = []
       
       for file in shared_files.get('files', []):
           file_id = file['id']
           file_name = file['name']
           
           # Check each permission
           for permission in file.get('permissions', []):
               # Identify suspicious permissions (external or anyone)
               if is_suspicious_permission(permission):
                   try:
                       # Delete suspicious permission
                       drive_service.permissions().delete(
                           fileId=file_id,
                           permissionId=permission['id']
                       ).execute()
                       
                       revocation_results.append({
                           'file_id': file_id,
                           'file_name': file_name,
                           'permission': permission,
                           'status': 'revoked'
                       })
                   except Exception as e:
                       revocation_results.append({
                           'file_id': file_id,
                           'file_name': file_name,
                           'permission': permission,
                           'status': 'error',
                           'error': str(e)
                       })
       
       return revocation_results
       
   def is_suspicious_permission(permission):
       """Determine if a permission is suspicious based on criteria"""
       # Check for 'anyone' access
       if permission.get('type') == 'anyone':
           return True
           
       # Check for external email domains
       if permission.get('type') == 'user' and permission.get('emailAddress'):
           if not permission['emailAddress'].endswith('@company.com'):  # Replace with your domain
               return True
               
       # Add additional logic as needed
       return False
   ```

2. **Clean Up Automated Access**
   ```
   # Via API or Admin Console
   - Remove unauthorized email forwarding
   - Delete suspicious email filters
   - Remove malicious Apps Script deployments
   ```

3. **Revoke OAuth Authorizations**
   ```
   Admin Console > Security > API Controls > Domain-wide delegation
   - Revoke delegated access for suspicious services
   - Remove unnecessary API access
   ```

4. **Remove Persistent Access Mechanisms**
   - Disable unauthorized service accounts
   - Remove compromised API keys
   - Delete unauthorized Apps Script projects
   - Uninstall malicious Workspace Add-ons

### Recovery Guidance

1. **Service Restoration**
   ```
   # For each affected user/system
   - Restore appropriate access rights
   - Re-enable necessary sharing capabilities
   - Reauthorize legitimate applications
   ```

2. **Data Access Control Implementation**
   ```
   Admin Console > Apps > Google Workspace > Drive
   - Implement enhanced sharing controls
   - Deploy file classification system
   - Configure sharing restrictions by file type
   ```

3. **DLP Enhancement**
   ```
   Admin Console > Security > Data protection
   - Deploy additional content scanning rules
   - Implement stricter export controls
   - Configure enhanced alerting for sensitive content
   ```

4. **API Security Hardening**
   ```
   Admin Console > Security > API Controls
   - Implement more granular API access controls
   - Deploy API monitoring and anomaly detection
   - Establish API usage baselines
   ```

### Post-Incident Analysis

1. **Data Exposure Assessment**
   - Identify all exposed documents
   - Determine sensitivity of exposed data
   - Assess regulatory compliance impact
   - Calculate potential business impact

2. **Control Gap Identification**
   - Identify DLP control failures
   - Assess sharing restriction effectiveness
   - Evaluate export control limitations
   - Review API security measures

3. **Security Enhancement Implementation**
   - Develop enhanced data protection controls
   - Implement improved monitoring capabilities
   - Deploy additional access restrictions
   - Create data classification system

4. **Documentation and Reporting**
   - Prepare data exposure report
   - Document control recommendations
   - Create incident summary
   - Develop security enhancement roadmap

## OAuth Token Abuse Incident Response

### Incident Overview

**Description:**  
Unauthorized access or activities using compromised OAuth tokens, potentially resulting in persistent access despite password changes and authentication enhancements.

**Common Attack Vectors:**
- Phishing campaigns for OAuth authorization
- Malicious third-party applications
- Token theft via client-side attacks
- Excessive permission requests from applications
- Stolen refresh tokens from compromised devices

**Severity Classifications:**
- **Critical**: Administrative access token compromise
- **High**: User token with extensive data access
- **Medium**: Limited-scope token for specific services
- **Low**: Minimal permission token with no sensitive data access

### Detection and Analysis

**Initial Indicators:**
- Unusual application authorization activity
- API usage from unexpected locations
- Application access despite password changes
- Abnormal API request patterns or volumes
- Unusual scopes requested by applications

**Investigation Procedures:**

1. **Token Activity Analysis**
   ```
   Admin Console > Reports > Audit > Token
   - Filter for token creation and usage events
   - Identify applications with unusual activity
   - Check for suspicious permission scopes
   ```

2. **Application Authorization Review**
   ```
   Admin Console > Security > API Controls > App access control
   - Review recently authorized applications
   - Check for applications with excessive permissions
   - Identify unauthorized or suspicious applications
   ```

3. **API Usage Analysis**
   ```python
   # Python script to analyze API usage patterns
   def analyze_api_usage(reports_service, days_back=7):
       """Analyze API usage patterns for anomalies"""
       # Calculate start time
       start_time = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
       
       # Get API activity events
       api_events = reports_service.activities().list(
           userKey='all',
           applicationName='token',
           startTime=start_time,
           maxResults=1000
       ).execute()
       
       # Analyze application usage
       app_activity = {}
       user_app_activity = {}
       
       for event in api_events.get('items', []):
           # Extract basic information
           user = event['actor']['email']
           parameters = event.get('events', [{}])[0].get('parameters', [])
           app_name = next((p.get('value') for p in parameters if p.get('name') == 'app_name'), 'Unknown')
           client_id = next((p.get('value') for p in parameters if p.get('name') == 'client_id'), 'Unknown')
           scopes = next((p.get('value') for p in parameters if p.get('name') == 'scope'), '').split()
           
           # Track by application
           app_key = f"{app_name}:{client_id}"
           if app_key not in app_activity:
               app_activity[app_key] = {
                   'app_name': app_name,
                   'client_id': client_id,
                   'user_count': set(),
                   'ip_addresses': set(),
                   'scope_count': len(scopes),
                   'scopes': scopes,
                   'high_risk_scopes': [s for s in scopes if is_high_risk_scope(s)],
                   'event_count': 0
               }
           
           app_activity[app_key]['user_count'].add(user)
           if event.get('ipAddress'):
               app_activity[app_key]['ip_addresses'].add(event.get('ipAddress'))
           app_activity[app_key]['event_count'] += 1
           
           # Track by user and application
           user_app_key = f"{user}:{app_key}"
           if user_app_key not in user_app_activity:
               user_app_activity[user_app_key] = {
                   'user': user,
                   'app_name': app_name,
                   'client_id': client_id,
                   'ip_addresses': set(),
                   'scopes': scopes,
                   'event_count': 0,
                   'first_seen': event.get('id', {}).get('time'),
                   'last_seen': event.get('id', {}).get('time')
               }
           
           user_app_activity[user_app_key]['event_count'] += 1
           if event.get('ipAddress'):
               user_app_activity[user_app_key]['ip_addresses'].add(event.get('ipAddress'))
           
           # Update last seen
           event_time = event.get('id', {}).get('time')
           if event_time and event_time > user_app_activity[user_app_key]['last_seen']:
               user_app_activity[user_app_key]['last_seen'] = event_time
       
       # Convert sets to counts and lists
       for app_key in app_activity:
           app_activity[app_key]['user_count'] = len(app_activity[app_key]['user_count'])
           app_activity[app_key]['ip_count'] = len(app_activity[app_key]['ip_addresses'])
           app_activity[app_key]['ip_list'] = list(app_activity[app_key]['ip_addresses'])
           del app_activity[app_key]['ip_addresses']
       
       for user_app_key in user_app_activity:
           user_app_activity[user_app_key]['ip_count'] = len(user_app_activity[user_app_key]['ip_addresses'])
           user_app_activity[user_app_key]['ip_list'] = list(user_app_activity[user_app_key]['ip_addresses'])
           del user_app_activity[user_app_key]['ip_addresses']
       
       # Identify suspicious applications
       suspicious_apps = []
       for app_key, data in app_activity.items():
           risk_score = calculate_app_risk_score(data)
           if risk_score > 7:  # Arbitrary threshold
               suspicious_apps.append({
                   'app_key': app_key,
                   'risk_score': risk_score,
                   'data': data
               })
       
       return {
           'app_activity': app_activity,
           'user_app_activity': user_app_activity,
           'suspicious_apps': sorted(suspicious_apps, key=lambda x: x['risk_score'], reverse=True)
       }
   
   def is_high_risk_scope(scope):
       """Determine if a scope is high-risk"""
       high_risk_indicators = [
           'https://mail.google.com/',
           'https://www.googleapis.com/auth/drive',
           'https://www.googleapis.com/auth/admin',
           'https://www.googleapis.com/auth/cloud-platform',
           '.readonly',  # Wildcard for read access to services
           'https://www.googleapis.com/auth/contacts',
           'https://www.googleapis.com/auth/calendar'
       ]
       
       return any(indicator in scope for indicator in high_risk_indicators)
   
   def calculate_app_risk_score(app_data):
       """Calculate a risk score for an application based on various factors"""
       risk_score = 0
       
       # More users = higher potential impact
       if app_data['user_count'] > 10:
           risk_score += 2
       elif app_data['user_count'] > 5:
           risk_score += 1
       
       # High number of scopes increases risk
       if app_data['scope_count'] > 10:
           risk_score += 3
       elif app_data['scope_count'] > 5:
           risk_score += 2
       elif app_data['scope_count'] > 2:
           risk_score += 1
       
       # High-risk scopes significantly increase risk
       risk_score += min(len(app_data['high_risk_scopes']) * 2, 6)
       
       # Multiple IP addresses may indicate broader usage
       if len(app_data['ip_list']) > 5:
           risk_score += 1
       
       return risk_score
   ```

4. **Token Revocation Testing**
   - Test revocation impact on applications
   - Identify applications unaffected by password changes
   - Verify token expiration enforcement

5. **Scope Analysis**
   - Identify token scopes and permissions
   - Evaluate potential access granted
   - Assess data exposure risk

6. **Evidence Collection**
   - Document affected applications and tokens
   - Capture relevant API access logs
   - Record suspicious token activity
   - Preserve authorization request evidence

### Containment Procedures

**Immediate Actions:**

1. **Token Revocation**
   ```
   Admin Console > Security > API Controls > Domain-wide delegation
   - Revoke tokens for suspected applications
   - Remove domain-wide delegations for compromised services
   ```

2. **Account Security Enhancement**
   ```
   Admin Console > Directory > Users > [User] > "Security"
   - Reset passwords for affected accounts
   - Force application logout
   - Enable enhanced security verification
   ```

3. **Application Blocking**
   ```
   Admin Console > Security > API Controls > App access control
   - Block suspicious applications
   - Restrict future authorizations
   - Implement app allowlisting for critical users
   ```

**Secondary Containment:**

1. **Access Scope Restriction**
   ```
   Admin Console > Security > API Controls
   - Restrict available API scopes
   - Implement more granular permissions
   - Configure access boundaries
   ```

2. **API Access Monitoring**
   ```
   # Via custom monitoring or security tool
   - Deploy enhanced API monitoring
   - Create alerts for suspicious activity
   - Implement token usage baselines
   ```

3. **Application Authorization Controls**
   ```
   Admin Console > Security > API Controls > App access control
   - Configure application verification requirements
   - Implement approval workflows for sensitive apps
   - Deploy risky application alerting
   ```

### Eradication Steps

1. **Comprehensive Token Revocation**
   ```python
   # Python script to revoke tokens for specific applications
   def revoke_application_tokens(reports_service, admin_service, client_id):
       """Revoke tokens for a specific client ID across all users"""
       # Get all users
       users_result = admin_service.users().list(
           customer='my_customer',
           maxResults=500
       ).execute()
       
       revocation_results = []
       
       for user in users_result.get('users', []):
           user_email = user['primaryEmail']
           
           # Get token events to identify tokens for this client
           try:
               token_events = reports_service.activities().list(
                   userKey=user_email,
                   applicationName='token',
                   maxResults=1000
               ).execute()
               
               # Look for matching client ID
               has_token = False
               for event in token_events.get('items', []):
                   parameters = event.get('events', [{}])[0].get('parameters', [])
                   event_client_id = next((p.get('value') for p in parameters 
                                          if p.get('name') == 'client_id'), None)
                   
                   if event_client_id == client_id:
                       has_token = True
                       break
               
               if has_token:
                   # Revoke access for this user
                   try:
                       admin_service.tokens().delete(
                           userKey=user_email,
                           clientId=client_id
                       ).execute()
                       
                       revocation_results.append({
                           'user': user_email,
                           'status': 'revoked'
                       })
                   except Exception as e:
                       revocation_results.append({
                           'user': user_email,
                           'status': 'error',
                           'error': str(e)
                       })
           except Exception as e:
               revocation_results.append({
                   'user': user_email,
                   'status': 'lookup_error',
                   'error': str(e)
               })
       
       return revocation_results
   ```

2. **OAuth App Removal**
   ```
   Admin Console > Security > API Controls > App access control
   - Remove malicious applications from allowlist
   - Block compromised app client IDs
   - Implement stricter app verification requirements
   ```

3. **Service Account Cleanup**
   ```
   Admin Console > Security > API Controls > Domain-wide delegation
   - Review and clean up service accounts
   - Verify legitimate delegations
   - Reduce permissions to least privilege
   ```

4. **Extension and Add-on Review**
   ```
   Admin Console > Apps > Marketplace apps
   - Remove unauthorized browser extensions
   - Uninstall suspicious Workspace add-ons
   - Validate legitimate integrations
   ```

### Recovery Guidance

1. **Application Access Restoration**
   ```
   # For legitimate applications
   - Reauthorize essential applications
   - Guide users through proper authorization process
   - Validate proper scope requests
   ```

2. **API Control Enhancement**
   ```
   Admin Console > Security > API Controls
   - Implement enhanced API access controls
   - Deploy API access monitoring
   - Configure more granular permissions
   ```

3. **OAuth Governance Implementation**
   - Deploy OAuth application inventory process
   - Implement regular access reviews
   - Create application authorization framework
   - Establish scope restriction policies

4. **User Communication and Training**
   - Provide guidance on safe application authorization
   - Educate on permission evaluation
   - Deploy phishing awareness for OAuth-based attacks
   - Create clear escalation procedures

### Post-Incident Analysis

1. **Token Abuse Impact Assessment**
   - Identify accessed data and services
   - Determine duration of unauthorized access
   - Assess regulatory compliance impact
   - Document business impact

2. **OAuth Security Evaluation**
   - Review OAuth authorization controls
   - Assess token management practices
   - Evaluate monitoring effectiveness
   - Identify security control gaps

3. **Documentation and Reporting**
   - Document affected applications and users
   - Create comprehensive timeline
   - Prepare executive summary
   - Develop token security roadmap

4. **Security Enhancement Implementation**
   - Deploy OAuth governance framework
   - Implement enhanced monitoring
   - Establish token usage baselines
   - Create application vetting process

## Admin Privilege Escalation Incident Response

### Incident Overview

**Description:**  
Unauthorized acquisition or use of administrative privileges within Google Workspace, potentially resulting in organization-wide security compromises, configuration changes, or data access.

**Common Attack Vectors:**
- Phishing attacks targeting admins
- Role privilege elevation through compromised accounts
- Creation of unauthorized admin accounts
- Exploitation of delegated admin rights
- OAuth application with admin capabilities
- Recovery email/phone compromise for admins

**Severity Classifications:**
- **Critical**: Super admin compromise
- **High**: Privilege escalation to admin with significant rights
- **Medium**: Limited admin role compromise
- **Low**: Attempted but unsuccessful admin privilege acquisition

### Detection and Analysis

**Initial Indicators:**
- Unexpected admin role assignments
- Unusual administrative console access
- Configuration changes without approval
- Suspicious admin activities from unusual locations
- Creation of new admin accounts
- Modification of admin recovery settings

**Investigation Procedures:**

1. **Admin Activity Analysis**
   ```
   Admin Console > Reports > Audit > Admin
   - Filter for role assignment changes
   - Identify unusual admin console access
   - Look for critical setting modifications
   - Check for new admin user creation
   ```

2. **Admin Role Assessment**
   ```
   Admin Console > Account > Admin roles
   - Review all admin role assignments
   - Identify unauthorized or excessive permissions
   - Check for recently modified roles
   ```

3. **Admin Access Pattern Analysis**
   ```python
   # Python script to analyze admin access patterns
   def analyze_admin_access_patterns(reports_service, days_back=30):
       """Analyze admin console access patterns for anomalies"""
       # Calculate start time
       start_time = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
       
       # Get admin console activities
       admin_events = reports_service.activities().list(
           userKey='all',
           applicationName='admin',
           startTime=start_time,
           maxResults=1000
       ).execute()
       
       # Organize by user
       admin_access = {}
       
       for event in admin_events.get('items', []):
           user = event['actor']['email']
           event_time = event.get('id', {}).get('time')
           event_name = event.get('events', [{}])[0].get('name')
           ip_address = event.get('ipAddress')
           
           if user not in admin_access:
               admin_access[user] = {
                   'access_count': 0,
                   'ip_addresses': set(),
                   'common_events': {},
                   'access_times': [],
                   'first_seen': event_time,
                   'last_seen': event_time,
                   'critical_events': []
               }
           
           # Update user data
           admin_access[user]['access_count'] += 1
           if ip_address:
               admin_access[user]['ip_addresses'].add(ip_address)
           
           # Track event frequency
           if event_name not in admin_access[user]['common_events']:
               admin_access[user]['common_events'][event_name] = 0
           admin_access[user]['common_events'][event_name] += 1
           
           # Update access times
           admin_access[user]['access_times'].append(event_time)
           
           # Update first/last seen
           if event_time < admin_access[user]['first_seen']:
               admin_access[user]['first_seen'] = event_time
           if event_time > admin_access[user]['last_seen']:
               admin_access[user]['last_seen'] = event_time
           
           # Check for critical events
           if is_critical_admin_event(event):
               admin_access[user]['critical_events'].append({
                   'event_name': event_name,
                   'time': event_time,
                   'ip_address': ip_address,
                   'details': extract_event_details(event)
               })
       
       # Process data for analysis
       admin_insights = []
       for user, data in admin_access.items():
           # Convert sets to lists/counts
           data['ip_count'] = len(data['ip_addresses'])
           data['ip_list'] = list(data['ip_addresses'])
           del data['ip_addresses']
           
           # Sort critical events by time
           data['critical_events'].sort(key=lambda x: x['time'])
           
           # Calculate working hours access percentage
           work_hours_access = calculate_work_hours_percentage(data['access_times'])
           data['work_hours_percentage'] = work_hours_access
           
           # Calculate common events
           data['common_events'] = sorted(
               [{'event': k, 'count': v} for k, v in data['common_events'].items()],
               key=lambda x: x['count'],
               reverse=True
           )
           
           # Calculate anomaly score
           anomaly_score = calculate_admin_anomaly_score(data)
           
           admin_insights.append({
               'user': user,
               'data': data,
               'anomaly_score': anomaly_score
           })
       
       # Sort by anomaly score
       admin_insights.sort(key=lambda x: x['anomaly_score'], reverse=True)
       
       return admin_insights
   
   def is_critical_admin_event(event):
       """Determine if an admin event is critical"""
       critical_event_types = [
           'GRANT_ADMIN_PRIVILEGE',
           'CREATE_ROLE',
           'CHANGE_ROLE_SCOPE',
           'ADD_ROLE_PRIVILEGE',
           'CREATE_USER',
           'CHANGE_USER_PASSWORD',
           'TOGGLE_SERVICE_ACCOUNT',
           'ADD_SERVICE_ACCOUNT_PRIVILEGE',
           'CHANGE_TWO_STEP_VERIFICATION',
           'CHANGE_RECOVERY_EMAIL',
           'CHANGE_RECOVERY_PHONE'
       ]
       
       event_name = event.get('events', [{}])[0].get('name')
       return event_name in critical_event_types
   
   def extract_event_details(event):
       """Extract important details from an event"""
       details = {}
       parameters = event.get('events', [{}])[0].get('parameters', [])
       
       for param in parameters:
           details[param.get('name')] = param.get('value')
       
       return details
   
   def calculate_work_hours_percentage(timestamps):
       """Calculate percentage of access during work hours (8AM-6PM local time)"""
       if not timestamps:
           return 0
           
       work_hours_count = 0
       
       for timestamp in timestamps:
           # Convert to datetime object
           try:
               dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
               # Check if access is during work hours (8AM-6PM local time, assuming UTC)
               hour = dt.hour
               if 8 <= hour < 18 and dt.weekday() < 5:  # Weekday and work hours
                   work_hours_count += 1
           except:
               pass
       
       return (work_hours_count / len(timestamps)) * 100
   
   def calculate_admin_anomaly_score(data):
       """Calculate an anomaly score for admin activity"""
       score = 0
       
       # Multiple IPs increases risk
       if data['ip_count'] > 3:
           score += min(data['ip_count'] - 3, 5)
       
       # Low work hours percentage is suspicious
       if data['work_hours_percentage'] < 70:
           score += min((70 - data['work_hours_percentage']) / 10, 5)
       
       # Critical events increase risk significantly
       score += min(len(data['critical_events']) * 2, 10)
       
       return score
   ```

4. **Critical Configuration Change Review**
   ```
   Admin Console > Reports > Audit > Admin
   - Focus on security setting changes
   - Check authentication configuration modifications
   - Review API and service account changes
   - Verify email routing configuration changes
   ```

5. **Evidence Collection**
   - Document all suspicious admin activities
   - Capture screenshots of admin console logs
   - Create timeline of privilege escalation events
   - Preserve original audit logs for investigation

### Containment Procedures

**Immediate Actions:**

1. **Admin Account Security**
   ```
   Admin Console > Directory > Users
   - Suspend suspected compromised admin accounts
   - Reset passwords for all admin accounts
   - Force logout of all admin sessions
   - Enable stringent login challenges
   ```

2. **Role Assignment Review and Restriction**
   ```
   Admin Console > Account > Admin roles
   - Remove unauthorized role assignments
   - Restrict available admin roles temporarily
   - Implement emergency admin access limitations
   ```

3. **Critical Function Restriction**
   ```
   # Various Admin Console settings
   - Disable user creation temporarily
   - Restrict organization unit modifications
   - Limit API access and integrations
   - Disable service account creation
   ```

4. **Secure Super Admin Access**
   ```
   Admin Console > Account > Account settings
   - Verify super admin accounts
   - Implement IP restrictions for admin access
   - Enable advanced protection for super admins
   - Add additional verification layers
   ```

**Secondary Containment:**

1. **Admin Console Access Restriction**
   ```
   Admin Console > Security > Access and data control > Context-aware access
   - Implement IP-based restrictions for Admin Console
   - Configure device-based access requirements
   - Deploy stepped-up authentication for admin actions
   ```

2. **API Access Limitation**
   ```
   Admin Console > Security > API Controls
   - Restrict administrative API capabilities
   - Review and reduce domain-wide delegations
   - Implement strict API monitoring
   ```

3. **Delegated Administration Review**
   ```
   Admin Console > Account > Admin roles
   - Review all delegated admin roles
   - Reduce privileges to minimum required
   - Implement time-bound delegations
   ```

### Eradication Steps

1. **Remove Unauthorized Access**
   ```
   Admin Console > Account > Admin roles
   - Remove all unauthorized role assignments
   - Delete suspicious admin accounts
   - Reset all admin role configurations
   ```

2. **Revert Unauthorized Changes**
   ```
   # Based on impact assessment
   - Restore security settings to known good state
   - Revert unauthorized configuration changes
   - Reset API access controls
   ```

3. **Rebuild Admin Structure**
   ```
   Admin Console > Account > Admin roles
   - Recreate admin roles with appropriate permissions
   - Implement least privilege principle
   - Establish role hierarchy with appropriate constraints
   ```

4. **Clean Up Persistent Access**
   ```
   Admin Console > Security > API Controls
   - Remove unauthorized API access
   - Revoke compromised service account credentials
   - Delete unauthorized domain-wide delegations
   ```

### Recovery Guidance

1. **Admin Access Restoration**
   ```
   Admin Console > Account > Admin roles
   - Restore essential admin roles
   - Configure appropriate role assignments
   - Implement enhanced monitoring for admin actions
   ```

2. **Admin Privilege Enhancement**
   ```
   # Various Admin Console settings
   - Implement time-based access controls
   - Configure location-based restrictions
   - Deploy task-based privilege assignment
   ```

3. **Multi-Party Authorization Implementation**
   - Develop multi-admin approval for critical changes
   - Create change management processes
   - Implement administrative separation of duties
   - Establish emergency access procedures

4. **Enhanced Monitoring Deployment**
   ```
   Admin Console > Reports > Audit
   - Configure comprehensive admin activity alerts
   - Implement baseline behavior monitoring
   - Deploy anomaly detection for admin access
   ```

### Post-Incident Analysis

1. **Admin Access Impact Assessment**
   - Document unauthorized admin actions
   - Assess impact of configuration changes
   - Determine potential data access or exposure
   - Evaluate regulatory compliance implications

2. **Admin Security Control Evaluation**
   - Review administrative access controls
   - Assess privilege management practices
   - Evaluate separation of duties implementation
   - Identify security control gaps

3. **Documentation and Reporting**
   - Create comprehensive incident timeline
   - Document security recommendations
   - Prepare executive summary
   - Develop admin security roadmap

4. **Security Enhancement Implementation**
   - Deploy enhanced admin access controls
   - Implement comprehensive audit procedures
   - Establish admin baseline behavior profiles
   - Create admin security verification processes

## Malicious Application Installation Incident Response

### Incident Overview

**Description:**  
Installation of unauthorized, malicious, or excessively permissioned applications in the Google Workspace environment, potentially resulting in data exposure, credential theft, or persistent unauthorized access.

**Common Attack Vectors:**
- Malicious Marketplace applications
- Phishing campaigns for application authorization
- Third-party applications with excessive permissions
- Rogue browser extensions with Workspace access
- Malicious Apps Script implementations
- OAuth phishing for application installation

**Severity Classifications:**
- **Critical**: Admin-level application with widespread deployment
- **High**: Data access application with significant adoption
- **Medium**: Limited access application with targeted deployment
- **Low**: Minimal risk application with restricted permissions

### Detection and Analysis

**Initial Indicators:**
- Unusual application installation patterns
- Applications requesting excessive permissions
- User reports of suspicious OAuth requests
- Unexpected data access or sharing
- Abnormal API usage from applications
- Unusual Chrome extension behavior

**Investigation Procedures:**

1. **Application Inventory Analysis**
   ```
   Admin Console > Security > API Controls > App access control
   - Review recently installed applications
   - Identify applications with unusual permission scopes
   - Check for applications with admin access
   ```

2. **OAuth Token Activity Review**
   ```
   Admin Console > Reports > Audit > Token
   - Analyze token usage patterns
   - Identify applications with unusual activity
   - Check for suspicious permission requests
   ```

3. **Marketplace Application Assessment**
   ```
   Admin Console > Apps > Marketplace apps
   - Review recently installed applications
   - Check for unauthorized deployment patterns
   - Identify suspicious application behavior
   ```

4. **Chrome Extension Inventory**
   ```
   Admin Console > Devices > Chrome > Apps & extensions
   - Review installed extensions
   - Check for extensions with unusual permissions
   - Identify extensions with Workspace access
   ```

5. **Application Behavior Analysis**
   ```python
   # Python script to analyze application behavior for anomalies
   def analyze_application_behavior(reports_service, days_back=7):
       """Analyze application behavior for suspicious patterns"""
       # Calculate start time
       start_time = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
       
       # Get application activities
       app_events = {}
       
       # Check various application types
       for app_type in ['token', 'drive', 'mobile']:
           events = reports_service.activities().list(
               userKey='all',
               applicationName=app_type,
               startTime=start_time,
               maxResults=1000
           ).execute()
           
           app_events[app_type] = events.get('items', [])
       
       # Analyze OAuth application behavior
       oauth_apps = {}
       
       for event in app_events.get('token', []):
           # Extract application details
           parameters = event.get('events', [{}])[0].get('parameters', [])
           client_id = next((p.get('value') for p in parameters if p.get('name') == 'client_id'), 'unknown')
           app_name = next((p.get('value') for p in parameters if p.get('name') == 'app_name'), 'unknown')
           scopes = next((p.get('value') for p in parameters if p.get('name') == 'scope'), '').split()
           user = event['actor']['email']
           
           # Create app entry if needed
           app_key = f"{app_name}:{client_id}"
           if app_key not in oauth_apps:
               oauth_apps[app_key] = {
                   'app_name': app_name,
                   'client_id': client_id,
                   'users': set(),
                   'scopes': scopes,
                   'scope_count': len(scopes),
                   'high_risk_scopes': [s for s in scopes if is_high_risk_scope(s)],
                   'ip_addresses': set(),
                   'access_count': 0,
                   'first_seen': event.get('id', {}).get('time'),
                   'last_seen': event.get('id', {}).get('time')
               }
           
           # Update app data
           oauth_apps[app_key]['users'].add(user)
           oauth_apps[app_key]['access_count'] += 1
           
           if event.get('ipAddress'):
               oauth_apps[app_key]['ip_addresses'].add(event.get('ipAddress'))
           
           # Update time range
           event_time = event.get('id', {}).get('time')
           if event_time < oauth_apps[app_key]['first_seen']:
               oauth_apps[app_key]['first_seen'] = event_time
           if event_time > oauth_apps[app_key]['last_seen']:
               oauth_apps[app_key]['last_seen'] = event_time
       
       # Process data for analysis
       app_analysis = []
       
       for app_key, data in oauth_apps.items():
           # Convert sets to counts
           data['user_count'] = len(data['users'])
           data['unique_ips'] = len(data['ip_addresses'])
           data['ip_list'] = list(data['ip_addresses'])
           data['user_list'] = list(data['users'])
           del data['ip_addresses']
           del data['users']
           
           # Calculate risk score
           risk_score = calculate_app_risk_score(data)
           
           app_analysis.append({
               'app_key': app_key,
               'data': data,
               'risk_score': risk_score
           })
       
       # Sort by risk score
       app_analysis.sort(key=lambda x: x['risk_score'], reverse=True)
       
       return app_analysis
   
   def is_high_risk_scope(scope):
       """Determine if a scope is high-risk"""
       high_risk_indicators = [
           'https://mail.google.com/',
           'https://www.googleapis.com/auth/drive',
           'https://www.googleapis.com/auth/admin',
           'https://www.googleapis.com/auth/cloud-platform',
           '.readonly',  # Wildcard for read access to services
           'https://www.googleapis.com/auth/contacts',
           'https://www.googleapis.com/auth/calendar'
       ]
       
       return any(indicator in scope for indicator in high_risk_indicators)
   
   def calculate_app_risk_score(app_data):
       """Calculate risk score for an application"""
       risk_score = 0
       
       # More users = higher potential impact
       if app_data['user_count'] > 50:
           risk_score += 3
       elif app_data['user_count'] > 10:
           risk_score += 2
       elif app_data['user_count'] > 3:
           risk_score += 1
       
       # High number of scopes increases risk
       if app_data['scope_count'] > 10:
           risk_score += 3
       elif app_data['scope_count'] > 5:
           risk_score += 2
       elif app_data['scope_count'] > 2:
           risk_score += 1
       
       # High-risk scopes significantly increase risk
       risk_score += min(len(app_data['high_risk_scopes']), 5)
       
       # Rapid adoption may indicate phishing campaign
       first_seen = datetime.fromisoformat(app_data['first_seen'].replace('Z', '+00:00'))
       last_seen = datetime.fromisoformat(app_data['last_seen'].replace('Z', '+00:00'))
       adoption_period = (last_seen - first_seen).total_seconds() / 3600  # hours
       
       if adoption_period < 24 and app_data['user_count'] > 5:
           risk_score += 2  # Rapid adoption across multiple users
       
       # Multiple IP addresses may indicate broader usage or command & control
       if app_data['unique_ips'] > 10:
           risk_score += 2
       elif app_data['unique_ips'] > 5:
           risk_score += 1
       
       return risk_score
   ```

6. **Evidence Collection**
   - Document suspicious applications
   - Record affected users and scope of installation
   - Capture OAuth permission request details
   - Create timeline of application installation and usage

### Containment Procedures

**Immediate Actions:**

1. **Application Access Revocation**
   ```
   Admin Console > Security > API Controls > App access control
   - Block suspicious applications
   - Revoke tokens for malicious applications
   - Restrict future authorization attempts
   ```

2. **Marketplace Application Restriction**
   ```
   Admin Console > Apps > Marketplace apps
   - Remove suspicious applications
   - Disable affected applications
   - Block future installations
   ```

3. **Chrome Extension Management**
   ```
   Admin Console > Devices > Chrome > Apps & extensions
   - Force remove malicious extensions
   - Block installation of suspicious extensions
   - Implement extension allowlisting
   ```

4. **Apps Script Management**
   ```
   Admin Console > Security > API Controls > App Scripts
   - Disable suspicious scripts
   - Revoke excessive permissions
   - Block unauthorized script execution
   ```

**Secondary Containment:**

1. **API Access Limitation**
   ```
   Admin Console > Security > API Controls
   - Restrict available API scopes
   - Implement more granular permissions
   - Deploy enhanced API monitoring
   ```

2. **Application Installation Control**
   ```
   Admin Console > Apps > Marketplace apps
   - Configure app installation restrictions
   - Implement approval workflows
   - Deploy application allowlisting
   ```

3. **User Communication**
   - Notify affected users of security incident
   - Provide application revocation instructions
   - Establish reporting procedures for suspicious apps
   - Deploy phishing awareness for application-based attacks

### Eradication Steps

1. **Comprehensive Application Removal**
   ```
   # Various Admin Console settings
   - Remove all instances of malicious applications
   - Revoke all associated OAuth tokens
   - Block application client IDs permanently
   ```

2. **Permission Cleanup**
   ```
   Admin Console > Security > API Controls
   - Review and reset excessive permissions
   - Implement least privilege for applications
   - Revoke unnecessary access rights
   ```

3. **Browser Extension Cleanup**
   ```
   Admin Console > Devices > Chrome > Apps & extensions
   - Remove all instances of malicious extensions
   - Implement comprehensive extension policies
   - Deploy browser security baselines
   ```

4. **Apps Script Remediation**
   ```
   # Via script inventory
   - Identify and remove malicious scripts
   - Audit trigger configurations
   - Remove unauthorized script deployments
   ```

### Recovery Guidance

1. **Application Access Restoration**
   ```
   # For legitimate applications
   - Restore access for approved applications
   - Implement proper permission scoping
   - Configure appropriate monitoring
   ```

2. **Application Control Implementation**
   ```
   Admin Console > Apps > Marketplace apps
   - Deploy application allowlisting
   - Implement installation approval workflows
   - Configure appropriate access controls
   ```

3. **Extension Governance**
   ```
   Admin Console > Devices > Chrome > Apps & extensions
   - Implement extension allowlisting
   - Deploy extension risk assessment process
   - Configure appropriate extension policies
   ```

4. **API Security Enhancement**
   ```
   Admin Console > Security > API Controls
   - Implement enhanced API access controls
   - Deploy comprehensive monitoring
   - Configure scope limitations
   ```

### Post-Incident Analysis

1. **Application Impact Assessment**
   - Identify scope of application installation
   - Determine data access and potential exposure
   - Assess user impact and workflow disruption
   - Document affected systems and services

2. **Application Control Evaluation**
   - Review application governance processes
   - Assess installation control effectiveness
   - Evaluate permission management practices
   - Identify security control gaps

3. **Documentation and Reporting**
   - Create comprehensive incident timeline
   - Document affected applications and users
   - Prepare executive summary
   - Develop application security roadmap

4. **Security Enhancement Implementation**
   - Deploy application governance framework
   - Implement comprehensive vetting process
   - Establish application security baselines
   - Create continuous monitoring procedures

## Additional Resources and References

### Incident Response Documentation Templates

1. **Incident Response Report Template**
   ```
   # Google Workspace Security Incident Report
   
   ## Incident Overview
   - Incident ID: [ID]
   - Type: [Account Compromise, Data Exfiltration, OAuth Token Abuse, etc.]
   - Severity: [Critical, High, Medium, Low]
   - Date Detected: [Date]
   - Date Contained: [Date]
   - Date Resolved: [Date]
   - Affected Users/Systems: [List]
   
   ## Incident Timeline
   - [Date/Time] - [Event]
   - [Date/Time] - [Event]
   - [Date/Time] - [Event]
   
   ## Root Cause Analysis
   - [Detailed analysis of how the incident occurred]
   
   ## Impact Assessment
   - [Description of impact on systems, users, and data]
   
   ## Response Actions
   - [Actions taken to contain, eradicate, and recover]
   
   ## Lessons Learned
   - [Key takeaways and improvement opportunities]
   
   ## Recommendations
   - [Specific actions to prevent recurrence]
   ```

2. **Communication Templates**
   - User Notification Template
   - Executive Briefing Template
   - Technical Team Communication Template
   - Post-Incident Review Meeting Agenda

### Google Workspace Security Resources

1. **Official Google Documentation**
   - [Google Workspace Security Center](https://workspace.google.com/security/)
   - [Google Security Best Practices](https://cloud.google.com/docs/security/best-practices)
   - [Google Admin Help: Security and privacy](https://support.google.com/a/topic/2683828)

2. **Security Frameworks and Standards**
   - [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
   - [SANS Incident Response Guide](https://www.sans.org/white-papers/incident-handlers-handbook/)
   - [ISO 27001 Information Security Management](https://www.iso.org/isoiec-27001-information-security.html)

3. **Regulatory Compliance Resources**
   - [GDPR Compliance](https://gdpr.eu/)
   - [HIPAA Compliance](https://www.hhs.gov/hipaa/index.html)
   - [NIST 800-53 Controls](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf)

---

**Note**: These playbooks should be adapted to your organization's specific Google Workspace configuration, security posture, and compliance requirements.