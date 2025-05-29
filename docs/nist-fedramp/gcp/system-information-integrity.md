# System and Information Integrity (SI) - Google Cloud Platform

## Overview

This guide provides gcloud commands and automated methods for collecting evidence related to NIST SP 800-53 and FedRAMP System and Information Integrity (SI) family controls in Google Cloud Platform environments.

## Key GCP Services

- **Security Command Center**: Vulnerability and threat detection
- **Cloud Logging**: Centralized logging and monitoring
- **Cloud Monitoring**: Performance and uptime monitoring
- **Cloud Security Scanner**: Web application vulnerability scanning
- **Container Analysis**: Container vulnerability scanning
- **Cloud IDS**: Intrusion detection system

## Control Implementation Commands

### SI-2: Flaw Remediation

**List Security Command Center findings**
```bash
gcloud scc findings list organizations/ORGANIZATION_ID \
  --source=organizations/ORGANIZATION_ID/sources/SECURITY_HEALTH_ANALYTICS_SOURCE_ID \
  --filter="state=\"ACTIVE\" AND category=\"VULNERABILITY\"" \
  --format="table(name,category,findingClass,severity)"
```

**Check OS patch status on instances**
```bash
gcloud compute instances os-inventory list-instances \
  --format="table(name,lastOsInventoryUpdateTime)"
```

**Get OS inventory details for an instance**
```bash
gcloud compute instances os-inventory describe INSTANCE_NAME \
  --zone=ZONE
```

### SI-3: Malware Protection

**Check Shielded VM status (includes vTPM for integrity)**
```bash
gcloud compute instances list \
  --filter="shieldedInstanceConfig.enableIntegrityMonitoring=true" \
  --format="table(name,shieldedInstanceConfig.enableIntegrityMonitoring,shieldedInstanceConfig.enableVtpm)"
```

**Monitor malware detection alerts**
```bash
gcloud logging read \
  "resource.type=\"gce_instance\" AND protoPayload.response.finding.category=\"MALWARE\"" \
  --project=PROJECT_ID \
  --freshness=7d
```

### SI-4: Information System Monitoring

**List all log sinks**
```bash
gcloud logging sinks list --project=PROJECT_ID
```

**Check Cloud Monitoring alerting policies**
```bash
gcloud monitoring policies list --project=PROJECT_ID
```

**List notification channels**
```bash
gcloud monitoring channels list --project=PROJECT_ID
```

**Export audit logs for analysis**
```bash
gcloud logging read \
  "logName=\"projects/PROJECT_ID/logs/cloudaudit.googleapis.com%2Factivity\"" \
  --project=PROJECT_ID \
  --format=json \
  --freshness=24h > audit_logs.json
```

**Check if Cloud IDS is enabled**
```bash
gcloud ids endpoints list --project=PROJECT_ID --location=LOCATION
```

### SI-5: Security Alerts, Advisories, and Directives

**List Security Command Center notification configs**
```bash
gcloud scc notification-configs list --organization=ORGANIZATION_ID
```

**Check for critical findings**
```bash
gcloud scc findings list organizations/ORGANIZATION_ID \
  --filter="severity=\"CRITICAL\" OR severity=\"HIGH\"" \
  --format="table(name,category,severity,state,createTime)"
```

### SI-6: Security Function Verification

**Verify security controls are active**
```bash
# Check if audit logging is enabled
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="auditConfigs[].auditLogConfigs[]" \
  --format="table(auditConfigs.service,auditConfigs.auditLogConfigs.logType)"

# Check organization policies are enforced
gcloud resource-manager org-policies list \
  --organization=ORGANIZATION_ID \
  --format="table(constraint,listPolicy.allValues,booleanPolicy.enforced)"
```

### SI-7: Software, Firmware, and Information Integrity

**Check image signatures and attestations**
```bash
gcloud container binauthz attestors list --project=PROJECT_ID
```

**Verify Binary Authorization policy**
```bash
gcloud container binauthz policy export --project=PROJECT_ID
```

**List signed container images**
```bash
gcloud container images list-tags gcr.io/PROJECT_ID/IMAGE_NAME \
  --format="table(digest,tags,timestamp)"
```

### SI-10: Information Input Validation

**Check Web Security Scanner findings**
```bash
gcloud web-security-scanner scan-runs list \
  --project=PROJECT_ID
```

**Get scan results**
```bash
gcloud web-security-scanner findings list \
  --scan-run=SCAN_RUN_NAME \
  --project=PROJECT_ID
```

### SI-12: Information Handling and Retention

**Check Cloud Storage lifecycle policies**
```bash
for bucket in $(gsutil ls); do
  echo "Bucket: $bucket"
  gsutil lifecycle get $bucket
done
```

**List retention policies on log buckets**
```bash
gcloud logging buckets list \
  --location=global \
  --format="table(name,retentionDays,locked)" \
  --project=PROJECT_ID
```

### SI-16: Memory Protection

**Check for instances with secure boot enabled**
```bash
gcloud compute instances list \
  --filter="shieldedInstanceConfig.enableSecureBoot=true" \
  --format="table(name,shieldedInstanceConfig.enableSecureBoot,shieldedInstanceConfig.enableVtpm,shieldedInstanceConfig.enableIntegrityMonitoring)"
```

## Automated Evidence Collection Scripts

### Comprehensive Security Monitoring Audit
```bash
#!/bin/bash
# Complete SI controls audit

PROJECT_ID="YOUR_PROJECT_ID"
ORG_ID="YOUR_ORG_ID"
OUTPUT_DIR="si_audit_$(date +%Y%m%d)"
mkdir -p $OUTPUT_DIR

# Security findings
echo "=== Security Command Center Findings ==="
gcloud scc findings list organizations/$ORG_ID \
  --filter="state=\"ACTIVE\"" \
  --format=json > $OUTPUT_DIR/scc_findings.json

# Logging configuration
echo "=== Logging Configuration ==="
gcloud logging sinks list --format=json > $OUTPUT_DIR/log_sinks.json
gcloud logging buckets list --location=global --format=json > $OUTPUT_DIR/log_buckets.json

# Monitoring configuration
echo "=== Monitoring Alerts ==="
gcloud monitoring policies list --format=json > $OUTPUT_DIR/alert_policies.json
gcloud monitoring channels list --format=json > $OUTPUT_DIR/notification_channels.json

# Shielded VM status
echo "=== Shielded VM Status ==="
gcloud compute instances list \
  --format="json(name,shieldedInstanceConfig)" > $OUTPUT_DIR/shielded_vms.json

# Binary Authorization
echo "=== Binary Authorization ==="
gcloud container binauthz policy export > $OUTPUT_DIR/binauthz_policy.yaml
gcloud container binauthz attestors list --format=json > $OUTPUT_DIR/attestors.json
```

### Vulnerability Management Report
```bash
#!/bin/bash
# Generate vulnerability management report

# OS vulnerabilities
echo "=== OS Vulnerabilities ==="
gcloud scc findings list organizations/ORG_ID \
  --source=organizations/ORG_ID/sources/SECURITY_HEALTH_ANALYTICS_SOURCE_ID \
  --filter="category=\"OS_VULNERABILITY\" AND state=\"ACTIVE\"" \
  --format="table(resource,category,findingClass,severity)"

# Container vulnerabilities
echo "=== Container Vulnerabilities ==="
for image in $(gcloud container images list --format="value(name)"); do
  echo "Scanning image: $image"
  gcloud container images scan $image
  gcloud container images describe $image --show-package-vulnerability
done

# Web application vulnerabilities
echo "=== Web Security Scanner Results ==="
gcloud web-security-scanner scan-runs list \
  --format="table(name,state,startTime,endTime,urlsCrawledCount,urlsTestedCount)"
```

### Real-time Security Monitoring
```bash
#!/bin/bash
# Monitor security events in real-time

# Monitor critical security findings
watch -n 300 'gcloud scc findings list organizations/ORG_ID \
  --filter="severity=\"CRITICAL\" AND state=\"ACTIVE\" AND eventTime>timestamp.now()-300s" \
  --format="table(name,category,severity,eventTime)"'

# Monitor authentication failures
gcloud logging tail \
  "protoPayload.status.code=7 OR protoPayload.status.code=16" \
  --project=PROJECT_ID

# Monitor configuration changes
gcloud logging tail \
  "protoPayload.methodName:(\"SetIamPolicy\" OR \"Update\" OR \"Patch\" OR \"Delete\")" \
  --project=PROJECT_ID
```

### Compliance Evidence Export
```bash
#!/bin/bash
# Export compliance evidence for SI controls

EXPORT_BUCKET="gs://compliance-evidence-bucket"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Export all security findings
gcloud scc findings list organizations/ORG_ID \
  --filter="state=\"ACTIVE\"" \
  --format=json | gsutil cp - $EXPORT_BUCKET/si_findings_$TIMESTAMP.json

# Export monitoring configuration
gcloud monitoring policies list --format=json | \
  gsutil cp - $EXPORT_BUCKET/monitoring_policies_$TIMESTAMP.json

# Export log aggregation proof
gcloud logging sinks list --format=json | \
  gsutil cp - $EXPORT_BUCKET/log_sinks_$TIMESTAMP.json

# Export patch compliance status
for instance in $(gcloud compute instances list --format="value(name,zone)"); do
  name=$(echo $instance | cut -d' ' -f1)
  zone=$(echo $instance | cut -d' ' -f2)
  gcloud compute instances os-inventory describe $name --zone=$zone --format=json | \
    gsutil cp - $EXPORT_BUCKET/patch_status_${name}_$TIMESTAMP.json
done
```

## Additional Resources

- [Security Command Center Documentation](https://cloud.google.com/security-command-center/docs)
- [Cloud Logging Documentation](https://cloud.google.com/logging/docs)
- [Cloud Monitoring Documentation](https://cloud.google.com/monitoring/docs)
- [Container Analysis Documentation](https://cloud.google.com/container-analysis/docs)