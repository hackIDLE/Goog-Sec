!!! warning "Under Construction"
    This page is under construction. Please check back later for comprehensive guidance

# Google Workspace Organizational Unit Security Design

This guide provides security professionals and MSPs with comprehensive strategies for designing and implementing secure organizational unit (OU) structures in Google Workspace environments. Proper OU design is fundamental to effective security implementation and management.

## Organizational Unit Fundamentals

### Understanding OU Architecture

Organizational Units in Google Workspace provide a hierarchical structure for managing users, applying policies, and controlling access. Key concepts include:

1. **Inheritance Model**
   - Settings flow from parent OUs to child OUs
   - Child OUs inherit settings unless explicitly overridden
   - Inheritance can be selectively blocked for specific settings

2. **Default Configuration**
   - All Google Workspace accounts start with a root OU
   - All users initially belong to the root OU
   - Settings applied at the root level affect all users by default

3. **Access Control Implications**
   - OU structure determines policy application
   - Admin privileges can be scoped to specific OUs
   - Service availability controlled at the OU level

### OU Security Design Principles

When designing a secure OU structure, follow these core principles:

1. **Least Privilege Model**
   - Group users based on required access levels
   - Apply restrictions at the highest possible level
   - Grant exceptions only where necessary

2. **Administrative Segregation**
   - Separate administrative boundaries
   - Delegate admin rights at appropriate OU levels
   - Implement administrative isolation for sensitive departments

3. **Security Consistency**
   - Maintain consistent security controls across similar OUs
   - Document security baselines for each OU level
   - Implement change control for OU structure modifications

4. **Operational Efficiency**
   - Balance security with management overhead
   - Design for scalability as organization grows
   - Minimize exceptions and special cases

## Strategic OU Design Patterns

### Pattern 1: Security-Oriented Hierarchy

This pattern prioritizes security boundaries and regulatory compliance:

```
Root
├── Security Tier 1 (Highest Security)
│   ├── Executive Leadership
│   ├── Finance
│   └── Legal
├── Security Tier 2 (Enhanced Security)
│   ├── Engineering
│   ├── Product Management
│   └── Human Resources
├── Security Tier 3 (Standard Security)
│   ├── Marketing
│   ├── Sales
│   └── Customer Support
└── Special Access
    ├── Contractors
    ├── Partners
    └── Temporary
```

**Implementation Considerations:**
- Apply MFA requirements consistently within each tier
- Implement stricter data controls as you move up the hierarchy
- Configure service access based on security requirements

### Pattern 2: Functional Hierarchy

This pattern organizes OUs based on department function:

```
Root
├── Corporate Services
│   ├── Executive
│   ├── Finance
│   ├── HR
│   └── Legal
├── Revenue Generation
│   ├── Sales
│   ├── Marketing
│   └── Business Development
├── Product Development
│   ├── Engineering
│   ├── Product Management
│   └── Design
├── Customer Operations
│   ├── Support
│   ├── Success
│   └── Training
└── External Collaborators
    ├── Vendors
    ├── Partners
    └── Contractors
```

**Implementation Considerations:**
- Apply security policies based on department-specific risks
- Customize service access by functional requirements
- Implement data sharing controls between departments

### Pattern 3: Geographic Hierarchy

For organizations with regional security or compliance requirements:

```
Root
├── North America
│   ├── USA (CCPA Compliant)
│   │   ├── HQ
│   │   └── Remote
│   └── Canada (PIPEDA Compliant)
├── Europe (GDPR Compliant)
│   ├── EU Members
│   └── UK
├── Asia Pacific
│   ├── Australia
│   ├── Singapore
│   └── Japan
└── Global Roles
    ├── Executive
    ├── IT Administration
    └── Security
```

**Implementation Considerations:**
- Apply region-specific compliance settings at regional OUs
- Implement appropriate data residency controls
- Configure service access based on regional availability

### Pattern 4: Multi-Tenant MSP Structure

For MSPs managing multiple client environments:

```
Root
├── MSP Internal
│   ├── Administration
│   ├── Engineering
│   ├── Support
│   └── Management
├── Client Tier 1 (Enterprise)
│   ├── Client A
│   │   ├── Admin
│   │   ├── Standard
│   │   └── Restricted
│   └── Client B
│       ├── Admin
│       ├── Standard
│       └── Restricted
├── Client Tier 2 (Mid-Market)
│   ├── Client C
│   └── Client D
└── Client Tier 3 (Small Business)
    ├── Client E
    └── Client F
```

**Implementation Considerations:**
- Implement strong isolation between client environments
- Apply standardized security baselines by client tier
- Configure delegated administration with appropriate boundaries

## Security Controls by OU Layer

For each layer in your OU hierarchy, implement appropriate security controls:

### Root-Level Controls (All Users)

| Security Control | Implementation | Rationale |
|------------------|----------------|-----------|
| **Password Policy** | Minimum 12 characters, complexity requirements | Baseline security for all accounts |
| **Basic MFA** | Require 2-Step Verification | Fundamental protection against account compromise |
| **Session Management** | Configure appropriate timeout settings | Basic security hygiene |
| **Account Recovery** | Standardize recovery options | Consistent recovery procedures |
| **Acceptable Use** | Apply organization-wide policies | Baseline compliance |

### Enhanced Security OU Controls

| Security Control | Implementation | Rationale |
|------------------|----------------|-----------|
| **Advanced MFA** | Require security keys | Stronger protection for sensitive roles |
| **Access Context** | Implement context-aware access policies | Adaptive security based on risk |
| **Device Management** | Require managed devices | Control endpoint security |
| **Data Controls** | Implement stricter DLP policies | Protect sensitive information |
| **External Sharing** | Restrict sharing capabilities | Prevent data leakage |

### High-Security OU Controls

| Security Control | Implementation | Rationale |
|------------------|----------------|-----------|
| **Security Keys Only** | Enforce FIDO security keys | Maximum authentication security |
| **Advanced Protection** | Enroll in Advanced Protection Program | Comprehensive protection for critical accounts |
| **IP Restriction** | Limit access to specific networks | Network-level access control |
| **Enhanced Auditing** | Implement comprehensive logging | Detailed visibility for sensitive activities |
| **External Access** | Severely restrict external sharing | Strict data boundary enforcement |

### Contractor/External OU Controls

| Security Control | Implementation | Rationale |
|------------------|----------------|-----------|
| **Service Limitation** | Restrict access to necessary services only | Minimize attack surface |
| **Data Access Controls** | Implement granular access controls | Strict need-to-know access |
| **Extended Verification** | Additional authentication challenges | Higher-risk accounts |
| **Time-Based Access** | Implement limited access windows | Temporal privilege restriction |
| **Auto-Expiration** | Configure account expiration | Automated deprovisioning |

## Best Practices for OU Security Implementation

### 1. OU Migration Planning

When implementing or restructuring OUs:

1. **Assessment Phase**
   - Document current state including users, groups, and policies
   - Identify security gaps in existing structure
   - Define security objectives for new structure

2. **Design Phase**
   - Create comprehensive OU diagram with security boundaries
   - Define inheritance model and override points
   - Document policy application by OU level

3. **Testing Phase**
   - Validate policy inheritance in test environment
   - Verify administrative boundaries function as expected
   - Test user experience for each OU level

4. **Implementation Phase**
   - Develop staged migration plan
   - Create communication plan for affected users
   - Implement controlled rollout with validation

### 2. OU Security Governance

Establish governance processes for OU management:

1. **Documentation Requirements**
   - Maintain up-to-date OU structure documentation
   - Document security baselines for each OU level
   - Maintain policy exception register

2. **Change Control**
   - Implement formal change process for OU structure modifications
   - Require security review for policy changes
   - Maintain audit trail of structural changes

3. **Regular Review Cycle**
   - Conduct quarterly OU structure reviews
   - Validate security control effectiveness
   - Assess user placement appropriateness

4. **Compliance Mapping**
   - Document how OU structure supports compliance requirements
   - Map controls to regulatory frameworks
   - Validate compliance control effectiveness

### 3. OU Administrative Model

Implement a secure administrative model for OU management:

1. **Role-Based Administration**
   - Define administrative roles aligned with OU structure
   - Implement least privilege for admin accounts
   - Create separation of duties between admin functions

2. **Delegated Administration**
   - Delegate specific admin functions to appropriate teams
   - Scope admin access to specific OUs
   - Implement strict controls for root-level administration

3. **Administrative Monitoring**
   - Log all administrative actions at OU level
   - Implement alerting for critical OU changes
   - Conduct regular admin access reviews

4. **Emergency Access Procedures**
   - Define break-glass procedures for emergency access
   - Create secure process for emergency OU changes
   - Implement post-incident review requirements

## Advanced OU Security Techniques

### Dynamic OU Assignment

Implement rule-based user assignment to OUs:

1. **Attribute-Based Assignment**
   - Develop automation to assign users based on HR attributes
   - Create rules for department, role, or location-based assignment
   - Implement review process for assignment exceptions

2. **Risk-Based OU Movement**
   - Develop criteria for moving users between security tiers
   - Implement automated risk scoring
   - Create process for handling high-risk user indicators

3. **Temporary Elevation**
   - Design process for temporary OU reassignment
   - Implement time-bound access to higher-privilege OUs
   - Create audit mechanisms for tracking temporary changes

### Security Inheritance Controls

Implement advanced inheritance management:

1. **Inheritance Documentation**
   - Map all inheritance overrides across OU structure
   - Document business justification for inheritance blocks
   - Maintain visualization of inheritance relationships

2. **Inheritance Monitoring**
   - Create alerts for critical inheritance changes
   - Implement regular validation of inheritance configuration
   - Develop reports highlighting inheritance exceptions

3. **Compliance Inheritance**
   - Implement specialized inheritance rules for compliance requirements
   - Create compliance-specific OUs where necessary
   - Document inheritance implications for auditors

## MSP-Specific OU Strategies

### Multi-Tenant OU Management

For MSPs managing multiple client environments:

1. **Client Isolation**
   - Implement strict boundaries between client OUs
   - Create separate administrative accounts per client
   - Configure distinct security baselines by client

2. **Standardized Substructures**
   - Develop templated OU structures for new clients
   - Create standard security tiers applicable across clients
   - Implement consistent naming conventions

3. **Cross-Client Visibility**
   - Design appropriate MSP admin visibility across clients
   - Implement security monitoring across OU boundaries
   - Create aggregated reporting capabilities

### Client Onboarding Procedures

Establish secure client implementation processes:

1. **OU Structure Design**
   - Conduct client security requirements workshop
   - Design appropriate OU structure based on needs
   - Document client-specific security requirements

2. **Security Baseline Implementation**
   - Apply appropriate tier-based security controls
   - Configure custom policies as required
   - Implement client-specific exceptions with documentation

3. **Administrative Delegation**
   - Configure appropriate client admin access
   - Establish MSP admin boundaries
   - Document administrative responsibilities

## Common OU Security Misconfigurations

### Anti-Pattern 1: Flat OU Structure

**Issue**: Using minimal OUs with extensive exceptions
**Risk**: Inconsistent policy application, excessive administrative overhead
**Remediation**:
- Implement hierarchical structure based on security requirements
- Group users with similar security needs
- Apply exceptions at appropriate OU levels rather than individually

### Anti-Pattern 2: Excessive OU Depth

**Issue**: Creating unnecessary levels of OU nesting
**Risk**: Complex management, inheritance problems, troubleshooting difficulties
**Remediation**:
- Limit OU depth to 3-4 levels when possible
- Focus on functional rather than organizational depth
- Document inheritance clearly for deep structures

### Anti-Pattern 3: Inconsistent Inheritance

**Issue**: Unpredictable blocking of inherited settings
**Risk**: Security gaps, unintended policy application
**Remediation**:
- Document all inheritance overrides
- Implement review process for inheritance changes
- Regularly audit effective settings at leaf OUs

### Anti-Pattern 4: Administrative Boundary Failures

**Issue**: Improper scoping of administrative access
**Risk**: Privilege escalation, unauthorized access to sensitive OUs
**Remediation**:
- Implement strict administrative boundaries
- Regularly review admin access scope
- Audit administrative actions across boundaries

## Implementation Checklist

### Initial OU Security Setup

- [ ] Document business requirements for OU structure
- [ ] Design OU hierarchy based on security needs
- [ ] Define security policies for each OU level
- [ ] Create OU structure in test environment
- [ ] Validate policy inheritance works as expected
- [ ] Implement administrative boundaries
- [ ] Document and review with stakeholders
- [ ] Migrate users to appropriate OUs

### Regular Maintenance Tasks

- [ ] Quarterly review of OU structure
- [ ] Audit of user OU placements
- [ ] Verification of policy inheritance
- [ ] Review of administrative access
- [ ] Validation of security control effectiveness
- [ ] Update of OU documentation
- [ ] Assessment of potential structure improvements

## Security Monitoring for OUs

### Critical Events to Monitor

| Event Type | Description | Risk Indication |
|------------|-------------|-----------------|
| **OU Creation/Deletion** | New OUs being created or removed | Potential structure manipulation |
| **OU Moving** | OUs being relocated in hierarchy | Inheritance changes, potential policy bypass |
| **User Moving** | Users moving between OUs | Security policy changes, potential privilege change |
| **Inheritance Override** | Changes to policy inheritance | Potential security control bypass |
| **Admin Privilege Changes** | Changes to admin access for OUs | Potential privilege escalation |

### Sample Monitoring Queries

**Detecting Unusual OU Changes:**
```sql
SELECT admin_email, event_type, target_ou_name, timestamp
FROM admin_audit_logs
WHERE event_type IN ('CREATE_OU', 'DELETE_OU', 'MOVE_OU')
  AND timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  AND admin_email NOT IN (SELECT admin_email FROM authorized_ou_admins)
ORDER BY timestamp DESC
```

**Monitoring High-Risk User Movement:**
```sql
SELECT admin_email, affected_user_email, 
       source_ou_path, destination_ou_path, timestamp
FROM admin_audit_logs
WHERE event_type = 'MOVE_USER'
  AND (
    -- Moving from restricted to less restricted
    (source_ou_path LIKE '%/HighSecurity/%' AND destination_ou_path NOT LIKE '%/HighSecurity/%')
    OR
    -- Moving to administrative OUs
    (destination_ou_path LIKE '%/Admin/%')
  )
  AND timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
ORDER BY timestamp DESC
```

**Tracking Inheritance Changes:**
```sql
SELECT admin_email, target_ou_path, setting_name, 
       old_value, new_value, timestamp
FROM admin_audit_logs
WHERE event_type = 'CHANGE_SETTING_INHERITANCE'
  AND setting_name IN ('Password Strength', 'Two Factor Authentication', 'Access Controls', 'Data Controls')
  AND timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
ORDER BY timestamp DESC
```

## Resources

- [Google Workspace Admin Help: Organizational Units](https://support.google.com/a/answer/182537)
- [Google Workspace Admin SDK: Directory API](https://developers.google.com/admin-sdk/directory)
- [Google Cloud Platform Resource Hierarchy](https://cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy)
- [NIST SP 800-53: Access Control](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf)

---

**Note**: This guide should be adapted to your organization's specific needs, size, and security requirements.