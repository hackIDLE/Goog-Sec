# Identification and Authentication (IA) - Google Cloud Platform

## Overview

This guide provides gcloud commands and automated methods for collecting evidence related to NIST SP 800-53 and FedRAMP Identification and Authentication (IA) family controls in Google Cloud Platform environments.

## Key GCP Services

- **Cloud Identity**: Identity management and authentication
- **Cloud IAM**: Identity and Access Management
- **Cloud KMS**: Key management for authentication
- **Security Command Center**: Security monitoring
- **Cloud Audit Logs**: Authentication event logging

## Control Implementation Commands

### IA-2: Identification and Authentication (Organizational Users)

**List all users in organization**
```bash
gcloud identity groups memberships list \
  --group-email="all@YOUR_DOMAIN.com" \
  --format="table(preferredMemberKey.id)"
```

**Check for users without 2FA enabled (via audit logs)**
```bash
gcloud logging read \
  "protoPayload.authenticationInfo.principalEmail:* AND NOT labels.\"2fa_used\":true" \
  --project=PROJECT_ID \
  --freshness=7d
```

**List service accounts and their keys**
```bash
# List all service accounts
gcloud iam service-accounts list --project=PROJECT_ID

# For each service account, list keys
gcloud iam service-accounts keys list \
  --iam-account=SERVICE_ACCOUNT_EMAIL \
  --format="table(name,validAfterTime,validBeforeTime,keyType)"
```

### IA-3: Device Identification and Authentication

**List all Compute Engine instances with OS Login enabled**
```bash
gcloud compute instances list \
  --format="table(name,metadata.items[key='enable-oslogin'].value)" \
  --project=PROJECT_ID
```

**Check metadata for SSH key management**
```bash
gcloud compute project-info describe \
  --format="value(commonInstanceMetadata.items[key='ssh-keys'])" \
  --project=PROJECT_ID
```

**List instances blocking project-wide SSH keys**
```bash
gcloud compute instances list \
  --filter="metadata.items[key='block-project-ssh-keys'].value='TRUE'" \
  --format="table(name,zone)"
```

### IA-4: Identifier Management

**List all service accounts with naming patterns**
```bash
gcloud iam service-accounts list \
  --format="table(email,displayName,disabled)" \
  --project=PROJECT_ID
```

**Check for duplicate or similar account names**
```bash
gcloud iam service-accounts list --format="value(email)" | sort | uniq -d
```

**Audit service account creation**
```bash
gcloud logging read \
  "protoPayload.methodName=\"google.iam.admin.v1.CreateServiceAccount\"" \
  --project=PROJECT_ID \
  --format=json \
  --freshness=30d
```

### IA-5: Authenticator Management

**Check service account key age**
```bash
for sa in $(gcloud iam service-accounts list --format="value(email)" --project=PROJECT_ID); do
  echo "Service Account: $sa"
  gcloud iam service-accounts keys list \
    --iam-account=$sa \
    --format="table(name,validAfterTime,validBeforeTime)" \
    --filter="keyType=USER_MANAGED"
done
```

**Find service accounts with multiple active keys**
```bash
for sa in $(gcloud iam service-accounts list --format="value(email)" --project=PROJECT_ID); do
  key_count=$(gcloud iam service-accounts keys list --iam-account=$sa --format="value(name)" | wc -l)
  if [ $key_count -gt 2 ]; then
    echo "$sa has $key_count keys"
  fi
done
```

**Monitor key creation/deletion activities**
```bash
gcloud logging read \
  "protoPayload.methodName:(\"google.iam.admin.v1.CreateServiceAccountKey\" OR \"google.iam.admin.v1.DeleteServiceAccountKey\")" \
  --project=PROJECT_ID \
  --format="table(timestamp,protoPayload.authenticationInfo.principalEmail,protoPayload.methodName,resource.labels.email)"
```

### IA-8: Identification and Authentication (Non-Organizational Users)

**List all IAM bindings with external users**
```bash
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:* AND NOT bindings.members:*@YOUR_DOMAIN.com" \
  --format="table(bindings.members,bindings.role)"
```

**Check for allUsers or allAuthenticatedUsers bindings**
```bash
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:(allUsers OR allAuthenticatedUsers)" \
  --format="table(bindings.members,bindings.role)"
```

**Audit external access in Cloud Storage**
```bash
for bucket in $(gsutil ls); do
  echo "Checking bucket: $bucket"
  gsutil iam get $bucket | grep -E "allUsers|allAuthenticatedUsers" || echo "No public access"
done
```

## Automated Evidence Collection Scripts

### Complete Authentication Audit
```bash
#!/bin/bash
# Comprehensive authentication audit script

PROJECT_ID="YOUR_PROJECT_ID"
ORG_ID="YOUR_ORG_ID"
OUTPUT_DIR="ia_audit_$(date +%Y%m%d)"
mkdir -p $OUTPUT_DIR

# Service accounts inventory
echo "=== Service Account Audit ==="
gcloud iam service-accounts list --format=json > $OUTPUT_DIR/service_accounts.json

# Service account keys audit
for sa in $(gcloud iam service-accounts list --format="value(email)"); do
  gcloud iam service-accounts keys list \
    --iam-account=$sa \
    --format=json > $OUTPUT_DIR/keys_${sa//[@.]/_}.json
done

# OS Login status
echo "=== OS Login Configuration ==="
gcloud compute instances list \
  --format="json(name,metadata.items[key='enable-oslogin'])" > $OUTPUT_DIR/oslogin_status.json

# External access audit
echo "=== External Access Audit ==="
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="NOT bindings.members:*@YOUR_DOMAIN.com" \
  --format=json > $OUTPUT_DIR/external_access.json

# Authentication logs
echo "=== Failed Authentication Attempts ==="
gcloud logging read \
  "protoPayload.authenticationInfo.principalEmail:* AND severity=ERROR" \
  --project=$PROJECT_ID \
  --format=json \
  --freshness=7d > $OUTPUT_DIR/failed_auth.json
```

### Monitor Authentication Events
```bash
#!/bin/bash
# Real-time authentication monitoring

# Monitor failed authentications
gcloud logging read \
  "protoPayload.status.code=7 OR protoPayload.status.code=16" \
  --project=PROJECT_ID \
  --format="table(timestamp,protoPayload.authenticationInfo.principalEmail,protoPayload.status.message)" \
  --freshness=1h

# Monitor service account usage
gcloud logging read \
  "protoPayload.authenticationInfo.serviceAccountDelegationInfo.firstPartyPrincipal.principalEmail:*" \
  --project=PROJECT_ID \
  --format="table(timestamp,protoPayload.authenticationInfo.principalEmail,protoPayload.methodName)" \
  --freshness=1h
```

### Service Account Key Rotation Check
```bash
#!/bin/bash
# Check for service account keys older than 90 days

THRESHOLD_DAYS=90
THRESHOLD_DATE=$(date -d "$THRESHOLD_DAYS days ago" +%Y-%m-%d)

for sa in $(gcloud iam service-accounts list --format="value(email)"); do
  old_keys=$(gcloud iam service-accounts keys list \
    --iam-account=$sa \
    --filter="validAfterTime.date('%Y-%m-%d', Z)<$THRESHOLD_DATE AND keyType=USER_MANAGED" \
    --format="value(name)")
  
  if [ ! -z "$old_keys" ]; then
    echo "Service Account $sa has keys older than $THRESHOLD_DAYS days:"
    echo "$old_keys"
  fi
done
```

## Additional Resources

- [Google Cloud Identity Documentation](https://cloud.google.com/identity/docs)
- [Cloud IAM Documentation](https://cloud.google.com/iam/docs)
- [OS Login Documentation](https://cloud.google.com/compute/docs/oslogin)