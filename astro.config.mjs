// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import pwa from './src/pwa/integration.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://zonik811.github.io',
  base: '/GitCurso',
  integrations: [mdx(), pwa()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
