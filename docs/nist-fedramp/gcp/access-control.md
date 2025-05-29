# Access Control (AC) - Google Cloud Platform

## Overview

This guide provides gcloud commands and automated methods for collecting evidence related to NIST SP 800-53 and FedRAMP Access Control (AC) family controls in Google Cloud Platform environments.

## Key GCP Services

- **Cloud IAM**: Role-based access control and identity management
- **Cloud Identity**: Enterprise identity services and directory
- **Organization Policies**: Centralized control constraints
- **VPC Service Controls**: Perimeter-based access controls
- **Cloud Audit Logs**: Access monitoring and logging

## Control Implementation Commands

### AC-2: Account Management

**List all IAM policy bindings for a project**
```bash
gcloud projects get-iam-policy PROJECT_ID --format=json
```

**List all service accounts in a project**
```bash
gcloud iam service-accounts list --project=PROJECT_ID
```

**Get IAM policy for an organization**
```bash
gcloud organizations get-iam-policy ORGANIZATION_ID
```

**List custom roles in organization**
```bash
gcloud iam roles list --organization=ORGANIZATION_ID --show-deleted
```

**Export audit logs for account activities**
```bash
gcloud logging read "protoPayload.methodName:(\"SetIamPolicy\" OR \"CreateServiceAccount\" OR \"DeleteServiceAccount\")" \
  --project=PROJECT_ID \
  --format=json \
  --freshness=30d
```

**List all members with specific roles**
```bash
gcloud asset search-all-iam-policies \
  --scope=organizations/ORGANIZATION_ID \
  --query="policy:roles/owner"
```

### AC-3: Access Enforcement

**Check effective permissions for a user**
```bash
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:EMAIL_ADDRESS" \
  --format="table(bindings.role)"
```

**List organizational policies**
```bash
gcloud resource-manager org-policies list --organization=ORGANIZATION_ID
```

**Verify VPC Service Controls**
```bash
gcloud access-context-manager perimeters list
```

**Get specific organizational policy details**
```bash
gcloud resource-manager org-policies describe CONSTRAINT_NAME \
  --organization=ORGANIZATION_ID
```

### AC-4: Information Flow Enforcement

**List VPC firewall rules**
```bash
gcloud compute firewall-rules list --project=PROJECT_ID
```

**Show VPC Service Control perimeters**
```bash
gcloud access-context-manager perimeters describe PERIMETER_NAME
```

**List Cloud Armor security policies**
```bash
gcloud compute security-policies list --project=PROJECT_ID
```

**Get details of specific firewall rules**
```bash
gcloud compute firewall-rules describe RULE_NAME --project=PROJECT_ID
```

### AC-5: Separation of Duties

**Create custom role with specific permissions**
```bash
gcloud iam roles create ROLE_ID \
  --organization=ORGANIZATION_ID \
  --title="Custom Role Title" \
  --description="Role description" \
  --permissions=permission1,permission2
```

**Audit users with multiple privileged roles**
```bash
gcloud asset search-all-iam-policies \
  --scope=organizations/ORGANIZATION_ID \
  --query="policy:roles/owner OR policy:roles/editor"
```

**List all custom roles**
```bash
gcloud iam roles list --organization=ORGANIZATION_ID --format="table(name,title,description)"
```

### AC-6: Least Privilege

**Find all primitive role assignments**
```bash
gcloud asset search-all-iam-policies \
  --scope=organizations/ORGANIZATION_ID \
  --query="policy:(roles/owner OR roles/editor OR roles/viewer)"
```

**List permissions for a specific role**
```bash
gcloud iam roles describe roles/compute.admin
```

**Check for overly permissive service account keys**
```bash
gcloud iam service-accounts keys list \
  --iam-account=SERVICE_ACCOUNT_EMAIL \
  --managed-by=user \
  --format="table(name,validAfterTime,validBeforeTime)"
```

### AC-7: Unsuccessful Logon Attempts

**Query failed login attempts from audit logs**
```bash
gcloud logging read "protoPayload.authenticationInfo.principalEmail:* AND severity=ERROR AND protoPayload.status.code=7" \
  --project=PROJECT_ID \
  --format=json \
  --freshness=7d
```

**Monitor authentication events**
```bash
gcloud logging read "protoPayload.serviceName=\"cloudresourcemanager.googleapis.com\" AND protoPayload.authenticationInfo.principalEmail:*" \
  --project=PROJECT_ID \
  --limit=100
```

### AC-17: Remote Access

**List all Compute Engine instances with external IPs**
```bash
gcloud compute instances list \
  --format="table(name,networkInterfaces[0].accessConfigs[0].natIP:label=EXTERNAL_IP)" \
  --filter="networkInterfaces[0].accessConfigs[0].natIP:*"
```

**Check IAP (Identity-Aware Proxy) tunnel instances**
```bash
gcloud compute instances list \
  --filter="labels.use-iap-tunnel=true" \
  --format="table(name,status,labels)"
```

**List Cloud VPN tunnels**
```bash
gcloud compute vpn-tunnels list --project=PROJECT_ID
```

### AC-20: Use of External Information Systems

**List all external IP addresses**
```bash
gcloud compute addresses list --project=PROJECT_ID --filter="addressType=EXTERNAL"
```

**Check Private Google Access status**
```bash
gcloud compute networks subnets list \
  --project=PROJECT_ID \
  --format="table(name,privateIpGoogleAccess,region)"
```

## Automated Evidence Collection Scripts

### Export Complete IAM Configuration
```bash
#!/bin/bash
# Export complete IAM configuration for compliance audit

ORG_ID="YOUR_ORG_ID"
OUTPUT_DIR="iam_audit_$(date +%Y%m%d)"
mkdir -p $OUTPUT_DIR

# Organization level IAM
gcloud organizations get-iam-policy $ORG_ID --format=json > $OUTPUT_DIR/org_iam_policy.json

# All folders
gcloud resource-manager folders list --organization=$ORG_ID --format=json > $OUTPUT_DIR/folders.json

# All projects
gcloud projects list --format=json > $OUTPUT_DIR/projects.json

# Service accounts across all projects
for project in $(gcloud projects list --format="value(projectId)"); do
    echo "Processing project: $project"
    gcloud iam service-accounts list --project=$project --format=json > $OUTPUT_DIR/service_accounts_$project.json
    gcloud projects get-iam-policy $project --format=json > $OUTPUT_DIR/project_iam_$project.json
done
```

### Monitor Privileged Access Changes
```bash
#!/bin/bash
# Monitor changes to privileged roles

gcloud logging read '
protoPayload.methodName="SetIamPolicy" AND
(protoPayload.request.policy.bindings.role="roles/owner" OR
 protoPayload.request.policy.bindings.role="roles/editor" OR
 protoPayload.request.policy.bindings.role="roles/iam.securityAdmin")' \
--project=PROJECT_ID \
--format=json \
--freshness=24h
```

### Check Compliance Status
```bash
#!/bin/bash
# Quick compliance check for common access control issues

echo "=== Checking for primitive roles usage ==="
gcloud asset search-all-iam-policies \
  --scope=organizations/$ORG_ID \
  --query="policy:(roles/owner OR roles/editor)" \
  --format="table(resource,policy.bindings.role,policy.bindings.members)"

echo "=== Checking for service accounts with user-managed keys ==="
for sa in $(gcloud iam service-accounts list --format="value(email)"); do
    keys=$(gcloud iam service-accounts keys list --iam-account=$sa --managed-by=user --format="value(name)")
    if [ ! -z "$keys" ]; then
        echo "Service Account: $sa has user-managed keys"
    fi
done

echo "=== Checking for external IP addresses ==="
gcloud compute instances list \
  --format="table(name,networkInterfaces[0].accessConfigs[0].natIP)" \
  --filter="networkInterfaces[0].accessConfigs[0].natIP:*"
```

## Additional Resources

- [Google Cloud IAM Documentation](https://cloud.google.com/iam/docs)
- [gcloud CLI Reference](https://cloud.google.com/sdk/gcloud/reference)
- [Cloud Asset Inventory](https://cloud.google.com/asset-inventory/docs)