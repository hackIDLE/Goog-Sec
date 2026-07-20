---
title: "Documentation Guidelines"
description: "How to write, review, and verify Goog-Sec documentation in Astro Starlight."
---

Goog-Sec documentation is written in Markdown and rendered by Astro Starlight. Contributions should be practical, source-aware, and explicit about scope.

## Start locally

```bash
npm install
npm run dev
```

The local site is available at the URL printed by Astro. Before opening a pull request, run:

```bash
npm test
```

This checks Markdown compatibility, TypeScript, the production build, required routes, stale repository links, and GitHub Pages base paths.

## Page structure

Every page starts with frontmatter:

```yaml
---
title: "Identity Security"
description: "Identity controls and implementation guidance for Google Workspace."
---
```

Then use one `##` section per major idea. Starlight renders the page title from frontmatter, so do not add another `#` heading.

Recommended structure:

1. Scope and intended audience
2. Threat or control context
3. Implementation steps
4. Validation or evidence
5. Operational limitations
6. Current references

## Security writing standard

- Distinguish Google Workspace, Google Cloud, Chrome, and cross-product behavior.
- State required product editions, licenses, roles, and permissions.
- Separate observed product behavior from recommendations.
- Include a verification step after configuration steps.
- Prefer primary Google, NIST, FedRAMP, RFC, or standards-body sources.
- Date-sensitive claims should include an access or verification date.
- Never publish credentials, tenant identifiers, customer data, or private infrastructure details.
- Label destructive commands and make rollback or recovery expectations clear.

:::caution[Validate before production use]
Goog-Sec is community-maintained guidance, not a substitute for current Google product documentation, organizational change control, or a formal compliance assessment.
:::

## Links

Use descriptive link text:

```markdown
Review [Google Cloud IAM documentation](https://cloud.google.com/iam/docs) before changing role bindings.
```

For internal pages, use relative links that remain valid under the `/Goog-Sec/` GitHub Pages base path:

```markdown
See the [GCP IAM guide](../gcp/iam/).
```

Do not hard-code root-relative links such as `/gcp/iam/`.

## Asides

Use Starlight asides for information that should interrupt the reading flow:

```markdown
:::note[Scope]
This control applies to managed Chrome browsers.
:::

:::tip[Verification]
Confirm the effective policy in `chrome://policy`.
:::

:::caution[Change impact]
Test this policy in a pilot organizational unit first.
:::

:::danger[Lockout risk]
Keep a tested break-glass administrator outside the affected group.
:::
```

Use color for meaning. Do not use danger or caution as decoration.

## Code blocks

Add a language identifier and optional filename:

````markdown
```bash title="Verify the active account"
gcloud auth list --filter=status:ACTIVE
```
````

Use fake project IDs, domains, emails, tokens, and resource names in every example.

## Images and diagrams

- Place public assets in `public/assets/`.
- Use meaningful alternative text.
- Do not include account numbers, email addresses, customer names, access tokens, or browser profile data.
- Prefer SVG for diagrams and PNG/WebP for screenshots.
- Content images automatically support keyboard-accessible full-size previews.

## Pull-request checklist

- [ ] The page has accurate title and description frontmatter.
- [ ] Product scope, prerequisites, and permissions are explicit.
- [ ] Commands use synthetic values and include verification.
- [ ] Claims cite current primary sources.
- [ ] Internal links are relative and images include alt text.
- [ ] `npm test` passes.
- [ ] The rendered page was checked in light, dark, desktop, and mobile layouts.
