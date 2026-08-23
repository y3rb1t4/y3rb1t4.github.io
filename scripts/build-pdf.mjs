/**
 * Genera dist/cv.pdf imprimiendo la página /cv ya construida.
 *
 * El PDF NO es una segunda fuente: es la misma página renderizada al medio
 * impreso. Por construcción no puede decir algo distinto que el HTML, que es
 * exactamente el bug que queremos que sea imposible.
 *
 * Correr SIEMPRE después de `astro build`:
 *   pnpm build && pnpm pdf
 *
 * Sirve dist/ con un http server mínimo en vez de usar file://, porque Astro
 * emite rutas root-relative (/_astro/...) que bajo file:// no resuelven —
 * saldría un PDF sin estilos y sin ningún error.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { chromium } from 'playwright';

const DIST = new URL('../dist/', import.meta.url).pathname;
const OUT = join(DIST, 'cv.pdf');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

const server = createServer(async (req, res) => {
  try {
    // normalize() corta el path traversal. Es un server de build local, pero
    // no hay razón para escribirlo mal.
    let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (path.endsWith('/')) path += 'index.html';
    if (!extname(path)) path += '/index.html';

    const body = await readFile(join(DIST, path));
    res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();

const browser = await chromium.launch();
try {
  const page = await browser.newPage();

  const res = await page.goto(`http://127.0.0.1:${port}/cv`, {
    waitUntil: 'networkidle',
  });
  if (!res || !res.ok()) {
    throw new Error(`/cv devolvió ${res?.status() ?? 'sin respuesta'} — ¿corriste astro build?`);
  }

  // Fuerza el media print: el PDF tiene que salir con la hoja de estilos de
  // impresión, no con la de pantalla.
  await page.emulateMedia({ media: 'print' });

  // preferCSSPageSize deja que `@page` de global.css mande sobre tamaño y
  // márgenes. NO agregar `margin` acá: la regla @page le gana igual, y tener
  // los márgenes en dos lugares hace que uno de los dos mienta.
  await page.pdf({
    path: OUT,
    printBackground: true,
    preferCSSPageSize: true,
  });

  console.log(`✓ ${OUT}`);
} finally {
  await browser.close();
  server.close();
}
