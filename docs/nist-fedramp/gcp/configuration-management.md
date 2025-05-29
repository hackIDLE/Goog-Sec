# Configuration Management (CM) - Google Cloud Platform

## Overview

This guide provides gcloud commands and automated methods for collecting evidence related to NIST SP 800-53 and FedRAMP Configuration Management (CM) family controls in Google Cloud Platform environments.

## Key GCP Services

- **Cloud Asset Inventory**: Track and analyze resource configurations
- **Organization Policy Service**: Enforce configuration constraints
- **Deployment Manager**: Infrastructure as code templates
- **Security Command Center**: Configuration compliance monitoring
- **Cloud Build**: Automated deployment pipelines

## Control Implementation Commands

### CM-2: Baseline Configuration

**Export current project configuration**
```bash
gcloud asset export \
  --project=PROJECT_ID \
  --output-path=gs://BUCKET_NAME/baseline-config.json \
  --content-type=resource
```

**List all Compute Engine instance templates**
```bash
gcloud compute instance-templates list --project=PROJECT_ID
```

**Export organization policies**
```bash
gcloud resource-manager org-policies list \
  --organization=ORGANIZATION_ID \
  --format=json > org-policies-baseline.json
```

**Capture VPC configurations**
```bash
gcloud compute networks list --project=PROJECT_ID --format=json
gcloud compute firewall-rules list --project=PROJECT_ID --format=json
```

**List all images in project**
```bash
gcloud compute images list --project=PROJECT_ID
```

**Export Deployment Manager deployments**
```bash
gcloud deployment-manager deployments list --project=PROJECT_ID
gcloud deployment-manager deployments describe DEPLOYMENT_NAME --project=PROJECT_ID
```

### CM-3: Configuration Change Control

**Monitor configuration changes via audit logs**
```bash
gcloud logging read \
  "protoPayload.methodName:(\"compute.instances.insert\" OR \"compute.firewalls.patch\" OR \"storage.buckets.update\")" \
  --project=PROJECT_ID \
  --format=json \
  --freshness=7d
```

**List Cloud Source Repositories**
```bash
gcloud source repos list --project=PROJECT_ID
```

**View Cloud Build history**
```bash
gcloud builds list --project=PROJECT_ID --limit=50
```

**Check deployment history**
```bash
gcloud deployment-manager deployments list --project=PROJECT_ID --format="table(name,insertTime,operation.status)"
```

### CM-5: Access Restrictions for Change

**Create custom role for configuration management**
```bash
gcloud iam roles create configurationManager \
  --organization=ORGANIZATION_ID \
  --title="Configuration Manager" \
  --description="Manages infrastructure configurations" \
  --permissions=compute.instances.update,compute.networks.update,storage.buckets.update
```

**List who has deployment permissions**
```bash
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.role:(roles/deploymentmanager.editor OR roles/editor OR roles/owner)" \
  --format="table(bindings.members,bindings.role)"
```

### CM-6: Configuration Settings

**List Security Health Analytics findings**
```bash
gcloud scc findings list organizations/ORGANIZATION_ID \
  --source=organizations/ORGANIZATION_ID/sources/SECURITY_HEALTH_ANALYTICS_SOURCE_ID \
  --filter="state=\"ACTIVE\""
```

**Check Cloud Storage bucket configurations**
```bash
for bucket in $(gsutil ls); do
  echo "Bucket: $bucket"
  gsutil iam get $bucket
  gsutil uniformbucketlevelaccess get $bucket
done
```

**Verify OS Login is enabled on instances**
```bash
gcloud compute instances list \
  --format="table(name,metadata.items[key='enable-oslogin'].value)" \
  --filter="metadata.items.key='enable-oslogin'"
```

**Check project-wide metadata**
```bash
gcloud compute project-info describe --project=PROJECT_ID --format="yaml(commonInstanceMetadata)"
```

### CM-7: Least Functionality

**List enabled APIs**
```bash
gcloud services list --enabled --project=PROJECT_ID
```

**Disable unnecessary APIs**
```bash
gcloud services disable API_NAME --project=PROJECT_ID
```

**Find unused firewall rules**
```bash
gcloud compute firewall-rules list \
  --filter="disabled=true" \
  --format="table(name,creationTimestamp,disabled)"
```

**List all running services on instances**
```bash
gcloud compute ssh INSTANCE_NAME --command="systemctl list-units --type=service --state=running"
```

### CM-8: Information System Component Inventory

**Export complete asset inventory**
```bash
gcloud asset export \
  --organization=ORGANIZATION_ID \
  --output-path=gs://BUCKET_NAME/inventory-$(date +%Y%m%d).json \
  --content-type=resource
```

**Query specific resource types**
```bash
gcloud asset search-all-resources \
  --scope=organizations/ORGANIZATION_ID \
  --asset-types=compute.googleapis.com/Instance,storage.googleapis.com/Bucket
```

**List resources with specific labels**
```bash
gcloud compute instances list \
  --filter="labels.environment=production" \
  --format="table(name,labels.environment,labels.owner,creationTimestamp)"
```

**Export all Compute Engine resources**
```bash
# Instances
gcloud compute instances list --format=json > instances.json

# Disks
gcloud compute disks list --format=json > disks.json

# Networks
gcloud compute networks list --format=json > networks.json

# Subnets
gcloud compute networks subnets list --format=json > subnets.json
```

### CM-9: Configuration Management Plan

**Check organization constraints**
```bash
gcloud resource-manager org-policies list --organization=ORGANIZATION_ID
```

**View specific constraint details**
```bash
gcloud resource-manager org-policies describe constraints/compute.requireOsLogin \
  --organization=ORGANIZATION_ID
```

## Automated Evidence Collection Scripts

### Complete Configuration Baseline Export
```bash
#!/bin/bash
# Export complete configuration baseline

PROJECT_ID="YOUR_PROJECT_ID"
ORG_ID="YOUR_ORG_ID"
OUTPUT_DIR="config_baseline_$(date +%Y%m%d)"
mkdir -p $OUTPUT_DIR

# Organization policies
gcloud resource-manager org-policies list --organization=$ORG_ID --format=json > $OUTPUT_DIR/org_policies.json

# Asset inventory
gcloud asset export \
  --organization=$ORG_ID \
  --output-path=gs://YOUR_BUCKET/$OUTPUT_DIR/full_inventory.json \
  --content-type=resource

# Compute configurations
gcloud compute instances list --format=json > $OUTPUT_DIR/instances.json
gcloud compute firewall-rules list --format=json > $OUTPUT_DIR/firewall_rules.json
gcloud compute networks list --format=json > $OUTPUT_DIR/networks.json
gcloud compute instance-templates list --format=json > $OUTPUT_DIR/instance_templates.json

# Storage configurations
gsutil ls -L > $OUTPUT_DIR/storage_buckets.txt

# Enabled APIs
gcloud services list --enabled --format=json > $OUTPUT_DIR/enabled_apis.json
```

### Configuration Drift Detection
```bash
#!/bin/bash
# Detect configuration changes from baseline

BASELINE_DIR="baseline_configs"
CURRENT_DIR="current_configs_$(date +%Y%m%d)"
mkdir -p $CURRENT_DIR

# Export current configurations
gcloud compute firewall-rules list --format=json > $CURRENT_DIR/firewall_rules.json
gcloud compute instances list --format=json > $CURRENT_DIR/instances.json

# Compare with baseline
echo "=== Firewall Rules Changes ==="
diff $BASELINE_DIR/firewall_rules.json $CURRENT_DIR/firewall_rules.json

echo "=== Instance Changes ==="
diff $BASELINE_DIR/instances.json $CURRENT_DIR/instances.json
```

### Monitor Configuration Changes
```bash
#!/bin/bash
# Monitor critical configuration changes in last 24 hours

gcloud logging read '
(protoPayload.methodName="compute.firewalls.insert" OR
 protoPayload.methodName="compute.firewalls.patch" OR
 protoPayload.methodName="compute.firewalls.delete" OR
 protoPayload.methodName="storage.buckets.update" OR
 protoPayload.methodName="compute.instances.setMetadata")' \
--project=PROJECT_ID \
--format="table(timestamp,protoPayload.authenticationInfo.principalEmail,protoPayload.methodName,protoPayload.resourceName)" \
--freshness=24h
```

## Additional Resources

- [Google Cloud Asset Inventory](https://cloud.google.com/asset-inventory/docs)
- [Organization Policy Service](https://cloud.google.com/resource-manager/docs/organization-policy/overview)
- [gcloud CLI Reference](https://cloud.google.com/sdk/gcloud/reference)