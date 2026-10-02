# ROADMAP.md — EcoFARMA (MVP)

Seguimiento técnico del proyecto: estado, esquema de base de datos y fases de implementación.

---

## 1. Stack

- **Frontend:** Vue 3 (SPA) + Tailwind CSS, con Vite
- **Backend:** Supabase: PostgreSQL, Auth, Storage y Realtime (chat)
- **Lógica de servidor:** Supabase Edge Functions en Deno (TypeScript)
- **Metodología:** Scrumban (Trello)

Se abandonó Laravel: el frontend consume Supabase directo con `supabase-js` y RLS, y la lógica sensible vive en Edge Functions.

---

## 2. Estado

- [x] Entorno inicial con Vue + Tailwind y conexión a Supabase vía variables `VITE_SUPABASE_*`.
- [x] Tokens de diseño en Tailwind (paleta y tipografías).
- [ ] Migración de stack: se retiraron Laravel, PHP y sus dependencias; el frontend quedó como SPA de Vite.
- [ ] Base de datos limpia: eliminar las tablas que habían creado las migraciones de Laravel.
- [ ] Inicializar `supabase/` con Supabase CLI (`supabase init` + `supabase link`).
- [ ] Migraciones SQL de las 5 tablas del dominio (0 de 5).

### Decisiones de modelo

- Autenticación con Supabase Auth: credenciales y email viven en `auth.users`; los datos de dominio en `profiles`.
- Sin puntos de entrega fijos: donante y receptor coordinan día, hora y lugar por el chat de la solicitud.
- `profiles.is_validado` arranca en `true`; el admin lo pasa a `false` para suspender una cuenta.
- `profiles.rol` e `is_validado` solo los modifica un admin (RLS / Edge Function), nunca el propio usuario.
- `profiles.rol` y los `estado` de `medicamentos` y `solicitudes` son VARCHAR con un conjunto cerrado de valores, no tipos ENUM de Postgres.
- `medicamentos`, `solicitudes` y `profiles` usan UUID como PK; `medicamentos_habilitados` y `solicitud_mensajes` usan BIGINT identity.
- `medicamentos.lote` da trazabilidad sanitaria; `motivo_rechazo` se comunica al donante por alerta o mail durante la moderación.
- `solicitudes.medicamento_id` usa `ON DELETE RESTRICT` para no perder el historial de intercambios.
- No hay tabla de alertas de moderación: la moderación se basa en el `estado` de `medicamentos` (`pendiente_revision`, `rechazado`) y en `motivo_rechazo`.
- Fotos de envases y recetas se guardan en Supabase Storage; las tablas guardan solo sus URLs.

### Sistema de diseño

Tokens definidos en `@theme` de `src/style.css`; fuentes cargadas desde Bunny Fonts en `index.html`.

- **Títulos (`h1`–`h5`):** Noto Sans 600 (`font-heading`), aplicado por defecto en la capa `base`.
- **Body:** Source Sans Pro 400 (`font-sans`).

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#215B8D` | Color principal |
| `secondary` | `#309AE6` | Color secundario |
| `icon` | `#52806C` | Íconos |
| `success` | `#43B75D` | Éxito |
| `danger` | `#FF383C` | Error / acciones destructivas |
| `warning` | `#FFAA00` | Advertencia |

---

## 3. Esquema de Base de Datos

Migraciones en SQL dentro de `supabase/migrations/` (`supabase migrations new <nombre>`), con RLS habilitado en todas las tablas.
Salvo aclaración, cada tabla tiene `created_at` / `updated_at` (TIMESTAMPTZ, default `now()`). El tipo de `id` se indica en cada tabla.
Orden de creación: `profiles`, `medicamentos_habilitados` → `medicamentos` → `solicitudes` → `solicitud_mensajes`.

| # | Tabla | Estado |
|---|---|---|
| 1 | `profiles` | Pendiente |
| 2 | `medicamentos_habilitados` | Pendiente |
| 3 | `medicamentos` | Pendiente |
| 4 | `solicitudes` | Pendiente |
| 5 | `solicitud_mensajes` | Pendiente |

### 1. `profiles` (Perfiles y Datos Legales)

Extensión pública vinculada al usuario autenticado de Supabase (`auth.users`). Se crea automáticamente al registrarse mediante un trigger sobre `auth.users`.

- `id`: UUID, PK, REFERENCES `auth.users(id)` ON DELETE CASCADE
- `name`: VARCHAR
- `dni`: VARCHAR, UNIQUE
- `telefono`, `direccion`, `localidad`: VARCHAR
- `rol`: VARCHAR, default `'user'` — `user` | `admin`
- `is_validado`: BOOLEAN, default `true` (alta automática)
- `acepto_ddjj`: BOOLEAN, default `false`
- `fecha_aceptacion_ddjj`: TIMESTAMPTZ, NULLABLE
- `created_at` / `updated_at`: TIMESTAMPTZ, default `now()`

Email, contraseña y verificación de email los gestiona Supabase Auth.

### 2. `medicamentos_habilitados` (Catálogo Oficial de Referencia / Vademécum)

Dataset de control sanitario para validar altas automáticamente desde una Edge Function (Deno) o retenerlas a revisión.

- `id`: BIGINT, PK, GENERATED ALWAYS AS IDENTITY
- `nombre_comercial`, `principio_activo`: VARCHAR
- `concentracion`, `forma_farmaceutica`, `presentacion`: VARCHAR, NULLABLE
- `requiere_receta`: BOOLEAN, default `false`
- `created_at` / `updated_at`: TIMESTAMPTZ, default `now()`

### 3. `medicamentos` (Publicaciones de Donaciones)

Unidades físicas subidas por los donantes para el catálogo comunitario.

- `id`: UUID, PK, default `gen_random_uuid()`
- `user_id`: UUID, FK → `profiles(id)`, ON DELETE CASCADE
- `nombre_comercial`, `principio_activo`: VARCHAR
- `concentracion`, `forma_farmaceutica`: VARCHAR, NULLABLE
- `cantidad_disponible`: INTEGER
- `lote`: VARCHAR, NULLABLE — trazabilidad sanitaria declarada
- `fecha_vencimiento`: DATE
- `fotos_envase`: JSONB — hasta 3 URLs de imágenes
- `descripcion`: TEXT, NULLABLE
- `estado`: VARCHAR, default `'disponible'` — `disponible` | `pendiente_revision` | `reservado` | `entregado` | `rechazado`
- `motivo_rechazo`: TEXT, NULLABLE — para alertas/mails en moderación
- `created_at` / `updated_at`: TIMESTAMPTZ, default `now()`
- Índice: `(nombre_comercial, principio_activo, estado)`

### 4. `solicitudes` (Intercambios y Trazabilidad)

Control de la reserva, receta médica y código numérico para la entrega en persona.

- `id`: UUID, PK, default `gen_random_uuid()`
- `medicamento_id`: UUID, FK → `medicamentos(id)`, ON DELETE RESTRICT
- `receptor_id`: UUID, FK → `profiles(id)`, ON DELETE CASCADE
- `es_para_tercero`: BOOLEAN, default `false`
- `nombre_destinatario_final`: VARCHAR, NULLABLE
- `receta_medica_url`: VARCHAR, NULLABLE
- `codigo_confirmacion`: VARCHAR(6) — código de 6 dígitos para retiro presencial
- `acepto_ddjj_receptor`: BOOLEAN, default `false`
- `fecha_aceptacion_ddjj`: TIMESTAMPTZ, NULLABLE
- `estado`: VARCHAR, default `'pendiente_coordinacion'` — `pendiente_coordinacion` | `en_camino` | `completado` | `cancelado`
- `fecha_entrega`: TIMESTAMPTZ, NULLABLE
- `created_at` / `updated_at`: TIMESTAMPTZ, default `now()`

### 5. `solicitud_mensajes` (Chat Realtime entre Donante y Receptor)

Mensajería de coordinación del punto de encuentro en tiempo real, con RLS: solo leen y escriben el donante y el receptor. Sin `updated_at`.

- `id`: BIGINT, PK, GENERATED ALWAYS AS IDENTITY
- `solicitud_id`: UUID, FK → `solicitudes(id)`, ON DELETE CASCADE
- `user_id`: UUID, FK → `profiles(id)`, ON DELETE CASCADE
- `mensaje`: TEXT
- `created_at`: TIMESTAMPTZ, default `now()`

---

## 4. Fases de Implementación

### Fase 1: Persistencia y Datos Semilla

- [ ] `supabase init` y `supabase link` al proyecto.
- [ ] Migraciones SQL en el orden del esquema, con trigger de creación de `profiles`.
- [ ] Políticas RLS en todas las tablas.
- [ ] Realtime sobre `solicitud_mensajes`.
- [ ] `supabase/seed.sql`: 10-15 fármacos habilitados, 2 usuarios (1 admin, 1 donante) y 5 medicamentos `disponible`.

### Fase 2: Feature Inicial

Comprobar el flujo Supabase → Vue sin Auth.

- [ ] Política RLS de lectura pública de medicamentos `disponible` con `fecha_vencimiento >= now()`.
- [ ] Catálogo en Vue con `supabase-js` y búsqueda por nombre comercial y principio activo.

### Fase 3: Autenticación y Cuentas

- [ ] Registro, login y logout con Supabase Auth.
- [ ] Registro con checkbox de Declaración Jurada y `is_validado = true` en `profiles`.
- [ ] RLS que bloquee donar y solicitar si `is_validado = false`.
- [ ] Vistas de Login, Registro y Perfil (datos e historial).

### Fase 4: Quiero Donar

- [ ] Bucket de Storage para fotos de envases (hasta 3 por publicación).
- [ ] Edge Function `publicar-medicamento`: valida contra `medicamentos_habilitados`; si coincide queda `disponible`, si no queda en `pendiente_revision` para moderación.
- [ ] Rechazo (`estado = 'rechazado'`) con `motivo_rechazo` y aviso al donante por mail.

### Fase 5: Quiero Recibir y Coordinación

- [ ] Edge Function `crear-solicitud`: reserva el medicamento, genera el código de 6 dígitos y exige receta (si `requiere_receta`), destinatario (si `es_para_tercero`) y DDJJ del receptor.
- [ ] Chat de la solicitud con suscripción Realtime en Vue.
- [ ] Edge Function `confirmar-entrega`: el donante ingresa el código → solicitud `completado`, medicamento `entregado`, `fecha_entrega` registrada.
- [ ] Cancelación de la solicitud (`cancelado`) que devuelve el medicamento a `disponible`.

### Fase 6: Panel de Administración

- [ ] Moderar donaciones en `pendiente_revision`: aprobar (`disponible`) o rechazar (`rechazado` + `motivo_rechazo`).
- [ ] Alta en `medicamentos_habilitados`.
- [ ] Suspender o rehabilitar usuarios (`is_validado`).
