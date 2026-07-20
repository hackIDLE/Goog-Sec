# Goog-Sec

Community-maintained security guidance for Google Workspace, Google Cloud, Chrome, and cross-product environments.

**Documentation:** <https://hackidle.github.io/Goog-Sec/>

## Scope

Goog-Sec combines practical implementation guidance, threat-informed checks, and NIST/FedRAMP-oriented control-testing references. Content is a community preview and must be validated against current Google documentation and organizational change-control requirements.

## Local development

Requirements:

- Node.js 22.12 or newer
- npm 9.6 or newer

```bash
npm install
npm run dev
```

Run the complete verification suite before opening a pull request:

```bash
npm test
```

The suite checks content compatibility, TypeScript, the production build, required routes, internal links and fragments, stale repository references, and the `/Goog-Sec/` GitHub Pages base path.

## Documentation stack

- Astro 7
- Astro Starlight
- `starlight-theme-md3`
- Pagefind search
- GitHub Pages

Source pages live in `src/content/docs/`. Project-specific components and styles live in `src/components/` and `src/styles/`.

## Contributing

Read the [documentation guidelines](https://hackidle.github.io/Goog-Sec/contributing/documentation-guidelines/) before contributing. New guidance should expose scope, permissions, verification, evidence, limitations, and rollback expectations.

Use synthetic identifiers in examples. Do not publish credentials, customer data, private infrastructure details, or employer-confidential information.
