import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');
const basePath = '/Goog-Sec/';
const origin = 'https://hackidle.github.io';
const required = [
  'index.html',
  'workspace/index.html',
  'gcp/index.html',
  'chrome/index.html',
  'cross-product/index.html',
  'nist-fedramp/index.html',
];
const errors = [];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function outputPath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  if (!decoded.startsWith(basePath)) return null;
  const path = decoded.slice(basePath.length);
  if (!path) return join(dist, 'index.html');
  if (path === '404/') return join(dist, '404.html');
  if (path.endsWith('/')) return join(dist, path, 'index.html');
  if (extname(path)) return join(dist, path);
  return join(dist, path, 'index.html');
}

for (const path of required) {
  if (!existsSync(join(dist, path))) errors.push(`missing required route: ${path}`);
}

const htmlFiles = walk(dist).filter((path) => path.endsWith('.html'));
const ids = new Map();
for (const file of htmlFiles) {
  const source = readFileSync(file, 'utf8');
  ids.set(file, new Set([...source.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])));
}

for (const file of htmlFiles) {
  const source = readFileSync(file, 'utf8');
  const rel = relative(dist, file).replace(/\\/g, '/');
  const pagePath = rel === 'index.html' ? basePath : `${basePath}${rel.replace(/index\.html$/, '')}`;

  if (/ethanolivertroy\/(?:Goog-Sec|GWS-Security-Suite)/i.test(source)) {
    errors.push(`${rel}: stale repository URL in generated HTML`);
  }

  for (const match of source.matchAll(/(?:href|src)="([^"\s]+)"/g)) {
    const raw = match[1].replaceAll('&amp;', '&');
    if (/^(?:data:|mailto:|tel:|javascript:)/i.test(raw)) continue;

    let target;
    try {
      target = new URL(raw, `${origin}${pagePath}`);
    } catch {
      errors.push(`${rel}: invalid URL ${raw}`);
      continue;
    }
    if (target.origin !== origin) continue;
    if (!target.pathname.startsWith(basePath)) {
      errors.push(`${rel}: unbased internal asset or link ${raw}`);
      continue;
    }

    const targetFile = outputPath(target.pathname);
    if (!targetFile || !existsSync(targetFile)) {
      errors.push(`${rel}: missing internal target ${raw}`);
      continue;
    }

    if (target.hash && targetFile.endsWith('.html')) {
      const fragment = decodeURIComponent(target.hash.slice(1));
      if (fragment && !ids.get(targetFile)?.has(fragment)) {
        errors.push(`${rel}: missing fragment ${raw}`);
      }
    }
  }
}

if (errors.length) {
  console.error([...new Set(errors)].slice(0, 100).join('\n'));
  if (errors.length > 100) console.error(`...and ${errors.length - 100} more`);
  process.exit(1);
}

console.log(`Build and local-link validation passed for ${htmlFiles.length} HTML pages.`);
