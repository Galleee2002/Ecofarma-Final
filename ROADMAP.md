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
- [x] Base de datos limpia: eliminar las tablas que habían creado las migraciones de Laravel.
- [x] Inicializar `supabase/` con Supabase CLI (`supabase init` + `supabase link`).
- [ ] Migraciones SQL de las 5 tablas del dominio (0 de 5). **Sprint actual.**

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
- El vademécum (`medicamentos_habilitados`) se carga con el listado de medicamentos esenciales del Programa Remediar. Usa nombres genéricos, por eso su `nombre_comercial` es opcional; la marca la carga el donante en `medicamentos`.
- La coincidencia con el vademécum se busca por `principio_activo` + `concentracion` + `forma_farmaceutica`, no por nombre comercial, para que cualquier marca del mismo genérico coincida.
- `medicamentos.medicamento_habilitado_id` guarda la fila del vademécum con la que coincidió la donación. Es opcional: queda en `NULL` si no hubo coincidencia y la donación va a `pendiente_revision`.
- `requiere_receta = true` para antibióticos y psicofármacos. Si la donación no está vinculada al vademécum, se exige receta por defecto; al aprobarla, el admin la vincula a una fila del vademécum.
- La app solo verifica que se haya subido la foto de la receta, no su autenticidad; la responsabilidad queda cubierta por la DDJJ del receptor.
- `solicitudes` no tiene política RLS de `insert` para el frontend: solo se crean desde la Edge Function `crear-solicitud`, para que no se pueda saltear la validación de receta.

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
Orden de creación: `profiles`, `medicamentos_habilitados` → `medicamentos` → `solicitudes` → `solicitud_mensajes`. Una migración por tabla.

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

Dataset de control sanitario para validar altas automáticamente desde una Edge Function (Deno) o retenerlas a revisión. Se carga con el listado de medicamentos esenciales del Programa Remediar.

- `id`: BIGINT, PK, GENERATED ALWAYS AS IDENTITY
- `nombre_comercial`: VARCHAR, NULLABLE — Remediar usa nombres genéricos
- `principio_activo`: VARCHAR
- `concentracion`, `forma_farmaceutica`, `presentacion`: VARCHAR, NULLABLE
- `requiere_receta`: BOOLEAN, default `false` — `true` en antibióticos y psicofármacos
- `created_at` / `updated_at`: TIMESTAMPTZ, default `now()`

### 3. `medicamentos` (Publicaciones de Donaciones)

Unidades físicas subidas por los donantes para el catálogo comunitario.

- `id`: UUID, PK, default `gen_random_uuid()`
- `user_id`: UUID, FK → `profiles(id)`, ON DELETE CASCADE
- `medicamento_habilitado_id`: BIGINT, FK → `medicamentos_habilitados(id)`, ON DELETE SET NULL, NULLABLE — fila del vademécum con la que coincidió
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
- Índices: `(nombre_comercial, principio_activo, estado)`, `user_id` y `medicamento_habilitado_id`

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

Tareas tomadas del tablero de Trello (Sprint Backlog, To Do y Backlog), adaptadas de Laravel a Supabase.

### Fase 1: Persistencia y Datos Semilla (Sprint Backlog)

- [x] `supabase init` y `supabase link` al proyecto.
- [ ] Migraciones SQL en el orden del esquema, con trigger de creación de `profiles`.
- [ ] Políticas RLS en todas las tablas (sin `insert` en `solicitudes` desde el frontend).
- [ ] Realtime sobre `solicitud_mensajes`.
- [ ] `supabase/seed.sql`: listado Remediar en `medicamentos_habilitados` (`requiere_receta = true` en antibióticos y psicofármacos), 2 usuarios (1 admin, 1 donante) y 5 medicamentos `disponible` vinculados al vademécum.

### Fase 2: Landing y Catálogo Público (To Do)

Comprobar el flujo Supabase → Vue sin Auth.

- [ ] Vue Router con las secciones de la arquitectura de información: Inicio, Información/Ayuda, Donar, Recibir, Sobre nosotros, Contacto y Legales.
- [ ] Landing responsive: propuesta de valor, cómo funciona donar y recibir, y canales de contacto.
- [ ] Política RLS de lectura pública de medicamentos `disponible` con `fecha_vencimiento >= now()`.
- [ ] Catálogo tipo vidriera (sin checkout) con `supabase-js`: cards y búsqueda reactiva por nombre comercial y principio activo.
- [ ] Detalle del medicamento.

### Fase 3: Autenticación y Cuentas

- [ ] Registro, login y logout con Supabase Auth.
- [ ] Registro con datos de contacto, DNI validado y aceptación obligatoria de Términos y DDJJ (`acepto_ddjj`, `fecha_aceptacion_ddjj`); `is_validado = true`.
- [ ] Guards de Vue Router: donar y solicitar requieren sesión.
- [ ] RLS que bloquee donar y solicitar si `is_validado = false`.
- [ ] Vista Perfil con pestañas:
  - Datos: solo se editan `telefono`, `direccion` y `localidad` (DNI y email fijos).
  - Mis donaciones: estado de cada publicación con badges.
  - Mis solicitudes: estado, código de 6 dígitos y acceso al chat.

### Fase 4: Quiero Donar

- [ ] Formulario de publicación en Vue (datos del fármaco, lote, vencimiento y hasta 3 fotos).
- [ ] Bucket de Storage para fotos de envases.
- [ ] Edge Function `publicar-medicamento`: busca en `medicamentos_habilitados` por `principio_activo` + `concentracion` + `forma_farmaceutica`; si coincide guarda `medicamento_habilitado_id` y queda `disponible`, si no queda en `pendiente_revision` con el vínculo en `NULL`.

### Fase 5: Quiero Recibir y Coordinación

- [ ] Botón "Solicitar" en el detalle: exige sesión, `is_validado` y DDJJ del receptor.
- [ ] Edge Function `crear-solicitud` (única vía para crear solicitudes): reserva el medicamento, genera el código de 6 dígitos y exige receta (si `requiere_receta` del vademécum vinculado, o si no hay vínculo), destinatario (si `es_para_tercero`) y DDJJ del receptor.
- [ ] Chat de la solicitud con suscripción Realtime, scroll automático y aviso de normas de convivencia al abrirlo.
- [ ] Edge Function `confirmar-entrega`: el donante ingresa el código → solicitud `completado`, medicamento `entregado`, `fecha_entrega` registrada.
- [ ] Cancelación de la solicitud (`cancelado`) que devuelve el medicamento a `disponible`.

### Fase 6: Panel de Administración

- [ ] Rutas `/admin/*` restringidas a `rol = 'admin'` (guard en Vue + verificación en RLS y Edge Functions).
- [ ] Moderación con pestañas Pendientes (con contador), Disponibles y Rechazados: ver fotos, corregir datos y aprobar (`disponible`, vinculando `medicamento_habilitado_id`) o rechazar (`rechazado` + motivo predefinido en `motivo_rechazo`), con aviso al donante por mail.
- [ ] Alta en `medicamentos_habilitados`.
- [ ] Gestión de usuarios: padrón con búsqueda por nombre, email o DNI y filtros por estado y rol; suspender o rehabilitar (`is_validado`) y promover o revocar admin. Va en una Edge Function porque el email vive en `auth.users`.
