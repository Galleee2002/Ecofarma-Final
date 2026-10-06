# EcoFARMA — Guía para agentes

## Stack

- Frontend: Vue 3 (SPA, Composition API) + Tailwind CSS 4, con Vite. Gestor de paquetes: pnpm.
- Backend: Supabase (PostgreSQL, Auth, Storage, Realtime).
- Lógica de servidor: Supabase Edge Functions en TypeScript sobre Deno.
- El proyecto no usa Laravel ni PHP. No agregar dependencias de PHP/Composer ni de Laravel.

El estado del proyecto, el esquema de base de datos y las fases están en `ROADMAP.md`. Mantenerlo actualizado al completar tareas.

## Prioridades

- Primero la funcionalidad: datos, backend (Supabase, RLS, consultas, Edge Functions) y la lógica de cada fase de `ROADMAP.md`.
- Los estilos y la landing page son lo último del tablero de Trello. Hasta esa etapa, la interfaz lleva solo las clases de Tailwind mínimas para que se pueda usar y probar, sin pulido visual, animaciones ni diseño responsive detallado.
- Esto no exime de la sección "Mensajes al usuario y manejo de errores": los mensajes personalizados y sus colores de token siguen siendo obligatorios.

## Estructura

- `index.html`: punto de entrada de Vite.
- `src/main.js`, `src/App.vue`: arranque de la app.
- `src/style.css`: Tailwind y tokens de diseño (`@theme`).
- `src/lib/supabase.js`: cliente único de Supabase. Importarlo desde ahí; no crear otros clientes en el frontend.
- `src/router/`: rutas de Vue Router.
- `src/views/`: páginas, una por ruta (por ejemplo `CatalogoView.vue`).
- `src/components/`: componentes reutilizables, agrupados por dominio (por ejemplo `components/medicamentos/`).
- `src/composables/`: lógica reutilizable y acceso a Supabase (por ejemplo `useMedicamentos.js`). Las vistas llaman al composable y pasan los datos a los componentes por props.
- `supabase/migrations/`: migraciones SQL del esquema (se crean con `pnpm supabase migrations new <nombre>`).
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

### Mensajes al usuario y manejo de errores

Al implementar cualquier fase de `ROADMAP.md` que maneje errores o devuelva mensajes al usuario (formularios, llamadas a Supabase, Edge Functions, confirmaciones de acciones, estados vacíos, etc.):

- Mostrar siempre un mensaje personalizado, claro y en español, pensado para el usuario final. Nunca mostrar el error crudo de Supabase, de la Edge Function o de JavaScript (`error.message`, códigos de Postgres, stack traces); traducirlo a un texto comprensible y registrar el detalle técnico solo en consola.
- Usar el color del token de `src/style.css` que corresponda al tipo de mensaje, nunca hex sueltos ni colores por defecto de Tailwind:
  - Error: `danger` (`text-danger`, `border-danger`, `bg-danger/10`).
  - Éxito: `success` (`text-success`, `border-success`, `bg-success/10`).
  - Advertencia: `warning` (`text-warning`, `border-warning`, `bg-warning/10`).
  - Informativo: `secondary` (`text-secondary`, `border-secondary`, `bg-secondary/10`).
- Las Edge Functions deben responder errores con un cuerpo JSON consistente (por ejemplo `{ "error": "<mensaje para el usuario>" }`) y el código HTTP adecuado, para que el frontend pueda mostrar el mensaje personalizado.

## Estilo de código

- No escribir comentarios en el código, salvo que el usuario lo pida.
- Es un proyecto académico: usar sintaxis básica y legible en todos los lenguajes (JavaScript, Vue, SQL, TypeScript), sin funcionalidades avanzadas, librerías innecesarias ni abstracciones de más, para que cualquiera del equipo entienda el código al leerlo.

## Verificación de cambios

- No ejecutar `pnpm dev`, `pnpm build`, `pnpm preview` ni levantar servidores (incluido `pnpm supabase functions serve`) para revisar los cambios por iniciativa propia. Hacerlo únicamente cuando el usuario lo solicite.
- Si hace falta validar algo, preferir revisar el código y los linters, y avisar al usuario qué conviene probar.

## Ramas y flujo de Git

- `main`: producción. `dev`: integración. Features en ramas `featureNN/<nombre>` creadas desde `dev`.
- Las features se integran primero en `dev`, nunca directo en `main`.
- Antes de pushear o mergear a `main`, confirmar que `dev` funciona correctamente con la última feature integrada (la app levanta, el build pasa y el flujo de la feature fue probado). Si no está verificado, no pushear a `main` y avisar al usuario.
- Cuando una feature se da por finalizada e integrada en `dev`, indicarle al usuario que elimine la rama (local y remota) y dejarle los comandos (`git branch -d featureNN/<nombre>` y `git push origin --delete featureNN/<nombre>`). Nunca eliminar ramas sin permiso explícito del usuario.

## Comandos

### Proyecto

- `pnpm install`: instalar dependencias.
- `pnpm dev`: servidor de desarrollo de Vite.
- `pnpm build`: build de producción.
- `pnpm preview`: servir el build localmente.

### Supabase

La CLI de Supabase está instalada como dependencia del proyecto: correr siempre los comandos con el prefijo `pnpm` (`pnpm supabase ...`), nunca con `supabase` a secas ni con `npx`.

- `pnpm supabase login`: iniciar sesión en la CLI.
- `pnpm supabase link --project-ref <ref>`: vincular el proyecto remoto.
- `pnpm supabase migrations new <nombre>`: crear una migración.
- `pnpm supabase db push`: aplicar migraciones pendientes al proyecto remoto.
- `pnpm supabase functions serve`: servir Edge Functions en local.
- `pnpm supabase functions deploy <nombre>`: desplegar una Edge Function.
- `pnpm supabase secrets set NOMBRE=valor`: definir secretos para Edge Functions.

### Git

- `git checkout dev && git pull`: actualizar `dev` antes de empezar.
- `git checkout -b featureNN/<nombre>`: crear una rama de feature desde `dev`.
- `git push -u origin featureNN/<nombre>`: subir la feature.
- `git checkout dev && git merge featureNN/<nombre> && git push`: integrar la feature en `dev`.
- `git checkout main && git merge dev && git push`: pasar `dev` a `main`, solo después de verificar `dev`.
