!!! warning "Under Construction"
    This page is under construction. Please check back later for comprehensive guidance

# Identity and Access Security in Google Workspace

This guide provides detailed strategies for implementing robust identity security in Google Workspace environments, with a focus on practices relevant to MSPs and SMBs.

## Understanding the Identity Security Landscape

In Google Workspace, identity is the foundation of your security posture. Compromised identities are among the most common attack vectors, enabling threat actors to:

- Access sensitive company data
- Launch lateral movement attacks
- Establish persistence
- Exfiltrate information
- Deploy ransomware or other malicious payloads

## Critical Identity Controls

### 1. Multi-Factor Authentication (MFA)

MFA is your most effective defense against account compromise. Implement a tiered approach:

#### Tier 1: Basic (Minimum Requirement)
- **Google Authenticator**: Time-based one-time passwords
- **SMS/Voice verification**: Less secure but better than no MFA
- **Email verification codes**: For lower-risk scenarios

#### Tier 2: Enhanced Security
- **Security keys**: FIDO U2F or FIDO2 hardware keys
- **Google Titan Security Keys**: Purpose-built hardware security
- **Integrated device verification**: For managed devices

#### Tier 3: Zero Trust Implementation
- **Context-aware access**: Location, device, and risk-based authentication
- **Continuous verification**: Session-based reauthentication
- **Adaptive risk scoring**: ML-based anomaly detection

#### Context-Aware Access Implementation

Context-Aware Access enables granular access control based on contextual attributes to enforce Zero Trust principles:

##### Key Capabilities
- **User identity verification**: Strong authentication based on user identity
- **Device security posture**: Access decisions based on device security state
- **Location awareness**: Limiting access based on geographic location
- **Resource sensitivity**: Varying security requirements based on data sensitivity
- **Temporal conditions**: Time-based access restrictions

##### Implementation Steps
1. **Define access levels**: Create access levels based on IP ranges, geographic locations, and device policies
2. **Configure access policies**: Apply access levels to Google Workspace services
3. **Set up device validation**: Implement device security requirements with endpoint verification
4. **Create security groups**: Group users by access requirements
5. **Apply tiered access**: Implement least-privilege access by service and data sensitivity

##### Advanced Context-Aware Configuration
- **Conditional access by OU**: Different policies for different organizational units
- **Service-specific policies**: Tailored restrictions for Gmail, Drive, Meet, etc.
- **API access control**: Context-based restrictions for API access
- **Third-party application integration**: Extend context-aware access to connected applications
- **Real-time policy enforcement**: Dynamic access decisions based on changing conditions

For detailed configuration instructions, refer to [Google's official Context-Aware Access guide](https://support.google.com/a/answer/12645308).

#### Phishing-Resistant MFA Implementation

Phishing-resistant MFA methods provide significantly stronger protection than standard MFA:

- **Hardware security keys**: Physical FIDO2/WebAuthn keys that cryptographically verify both the user and the destination site
- **Passkeys**: Modern authentication method tied to device biometrics with phishing resistance
- **Platform authenticators**: Built-in security features in devices that support FIDO standards

##### Benefits of Phishing-Resistant MFA
- Prevents credential theft even if users are tricked by sophisticated phishing attempts
- Verifies both the user identity and the legitimacy of the service being accessed
- Eliminates risks associated with OTPs, push notifications, and other interceptable verification methods
- Provides stronger protection against man-in-the-middle attacks

##### Hardware Key Management
- **Inventory tracking**: Maintain a central registry of all issued hardware keys
- **User assignment**: Track which keys are assigned to which users
- **Backup procedures**: Ensure users have backup authentication methods or keys
- **Revocation process**: Implement clear procedures for when keys are lost or compromised
- **Usage analytics**: Monitor which users actively use hardware keys for authentication

##### Implementation Strategy for Hardware Keys
1. **Identify high-risk users**: Start with admins and users with access to sensitive data
2. **Pilot program**: Test with a small group before organization-wide deployment
3. **Procurement planning**: Select compatible hardware keys that meet security requirements
4. **User training**: Provide clear instructions on how to use and safeguard hardware keys
5. **Gradual enforcement**: Begin with optional adoption, then require for specific actions, and finally mandate for all authentication
6. **Monitoring and compliance**: Track adoption rates and enforce policies through conditional access

##### Enforcing Hardware Key Requirements
In Google Workspace Admin Console:
1. Go to Security > Authentication > 2-Step Verification
2. Enable "Require security key" option for selected organizational units
3. Configure settings to only allow hardware security keys as 2SV methods
4. Set up alerts for authentication attempts that don't use hardware keys

##### Reporting on Hardware Key Usage
To gain visibility into hardware key adoption:
1. Generate 2-Step Verification reports from Admin Console (Security > Reports)
2. Monitor "Login audit logs" filtering for security key authentication events
3. Create custom alerts for users attempting to bypass hardware key requirements
4. Establish regular compliance reviews of hardware key usage across the organization

#### Implementation Strategy
- Start with a pilot group of admin and high-value accounts
- Use enrollment campaigns with clear deadlines
- Monitor MFA adoption and enforce through conditional access policies
- Consider security key provisioning for privileged accounts

### 2. Password Policies and Controls

Even with MFA, password security remains critical:

- **Strong password requirements**: Enforce minimum length (12+ characters) and complexity
- **Password rotation**: Balance security with usability (90-180 days for standard accounts)
- **Password breach detection**: Enable Google's built-in compromised credential checking
- **No password sharing**: Implement delegate access instead of sharing credentials
- **Password manager integration**: Encourage use of secure password management

### 3. Super Admin Account Protection

Super Admin accounts require exceptional protection:

- **Dedicated admin accounts**: Separate from day-to-day user accounts
- **Break-glass procedures**: For emergency access to admin credentials
- **Advanced Protection Program**: For highest-value admin accounts
- **Admin privilege segmentation**: Implement least privilege for administrative roles
- **Admin account activity logging**: Enhanced monitoring for admin actions

### 4. External Identity Management

Control how users authenticate with external services:

- **SSO implementation**: Centralize authentication through Google IdP
- **SAML application onboarding**: Secure integration of third-party services
- **OAuth scope review**: Regular audit of third-party application permissions
- **External identity governance**: Policies for B2B identity federation
- **Consumer identity separation**: Segregate consumer and corporate identity

## Advanced Identity Security Techniques

### Account Takeover Prevention

Implement specific controls to detect and prevent account takeovers:

- **Login challenge triggers**: Based on suspicious location, device, or behavior
- **Login velocity monitoring**: Detect unusual patterns in authentication attempts
- **Impossible travel detection**: Flag authentications from geographically distant locations
- **Authentication anomaly alerting**: Notify security teams of suspicious login patterns
- **Access suspension workflows**: Automated or manual account freezing

### Identity Threat Detection

Develop capabilities to identify identity-based threats:

- **Authentication log analysis**: Regular review of login patterns and failures
- **Permission change monitoring**: Detection of privilege escalation
- **OAuth token abuse detection**: Identify suspicious application access
- **Session hijacking detection**: Monitor for indicators of session compromise
- **Lateral movement identification**: Track identity usage across services

## MSP-Specific Identity Management

!!! msp "MSP Considerations"
    These guidelines are specifically designed for Managed Service Providers supporting multiple client Google Workspace environments.

For MSPs managing multiple Google Workspace tenants:

- **Cross-tenant identity governance**: Consistent policies across client environments
- **Delegated admin management**: Secure partner access to client tenants
- **Identity baseline templates**: Standardized identity controls for new clients
- **Tiered identity services**: Different security levels based on client requirements
- **Identity security reporting**: Client-specific identity risk assessments

## Implementation Checklist

!!! best-practice "Best Practices"
    This checklist represents recommended security controls that align with industry best practices. Prioritize implementation based on your organization's risk profile and resources.

- [ ] Enable MFA for all user accounts, prioritizing privileged accounts
- [ ] Implement phishing-resistant MFA with hardware keys for administrators and high-risk users
- [ ] Create hardware key inventory and management procedures
- [ ] Implement strong password policies
- [ ] Configure enhanced security for Super Admin accounts
- [ ] Review and restrict third-party application access
- [ ] Implement alerting for suspicious authentication events
- [ ] Deploy SSO for all compatible applications
- [ ] Develop and test account recovery procedures
- [ ] Create user security awareness training for identity protection
- [ ] Establish regular identity security reviews
- [ ] Deploy Advanced Protection Program for high-value accounts

## Threat Hunting Scenarios

### Suspicious OAuth Grants
Monitor for and investigate:
- OAuth grants to new or uncommon applications
- Applications requesting unusual scopes
- Multiple users authorizing the same suspicious application
- OAuth grants occurring outside business hours

### Authentication Anomalies
Look for:
- Failed login attempts followed by successful logins
- Successful logins from unusual locations
- Authentication pattern changes (time, location, device)
- Password resets followed by immediate login activity
- Disabled MFA followed by authentication from new location

## Resources

- [Google Workspace Admin Help: 2-Step Verification](https://support.google.com/a/answer/175197)
- [Google Advanced Protection Program](https://landing.google.com/advancedprotection/)
- [Google Identity Services Documentation](https://developers.google.com/identity)
- [NIST 800-63 Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)
- [CISA Phishing-Resistant MFA Fact Sheet](https://www.cisa.gov/sites/default/files/publications/fact-sheet-implementing-phishing-resistant-mfa-508c.pdf)

---

**Note**: This guide should be adapted to your organization's specific needs and risk profile.