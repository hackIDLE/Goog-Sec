# Google Kubernetes Engine (GKE) Security

## Overview

Google Kubernetes Engine (GKE) is Google Cloud's managed Kubernetes service that provides a secure, scalable platform for containerized applications. This section covers security best practices, compliance requirements, and implementation guidance for GKE environments.

## Key Security Features

### Cluster Security
- **Shielded GKE Nodes**: Secure boot, virtual trusted platform module (vTPM), and integrity monitoring
- **Private Clusters**: Nodes without public IP addresses, accessible only via private Google Cloud networks
- **Authorized Networks**: IP allowlisting for API server access
- **Workload Identity**: Secure pod-to-GCP service authentication

### Network Security
- **Network Policies**: Kubernetes-native traffic control between pods
- **Service Mesh**: Istio/Anthos Service Mesh for advanced traffic management
- **Private Service Connect**: Private connectivity to Google APIs
- **Binary Authorization**: Deploy-time security controls for container images

### Compliance and Governance
- **FIPS 140-2 Compliance**: Validated cryptographic modules for data protection
- **FedRAMP Authorization**: High-impact level compliance for government workloads
- **PCI DSS**: Payment card industry compliance capabilities
- **HIPAA**: Healthcare data protection compliance

## Security Guides

<div class="grid cards" markdown>

-   :material-shield-lock:{ .lg .middle } **FIPS 140-2 Compliance**

    ---

    Complete guide to FIPS-compliant storage options and cryptographic validation in GKE

    [:octicons-arrow-right-24: FIPS Compliance Guide](fips-compliance.md)

-   :material-security:{ .lg .middle } **Cluster Hardening**

    ---

    Best practices for securing GKE clusters following CIS Kubernetes Benchmark

    [:octicons-arrow-right-24: Coming Soon](#)

-   :material-key:{ .lg .middle } **Workload Identity**

    ---

    Implementing secure pod-to-GCP service authentication without service account keys

    [:octicons-arrow-right-24: Coming Soon](#)

-   :material-network-strength-4:{ .lg .middle } **Network Policies**

    ---

    Implementing zero-trust networking with Kubernetes network policies

    [:octicons-arrow-right-24: Coming Soon](#)

</div>

## Quick Security Checks

### Verify Cluster Security Settings
```bash
# Check if Shielded GKE nodes are enabled
gcloud container clusters describe CLUSTER_NAME \
  --zone=ZONE \
  --format="value(shieldedNodes.enabled)"

# List authorized networks
gcloud container clusters describe CLUSTER_NAME \
  --zone=ZONE \
  --format="table(masterAuthorizedNetworksConfig.cidrBlocks[].cidrBlock)"

# Check if private cluster is enabled
gcloud container clusters describe CLUSTER_NAME \
  --zone=ZONE \
  --format="value(privateClusterConfig.enablePrivateNodes)"
```

### Audit Workload Identity Configuration
```bash
# Check if Workload Identity is enabled
gcloud container clusters describe CLUSTER_NAME \
  --zone=ZONE \
  --format="value(workloadIdentityConfig.workloadPool)"

# List service accounts with Workload Identity bindings
gcloud iam service-accounts list --filter="displayName:gke-"
```

### Review Binary Authorization Policy
```bash
# Export current Binary Authorization policy
gcloud container binauthz policy export

# List attestors
gcloud container binauthz attestors list
```

## Common Security Tasks

### Enable FIPS Mode on Nodes
```bash
# Create node pool with FIPS-compliant boot disk
gcloud container node-pools create fips-pool \
  --cluster=CLUSTER_NAME \
  --zone=ZONE \
  --image-type=COS_CONTAINERD \
  --enable-gvnic \
  --metadata=google-compute-enable-fips=TRUE
```

### Configure Network Policies
```yaml
# Example: Deny all ingress traffic by default
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
```

### Implement Pod Security Standards
```yaml
# Example: Enforce restricted security policy
apiVersion: v1
kind: Namespace
metadata:
  name: secure-namespace
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

## Compliance Quick Reference

| Compliance Framework | GKE Support | Key Requirements |
|---------------------|-------------|------------------|
| FIPS 140-2 | ✅ Supported | Use validated crypto modules, FIPS-mode nodes |
| FedRAMP High | ✅ Supported | Use compliant regions, enable audit logging |
| PCI DSS | ✅ Supported | Network segmentation, encryption, access controls |
| HIPAA | ✅ Supported | Encryption at rest/transit, audit logs, BAAs |
| SOC 2 | ✅ Supported | Security controls, monitoring, incident response |

## Security Best Practices

1. **Use Autopilot Mode** when possible for Google-managed security hardening
2. **Enable Shielded GKE Nodes** for enhanced node security
3. **Implement Workload Identity** instead of service account keys
4. **Use Binary Authorization** to ensure only verified images are deployed
5. **Enable audit logging** and ship logs to Cloud Logging
6. **Regularly update** clusters and nodes to latest versions
7. **Implement network policies** for pod-to-pod traffic control
8. **Use private clusters** to reduce attack surface

## Additional Resources

- [GKE Security Best Practices](https://cloud.google.com/kubernetes-engine/docs/how-to/hardening-your-cluster)
- [GKE Compliance](https://cloud.google.com/kubernetes-engine/docs/concepts/compliance)
- [CIS GKE Benchmark](https://www.cisecurity.org/benchmark/kubernetes)
- [Anthos Security Blueprint](https://cloud.google.com/anthos/docs/security-blueprint)