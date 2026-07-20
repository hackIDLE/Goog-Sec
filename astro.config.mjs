import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import md3Theme from 'starlight-theme-md3';

const repository = 'https://github.com/hackIDLE/Goog-Sec';

export default defineConfig({
  site: 'https://hackidle.github.io',
  base: '/Goog-Sec',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'Goog-Sec',
      description:
        'Practical security guidance for Google Workspace, Google Cloud, Chrome, and cross-product environments.',
      logo: {
        src: './src/assets/logo.svg',
        alt: 'Goog-Sec shield',
      },
      favicon: '/assets/logo.svg',
      lastUpdated: true,
      editLink: {
        baseUrl: `${repository}/edit/main/`,
      },
      social: [
        { icon: 'github', label: 'Goog-Sec on GitHub', href: repository },
      ],
      head: [
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: 'https://hackidle.github.io/Goog-Sec/assets/social-card.png',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:card',
            content: 'summary_large_image',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:image',
            content: 'https://hackidle.github.io/Goog-Sec/assets/social-card.png',
          },
        },
      ],
      customCss: ['./src/styles/goog-sec.css'],
      components: {
        Banner: './src/components/Banner.astro',
        Footer: './src/components/Footer.astro',
      },
      plugins: [
        md3Theme({
          seed: '#0F9D58',
          variant: 'tonalSpot',
          density: 'compact',
          shape: 'medium',
          contrast: 'medium',
          tonalSurface: true,
          motion: false,
        }),
      ],
      sidebar: [
        { label: 'Home', link: '/' },
        {
          label: 'Google Workspace Security',
          items: [
            { label: 'Overview', slug: 'workspace' },
            {
              label: 'Core Security Components',
              items: [
                { label: 'Identity Security', slug: 'identity-security' },
                { label: 'Data Protection', slug: 'data-protection' },
                { label: 'Email Security', slug: 'email-security' },
                { label: 'Endpoint Security', slug: 'endpoint-security' },
                { label: 'Drive & Document Security', slug: 'drive-document-security' },
                { label: 'Threat Hunting', slug: 'threat-hunting' },
                { label: 'Detection Rules', slug: 'detection-rules' },
                { label: 'Security Checklists', slug: 'security-checklists' },
              ],
            },
            {
              label: 'Advanced Security Topics',
              collapsed: true,
              items: [
                { label: 'Apps Script Security', slug: 'apps-script-security' },
                { label: 'Attack Vectors', slug: 'attack-vectors' },
                { label: 'Exploitation Examples', slug: 'exploitation-examples' },
                { label: 'Google Groups Security', slug: 'google-groups-security' },
                { label: 'Incident Response Playbooks', slug: 'incident-response-playbooks' },
                { label: 'Log Analysis', slug: 'log-analysis' },
                { label: 'Marketplace Security', slug: 'marketplace-security' },
                { label: 'MSP Implementation', slug: 'msp-implementation' },
                { label: 'OAuth Token Analysis', slug: 'oauth-token-analysis' },
                { label: 'Organizational Units', slug: 'organizational-units' },
                { label: 'Pentesting Insights', slug: 'pentesting-insights' },
                { label: 'Vulnerability Management', slug: 'vulnerability-management' },
                { label: 'Executive Dashboards', slug: 'executive-dashboards' },
              ],
            },
          ],
        },
        {
          label: 'Google Cloud Platform Security',
          items: [
            { label: 'Overview', slug: 'gcp' },
            { label: 'Identity & Access Management', slug: 'gcp/iam' },
            { label: 'Network Security', slug: 'gcp/network-security' },
            { label: 'Compute Security', slug: 'gcp/compute-security' },
            { label: 'Storage & Database Security', slug: 'gcp/storage-security' },
            {
              label: 'Kubernetes & Container Security',
              items: [
                { label: 'Overview', slug: 'gcp/container-security' },
                { label: 'GKE Overview', slug: 'gcp/gke' },
                { label: 'FIPS 140-2 Compliance', slug: 'gcp/gke/fips-compliance' },
              ],
            },
            { label: 'Cloud Logging & Monitoring', slug: 'gcp/logging-monitoring' },
            { label: 'Security Command Center', slug: 'gcp/security-command-center' },
            { label: 'AI/ML Security (SAIF)', slug: 'gcp/saif-framework' },
            { label: 'Compliance & Regulatory Controls', slug: 'gcp/compliance' },
          ],
        },
        {
          label: 'Google Chrome Security',
          items: [
            { label: 'Overview', slug: 'chrome' },
            { label: 'Chrome Enterprise', slug: 'chrome/chrome-enterprise' },
            { label: 'Policy Configuration', slug: 'chrome/policy-config' },
            { label: 'Extension Security', slug: 'chrome/extension-security' },
            { label: 'Web Filtering', slug: 'chrome/web-filtering' },
            { label: 'Authentication & SSO', slug: 'chrome/authentication' },
            { label: 'Zero Trust Browsing', slug: 'chrome/zero-trust' },
          ],
        },
        {
          label: 'Cross-Product Security',
          items: [
            { label: 'Overview', slug: 'cross-product' },
            { label: 'Identity Federation', slug: 'cross-product/identity-federation' },
            { label: 'Zero Trust Architecture', slug: 'cross-product/zero-trust' },
            { label: 'Security Operations', slug: 'cross-product/security-operations' },
            { label: 'Threat Intelligence', slug: 'cross-product/threat-intelligence' },
            { label: 'Compliance Management', slug: 'cross-product/compliance' },
          ],
        },
        {
          label: 'NIST/FedRAMP Controls',
          collapsed: true,
          items: [
            { label: 'Overview', slug: 'nist-fedramp' },
            {
              label: 'Google Cloud Platform',
              items: [
                { label: 'Access Control (AC)', slug: 'nist-fedramp/gcp/access-control' },
                {
                  label: 'Configuration Management (CM)',
                  slug: 'nist-fedramp/gcp/configuration-management',
                },
                {
                  label: 'Identification & Authentication (IA)',
                  slug: 'nist-fedramp/gcp/identification-authentication',
                },
                {
                  label: 'System & Communications Protection (SC)',
                  slug: 'nist-fedramp/gcp/system-communications-protection',
                },
                {
                  label: 'System & Information Integrity (SI)',
                  slug: 'nist-fedramp/gcp/system-information-integrity',
                },
              ],
            },
            { label: 'Google Workspace', slug: 'nist-fedramp/workspace' },
          ],
        },
        { label: 'Resources', slug: 'resources' },
        {
          label: 'Contributing',
          collapsed: true,
          items: [
            { label: 'Documentation Guidelines', slug: 'contributing/documentation-guidelines' },
            { label: 'Code Block Features', slug: 'contributing/code-blocks' },
            { label: 'Plugin Installation', slug: 'contributing/plugin-installation' },
          ],
        },
      ],
    }),
  ],
});
