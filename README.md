# EcoFARMA

Plataforma de donación de medicamentos entre particulares: los donantes publican medicamentos sobrantes, los receptores los solicitan y ambos coordinan la entrega por un chat en tiempo real.

## Stack

- **Frontend:** Vue 3 (SPA) + Tailwind CSS 4, empaquetado con Vite.
- **Backend:** Supabase (PostgreSQL, Auth, Storage y Realtime).
- **Lógica de servidor:** Supabase Edge Functions escritas en TypeScript sobre Deno.
- **Gestor de paquetes:** pnpm.

El frontend habla directo con Supabase mediante `@supabase/supabase-js` usando la `anon key`, con la seguridad delegada en Row Level Security (RLS). Las operaciones que requieren privilegios o reglas de negocio sensibles (validación contra el vademécum, códigos de confirmación, cierre de entregas) se resuelven en Edge Functions.

## Estructura

```
.
├── index.html              # Punto de entrada de Vite
├── public/                 # Estáticos (favicon, robots.txt)
├── src/
│   ├── main.js             # Bootstrap de la app Vue
│   ├── App.vue
│   ├── style.css           # Tailwind y tokens de diseño
│   └── lib/supabase.js     # Cliente único de Supabase
└── supabase/               # Se crea con `supabase init`
    ├── config.toml
    ├── migrations/         # Migraciones SQL del esquema
    └── functions/          # Edge Functions (Deno)
```

## Requisitos

- Node.js y pnpm.
- [Deno](https://deno.com) y [Supabase CLI](https://supabase.com/docs/guides/cli) para desarrollar y desplegar las Edge Functions.

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar con los datos del proyecto de Supabase:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

La `service_role` key nunca va en el frontend: solo se usa dentro de las Edge Functions como secreto de Supabase.

## Comandos

```bash
pnpm install                     # Dependencias del frontend
pnpm dev                         # Servidor de desarrollo de Vite
pnpm build                       # Build de producción en dist/
pnpm preview                     # Previsualizar el build

supabase link --project-ref <ref>
supabase migrations new <nombre> # Nueva migración SQL
supabase db push                 # Aplicar migraciones al proyecto remoto
supabase functions new <nombre>  # Nueva Edge Function
supabase functions serve         # Servir Edge Functions en local
supabase functions deploy <nombre>
```

## Seguimiento

El estado del proyecto, el esquema de base de datos y las fases de implementación están en [ROADMAP.md](ROADMAP.md).
