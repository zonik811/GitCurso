import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, '.screenshots');
mkdirSync(outDir, { recursive: true });

const base = process.env.BASE_URL ?? 'http://localhost:4321';

const viewports = [
  { name: 'mobile', width: 375, height: 780 },
  { name: 'tablet', width: 768, height: 900 },
  { name: 'desktop', width: 1280, height: 900 },
];

const pages = [
  { path: '/', name: 'home' },
  { path: '/lecciones/flujo-de-trabajo/', name: 'terminal' },
  { path: '/lecciones/ramas/', name: 'ramas' },
  { path: '/lecciones/repositorios-remotos/', name: 'remotos' },
  { path: '/lecciones/gitignore-buenas-practicas/', name: 'gitignore' },
  { path: '/chuleta/', name: 'chuleta' },
  { path: '/glosario/', name: 'glosario' },
];

const browser = await chromium.launch({ channel: 'chrome' });

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  for (const p of pages) {
    await page.goto(base + p.path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(outDir, `${vp.name}-${p.name}.png`) });
  }

  // Menú móvil abierto (solo en mobile)
  if (vp.name === 'mobile') {
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    await page.click('#menuToggle');
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(outDir, `${vp.name}-menu-open.png`) });
  }

  await context.close();
}

// Comprobar desbordamiento horizontal en cada viewport
const overflow = [];
for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await context.newPage();
  for (const p of pages) {
    await page.goto(base + p.path, { waitUntil: 'networkidle' });
    const res = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    if (res.scrollW > res.clientW + 1) {
      overflow.push(`${vp.name} ${p.path}: scrollWidth=${res.scrollW} > clientWidth=${res.clientW}`);
    }
  }
  await context.close();
}

await browser.close();

if (overflow.length) {
  console.error('\u2717 Desbordamiento horizontal detectado:');
  overflow.forEach((o) => console.error('  - ' + o));
  process.exit(1);
}

console.log('\u2713 Sin desbordamiento horizontal en mobile/tablet/desktop.');
console.log(`Capturas en ${outDir}`);
