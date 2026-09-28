import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const curriculumPath = join(root, 'src', 'data', 'curriculum.ts');
const lessonsDir = join(root, 'src', 'content', 'lecciones');

const curriculumRaw = readFileSync(curriculumPath, 'utf8');
const curriculum = curriculumRaw.split('export const labs')[0];
const slugs = [...curriculum.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);
const moduleIds = [...curriculum.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
const uniqueSlugs = new Set(slugs);

const errors = [];

if (slugs.length === 0) errors.push('No se encontraron slugs en src/data/curriculum.ts');
if (uniqueSlugs.size !== slugs.length) errors.push('Hay slugs duplicados en curriculum.ts');

const files = existsSync(lessonsDir) ? readdirSync(lessonsDir) : [];
const mdxFiles = files.filter((f) => f.endsWith('.mdx'));
const mdFiles = files.filter((f) => f.endsWith('.md'));
const mdxSlugs = new Set(mdxFiles.map((f) => f.replace(/\.mdx$/, '')));

if (mdFiles.length) {
  errors.push(`Hay lecciones en .md (deberían ser .mdx): ${mdFiles.join(', ')}`);
}

for (const slug of slugs) {
  if (!mdxSlugs.has(slug)) {
    errors.push(`Falta el archivo de lección: src/content/lecciones/${slug}.mdx`);
    continue;
  }
  const content = readFileSync(join(lessonsDir, `${slug}.mdx`), 'utf8');
  if (!content.includes('<Quiz')) {
    errors.push(`La lección "${slug}" no incluye un componente <Quiz>.`);
  }
  if (!content.includes('<DragLab')) {
    errors.push(`La lección "${slug}" no incluye un laboratorio <DragLab>.`);
  } else if (!/import DragLab from/.test(content)) {
    errors.push(`La lección "${slug}" usa <DragLab> pero no lo importa.`);
  } else if (content.indexOf('<DragLab') > content.indexOf('<Quiz')) {
    errors.push(`La lección "${slug}" coloca el laboratorio después del Quiz.`);
  }
}

for (const file of mdxFiles) {
  const slug = file.replace(/\.mdx$/, '');
  if (!uniqueSlugs.has(slug)) {
    errors.push(`Lección huérfana (no está en curriculum.ts): ${file}`);
  }
}

if (errors.length) {
  console.error(`\u2717 Contenido con problemas (${errors.length}):`);
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}

console.log(
  `\u2713 Contenido OK: ${slugs.length} lecciones en ${moduleIds.length} módulos, todas con Quiz y laboratorio <DragLab> antes del Quiz.`,
);
