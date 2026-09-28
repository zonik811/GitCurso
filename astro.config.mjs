// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import pwa from './src/pwa/integration.mjs';

// El base cambia segun donde se despliegue: en Vercel la web vive en la raiz
// ('/'), mientras que en GitHub Pages cuelga de /GitCurso. El workflow de Pages
// define BASE_PATH; en cualquier otro caso se usa la raiz.
const base = process.env.BASE_PATH || '/';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://git-curso.vercel.app',
  base,
  integrations: [mdx(), pwa()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
