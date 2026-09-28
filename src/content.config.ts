import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const lecciones = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lecciones' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { lecciones };
