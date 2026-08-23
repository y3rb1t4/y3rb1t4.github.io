# CLAUDE.md — y3rb1t4.pro

Web personal de **y3rb1t4** (Ch4ng0): portfolio + CV descargable en PDF.
Sitio **estático**, en la raíz de `y3rb1t4.pro`, servido por GitHub Pages.

> **Idioma:** contenido del sitio en **inglés** (audiencia: recruiters
> internacionales, comunidad infosec). Explicaciones y comentarios internos en
> español. Commits en inglés.

---

## Estado

**Fase 1 — anda.** `pnpm build` pasa, `/` y `/cv` renderizan, `dist/cv.pdf` se
genera y se verificó a ojo. Node 22 via fnm, deps instaladas.

Falta: llenar el CV (está lleno de `TODO`), agregar proyectos reales, y
**resolver el DNS antes del primer deploy** (§Dominio y DNS).

---

## Qué es y qué no es

**Es:** la puerta de entrada pública de un AppSec engineer. Portfolio de
proyectos + CV en pantalla y descargable en PDF. Rápido, gratis, sin infra.

**No es:** el blog. Los writeups y posts viven en
[`y3rb1t4/blog`](https://github.com/y3rb1t4/blog) (Hexo, tema next).
**No migrar el blog acá sin que Ch4ng0 lo pida.**

**Tampoco es:** `y3rb1t4/portfolio` ni `y3rb1t4/itify` — plantillas Next.js de
2023, muertas. No copiar código de ahí.

---

## Stack

| Capa | Elección | Por qué |
|---|---|---|
| Framework | **Astro 7** (`astro@7.2.4`) | ~0 JS por defecto. Lighthouse alto casi gratis. Superficie de ataque mínima — importa cuando la cara pública es la de alguien de AppSec |
| Lenguaje | TypeScript **strict** | `astro/tsconfigs/strict` |
| Estilos | Tailwind v4 (`@tailwindcss/vite`) | No el plugin viejo de Astro |
| Contenido | Content Collections + MDX | Proyectos tipados con Zod |
| CV | JSON Resume + Zod → `/cv` → `cv.pdf` | Una fuente, dos salidas. Ver §El CV |
| Deploy | **GitHub Pages** vía Actions | Gratis, sin infra que cuidar |
| Backend | **Ninguno. A propósito.** | Ver abajo |

### Sin backend, y es una decisión, no una carencia

Hubo un diseño previo con un chat IA sobre el CV (Cloudflare Workers + KV +
Turnstile + la API de Anthropic). **Ch4ng0 lo descartó el 2026-08-22**, antes
de que se desplegara nada.

El razonamiento, para que nadie lo re-proponga sin argumentos nuevos: un
recruiter escanea un CV en 30 segundos y sigue; el CV son tres páginas, y un
chat para consultar tres páginas pierde contra Ctrl+F; cada request la pagaba
y3rb1t4; y convertía un sitio estático gratis y sin mantenimiento en algo con
secrets, rate limiting y superficie de ataque.

**Consecuencia dura: no agregar nada que requiera runtime en el servidor.**
Formularios, analytics con backend propio, endpoints de API, SSR — todo eso
rompe el modelo de despliegue entero, no es "una ruta más". Si alguna vez hace
falta de verdad, es una conversación con Ch4ng0 sobre hosting, no un commit.

Formularios de contacto: `mailto:` o un servicio de terceros. No un endpoint.

### Toolchain

**Node 22 LTS vía `fnm`, pnpm 10.34.5.** Usar **pnpm**, no npm.

El node del sistema es `nodejs-lts-iron` (20.20.2) y **se queda ahí**: de él
cuelgan `bloodhound` y `cursor-bin`. Astro 7 pide `node >=22.12.0`, así que
este proyecto usa `fnm` con un `.node-version` en la raíz — aditivo, sin tocar
el node del sistema.

```bash
fnm use          # respeta .node-version; correr antes de cualquier pnpm
node --version   # tiene que dar v22.x
```

Si `pnpm install` tira `Unsupported engine: wanted {"node":">=22.12.0"}`,
te olvidaste el `fnm use`.

### Por qué no lo otro

- **React / Vue / Svelte:** no hay ninguna isla interactiva todavía. No agregar
  un framework de UI "por las dudas" — son ~40KB de JS para nada. Un theme
  toggle o un filtro de proyectos se hacen con vanilla en menos líneas. Si
  alguna vez aparece algo genuinamente interactivo, ahí se evalúa.
- **Cloudflare Pages / Vercel / Netlify:** todos andarían, pero sin backend no
  aportan nada sobre GitHub Pages y suman un proveedor más. El repo ya vive en
  GitHub; el deploy es un workflow.
- **Un CMS:** el contenido son un JSON y un puñado de MDX en el repo. Un CMS
  para eso es infra para administrar tres archivos.

---

## Lenguaje visual

**Terminal-brutalista.** Referencia elegida por Ch4ng0:
[lautarovculic.com](https://lautarovculic.com/). Monoespaciada en todo, fondo
casi negro, sin sombras ni bordes redondeados, alta densidad. Vocabulario:

| Primitiva | Clase | Qué es |
|---|---|---|
| Caja ASCII | `.tui-box` | Marco de 1px, como el header de una TUI |
| Separador | `.rule` | `border-top` punteado en lugar de una fila de `---` |
| Encabezado | `.section-label` + `.hex` | `0x1 EXPERIENCE`, offsets tipo hexdump |
| Fila etiquetada | `.kv` | `[ role ]  Application Security Engineer` |
| Cursor | `.caret` | `_` parpadeante; se apaga con `prefers-reduced-motion` |

**`.kv` usa `grid-template-columns: max-content`, nunca un ancho fijo en `ch`.**
La columna se mide sola por la etiqueta más larga. Con un valor fijo, una
etiqueta que no entra parte el `]` a la línea siguiente — pasó con
`[ location ]` y `[ linkedin ]` contra un `11ch`. Agregar una red nueva no
debería obligar a recontar caracteres.

### Pantalla ≠ papel

**La estética de terminal es solo para pantalla. El PDF va limpio y
convencional** — sans-serif, blanco, sin corchetes ni hex. El `@media print`
de `global.css` apaga las primitivas una por una.

No es capricho: el PDF es el archivo que se adjunta a una postulación y lo
puede parsear un ATS o leerlo alguien de RRHH. Una monoespaciada sobre fondo
negro ahí juega en contra. **Si agregás una primitiva visual nueva, apagala
también en el bloque de impresión.**

### Sin webfont

El stack de mono es de sistema. y3rb1t4 tiene UbuntuMono Nerd Font en su
máquina, el visitante no — pedirla por web serían ~200KB para que se vea
prácticamente igual. Si alguna vez se agrega una, que sea con `font-display:
swap` y subset.

---

## Presupuesto de JavaScript

El sitio embarca **un solo script**: el toggle de tema (`ThemeToggle.astro` +
el `is:inline` del `<head>`). Unas 20 líneas, sin bundle, sin framework.

- El default es **dark**, servido como `data-theme="dark"` en el `<html>`. Por
  eso la mayoría de las visitas no ejecutan ningún cambio y no hay flash.
- El `is:inline` del `<head>` es **bloqueante a propósito**: corre antes del
  primer paint para que quien eligió claro no vea un flash oscuro. No moverlo
  abajo ni ponerle `defer`.
- Las etiquetas `dark`/`light` viven las dos en el DOM y se alternan por CSS.
  Escribirlas por JS hace que el botón parpadee con la equivocada.

**Cualquier cosa que sume JS necesita justificación explícita.** Y si el sitio
deja de poder afirmar algo, hay que actualizar el footer — hoy dice "no
trackers, no cookies, no analytics", que sigue siendo cierto.

---

## Estructura

```
src/
├── content/
│   ├── cv/y3rb1t4.json   # FUENTE ÚNICA DE VERDAD del CV
│   └── projects/         # un .mdx por proyecto del portfolio
├── lib/cv.ts             # schema Zod + validación del CV
├── layouts/
├── pages/
│   ├── index.astro       # landing + portfolio
│   └── cv.astro          # CV renderizado (y origen del PDF)
├── components/           # ThemeToggle, SocialIcon
└── styles/
scripts/
└── build-pdf.mjs         # imprime /cv a dist/cv.pdf con Playwright
```

## El CV: una fuente, dos salidas

`src/content/cv/y3rb1t4.json` en formato **JSON Resume** es la única fuente.
`src/lib/cv.ts` lo valida con Zod **al importar**, así que un CV malformado
rompe el build en vez de publicar un `/cv` en blanco.

De ahí salen:

1. La página `/cv`, renderizada por Astro
2. `dist/cv.pdf`, **impreso desde esa misma página** por `scripts/build-pdf.mjs`

El PDF no es una segunda fuente: es `/cv` renderizado al medio impreso. Por
construcción no puede decir algo distinto que el HTML — que es justamente el
bug que este diseño existe para hacer imposible. **Nunca editar el PDF a mano
ni hardcodear datos del CV en un componente.**

```bash
pnpm build && pnpm pdf    # el pdf necesita el build hecho primero
```

Notas del generador:
- Sirve `dist/` por HTTP en vez de usar `file://`, porque Astro emite rutas
  root-relative (`/_astro/...`) que bajo `file://` no resuelven — saldría un
  PDF sin estilos **y sin ningún error**.
- Fuerza `media: print`. La hoja de estilos de impresión de `/cv` es lo que
  define cómo sale el PDF; si el PDF se ve mal, se arregla ahí, no en el script.
- `cv.pdf` está gitignoreado (vive dentro de `dist/`). Se genera en cada deploy.

### Sin PII

Nada de teléfono, dirección ni documento en el JSON. Ese archivo se publica
entero en el HTML y en el PDF.

---

## Dominio y DNS

- `y3rb1t4.pro` → **este sitio** (GitHub Pages)
- `m4ld3v.y3rb1t4.pro` → repo `m4ld3v-notes`, **no tocar**
- El blog (repo `blog`, Hexo) → **pendiente, ver abajo**

> [!warning]
> **El CNAME de la raíz hoy lo tiene el repo `blog`** (`source/CNAME` =
> `y3rb1t4.pro`). GitHub Pages permite **un dominio custom por repo**, así que
> los dos repos no pueden reclamar el apex. Publicar este sitio en la raíz
> **baja el blog** hasta que se le dé destino. Los dos cambios van juntos.

**Decisión pendiente de Ch4ng0** — dos caminos, y hay que elegir antes del
primer deploy:

| | Cómo | Costo |
|---|---|---|
| **A. Blog a subdominio** | El repo `blog` cambia su CNAME a `blog.y3rb1t4.pro`; este repo se queda con el apex | Una línea en cada repo + un registro DNS. Lo más rápido |
| **B. Blog en `/blog`** | Este repo se renombra a `y3rb1t4.github.io` (user site, se sirve en el apex); `blog` pasa a project site y cae en `y3rb1t4.pro/blog` | Renombrar el repo cambia la URL de clone. Da la estructura que Ch4ng0 pidió originalmente |

**No tocar el CNAME de ningún repo sin confirmar cuál de los dos.**

---

## Agentes

Instalados user-scoped, disponibles en toda sesión:

| Agente | Plugin | Para qué acá |
|---|---|---|
| `frontend-developer` | `voltagent-core-dev` | Componentes Astro, accesibilidad, performance |
| `ui-designer` / `design-bridge` | `voltagent-core-dev` | Sistema visual, tokens, tipografía |

`backend-developer`, `api-designer`, `websocket-engineer`, `graphql-architect`,
`microservices-architect` están instalados pero **no aplican a este proyecto**:
no hay backend. Si un agente propone usarlos acá, está resolviendo un problema
que este repo no tiene.

Skills de diseño (`claude-design-skillstack`): `modern-web-design`,
`gsap-scrolltrigger`, `motion-framer`, `threejs-webgl`, `react-three-fiber`,
`babylonjs-engine`, `web3d-integration-patterns`.

**Presupuesto de animación.** El proyecto hoy embarca **cero JS**. Eso es una
feature, no un accidente. Antes de agregar cualquier librería de animación,
preguntarse si CSS solo alcanza — casi siempre alcanza. GSAP/ScrollTrigger se
justifica para scroll-driven de verdad; Framer Motion arrastra React entero,
así que hoy no. Three.js/R3F **solo si Ch4ng0 lo pide explícitamente**: meter
WebGL en una landing de CV cuesta cientos de KB y tira abajo justamente lo que
se eligió Astro para ganar. Respetar `prefers-reduced-motion` siempre.

---

## Convenciones

- **Commits en inglés**, conventional commits (`feat:`, `fix:`, `chore:`).
- **Nunca commitear a `main`.** Branch + PR, igual que en colmena.
- Antes de dar una tarea por terminada: `pnpm build` tiene que pasar limpio.
- No agregar dependencias sin justificarlas — cada una es peso y superficie.
  El presupuesto de JS embarcado es **0 KB** hasta nuevo aviso.

## Setup

Los archivos de config están escritos a mano (no se usó `create-astro`, que
además pide Node ≥22.12 y habría fallado con el node del sistema).

```bash
cd ~/Documents/github/y3rb1t4/y3rb1t4.pro
fnm use && pnpm install
pnpm dev                  # http://localhost:4321
pnpm build && pnpm pdf    # build + genera dist/cv.pdf
```

Versiones fijadas en `package.json`, verificadas contra el registry de npm el
2026-08-22: `astro@7.2.4`, `@astrojs/mdx@7.0.7`, `tailwindcss@4.3.3`,
`playwright@^1.50.0`.

**Deploy:** `.github/workflows/deploy.yml` corre en cada push a `main` —
install, build, `playwright install chromium`, genera el PDF y publica `dist/`
en Pages. Requiere tener Pages configurado en modo **GitHub Actions** en los
settings del repo (no "deploy from branch").

---

## Gotchas

- **No hay adapter y no debe haberlo.** El sitio es estático puro. Un
  `export const prerender = false` en cualquier página falla el build: no hay
  runtime donde correr. Ver §Sin backend.
- **Content Collections: el archivo es `src/content.config.ts`** (raíz de
  `src/`), **no** `src/content/config.ts` — esa es la API vieja. Los imports
  son `defineCollection` de `astro:content`, `glob`/`file` de `astro/loaders`,
  y `z` de **`astro/zod`** (no del paquete `zod` suelto). El id de una entrada
  es `entry.id`, y el contenido se renderiza con `render(entry)`.
- **El CV no es una content collection.** Es un documento único: JSON +
  validación Zod en `src/lib/cv.ts`. Las collections son para los proyectos,
  que sí son muchos. No forzar el CV a la API de collections.
- **`pnpm pdf` sin `pnpm build` antes falla**, y el mensaje de error lo dice.
  El script imprime lo que hay en `dist/`.
- **Tailwind v4 se configura en CSS** (`@import "tailwindcss"`), no en
  `tailwind.config.js`. La config v3 no aplica.
- **`fnm use` antes de cualquier `pnpm`.** Sin eso agarra el node 20 del
  sistema y Astro 7 rebota con `Unsupported engine`.
