import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const docsRoot = join(root, 'src/content/docs');
const errors = [];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

for (const file of walk(docsRoot).filter((path) => /\.(md|mdx)$/.test(path))) {
  const rel = relative(root, file);
  const source = readFileSync(file, 'utf8');
  if (!source.startsWith('---\n')) errors.push(`${rel}: missing frontmatter`);
  if (/^\s*(?:!!!|\?\?\?)\s+/m.test(source)) errors.push(`${rel}: contains MkDocs admonition syntax`);
  if (/\smarkdown(?:=|>)/.test(source)) errors.push(`${rel}: contains MkDocs markdown HTML attribute`);
  if (/ethanolivertroy\/(?:Goog-Sec|GWS-Security-Suite)/i.test(source)) {
    errors.push(`${rel}: contains a stale pre-transfer repository URL`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Content compatibility checks passed.');
