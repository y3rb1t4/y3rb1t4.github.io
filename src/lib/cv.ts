import { z } from 'astro/zod';
import raw from '../content/cv/y3rb1t4.json';

/**
 * FUENTE ÚNICA DE VERDAD del CV.
 *
 * De este archivo salen las dos representaciones:
 *   1. la página /cv
 *   2. dist/cv.pdf (impreso desde esa misma página en CI)
 *
 * El PDF se genera imprimiendo /cv, así que no puede divergir del HTML por
 * construcción. Si el CV cambia, cambia el JSON. Nunca duplicar estos datos en
 * un componente ni editar el PDF a mano.
 *
 * Subconjunto del schema JSON Resume (jsonresume.org/schema).
 * SIN PII: nada de teléfono, dirección ni documento — este archivo se publica
 * entero en el HTML.
 */

const dateish = z.string().regex(/^\d{4}(-\d{2})?$/, 'usar YYYY o YYYY-MM');

const cvSchema = z.object({
  basics: z.object({
    name: z.string(),
    label: z.string(),
    email: z.string().email().optional(),
    url: z.string().url().optional(),
    summary: z.string(),
    location: z.object({
      city: z.string(),
      countryCode: z.string().length(2),
    }),
    profiles: z
      .array(
        z.object({
          network: z.string(),
          username: z.string(),
          url: z.string().url(),
        }),
      )
      .default([]),
  }),

  work: z
    .array(
      z.object({
        name: z.string(),
        position: z.string(),
        url: z.string().url().optional(),
        startDate: dateish,
        endDate: dateish.optional(), // ausente = puesto actual
        summary: z.string().optional(),
        highlights: z.array(z.string()).default([]),
      }),
    )
    .default([]),

  education: z
    .array(
      z.object({
        institution: z.string(),
        area: z.string(),
        studyType: z.string(),
        startDate: dateish.optional(),
        endDate: dateish.optional(),
      }),
    )
    .default([]),

  certificates: z
    .array(
      z.object({
        name: z.string(),
        // Opcional a propósito: el export de LinkedIn no trae el emisor, y es
        // preferible listar la certificación sin atribuir que inventar quién
        // la emitió.
        issuer: z.string().optional(),
        date: dateish.optional(),
        url: z.string().url().optional(),
      }),
    )
    .default([]),

  skills: z
    .array(
      z.object({
        name: z.string(),
        keywords: z.array(z.string()).default([]),
      }),
    )
    .default([]),

  languages: z
    .array(z.object({ language: z.string(), fluency: z.string() }))
    .default([]),
});

export type CV = z.infer<typeof cvSchema>;

/**
 * Se valida al importar, así que un CV malformado rompe el BUILD y no
 * producción. Es a propósito: preferimos un build rojo a un /cv en blanco.
 */
export const cv: CV = cvSchema.parse(raw);

/**
 * "2024-01 — present"
 * En inglés: el contenido del sitio es inglés (ver CLAUDE.md), solo los
 * comentarios y las explicaciones van en español.
 */
export const fmtRange = (start: string, end?: string) =>
  `${start} — ${end ?? 'present'}`;
