import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const docsRoot = join(root, 'src/content/docs');
const output = join(root, 'src/data/contributors.json');
const knownLogins = new Map([['PentaK', 'Pentaksecurity']]);

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function routeId(file) {
  const id = relative(docsRoot, file).replace(/\\/g, '/').replace(/\.(md|mdx)$/, '');
  return id === 'index' ? '' : id.replace(/\/index$/, '');
}

function previousPath(file) {
  const rel = relative(docsRoot, file).replace(/\\/g, '/').replace(/\.mdx$/, '.md');
  return join(root, 'docs', rel);
}

function parseLogin(email) {
  const noReply = email.match(/^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/i);
  if (noReply) return noReply[1];
  return undefined;
}

function gitAuthors(file) {
  const candidates = [file, previousPath(file)];
  let log = '';
  for (const candidate of candidates) {
    try {
      log = execFileSync('git', ['log', '--follow', '--format=%aN%x09%aE', '--', candidate], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      if (log.trim()) break;
    } catch {
      // A page may be new or not committed yet.
    }
  }

  const seen = new Set();
  return log
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [name, email = ''] = line.split('\t');
      const login = parseLogin(email) ?? knownLogins.get(name);
      return {
        name,
        ...(login ? { login, avatar: `https://github.com/${login}.png?size=64` } : {}),
      };
    })
    .filter((author) => {
      const key = author.login ?? author.name;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

const data = Object.fromEntries(
  walk(docsRoot)
    .filter((file) => /\.(md|mdx)$/.test(file))
    .map((file) => [routeId(file), gitAuthors(file)]),
);

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Generated contributor metadata for ${Object.keys(data).length} pages.`);
