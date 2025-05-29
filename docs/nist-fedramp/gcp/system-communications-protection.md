# System and Communications Protection (SC) - Google Cloud Platform

## Overview

This guide provides gcloud commands and automated methods for collecting evidence related to NIST SP 800-53 and FedRAMP System and Communications Protection (SC) family controls in Google Cloud Platform environments.

## Key GCP Services

- **VPC Networks**: Virtual Private Cloud networking
- **Cloud Armor**: DDoS protection and WAF
- **Cloud Load Balancing**: SSL/TLS termination
- **Cloud VPN**: Encrypted connections
- **Cloud KMS**: Encryption key management
- **VPC Service Controls**: API security perimeters

## Control Implementation Commands

### SC-7: Boundary Protection

**List all VPC networks**
```bash
gcloud compute networks list --project=PROJECT_ID
```

**List all firewall rules**
```bash
gcloud compute firewall-rules list \
  --format="table(name,direction,priority,sourceRanges,allowed[].ports,targetTags)" \
  --project=PROJECT_ID
```

**Check for overly permissive firewall rules**
```bash
gcloud compute firewall-rules list \
  --filter="sourceRanges:('0.0.0.0/0')" \
  --format="table(name,allowed[].ports,targetTags)" \
  --project=PROJECT_ID
```

**List Cloud Armor security policies**
```bash
gcloud compute security-policies list --project=PROJECT_ID
```

**Check VPC peering connections**
```bash
gcloud compute networks peerings list --network=NETWORK_NAME --project=PROJECT_ID
```

### SC-8: Transmission Confidentiality and Integrity

**List SSL certificates**
```bash
gcloud compute ssl-certificates list --project=PROJECT_ID
```

**Check HTTPS load balancers**
```bash
gcloud compute target-https-proxies list --project=PROJECT_ID
```

**List VPN tunnels and gateways**
```bash
gcloud compute vpn-tunnels list --project=PROJECT_ID
gcloud compute vpn-gateways list --project=PROJECT_ID
```

**Check Cloud Interconnect attachments**
```bash
gcloud compute interconnects attachments list --project=PROJECT_ID
```

### SC-12: Cryptographic Key Establishment and Management

**List all Cloud KMS keys**
```bash
gcloud kms keys list --location=global --keyring=KEYRING_NAME --project=PROJECT_ID
```

**Check key rotation schedules**
```bash
gcloud kms keys describe KEY_NAME \
  --location=LOCATION \
  --keyring=KEYRING_NAME \
  --format="table(name,rotationPeriod,nextRotationTime)" \
  --project=PROJECT_ID
```

**List keys by protection level**
```bash
gcloud kms keys list \
  --location=global \
  --keyring=KEYRING_NAME \
  --filter="versionTemplate.protectionLevel=HSM" \
  --project=PROJECT_ID
```

### SC-13: Cryptographic Protection

**Check Cloud Storage bucket encryption**
```bash
for bucket in $(gsutil ls); do
  echo "Bucket: $bucket"
  gsutil encryption get $bucket
done
```

**List disks and their encryption status**
```bash
gcloud compute disks list \
  --format="table(name,zone,diskEncryptionKey.kmsKeyName:label=KMS_KEY)" \
  --project=PROJECT_ID
```

**Check default encryption settings for project**
```bash
gcloud compute project-info describe \
  --format="value(defaultServiceAccount,commonInstanceMetadata.items[key='google-compute-default-encrypt'])" \
  --project=PROJECT_ID
```

### SC-23: Session Authenticity

**Check load balancer session affinity**
```bash
gcloud compute backend-services list \
  --format="table(name,sessionAffinity,affinityCookieTtlSec)" \
  --project=PROJECT_ID
```

**List instances with secure boot enabled**
```bash
gcloud compute instances list \
  --filter="shieldedInstanceConfig.enableSecureBoot=true" \
  --format="table(name,shieldedInstanceConfig.enableSecureBoot)" \
  --project=PROJECT_ID
```

### SC-28: Protection of Information at Rest

**Check bucket lifecycle policies for data retention**
```bash
for bucket in $(gsutil ls); do
  echo "Bucket: $bucket"
  gsutil lifecycle get $bucket
done
```

**List all customer-managed encryption keys (CMEK) usage**
```bash
gcloud asset search-all-resources \
  --scope=projects/PROJECT_ID \
  --query="kmsKey:*" \
  --format="table(name,assetType,kmsKey)"
```

## Automated Evidence Collection Scripts

### Network Security Audit
```bash
#!/bin/bash
# Comprehensive network security audit

PROJECT_ID="YOUR_PROJECT_ID"
OUTPUT_DIR="sc_audit_$(date +%Y%m%d)"
mkdir -p $OUTPUT_DIR

# Firewall rules audit
echo "=== Firewall Rules Audit ==="
gcloud compute firewall-rules list --format=json > $OUTPUT_DIR/firewall_rules.json

# Find risky firewall rules
echo "=== Risky Firewall Rules ==="
gcloud compute firewall-rules list \
  --filter="sourceRanges:('0.0.0.0/0') AND allowed.ports:('22' OR '3389' OR '23')" \
  --format=json > $OUTPUT_DIR/risky_firewall_rules.json

# VPC configuration
echo "=== VPC Networks ==="
gcloud compute networks list --format=json > $OUTPUT_DIR/vpc_networks.json

# SSL certificates
echo "=== SSL Certificates ==="
gcloud compute ssl-certificates list --format=json > $OUTPUT_DIR/ssl_certificates.json

# VPN configuration
echo "=== VPN Configuration ==="
gcloud compute vpn-tunnels list --format=json > $OUTPUT_DIR/vpn_tunnels.json
gcloud compute vpn-gateways list --format=json > $OUTPUT_DIR/vpn_gateways.json

# Cloud Armor policies
echo "=== Cloud Armor Policies ==="
gcloud compute security-policies list --format=json > $OUTPUT_DIR/cloud_armor_policies.json
```

### Encryption Audit
```bash
#!/bin/bash
# Audit encryption across all resources

PROJECT_ID="YOUR_PROJECT_ID"
OUTPUT_DIR="encryption_audit_$(date +%Y%m%d)"
mkdir -p $OUTPUT_DIR

# KMS keys inventory
echo "=== KMS Keys ==="
for keyring in $(gcloud kms keyrings list --location=global --format="value(name)"); do
  gcloud kms keys list --keyring=$keyring --location=global --format=json >> $OUTPUT_DIR/kms_keys.json
done

# Disk encryption audit
echo "=== Disk Encryption ==="
gcloud compute disks list \
  --format="json(name,zone,diskEncryptionKey,sourceImageEncryptionKey)" > $OUTPUT_DIR/disk_encryption.json

# Check for unencrypted disks
echo "=== Unencrypted Disks ==="
gcloud compute disks list \
  --filter="diskEncryptionKey.kmsKeyName:NULL" \
  --format="table(name,zone)" > $OUTPUT_DIR/unencrypted_disks.txt

# Storage bucket encryption
echo "=== Storage Bucket Encryption ==="
for bucket in $(gsutil ls); do
  echo "Bucket: $bucket" >> $OUTPUT_DIR/bucket_encryption.txt
  gsutil encryption get $bucket >> $OUTPUT_DIR/bucket_encryption.txt
  echo "---" >> $OUTPUT_DIR/bucket_encryption.txt
done
```

### Monitor Network Security Events
```bash
#!/bin/bash
# Monitor security-related network events

# Monitor firewall denials
gcloud logging read \
  "resource.type=\"gce_subnetwork\" AND jsonPayload.rule_details.action=\"deny\"" \
  --project=PROJECT_ID \
  --format="table(timestamp,jsonPayload.rule_details.reference,jsonPayload.connection.src_ip,jsonPayload.connection.dest_ip)" \
  --freshness=24h

# Monitor VPN connection issues
gcloud logging read \
  "resource.type=\"vpn_gateway\" AND severity>=WARNING" \
  --project=PROJECT_ID \
  --format="table(timestamp,textPayload)" \
  --freshness=24h

# Monitor SSL certificate expiration
for cert in $(gcloud compute ssl-certificates list --format="value(name)"); do
  expiry=$(gcloud compute ssl-certificates describe $cert --format="value(expireTime)")
  echo "Certificate: $cert expires on $expiry"
done
```

### VPC Service Controls Audit
```bash
#!/bin/bash
# Audit VPC Service Controls configuration

# List all access policies
gcloud access-context-manager policies list

# List service perimeters
gcloud access-context-manager perimeters list \
  --policy=POLICY_ID \
  --format="table(name,title,perimeterType,status.resources)"

# Check for dry-run perimeters
gcloud access-context-manager perimeters list \
  --policy=POLICY_ID \
  --filter="perimeterType=PERIMETER_TYPE_DRY_RUN"

# List access levels
gcloud access-context-manager levels list \
  --policy=POLICY_ID \
  --format="table(name,title,basic.conditions.ipSubnetworks)"
```

## Additional Resources

- [VPC Documentation](https://cloud.google.com/vpc/docs)
- [Cloud Armor Documentation](https://cloud.google.com/armor/docs)
- [Cloud KMS Documentation](https://cloud.google.com/kms/docs)
- [VPC Service Controls](https://cloud.google.com/vpc-service-controls/docs)