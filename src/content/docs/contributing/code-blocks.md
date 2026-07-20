---
title: "Code Block Features"
description: "Author readable, copyable, and security-conscious code examples with Starlight Expressive Code."
---

Goog-Sec uses Starlight's built-in Expressive Code renderer for syntax highlighting, filenames, line markers, and copy controls.

## Basic block

````markdown
```bash
 gcloud projects describe example-project
```
````

## Filename or command purpose

````markdown
```yaml title="organization-policy.yaml"
name: organizations/123456789/policies/iam.disableServiceAccountKeyCreation
spec:
  rules:
    - enforce: true
```
````

## Highlight lines

Use brace markers after the language:

````markdown
```json {3-5}
{
  "bindings": [
    {
      "role": "roles/viewer",
      "members": ["group:security@example.com"]
    }
  ]
}
```
````

## Mark inserted or deleted lines

````markdown
```diff lang="yaml"
- member: user:admin@example.com
+ member: group:cloud-admins@example.com
```
````

## Command and output

Keep commands and observed output separate when readers should not copy the output:

````markdown
```bash title="Command"
gcloud auth list --filter=status:ACTIVE
```

```text title="Expected shape"
Credentialed Accounts
ACTIVE  ACCOUNT
*       operator@example.com
```
````

## Safety rules

- Use synthetic identifiers such as `example-project` and `example.com`.
- Never include tokens, cookies, API keys, customer data, or real tenant IDs.
- Mark destructive commands explicitly in nearby prose.
- Include a read-only verification command after every configuration example.
- Prefer complete commands over fragments that depend on hidden shell state.
