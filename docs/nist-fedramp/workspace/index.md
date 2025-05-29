# Google Workspace NIST/FedRAMP Controls Testing Guide

## Overview

This section provides comprehensive testing guidance for NIST and FedRAMP security controls specifically tailored for Google Workspace environments. These guides help assessors, security teams, and administrators validate compliance and security implementations across Google Workspace services.

## Google Workspace Services Covered

- **Gmail**: Email security, data loss prevention, and communication controls
- **Google Drive**: Document security, sharing controls, and data protection
- **Google Meet**: Video conferencing security and privacy controls
- **Google Calendar**: Scheduling security and information sharing
- **Google Admin Console**: Administrative controls and policy management
- **Google Vault**: eDiscovery, retention, and legal hold capabilities
- **Google Cloud Identity**: Identity and access management

## Control Testing Guides

### Access Control (AC) - Coming Soon

Comprehensive testing procedures for:
- User access provisioning and deprovisioning
- Role-based access control (RBAC) implementation
- Organizational unit (OU) based policies
- Guest and external user access controls
- Mobile device access restrictions

### Identity and Authentication (IA) - Coming Soon

Testing methodologies for:
- Multi-factor authentication (MFA) enforcement
- Single Sign-On (SSO) configuration
- Password policies and complexity requirements
- Session management and timeout controls
- Certificate-based authentication

### Data Protection (SC/MP) - Coming Soon

Validation procedures for:
- Data Loss Prevention (DLP) policies
- Email encryption and S/MIME
- Drive encryption and sharing restrictions
- Information Rights Management (IRM)
- Mobile device management (MDM)

### Audit and Accountability (AU) - Coming Soon

Assessment guides for:
- Admin audit logs configuration
- User activity monitoring
- Login and access reports
- Alert policies and notifications
- Log retention and export

### Configuration Management (CM) - Coming Soon

Testing procedures for:
- Security baselines and hardening
- Change management processes
- Group policies and settings
- API access controls
- Third-party app management

## Quick Reference

### Essential Admin Console Locations

| Control Area | Admin Console Path |
|-------------|-------------------|
| User Management | Directory > Users |
| Security Settings | Security > Security Center |
| Device Management | Devices > Mobile & Endpoints |
| Audit Logs | Reports > Audit Log |
| DLP Rules | Security > Data Protection |
| Authentication | Security > Authentication |

### Key APIs for Automation

```python
# Example: List users with admin privileges
from googleapiclient.discovery import build
from google.oauth2 import service_account

# Initialize the Admin SDK Directory API
service = build('admin', 'directory_v1', credentials=creds)

# List all admin users
results = service.users().list(
    customer='my_customer',
    query='isAdmin=true',
    orderBy='email'
).execute()
```

### Common Compliance Checks

1. **MFA Enforcement Status**
   ```
   Admin Console > Security > Authentication > 2-Step Verification
   ```

2. **Password Policy Compliance**
   ```
   Admin Console > Security > Authentication > Password Management
   ```

3. **External Sharing Settings**
   ```
   Admin Console > Apps > Google Workspace > Drive > Sharing Settings
   ```

4. **Mobile Device Requirements**
   ```
   Admin Console > Devices > Mobile & Endpoints > Settings
   ```

## Best Practices

!!! tip "Preparation Checklist"
    - [ ] Obtain Super Admin access or appropriate delegated admin roles
    - [ ] Review organizational structure and OU hierarchy
    - [ ] Document current security policies and exceptions
    - [ ] Enable comprehensive audit logging before testing
    - [ ] Create test accounts for validation procedures

!!! warning "Testing Considerations"
    - Always test in a controlled manner to avoid service disruption
    - Be aware of propagation delays for policy changes (up to 24 hours)
    - Consider the impact on end users when modifying settings
    - Document all changes made during testing for rollback purposes

## Integration with GCP

Many organizations use both Google Workspace and GCP. Key integration points for testing:

- **Cloud Identity**: Unified identity management
- **Context-Aware Access**: Combined access policies
- **Security Command Center**: Centralized security monitoring
- **Cloud Logging**: Aggregated audit logs

## Tools and Resources

### Google-Provided Tools
- [Security Health Check](https://admin.google.com/ac/security/health)
- [Admin SDK API Explorer](https://developers.google.com/admin-sdk/directory/v1/reference)
- [GAM (Google Apps Manager)](https://github.com/jay0lee/GAM)

### Third-Party Assessment Tools
- BeyondCorp Enterprise assessment tools
- Workspace security scanners
- Compliance automation platforms

## Roadmap

- [ ] Q2 2025: Access Control (AC) Testing Guide
- [ ] Q2 2025: Identity & Authentication (IA) Testing Guide
- [ ] Q3 2025: Data Protection Testing Guide
- [ ] Q3 2025: Audit & Accountability Testing Guide
- [ ] Q4 2025: Automated testing scripts and tools

## Getting Help

For questions about Google Workspace security controls:
- [Google Workspace Admin Help](https://support.google.com/a)
- [Google Workspace Security Center](https://workspace.google.com/security)
- [Google Cloud Customer Care](https://cloud.google.com/support)