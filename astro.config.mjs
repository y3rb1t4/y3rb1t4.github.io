// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Sitio 100% estático. Sin adapter, sin SSR, sin backend.
// Si algún día vuelve a hacer falta una ruta dinámica, eso implica adapter +
// hosting con runtime — no es un cambio de una línea. Ver CLAUDE.md.
export default defineConfig({
  site: 'https://y3rb1t4.pro',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
