# FIPS 140-2 Compliance in Google Kubernetes Engine

## Overview

Federal Information Processing Standard (FIPS) 140-2 is a U.S. government standard that defines minimum security requirements for cryptographic modules. This guide covers FIPS-compliant storage options in GKE and how to implement them for both Autopilot and Standard clusters.

## FIPS Compliance in GKE

GKE provides FIPS 140-2 compliance through:
- **Validated Cryptographic Modules**: Google Cloud uses FIPS 140-2 validated modules for encryption
- **FIPS-mode Operating System**: Container-Optimized OS (COS) with FIPS mode enabled
- **Compliant Storage Options**: Multiple storage backends with FIPS validation
- **Network Encryption**: TLS 1.2+ with FIPS-approved algorithms

## Storage Options Comparison

| Storage Option | Autopilot Support | Standard Support | FIPS 140-2 Compliance | Notes (Encryption & Access) |
|---|---|---|---|---|
| **GCE Persistent Disk (Block Storage)** | Yes (default PV) | Yes (default PV) | **Yes** – Encrypted at rest by default using FIPS 140-2 validated module | Block storage (zonal or regional); single-writer (RWO) access. |
| **Cloud Storage Bucket (GCS FUSE CSI)** | Yes (with CSI) | Yes (with CSI) | **Yes** – Encrypted at rest by default (AES-256 via FIPS module) | Object storage mounted via CSI driver; uses TLS in transit. |
| **Filestore (Managed NFS)** | Yes (with CSI) | Yes (with CSI) | **Yes** – Encrypted at rest by default (FedRAMP-authorized storage) | NFS file storage (multi-writer RWX); within VPC for in-transit protection. |
| **Local SSD (Ephemeral node disk)** | No | Yes (node config) | **No (Default)** – _Not FIPS-validated by default_; requires additional FIPS encryption in software. | High-performance ephemeral disk on node; not persistent across node restart. |
| **NetApp Cloud Volumes (CVS)** | _Limited_ † | Yes (via CSI) | **Yes** – Encrypted at rest by Google (FIPS module) + optional NetApp FIPS encryption | Managed NFS/SMB service; uses Astra Trident CSI in GKE; TLS 1.2 for data transfer. |
| **Portworx (PX Enterprise SDS)** | No | Yes (via DaemonSet) | **Configurable** – Uses FIPS 140-2 certified crypto for volume encryption when enabled | Software-defined storage inside cluster; encrypts volumes with FIPS-compliant libraries. |
| **Other Vendor Storage (Ceph, etc.)** | _Varies_ | Yes (via CSI) | **Configurable** – Depends on vendor (must use FIPS-validated encryption on backend). | E.g. Ceph/Rook or storage array CSI drivers; generally Standard cluster only. |

† _NetApp CVS in Autopilot requires specific configurations and may have limitations_

## Implementing FIPS-Compliant Storage

### 1. GCE Persistent Disks (Recommended Default)

**Create FIPS-compliant persistent disk:**
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: fips-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Gi
  storageClassName: standard-rwo  # Uses GCE PD with FIPS encryption
```

**Verify disk encryption:**
```bash
# Get disk name from PVC
DISK_NAME=$(kubectl get pvc fips-pvc -o jsonpath='{.spec.volumeName}')

# Check disk encryption
gcloud compute disks describe $DISK_NAME \
  --zone=ZONE \
  --format="value(diskEncryptionKey)"
```

### 2. Cloud Storage with GCS FUSE CSI

**Enable GCS FUSE CSI driver:**
```bash
# For new cluster
gcloud container clusters create CLUSTER_NAME \
  --addons=GcsFuseCsiDriver \
  --zone=ZONE

# For existing cluster
gcloud container clusters update CLUSTER_NAME \
  --update-addons=GcsFuseCsiDriver=ENABLED \
  --zone=ZONE
```

**Create FIPS-compliant GCS bucket storage:**
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: gcs-fips-pvc
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 100Gi
  storageClassName: gcsfuse-csi
```

### 3. Filestore for Multi-Writer Access

**Create Filestore instance with CMEK:**
```bash
# Create KMS key for additional encryption layer
gcloud kms keyrings create filestore-keyring \
  --location=us-central1

gcloud kms keys create filestore-key \
  --location=us-central1 \
  --keyring=filestore-keyring \
  --purpose=encryption

# Create Filestore with CMEK
gcloud filestore instances create fips-filestore \
  --tier=BASIC_HDD \
  --file-share=name=vol1,capacity=1TB \
  --network=name=default \
  --zone=us-central1-a \
  --kms-key=projects/PROJECT_ID/locations/us-central1/keyRings/filestore-keyring/cryptoKeys/filestore-key
```

**Mount in GKE:**
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: filestore-pv
spec:
  capacity:
    storage: 1Ti
  accessModes:
    - ReadWriteMany
  nfs:
    server: FILESTORE_IP
    path: /vol1
  storageClassName: ""
```

### 4. Configuring FIPS Mode on Nodes

**Create node pool with FIPS mode enabled:**
```bash
gcloud container node-pools create fips-pool \
  --cluster=CLUSTER_NAME \
  --zone=ZONE \
  --image-type=COS_CONTAINERD \
  --metadata=google-compute-enable-fips=TRUE \
  --machine-type=n2-standard-4 \
  --num-nodes=3
```

**Verify FIPS mode on nodes:**
```bash
# SSH into node and check FIPS status
kubectl debug node/NODE_NAME -it --image=busybox
cat /proc/sys/crypto/fips_enabled  # Should return "1"
```

## Compliance Verification

### Check Storage Encryption Status

```bash
#!/bin/bash
# Audit all PVCs for encryption compliance

echo "=== PVC Encryption Audit ==="
for pvc in $(kubectl get pvc -A -o custom-columns=NAMESPACE:.metadata.namespace,NAME:.metadata.name --no-headers); do
  namespace=$(echo $pvc | awk '{print $1}')
  name=$(echo $pvc | awk '{print $2}')
  
  # Get backing disk
  pv=$(kubectl get pvc $name -n $namespace -o jsonpath='{.spec.volumeName}')
  disk_name=$(kubectl get pv $pv -o jsonpath='{.spec.gcePersistentDisk.pdName}' 2>/dev/null)
  
  if [ ! -z "$disk_name" ]; then
    echo "PVC: $namespace/$name (Disk: $disk_name)"
    gcloud compute disks describe $disk_name --zone=ZONE --format="value(diskEncryptionKey.kmsKeyName)"
  fi
done
```

### Validate FIPS Module Usage

```bash
# Check GKE cluster for FIPS compliance indicators
gcloud container clusters describe CLUSTER_NAME \
  --zone=ZONE \
  --format="yaml(nodeConfig.metadata,nodePools[].config.metadata)"

# Verify TLS configuration
kubectl get deployments -A -o yaml | grep -E "tls|TLS" | grep -i version
```

## Best Practices for FIPS Compliance

1. **Always Use Encrypted Storage Classes**
   - Default GCE PD storage classes provide FIPS encryption
   - Avoid local SSDs unless implementing software encryption

2. **Enable FIPS Mode on All Nodes**
   ```bash
   # Ensure all node pools have FIPS metadata
   --metadata=google-compute-enable-fips=TRUE
   ```

3. **Use Customer-Managed Encryption Keys (CMEK)**
   ```bash
   # Additional encryption layer with Cloud KMS
   --disk-encryption-key=projects/PROJECT/locations/LOCATION/keyRings/RING/cryptoKeys/KEY
   ```

4. **Implement Network Encryption**
   - Use Istio/Anthos Service Mesh for mTLS between pods
   - Ensure all external traffic uses TLS 1.2+

5. **Regular Compliance Audits**
   - Scan for unencrypted volumes
   - Verify FIPS mode on all nodes
   - Check certificate compliance

## Troubleshooting

### Issue: Local SSD FIPS Compliance

**Problem**: Local SSDs are not FIPS-compliant by default

**Solution**: Implement software encryption
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fips-encryption-script
data:
  setup.sh: |
    #!/bin/bash
    # Setup dm-crypt with FIPS-approved algorithms
    cryptsetup luksFormat /dev/sdb --cipher aes-xts-plain64 --key-size 256
    cryptsetup luksOpen /dev/sdb encrypted-local-ssd
    mkfs.ext4 /dev/mapper/encrypted-local-ssd
    mount /dev/mapper/encrypted-local-ssd /mnt/encrypted
```

### Issue: Verifying Encryption in Transit

**Check pod-to-pod encryption:**
```bash
# Deploy network policy tester
kubectl apply -f https://github.com/ahmetb/kubernetes-network-policy-recipes/raw/master/04-deny-traffic-from-other-namespaces.yaml

# Verify TLS between services
kubectl exec -it POD_NAME -- openssl s_client -connect SERVICE:PORT -tls1_2
```

## Additional Resources

- [Google Cloud FIPS 140-2 Validated Cryptographic Modules](https://cloud.google.com/security/compliance/fips-140-2-validated)
- [GKE FIPS Compliance Documentation](https://cloud.google.com/kubernetes-engine/docs/concepts/fips-compliance)
- [NIST FIPS 140-2 Standard](https://csrc.nist.gov/publications/detail/fips/140/2/final)
- [Cloud KMS FIPS Documentation](https://cloud.google.com/kms/docs/fips)