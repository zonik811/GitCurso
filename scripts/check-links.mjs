import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

/* El sitio puede desplegarse en un subdirectorio (GitHub Pages), asi que los
   enlaces internos llevan el prefijo `base`. Lo leemos de astro.config.mjs
   para no duplicarlo y lo quitamos antes de resolver contra dist/. */
const configRaw = readFileSync(join(root, 'astro.config.mjs'), 'utf8');
const baseMatch = configRaw.match(/\bbase:\s*'([^']*)'/);
const base = (baseMatch?.[1] ?? '/').replace(/\/+$/, '');

if (!existsSync(dist)) {
  console.error('\u2717 No existe la carpeta dist/. Ejecuta `npm run build` primero.');
  process.exit(1);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = walk(dist);
const errors = [];
const attrRe = /(?:href|src)="([^"]+)"/g;

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  let m;
  while ((m = attrRe.exec(html))) {
    let url = m[1];
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    url = url.split('#')[0].split('?')[0];
    if (!url) continue;

    /* quita el prefijo base del despliegue */
    if (base && (url === base || url.startsWith(base + '/'))) {
      url = url.slice(base.length) || '/';
    }

    let target = join(dist, decodeURIComponent(url));
    if (url.endsWith('/')) {
      target = join(target, 'index.html');
    } else if (!/\.[a-z0-9]+$/i.test(url)) {
      if (existsSync(join(target, 'index.html'))) target = join(target, 'index.html');
      else if (existsSync(target + '.html')) target = target + '.html';
    }

    if (!existsSync(target)) {
      errors.push(`${relative(dist, file)} \u2192 ${url}`);
    }
  }
}

if (errors.length) {
  console.error(`\u2717 Enlaces internos rotos (${errors.length}):`);
  errors.slice(0, 50).forEach((e) => console.error('  - ' + e));
  process.exit(1);
}

console.log(`\u2713 Enlaces OK: ${files.length} páginas revisadas, sin enlaces internos rotos.`);
