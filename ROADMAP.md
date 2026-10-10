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
- [x] Migraciones SQL de las 5 tablas del dominio (5 de 5), aplicadas al proyecto remoto.
- [x] Políticas RLS de las 5 tablas y funciones auxiliares (`es_admin`, `es_participante`, `solicito_medicamento`, `participantes_solicitud`, `obtener_codigo_confirmacion`), aplicadas al proyecto remoto.
- [x] Migración `table_grants` con los permisos de tabla para los roles de la API, aplicada al proyecto remoto.
- [x] Documentación académica de la base de datos, RLS y grants en `docs/base-de-datos.md`.
- [x] Migración `realtime_solicitud_mensajes`: `solicitud_mensajes` en la publicación `supabase_realtime` (Postgres Changes), aplicada al proyecto remoto.
- [x] `supabase/seed.sql` con el vademécum Remediar, 2 usuarios de prueba y 5 donaciones `disponible`, aplicado al proyecto remoto.
- [x] Catálogo público en `/catalogo` (router mínimo, estilos mínimos): composable `useMedicamentos` con la consulta a Supabase, búsqueda y manejo de errores, y los componentes de búsqueda, grilla y card.

### Decisiones de modelo

- Autenticación con Supabase Auth: credenciales y email viven en `auth.users`; los datos de dominio en `profiles`.
- Sin puntos de entrega fijos: donante y receptor coordinan día, hora y lugar por el chat de la solicitud.
- `profiles.is_validado` arranca en `true`; el admin lo pasa a `false` para suspender una cuenta.
- `profiles.rol` e `is_validado` solo los modifica un admin (RLS / Edge Function), nunca el propio usuario.
- El chat usa Realtime Postgres Changes sobre `solicitud_mensajes`: cada suscriptor recibe solo los mensajes que su política de `select` le permite leer. Si el chat superara ~3.000 suscriptores concurrentes, conviene pasar a Broadcast.
- El seed es solo para desarrollo (contraseñas públicas): usuarios `admin@ecofarma.test` y `donante@ecofarma.test`, contraseña `EcoFarma2026!`. Los vencimientos de las donaciones se calculan desde `current_date` para que nunca queden vencidas. Incluye 2 medicamentos de control que nunca deben verse en el catálogo: uno `pendiente_revision` sin vínculo al vademécum y uno `disponible` vencido.
- El catálogo filtra en la consulta por `estado = 'disponible'` y `fecha_vencimiento >= hoy` aunque la RLS ya lo haga para `anon`, porque con sesión las políticas se suman y el donante o el admin verían también otros estados. La búsqueda por nombre comercial y principio activo se hace en memoria.
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
- El proyecto no otorga permisos por defecto a los roles de la API: cada tabla nueva necesita `GRANT` explícito para `anon` / `authenticated`, además de sus políticas RLS. `service_role` los recibe por default privileges.
- Las comprobaciones de las políticas viven en funciones `security definer` (`es_admin`, `es_participante`, `solicito_medicamento`) para evitar recursión entre las políticas de `medicamentos` y `solicitudes`.
- `solicitudes.codigo_confirmacion` no se expone al frontend (permisos por columna): el receptor lo obtiene con `rpc('obtener_codigo_confirmacion')`, así el donante no puede confirmar la entrega sin él. Por eso en `solicitudes` las consultas listan columnas en vez de `select('*')`.
- Los participantes de una solicitud solo ven el nombre del otro, con `rpc('participantes_solicitud')`; DNI, teléfono y dirección quedan ocultos.
- El usuario solo edita `telefono`, `direccion` y `localidad` de su perfil (permisos por columna).

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
| 1 | `profiles` | Creada |
| 2 | `medicamentos_habilitados` | Creada |
| 3 | `medicamentos` | Creada |
| 4 | `solicitudes` | Creada |
| 5 | `solicitud_mensajes` | Creada |

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

El orden sigue el Trello: primero lo que ya está hecho, después el Sprint Backlog y luego el Backlog en el orden de las tarjetas. En el tablero, #27 y #24 tienen el título cruzado con el contenido; cada fase de abajo usa el «Qué hacer» de la tarjeta.

Confirmar la entrega, cancelar una solicitud, dar de alta el vademécum y avisar al donante por mail no están en ninguna tarjeta. Quedan en la fase del flujo que cierran.

### Fase 1: Persistencia y Datos Semilla

Hecha. Es la base del resto y no tiene tarjeta propia en el backlog actual.

- [x] `supabase init` y `supabase link` al proyecto.
- [x] Migraciones SQL en el orden del esquema, con trigger de creación de `profiles`.
- [x] Políticas RLS en todas las tablas (sin `insert` en `solicitudes` desde el frontend), aplicadas al proyecto remoto.
- [x] Permisos de tabla para los roles de la API (migración `table_grants`).
- [x] Realtime sobre `solicitud_mensajes` (migración `realtime_solicitud_mensajes`, aplicada al proyecto remoto).
- [x] `supabase/seed.sql`: listado Remediar en `medicamentos_habilitados` (`requiere_receta = true` en antibióticos y psicofármacos), 2 usuarios (1 admin, 1 donante) y 5 medicamentos `disponible` vinculados al vademécum.

### Fase 2: Catálogo público (Trello #20, Sprint Backlog)

Consulta directa a `medicamentos` desde Vue, sin login. El clic a la ficha ya está; la vista de destino se crea en la Fase 6.

- [x] Política RLS de lectura pública de medicamentos `disponible` con `fecha_vencimiento >= current_date` (incluida en la migración `rls_policies`).
- [x] Traer solo `estado = 'disponible'` y `fecha_vencimiento >= hoy`.
- [x] Buscador reactivo (`v-model`) por `nombre_comercial` o `principio_activo`.
- [x] Grilla con cards: primera foto del envase, nombre, principio activo, concentración y fecha de vencimiento (en `/catalogo`, router y estilos mínimos).
- [x] Al hacer clic en una tarjeta, ir a `/medicamento/:id` (`RouterLink` en `MedicamentoCard.vue`). La vista de destino es la Fase 6.

### Fase 3: Autenticación y validación de usuario (Trello #19, Sprint Backlog)

Siguiente. El trigger de `profiles` ya existe (Fase 1).

- [x] Trigger PostgreSQL que inserta el usuario en `profiles` al registrarse.
- [ ] Registro, login y logout con Supabase Auth.
- [ ] Registro con DNI, teléfono, dirección y localidad; `is_validado = true`; aceptación obligatoria de Términos y DDJJ (`acepto_ddjj`, `fecha_aceptacion_ddjj`).
- [ ] Persistir la sesión en Vue.
- [ ] Proteger las rutas privadas: donar y solicitar requieren sesión.
- [ ] RLS que bloquee donar y solicitar si `is_validado = false`.

### Fase 4: Perfil de usuario (Trello #23)

- [ ] Vista `/perfil` para editar solo `telefono`, `direccion` y `localidad` (DNI y email fijos).
- [ ] Pestaña «Mis donaciones», con el estado de cada publicación.
- [ ] Pestaña «Mis solicitudes», con el estado, el código de retiro de 6 dígitos y el acceso al chat.

### Fase 5: Publicar una donación (Trello #27)

En el tablero esta tarjeta se llama «Gestión de Usuarios, Roles y Bloqueos». El contenido es el alta de una donación.

- [ ] Formulario en Vue: datos del fármaco, lote, vencimiento y hasta 3 fotos.
- [ ] Bucket de Storage para las fotos de envases.
- [ ] Edge Function `publicar-medicamento`: busca en `medicamentos_habilitados` por `principio_activo` + `concentracion` + `forma_farmaceutica`. Si coincide, guarda `medicamento_habilitado_id` y queda `disponible`. Si no, queda en `pendiente_revision` con el vínculo en `NULL`.

### Fase 6: Detalle del medicamento y solicitud (Trello #25)

- [ ] Vista `/medicamento/:id` con especificaciones y fotos, y su ruta en `src/router/index.js` (el enlace desde la tarjeta del catálogo ya existe, Fase 2).
- [ ] Botón «Solicitar»: exige sesión, `is_validado` y DDJJ del receptor.
- [ ] Edge Function `crear-solicitud` (única vía para crear solicitudes): pasa el medicamento a `reservado`, genera el código de 6 dígitos y exige receta (si `requiere_receta` del vademécum vinculado, o si no hay vínculo), destinatario (si `es_para_tercero`) y DDJJ del receptor.

### Fase 7: Chat de coordinación (Trello #29)

- [ ] Suscripción Realtime a `solicitud_mensajes`, envío de mensajes y scroll automático.
- [ ] Coordinar día, hora y lugar por el chat.
- [ ] Aviso de normas de convivencia al abrir el chat.
- [ ] Edge Function `confirmar-entrega`: el donante ingresa el código → solicitud `completado`, medicamento `entregado`, `fecha_entrega` registrada.
- [ ] Cancelación de la solicitud (`cancelado`) que devuelve el medicamento a `disponible`.

### Fase 8: Moderación de donaciones (Trello #26)

- [ ] Rutas `/admin/*` restringidas a `rol = 'admin'` (guard en Vue y verificación en RLS y Edge Functions).
- [ ] Pestañas Pendientes (con contador), Disponibles y Rechazados: ver fotos y vencimiento, corregir datos, aprobar (`disponible`, vinculando `medicamento_habilitado_id`) o rechazar (`rechazado` + motivo en `motivo_rechazo`), con aviso al donante por mail.
- [ ] Alta en `medicamentos_habilitados`.

### Fase 9: Gestión de usuarios, roles y bloqueos (Trello #24)

En el tablero esta tarjeta se llama «Formulario de publicación (Donación)». El contenido es la gestión de cuentas.

- [ ] Vista para consultar `profiles`, con búsqueda por nombre, email o DNI y filtros por estado y rol.
- [ ] Suspender o rehabilitar (`is_validado`) y promover o revocar admin. Va en una Edge Function porque el email vive en `auth.users`.

### Fase 10: Landing (Trello #18)

Última del tablero. Estilos mínimos hasta esta fase.

- [ ] Vue Router con las secciones de la arquitectura de información: Inicio, Información/Ayuda, Donar, Recibir, Sobre nosotros, Contacto y Legales.
- [ ] Home responsive con los colores y tipografías del UI Kit: propósito social y ambiental, cómo donar y cómo recibir, canales de contacto y enlaces al catálogo.
