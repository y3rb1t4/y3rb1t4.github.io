import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Proyectos del portfolio: un .mdx por proyecto.
// El CV NO vive acá — es un documento único, no una colección.
// Ver src/lib/cv.ts.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    // Orden en la home. Menor = más arriba.
    order: z.number().default(999),
    featured: z.boolean().default(false),
    stack: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    year: z.number().int().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects };
