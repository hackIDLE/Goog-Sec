---
title: "Local Development and Extensions"
description: "Set up Goog-Sec locally and add Starlight integrations without weakening the documentation build."
---

Goog-Sec uses Astro Starlight with the Material Design 3 theme.

## Local setup

Requirements:

- Node.js 22.12 or newer
- npm 9.6 or newer
- Git

```bash
git clone https://github.com/hackIDLE/Goog-Sec.git
cd Goog-Sec
npm install
npm run dev
```

## Production verification

```bash
npm test
```

The production site is generated in `dist/`.

## Add an integration

1. Read the integration's source, license, peer dependencies, and release history.
2. Install an exact version instead of an unbounded dependency.
3. Configure it in `astro.config.mjs`.
4. Add focused validation for any routes, generated files, or client behavior it introduces.
5. Run `npm test` and inspect representative desktop and mobile pages.

:::caution[Keep the trust boundary small]
Documentation integrations execute during the build and may process every source file. Avoid abandoned packages, postinstall-heavy dependencies, and integrations that require broad repository or cloud credentials.
:::

## Current presentation stack

- `@astrojs/starlight` supplies navigation, Pagefind search, accessible content layouts, code rendering, and content collections.
- `starlight-theme-md3` supplies Material Design 3 tokens and component styling.
- `src/styles/goog-sec.css` contains project-owned trust, feedback, image-preview, and brand refinements.
- `src/components/` contains the project-status banner and provenance/feedback footer.

## GitHub Pages

The deployment workflow builds on pushes to `main` and publishes through GitHub's Pages artifact flow. The Astro configuration intentionally sets:

```js
site: 'https://hackidle.github.io',
base: '/Goog-Sec',
```

Do not remove the base path unless the site moves to a custom domain.
