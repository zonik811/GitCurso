import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/* Genera los iconos PNG de la PWA a partir de un unico SVG.
   Uso: npm run icons */
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const BG = '#0d1117';
const FG = '#58a6ff';

function svg(scale) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="${BG}"/>
    <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
      <g fill="none" stroke="${FG}" stroke-width="30" stroke-linecap="round">
        <path d="M190 126 V 386"/>
        <path d="M190 240 C 190 316 268 300 330 300"/>
      </g>
      <g fill="${FG}">
        <circle cx="190" cy="112" r="44"/>
        <circle cx="190" cy="400" r="44"/>
        <circle cx="344" cy="300" r="44"/>
      </g>
    </g>
  </svg>`;
}

const targets = [
  { file: 'icon-192.png', size: 192, scale: 1 },
  { file: 'icon-512.png', size: 512, scale: 1 },
  { file: 'maskable-512.png', size: 512, scale: 0.78 },
  { file: 'apple-touch-icon.png', size: 180, scale: 1 },
];

const browser = await chromium.launch({ channel: 'chrome' });
for (const t of targets) {
  const page = await browser.newPage({
    viewport: { width: t.size, height: t.size },
    deviceScaleFactor: 1,
  });
  const markup = svg(t.scale).replace(
    '<svg ',
    `<svg width="${t.size}" height="${t.size}" `,
  );
  await page.setContent(`<!doctype html><html><body style="margin:0">${markup}</body></html>`);
  await page.screenshot({
    path: join(outDir, t.file),
    clip: { x: 0, y: 0, width: t.size, height: t.size },
  });
  await page.close();
  console.log('generado public/icons/' + t.file + ' (' + t.size + 'px)');
}
await browser.close();
