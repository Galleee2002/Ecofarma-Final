# EcoFARMA — Guía para agentes

## Stack

- Frontend: Vue 3 (SPA, Composition API) + Tailwind CSS 4, con Vite. Gestor de paquetes: pnpm.
- Backend: Supabase (PostgreSQL, Auth, Storage, Realtime).
- Lógica de servidor: Supabase Edge Functions en TypeScript sobre Deno.
- El proyecto no usa Laravel ni PHP. No agregar dependencias de PHP/Composer ni de Laravel.

El estado del proyecto, el esquema de base de datos y las fases están en `ROADMAP.md`. Mantenerlo actualizado al completar tareas.

## Estructura

- `index.html`: punto de entrada de Vite.
- `src/main.js`, `src/App.vue`: arranque de la app.
- `src/style.css`: Tailwind y tokens de diseño (`@theme`).
- `src/lib/supabase.js`: cliente único de Supabase. Importarlo desde ahí; no crear otros clientes en el frontend.
- `supabase/migrations/`: migraciones SQL del esquema (se crean con `supabase migrations new <nombre>`).
- `supabase/functions/<nombre>/index.ts`: Edge Functions.
- `supabase/seed.sql`: datos semilla.

## Base de datos

- Todo cambio de esquema va en una migración SQL nueva; no editar migraciones ya aplicadas.
- RLS habilitado en todas las tablas, con políticas explícitas por operación.
- Los usuarios viven en `auth.users`; los datos de dominio en `public.profiles` (`id` UUID FK a `auth.users.id`).
- Nombres de tablas y columnas en español y `snake_case`, como en `ROADMAP.md`.

## Edge Functions (Deno)

- TypeScript con `Deno.serve`.
- Imports con especificadores `npm:` o `jsr:` (por ejemplo `npm:@supabase/supabase-js@2`); no usar `node_modules` del frontend.
- Leer secretos con `Deno.env.get(...)`. La `service_role` key solo se usa dentro de Edge Functions.
- Validar el JWT del usuario y responder con CORS para que el frontend pueda invocarlas con `supabase.functions.invoke`.
- Las reglas de negocio sensibles (validación contra `medicamentos_habilitados`, código de confirmación, cierre de entregas, acciones de admin) van en Edge Functions, no en el frontend.

## Frontend

- Variables de entorno con prefijo `VITE_` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), definidas en `.env.local`.
- Nunca exponer la `service_role` key ni otros secretos en el código del frontend.
- Estilos con clases de Tailwind y los tokens definidos en `src/style.css`.
- Colores solo a través de los tokens (`bg-primary`, `text-icon`, `text-danger`, etc.), nunca con hex sueltos. Los títulos ya usan `font-heading` por defecto; el body usa `font-sans`.

## Comandos

- `pnpm dev`, `pnpm build`, `pnpm preview`.
- `supabase functions serve`, `supabase functions deploy <nombre>`, `supabase db push`.
