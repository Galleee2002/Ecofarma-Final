# ROADMAP.md — EcoFARMA (MVP)

Seguimiento técnico del proyecto: estado, esquema de base de datos y fases de implementación.

---

## 1. Stack

- **Frontend:** Vue 3 (SPA) + Tailwind CSS, con Vite
- **Backend:** Supabase: PostgreSQL, Auth, Storage y Realtime (chat)
- **Lógica de servidor:** Supabase Edge Functions en Deno (JavaScript)
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
- [x] Registro, login y logout en `/registro` y `/login` (estilos mínimos): composable `useAuth`, formularios en `components/auth/` y `BarraNavegacion` con el usuario y «Cerrar sesión».
- [x] Migración `validar_registro`: `handle_new_user` rechaza el alta sin DDJJ aceptada o sin datos obligatorios, aplicada al proyecto remoto.
- [x] Fase 4 (estilos mínimos): sesión persistida en el guard, rutas protegidas con `meta.requiereSesion` / `meta.soloInvitados`, y `/perfil` con edición de datos y pestañas «Mis donaciones» y «Mis solicitudes» (composables `usePerfil`, `useDonaciones`, `useSolicitudes`).
- [x] Fase 5 (estilos mínimos): formulario de donación en `/donar` con sugerencias del vademécum (`useVademecum`), bucket `fotos-envases` (migración `bucket_fotos_envases`) y Edge Function `publicar-medicamento` en JavaScript. Pendiente aplicarlas al proyecto remoto (`db push` y `functions deploy`).
- [x] Fase 6 (estilos mínimos): vista pública `/medicamento/:id`, botón «Solicitar» con gates, bucket `recetas-medicas` (migración `bucket_recetas_medicas`) y Edge Function `crear-solicitud` en JavaScript. Pendiente aplicarlas al proyecto remoto (`db push` y `functions deploy crear-solicitud`).
- [x] Fase 8 (estilos mínimos): rutas `/admin/*` con guard de `rol = 'admin'`, pestañas de moderación y alta del vademécum, Edge Functions `moderar-donacion` y `alta-medicamento-habilitado` en JavaScript. Pendiente desplegarlas al proyecto remoto (`functions deploy`).
- [ ] Frontend de las funcionalidades actuales: decidir la estructura de carpetas con el equipo y empezar. Inventario y endpoints en la sección 5.

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
| `primary` | `#215B8D` | Corporativo: Azul Océano |
| `secondary` | `#309AE6` | Corporativo: Azul Dodger |
| `icon` | `#52806C` | Corporativo: Verde Mar |
| `success` | `#43B75D` | Contextual: Césped Artificial (éxito) |
| `danger` | `#FF3C3C` | Contextual: Rojo Coral (error / acciones destructivas) |
| `warning` | `#FFAA00` | Contextual: Ámbar (advertencia) |
| `background` | `#EEF4F6` | Contextual: Blanco Hielo (fondo de página) |
| `foreground` | `#1A1A1A` | Contextual: Negro (texto) |
| `muted` | `#6C757D` | Contextual: Muted Gray (informativo / texto secundario) |

### Pendiente: componentes shadcn/vue

Los componentes de `src/components/ui` ya están copiados. El catálogo, el detalle y la solicitud, el ingreso, el registro, el perfil, publicar donación, el chat, la moderación, el alta del vademécum y la barra de navegación usan esos componentes con los tokens de esta sección. La moderación usa **Select** para vincular una fila del vademécum. `secondary` e `icon` se usan en los enlaces activos de la barra, el saludo y las fechas de vencimiento. Gestión de usuarios y la landing siguen sin maquetar.

Cuando se pida, se puede sumar sin cambiar el stack (Vue 3, Vite, Tailwind CSS 4, JavaScript y pnpm):

- El CLI copia cada componente al proyecto (por ejemplo `src/components/ui`). No es un paquete cerrado.
- Los componentes se generan en JavaScript (`typescript: false` en `components.json`). El proyecto sigue sin TypeScript.
- Se conservan `src/style.css`, los tokens de esta sección y las fuentes de `index.html`. El init no reemplaza ese archivo.
- El alias `@` en Vite y un `jsconfig.json` alcanzan para los imports. Siguen siendo Vue, Vite y Tailwind.
- Las dependencias de apoyo (`reka-ui`, `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-vue-next`) acompañan a los componentes. No reemplazan Vue, Vite ni Tailwind.

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

Consulta directa a `medicamentos` desde Vue, sin login. El clic a la ficha ya está; la vista de destino se crea en la Fase 6. La pantalla `/catalogo` usa `Input`, `Label`, `Card`, `Alert` y `Button` de `src/components/ui`. La consulta, el filtro y la búsqueda siguen en `useMedicamentos`.

- [x] Política RLS de lectura pública de medicamentos `disponible` con `fecha_vencimiento >= current_date` (incluida en la migración `rls_policies`).
- [x] Traer solo `estado = 'disponible'` y `fecha_vencimiento >= hoy`.
- [x] Buscador reactivo (`v-model`) por `nombre_comercial` o `principio_activo`.
- [x] Grilla con cards: primera foto del envase, nombre, principio activo, concentración y fecha de vencimiento (en `/catalogo`, router y estilos mínimos).
- [x] Al hacer clic en una tarjeta, ir a `/medicamento/:id` (`RouterLink` en `MedicamentoCard.vue`). La vista de destino es la Fase 6.

### Fase 3: Autenticación y validación de usuario (Trello #19, Sprint Backlog)

Hecha. Los guards de rutas pasaron a la Fase 4.

Decisiones tomadas:

- La confirmación de email está desactivada en el proyecto remoto: `signUp` devuelve la sesión y el usuario queda logueado al registrarse, sin mail de confirmación ni redirect URLs.
- DNI repetido: el error del trigger llega genérico («Database error saving new user»), así que se muestra un mensaje general («No pudimos crear la cuenta. Verificá que el DNI no esté registrado.»). No se agrega una RPC pública para consultar DNIs, porque permitiría averiguar qué DNIs están registrados.
- La DDJJ y los datos obligatorios también se validan en la base, no solo en el formulario: como `signUp` se puede llamar directo contra la API, una migración nueva reemplaza `handle_new_user` para cancelar el registro si `acepto_ddjj` no es `true` o falta `name`, `dni`, `telefono`, `direccion` o `localidad`. Los usuarios del seed ya traen esos metadatos.
- Rama de trabajo: `feature03/autenticacion`, creada desde `dev`.
- `useAuth` comparte entre vistas la sesión, el perfil y el último mensaje (`mensajeExito` + `tipoMensaje`); `cargando` y `error` son propios de cada vista, para que el error de una pantalla no aparezca en otra.
- La sesión se escucha solo con `onAuthStateChange`: el evento `INITIAL_SESSION` trae la sesión guardada al recargar, sin llamar a `getSession`. El perfil se carga con `setTimeout` fuera del callback (recomendación de Supabase para no trabar el cliente) y solo cuando cambia el usuario, no en cada renovación del token.
- El perfil se consulta con todas sus columnas de dominio aunque hoy solo se muestra `name`: `dni`, `telefono`, `direccion` y `localidad` se usan en la Fase 4 y `rol` / `is_validado` en los guards y el admin.
- Los mensajes de registro e ingreso usan `success`; el de cierre de sesión usa `danger` por decisión del equipo.
- `is_validado` para donar y solicitar: no se agrega una política RLS nueva. Donar y solicitar solo se hacen con las Edge Functions `publicar-medicamento` y `crear-solicitud`, que usan la `service_role` key y no pasan por RLS; por eso cada Edge Function lee el perfil del usuario del JWT y responde 403 con `{ "error": "..." }` si `is_validado = false`. RLS ya cubre la otra vía: sin políticas de `INSERT` en `medicamentos` ni en `solicitudes`, nadie puede insertar directo con la `anon` key.
- Email rechazado por Supabase (`email_address_invalid`): Supabase Auth bloquea direcciones que considera falsas o no entregables aunque el formato sea correcto (por ejemplo, `holamundo@gmail.com`). Para probar el registro usar emails reales.
- Persistir la sesión en los guards y proteger las rutas privadas pasan a la Fase 4: todavía no existe ninguna ruta privada, y `/perfil` es la primera. Se hacen en la misma rama que el perfil, para probar el guard con una ruta real en lugar de una vista de prueba.

- [x] Trigger PostgreSQL que inserta el usuario en `profiles` al registrarse.
- [x] Registro, login y logout con Supabase Auth.
- [x] Registro con DNI, teléfono, dirección y localidad; `is_validado = true`; aceptación obligatoria de Términos y DDJJ (`acepto_ddjj`, `fecha_aceptacion_ddjj`), validada en el formulario y en el trigger (migración `validar_registro`).
- [x] Donar y solicitar bloqueados para usuarios con `is_validado = false`: RLS ya impide los inserts directos desde el frontend, porque `medicamentos` y `solicitudes` no tienen políticas de `INSERT`. La validación de `is_validado` se hace en las Edge Functions `publicar-medicamento` (Fase 5) y `crear-solicitud` (Fase 6).

### Fase 4: Perfil de usuario (Trello #23)

Hecha. Incluye los guards de rutas que venían de la Fase 3. Rama de trabajo: `feature04/<nombre>`, creada desde `dev`. El acceso al chat desde «Mis solicitudes» pasó a la Fase 7.

Decisiones tomadas:

- El router espera la sesión guardada antes de cada navegación: `useAuth` expone `esperarSesionInicial()`, que devuelve una promesa resuelta al llegar el evento `INITIAL_SESSION` de `onAuthStateChange` (sin llamar a `getSession`). Si no hay sesión guardada, el evento llega igual con `null`, así que la navegación nunca queda trabada.
- La escucha de la sesión se inicia desde el `router.beforeEach` y no desde `App.vue`, porque la primera navegación arranca con `app.use(router)`, antes de que se monte `App.vue`.
- El guard usa dos `meta` en las rutas: `requiereSesion` (sin sesión redirige a `/login`) y `soloInvitados` (`/login` y `/registro`; con sesión redirige al catálogo). Es una ayuda de navegación: la protección real de los datos sigue en RLS y en las Edge Functions.
- Al mandar a `/login`, el guard guarda la ruta pedida en `?redirect=`. Después de ingresar, `LoginView` vuelve a esa ruta si empieza con `/`; si no hay `redirect`, va al catálogo. El registro siempre va al catálogo.
- `useAuth` expone `errorPerfil` para distinguir "cargando" de "falló la consulta del perfil" y mostrar un mensaje con `danger` en vez de quedarse cargando.
- `/perfil` tiene tres pestañas («Mis datos», «Mis donaciones», «Mis solicitudes») manejadas con un `ref` en `PerfilView`. Las listas se cargan la primera vez que se abre su pestaña.
- Un composable por dominio: `usePerfil` (editar datos), `useDonaciones` (en la Fase 5 suma publicar) y `useSolicitudes` (en la Fase 6 suma crear). Los componentes de la vista viven en `components/perfil/`.
- La edición de datos hace `update` directo sobre `profiles`, sin Edge Function: RLS limita al propio perfil y los permisos por columna solo dejan tocar `telefono`, `direccion` y `localidad`. El `update` devuelve la fila y reemplaza el `perfil` compartido de `useAuth`, así la barra y la vista se actualizan solas.
- «Mis donaciones» filtra por `user_id` y «Mis solicitudes» por `receptor_id` aunque RLS ya limite las filas, porque las políticas se suman y un admin vería todo.
- El código de retiro se pide con `rpc('obtener_codigo_confirmacion')` solo para las solicitudes en `pendiente_coordinacion` o `en_camino`, una llamada por solicitud. Si falla el código de una, esa solicitud muestra un aviso con `warning` y el resto de la lista se ve igual.
- «Mis solicitudes» muestra solo las solicitudes donde el usuario es receptor. Las solicitudes que recibe como donante se ven por el estado `reservado` de sus donaciones; su gestión llega con el chat (Fase 7).

- [x] Persistir la sesión en Vue: `supabase-js` guarda la sesión en `localStorage`, `useAuth` la escucha con `onAuthStateChange` y el `router.beforeEach` espera `esperarSesionInicial()` antes de decidir, para que al recargar una ruta privada el guard no vea la sesión vacía.
- [x] Guard de rutas (`router.beforeEach`): una ruta con `meta.requiereSesion` sin sesión redirige a `/login?redirect=<ruta>`. `/perfil` es la primera ruta protegida; las de donar (Fase 5) y solicitar (Fase 6) solo agregan ese `meta`.
- [x] `/login` y `/registro` (`meta.soloInvitados`) redirigen al catálogo si ya hay sesión.
- [x] Vista `/perfil` para editar solo `telefono`, `direccion` y `localidad` (DNI y email fijos).
- [x] Pestaña «Mis donaciones», con el estado de cada publicación y el motivo si fue rechazada.
- [x] Pestaña «Mis solicitudes», con el estado y el código de retiro de 6 dígitos. El acceso al chat se agrega en la Fase 7.

### Fase 5: Publicar una donación (Trello #27)

En el tablero esta tarjeta se llama «Gestión de Usuarios, Roles y Bloqueos». El contenido es el alta de una donación.

Decisiones tomadas:

- Rama de trabajo: `feature05/publicar-donacion`, creada desde `dev`. Cubre toda la fase.
- El formulario vive en `/donar` (`meta.requiereSesion`), con `DonarView` y `components/donaciones/FormularioDonacion`. La barra de navegación muestra «Donar» solo con sesión.
- Principio activo, concentración y forma farmacéutica son inputs de texto con sugerencias del vademécum (`<datalist>`), para que el donante use los mismos valores que `medicamentos_habilitados` y la Edge Function encuentre la coincidencia exacta. Puede escribir otro valor; en ese caso la donación irá a `pendiente_revision`. Las sugerencias de concentración y forma se filtran por el principio activo escrito.
- Las sugerencias se cargan con el composable `useVademecum` (lo reutiliza el admin en la Fase 8). Si fallan, se avisa con `warning` y el formulario sigue usable.
- Obligatorios: nombre comercial, principio activo, cantidad (entero mayor o igual a 1), fecha de vencimiento posterior a hoy y al menos 1 foto. Lote, concentración, forma farmacéutica y descripción son opcionales, como en la tabla.
- Fotos: de 1 a 3, solo JPG, PNG o WEBP, hasta 5 MB cada una, con previsualización y botón para quitar.
- La validación vive en `useDonaciones` (`validarDonacion`), igual que el registro en `useAuth`, y la Edge Function la repite del lado del servidor.
- Si el perfil tiene `is_validado = false`, el formulario muestra un aviso con `warning` y deshabilita el botón. Es una ayuda visual: la validación real queda en la Edge Function.
- Las Edge Functions se escriben en JavaScript simple (decisión del equipo, ver `AGENTS.md`). Cada una se registra en `supabase/config.toml` con `entrypoint` a su `index.js`, porque la CLI busca `index.ts` por defecto.
- Bucket `fotos-envases` público (migración `bucket_fotos_envases`): la foto de un envase no es un dato sensible y el catálogo la muestra sin login. Límite de 5 MB y solo JPG, PNG o WEBP, también del lado del servidor. Las recetas de la Fase 6 van en otro bucket privado.
- Cada usuario sube, ve y borra solo dentro de su carpeta (`<user_id>/<uuid>.<extensión>`), con políticas de `insert`, `select` y `delete` sobre `storage.objects`. No hay política de `update`: las fotos no se reemplazan.
- El frontend sube las fotos y después invoca `publicar-medicamento` con sus URLs. La función solo acepta URLs públicas del bucket dentro de la carpeta del usuario del JWT. Si la función o una subida fallan, el frontend borra las fotos ya subidas.
- `publicar-medicamento` tiene `verify_jwt = false`: el proyecto usa las claves nuevas (`sb_publishable_...`), que no son compatibles con la verificación automática del gateway. La función valida el JWT con `auth.getUser(token)` y responde 401 si no hay sesión.
- La coincidencia con el vademécum es exacta (`.eq` sobre los tres campos), no con `ilike`, porque el `%` de valores como «2 %» actuaría de comodín. Sin concentración o sin forma farmacéutica no hay coincidencia y la donación va a `pendiente_revision`.
- La fecha de hoy en la Edge Function se calcula con la zona horaria de Argentina, para no rechazar vencimientos válidos por la diferencia con UTC.
- Al publicar, `disponible` se avisa con `success` y `pendiente_revision` con `muted`. El formulario se vacía cambiando su `key`.

- [x] Formulario en Vue: datos del fármaco, lote, vencimiento y hasta 3 fotos (estilos mínimos).
- [x] Bucket de Storage `fotos-envases` para las fotos de envases (migración `bucket_fotos_envases`).
- [x] Edge Function `publicar-medicamento`: rechaza la publicación si el donante tiene `is_validado = false` (decisión de la Fase 3). Busca en `medicamentos_habilitados` por `principio_activo` + `concentracion` + `forma_farmaceutica`. Si coincide, guarda `medicamento_habilitado_id` y queda `disponible`. Si no, queda en `pendiente_revision` con el vínculo en `NULL`.

### Fase 6: Detalle del medicamento y solicitud (Trello #25)

Decisiones tomadas:

- Rama de trabajo: `feature06/detalle-solicitar`, creada desde `dev`. Cubre la vista de detalle, el botón «Solicitar» y la Edge Function `crear-solicitud`.
- La ruta `/medicamento/:id` (`name: 'medicamento-detalle'`) es pública: no usa `meta.requiereSesion`. El login se exige solo al intentar solicitar, con `redirect` de vuelta al detalle.
- La vista es `MedicamentoDetalleView`; los datos los carga `useMedicamentos.cargarMedicamentoPorId` con el mismo filtro del catálogo (`disponible` y no vencido), campos extra `lote` y `descripcion`, y el join a `medicamentos_habilitados(requiere_receta)` para mostrar el input de receta. Si no hay fila, el mensaje es personalizado (`danger`).
- El detalle visual vive en `components/medicamentos/DetalleMedicamento`. El CTA vive en `PanelSolicitar` (tercero, receta si aplica, DDJJ) y llama a `useSolicitudes.crearSolicitud`.
- Sin sesión: CTA «Iniciar sesión para solicitar» → `/login?redirect=<ruta>`. Con sesión y `is_validado = false`: aviso `warning` y botón deshabilitado (mismo patrón que donar). Con sesión validada: checkbox de DDJJ del receptor; el botón «Solicitar» solo se habilita si está marcado (y si aplica, con receta y destinatario).
- Bucket `recetas-medicas` privado (migración `bucket_recetas_medicas`): 5 MB, solo JPG, PNG o WEBP. Cada usuario sube, ve y borra solo en su carpeta (`<user_id>/<uuid>.<extensión>`). El frontend sube la receta (si hace falta) y después invoca `crear-solicitud` con la URL de `getPublicUrl`; si la función falla, borra el archivo subido.
- `crear-solicitud` tiene `verify_jwt = false` (mismo motivo que `publicar-medicamento`): valida el JWT con `auth.getUser(token)`. Rechaza si `is_validado = false`, si el receptor es el donante, si falta DDJJ, si falta destinatario con `es_para_tercero`, o si falta receta cuando no hay vínculo al vademécum o `requiere_receta = true`. Reserva el medicamento con `update … where estado = 'disponible'` (si 0 filas → 409). Genera el código de 6 dígitos y no lo devuelve en la respuesta: el receptor lo ve en «Mis solicitudes» con `rpc('obtener_codigo_confirmacion')`. Si el insert de la solicitud falla, revierte el medicamento a `disponible`.
- Pendiente en remoto: `pnpm supabase db push` y `pnpm supabase functions deploy crear-solicitud`.

- [x] Vista `/medicamento/:id` con especificaciones y fotos, y su ruta en `src/router/index.js` (el enlace desde la tarjeta del catálogo ya existe, Fase 2).
- [x] Botón «Solicitar»: exige sesión, `is_validado` y DDJJ del receptor.
- [x] Edge Function `crear-solicitud` (única vía para crear solicitudes): rechaza la solicitud si el receptor tiene `is_validado = false` (decisión de la Fase 3), pasa el medicamento a `reservado`, genera el código de 6 dígitos y exige receta (si `requiere_receta` del vademécum vinculado, o si no hay vínculo), destinatario (si `es_para_tercero`) y DDJJ del receptor.

### Fase 7: Chat de coordinación (Trello #29)

Decisiones tomadas:

- Rama de trabajo: `feature07/chat-coordinacion`, creada desde `dev`. Cubre el chat y el cierre de la solicitud.
- Confirmar y cancelar no cambian el esquema: `authenticated` no puede hacer `UPDATE` de `solicitudes` ni de `medicamentos`, así que ambas acciones son Edge Functions con `service_role`, el mismo patrón que `crear-solicitud` (`verify_jwt = false` y validación del JWT con `auth.getUser`).
- `confirmar-entrega` la usa solo el donante (`medicamentos.user_id`). Recibe el código de 6 dígitos, lo compara con `codigo_confirmacion` y no lo devuelve. Si coincide y la solicitud está en `pendiente_coordinacion` o `en_camino` con el medicamento `reservado`, la solicitud pasa a `completado` con `fecha_entrega` y el medicamento a `entregado`.
- `cancelar-solicitud` la puede usar el donante o el receptor, desde el chat, en esos mismos estados. La solicitud pasa a `cancelado` y el medicamento vuelve a `disponible`.
- Las dos actualizaciones son condicionales. Si el medicamento no cambia, la función vuelve la solicitud al estado anterior.
- La cuenta con `is_validado = false` no puede confirmar ni cancelar. El paso a `en_camino` no se implementa en esta fase: confirmar y cancelar valen desde `pendiente_coordinacion`.
- En el chat, el donante ve el formulario del código y las dos partes ven la cancelación, con una confirmación en la misma pantalla. Al terminar, el chat se recarga y deja de admitir mensajes.

- [x] Suscripción Realtime a `solicitud_mensajes`, envío de mensajes y scroll automático.
- [x] Botón de acceso al chat desde «Mis solicitudes» (`components/perfil/ListaMisSolicitudes.vue`) y desde las donaciones `reservado` del donante.
- [x] Coordinar día, hora y lugar por el chat.
- [x] Aviso de normas de convivencia al abrir el chat.
- [x] Edge Function `confirmar-entrega`: el donante ingresa el código → solicitud `completado`, medicamento `entregado`, `fecha_entrega` registrada.
- [x] Cancelación de la solicitud (`cancelado`) que devuelve el medicamento a `disponible`.

### Fase 8: Moderación de donaciones (Trello #26)

Hecha. Rama de trabajo: `feature08/moderacion-donaciones`, creada desde `dev`.

Decisiones tomadas:

- El aviso al donante por mail no se implementa en esta fase: no hay servicio de correo. Al aprobar, la donación pasa a `disponible` y el donante la ve en «Mis donaciones». Al rechazar, se guarda `motivo_rechazo` y esa pestaña ya muestra el motivo. No hay tabla de alertas.
- Las rutas `/admin/donaciones` y `/admin/vademecum` usan `meta.requiereSesion` y `meta.requiereAdmin`. El guard espera `esperarPerfil()` porque el perfil se carga después de la sesión. Sin sesión va a `/login?redirect=`. Si falla el perfil, no entra y se muestra `errorPerfil`. Si el `rol` no es `admin`, va al catálogo con un aviso `warning`.
- `authenticated` solo tiene `SELECT` sobre `medicamentos` y `medicamentos_habilitados`: no hay políticas de `INSERT` ni `UPDATE`. Las escrituras van en Edge Functions con `service_role`, el mismo patrón que `publicar-medicamento` (`verify_jwt = false` y validación del JWT con `auth.getUser`).
- `moderar-donacion` solo acepta donaciones en `pendiente_revision`, `disponible` o `rechazado`. Corregir actualiza los datos del fármaco sin tocar fotos, `user_id`, `estado` ni el vínculo. Aprobar deja `disponible`, guarda `medicamento_habilitado_id` y limpia `motivo_rechazo`. Rechazar exige un motivo y deja `rechazado`.
- `alta-medicamento-habilitado` exige `principio_activo`. Si ya existe la misma combinación de principio activo, concentración y forma, no inserta y avisa para usar esa fila al aprobar.
- `useVademecum` ahora trae el `id` de cada fila para el desplegable de aprobación. Las sugerencias de `/donar` siguen usando los mismos campos.
- Pendiente en remoto: `pnpm supabase functions deploy moderar-donacion` y `pnpm supabase functions deploy alta-medicamento-habilitado`.

- [x] Rutas `/admin/*` restringidas a `rol = 'admin'` (guard en Vue y verificación en RLS y Edge Functions).
- [x] Pestañas Pendientes (con contador), Disponibles y Rechazados: ver fotos y vencimiento, corregir datos, aprobar (`disponible`, vinculando `medicamento_habilitado_id`) o rechazar (`rechazado` + motivo en `motivo_rechazo`). El donante ve el resultado en «Mis donaciones»; el mail queda para más adelante.
- [x] Alta en `medicamentos_habilitados`.

### Fase 9: Gestión de usuarios, roles y bloqueos (Trello #24)

En el tablero esta tarjeta se llama «Formulario de publicación (Donación)». El contenido es la gestión de cuentas.

- [ ] Vista para consultar `profiles`, con búsqueda por nombre, email o DNI y filtros por estado y rol.
- [ ] Suspender o rehabilitar (`is_validado`) y promover o revocar admin. Va en una Edge Function porque el email vive en `auth.users`.

### Fase 10: Landing (Trello #18)

Última del tablero. Estilos mínimos hasta esta fase.

- [ ] Vue Router con las secciones de la arquitectura de información: Inicio, Información/Ayuda, Donar, Recibir, Sobre nosotros, Contacto y Legales.
- [ ] Home responsive con los colores y tipografías del UI Kit: propósito social y ambiental, cómo donar y cómo recibir, canales de contacto y enlaces al catálogo.

---

## 5. Pendiente: frontend de las funcionalidades actuales

To-do sin fecha. Con la Fase 4 cerrada, las funcionalidades de las Fases 2 a 4 ya andan con estilos mínimos; falta construir su frontend definitivo. Esta sección junta lo que hace falta saber para empezar.

- [ ] Definir con el equipo dónde vive el frontend (decisión pendiente).
- [ ] Construir el frontend de las funcionalidades del inventario de abajo.

### Decisión pendiente: estructura de carpetas

- **Opción A, la actual:** un solo proyecto con `src/` (Vue) en la raíz y `supabase/` al lado. No hay que mover nada.
- **Opción B:** separar en `/frontend` (Vue + Vite + Tailwind, con su `package.json`) y `/backend` (carpeta `supabase/` con migraciones, seed y Edge Functions).
- Si se elige la B, antes de empezar:
  - Mover los archivos y actualizar la sección «Estructura» y los «Comandos» de `AGENTS.md`.
  - Definir desde qué carpeta se corre `pnpm supabase` (la CLI es dependencia del proyecto).
  - Mover `.env.local` a `/frontend`.
  - Revisar los imports relativos.

### Inventario de lo que ya existe

Rutas actuales en `src/` (si se elige la opción B, quedan dentro de `/frontend/src/`). Todo consume Supabase con el cliente único de `src/lib/supabase.js` y la `anon` key; RLS decide qué filas ve cada usuario.

| Funcionalidad | Ruta | Vista y componentes | Composable | Qué consume de Supabase |
|---|---|---|---|---|
| Catálogo público | `/catalogo` | `CatalogoView`, `components/medicamentos/` (`MedicamentoSearch`, `MedicamentoGrid`, `MedicamentoCard`) | `useMedicamentos` | `select` de `medicamentos` con `estado = 'disponible'` y `fecha_vencimiento >= hoy` |
| Registro | `/registro` | `RegistroView`, `components/auth/FormularioRegistro` | `useAuth` | `auth.signUp` con metadatos (`name`, `dni`, `telefono`, `direccion`, `localidad`, `acepto_ddjj`); el trigger `handle_new_user` crea el perfil |
| Login | `/login` | `LoginView`, `components/auth/FormularioLogin` | `useAuth` | `auth.signInWithPassword`; acepta `?redirect=` |
| Sesión y logout | todas | `components/layout/BarraNavegacion` | `useAuth` | `auth.onAuthStateChange` (`INITIAL_SESSION`), `auth.signOut`, `select` del propio perfil en `profiles` |
| Mis datos | `/perfil` | `PerfilView`, `components/perfil/FormularioPerfil` | `usePerfil` | `update` de `profiles` (solo `telefono`, `direccion`, `localidad`) |
| Mis donaciones | `/perfil` | `components/perfil/ListaMisDonaciones` | `useDonaciones` | `select` de `medicamentos` por `user_id`; si está `reservado`, `select` de la solicitud en `pendiente_coordinacion` o `en_camino` |
| Mis solicitudes | `/perfil` | `components/perfil/ListaMisSolicitudes` | `useSolicitudes` | `select` de `solicitudes` por `receptor_id` (columnas explícitas) y `rpc('obtener_codigo_confirmacion')` |
| Chat de una solicitud | `/solicitud/:solicitudId/chat` | `ChatView`, `components/chat/` (`ListaMensajes`, `FormularioMensaje`, `FormularioEncuentro`, `FormularioConfirmarEntrega`, `PanelCancelarSolicitud`) | `useMensajes`, `useSolicitudes` | `select` de `solicitudes` y de `solicitud_mensajes`, `rpc('participantes_solicitud')`, `insert` de mensajes (el encuentro se propone con un mensaje armado desde el formulario), Realtime `postgres_changes`, `functions.invoke('confirmar-entrega')` y `functions.invoke('cancelar-solicitud')` |
| Solicitar medicamento | `/medicamento/:id` | `components/medicamentos/PanelSolicitar` | `useSolicitudes.crearSolicitud` | Storage `recetas-medicas` + Edge Function `crear-solicitud` |
| Publicar donación | `/donar` | `DonarView`, `components/donaciones/FormularioDonacion` | `useVademecum`, `useDonaciones` | `select` de `medicamentos_habilitados` para las sugerencias; `upload` y `remove` en el bucket `fotos-envases`; `functions.invoke('publicar-medicamento')` |
| Moderación de donaciones | `/admin/donaciones` | `AdminDonacionesView`, `components/admin/` (`ListaModeracion`, `TarjetaModeracion`) | `useModeracion`, `useVademecum` | `select` de `medicamentos` en `pendiente_revision`, `disponible` y `rechazado` (join a `profiles.name`); `functions.invoke('moderar-donacion')` |
| Alta del vademécum | `/admin/vademecum` | `AdminVademecumView`, `components/admin/FormularioAltaVademecum` | `useVademecum` | `functions.invoke('alta-medicamento-habilitado')` |
| Guard de rutas | todas | `src/router/index.js` | `useAuth` | `meta.requiereSesion` → `/login?redirect=`; `meta.soloInvitados` → catálogo; `meta.requiereAdmin` espera el perfil y redirige al catálogo si `rol` no es `admin` |

### Endpoints que todavía no existen

El frontend los va a consumir cuando se hagan sus fases:

- Gestión de usuarios para el admin (Fase 9).

### Reglas a mantener

Siguen valiendo las de `AGENTS.md`:

- La lógica de datos queda en los composables; las vistas pasan los datos por props.
- Colores solo con tokens de `src/style.css`.
- Mensajes personalizados en español con su color (`danger`, `success`, `warning`, `muted`), sin mostrar errores crudos.
- No exponer la `service_role` key.
