# EcoFARMA — Guía para agentes

Reglas de trabajo. El estado, las decisiones y el esquema están en `ROADMAP.md`. Cómo se protegen los datos está en `docs/base-de-datos.md`. Al cerrar una fase o una pantalla de la sección 5, actualizar `ROADMAP.md`.

## Stack

- Frontend: Vue 3 (SPA, Composition API) + Tailwind CSS 4, con Vite. Gestor de paquetes: pnpm.
- Backend: Supabase (PostgreSQL, Auth, Storage, Realtime).
- Lógica de servidor: Supabase Edge Functions en JavaScript sobre Deno.
- No usar Laravel, PHP, TypeScript ni otros lenguajes.

## Alcance

- Implementar solo lo que el usuario pide. Si hace falta un archivo o un cambio de más para que funcione, avisarlo y explicar por qué antes de hacerlo.
- Primero datos, RLS, consultas y Edge Functions. Hasta la fidelidad visual y la landing (`ROADMAP.md`, sección 5 y fase 10), la interfaz lleva solo las clases de Tailwind mínimas para probarla. HTML nativo: `input`, `select`, `textarea`, `button`, `table`. Sin shadcn/vue ni librerías de UI.

## Estructura

Un solo proyecto: `src/` en la raíz y `supabase/` al lado. No separar en `/frontend` y `/backend`, ni mover archivos, `.env.local` o imports.

- `src/lib/supabase.js`: único cliente de Supabase en el frontend.
- `src/views/`: una página por ruta. Llama al composable y renderiza el formulario o la lista.
- `src/composables/`: acceso a Supabase y validación de formularios.
- `src/style.css`: Tailwind, tokens (`@theme`) y las utilidades `pagina`, `pagina-media` y `pagina-formulario`.
- `supabase/migrations/`: una migración nueva por cambio de esquema. No editar migraciones ya aplicadas.
- `supabase/functions/<nombre>/index.js`: Edge Functions.
- `supabase/seed.sql`: datos de desarrollo. No inserta donaciones.

## Base de datos

- RLS en todas las tablas, con políticas explícitas por operación.
- Cada tabla nueva necesita `GRANT` para `anon` y `authenticated`. `service_role` ya los recibe.
- Usuarios en `auth.users`. Datos de dominio en `public.profiles` (`id` UUID, FK a `auth.users.id`).
- Tablas y columnas en español y `snake_case`.
- Reglas sensibles en Edge Functions: coincidencia con el vademécum, receta, código de confirmación, cierre de entregas y acciones de admin. El frontend no inserta en `medicamentos` ni en `solicitudes`.

## Edge Functions

- JavaScript simple con `Deno.serve`, el mismo estilo que el frontend.
- Registrar cada función en `supabase/config.toml` con `entrypoint` a su `index.js`. La CLI busca `index.ts` por defecto.
- Imports con `npm:` o `jsr:` (por ejemplo `npm:@supabase/supabase-js@2`). No usar el `node_modules` del frontend.
- Secretos con `Deno.env.get(...)`. La `service_role` key solo dentro de la función.
- `verify_jwt = false`: las claves `sb_publishable_...` no pasan la verificación del gateway. Validar el JWT con `auth.getUser(token)` y responder 401 si no hay sesión.
- CORS habilitado, para invocarlas con `supabase.functions.invoke`.
- Error: `{ "error": "<mensaje en español para el usuario>" }` y el código HTTP que corresponda.

## Frontend

- `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env.local`. Nunca la `service_role` key ni otros secretos.
- Colores solo con tokens de `src/style.css` (`bg-primary`, `text-icon`, `text-danger`). Sin hex sueltos ni la paleta por defecto de Tailwind.
- Títulos en `font-heading` (Noto Sans). Cuerpo en `font-sans` (Source Sans Pro).

### Mensajes

- Texto claro en español. El error crudo (`error.message`, códigos de Postgres, stack) solo se escribe en consola.
- Error: `danger`. Éxito: `success`. Advertencia: `warning`. Informativo: `muted`. Usar `text-*`, `border-*` y `bg-*/10`.
- Ingreso, registro y cierre de sesión: aviso en `App.vue` con `mostrarAviso`. La donación publicada o en revisión queda en la misma pantalla de `/donar`. Los errores y las advertencias quedan en el formulario.

## Código

- Sin comentarios, salvo que el usuario los pida.
- Sintaxis básica, sin librerías ni capas de más.
- No ejecutar `pnpm dev`, `pnpm build`, `pnpm preview` ni `pnpm supabase functions serve` por cuenta propia. Revisar el código y decir qué conviene probar.

## Git

- `main` es producción. `dev` es integración. Las features salen de `dev` como `featureNN/<nombre>`.
- Integrar primero en `dev`. Pasar a `main` solo con `dev` verificado: la app levanta, el build pasa y el flujo se probó. Si falta esa prueba, no pushear y avisarlo.
- Al quedar la feature en `dev`, dejar los comandos para borrar la rama y no ejecutarlos: `git branch -d featureNN/<nombre>` y `git push origin --delete featureNN/<nombre>`.

## Comandos

La CLI va siempre como `pnpm supabase ...`. No usar `supabase` a secas ni `npx`.

- Proyecto: `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm preview`.
- Migración: `pnpm supabase migrations new <nombre>` y `pnpm supabase db push`.
- Funciones: `pnpm supabase functions serve` y `pnpm supabase functions deploy <nombre>`.
- Secretos: `pnpm supabase secrets set NOMBRE=valor`.
- Empezar: `git checkout dev && git pull` y `git checkout -b featureNN/<nombre>`.
- Integrar: `git checkout dev && git merge featureNN/<nombre> && git push`.
- A producción, después de verificar `dev`: `git checkout main && git merge dev && git push`.
