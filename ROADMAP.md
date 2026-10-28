# ROADMAP — EcoFARMA (MVP)

Estado del proyecto, decisiones que siguen vigentes, esquema y lo que falta. Las reglas de trabajo están en `AGENTS.md`. La protección de los datos (GRANT, RLS, Storage) está en `docs/base-de-datos.md`. Los componentes de UI están en `docs/shadcn/vue-implementacion.md`.

---

## 1. Estado

Las fases 1 a 9 están cerradas en funcionalidad. La capa visual compartida (escala, radios, sombras, superficie y aire de página) ya está. Falta el pulido de cada pantalla (sección 5) y la landing (fase 10).

| Fase | Qué quedó |
|---|---|
| 1 | Cinco tablas, RLS, grants, Realtime del chat y seed (vademécum + 2 usuarios). |
| 2 | Catálogo público en `/catalogo`. |
| 3 | Registro, ingreso y cierre de sesión. |
| 4 | Sesión en el guard, rutas protegidas y `/perfil`. |
| 5 | Publicar en `/donar` (`publicar-medicamento`, bucket `fotos-envases`). |
| 6 | Ficha `/medicamento/:id` y solicitud (`crear-solicitud`, bucket `recetas-medicas`). |
| 7 | Chat, `confirmar-entrega` y `cancelar-solicitud`. |
| 8 | Moderación y alta del vademécum (`moderar-donacion`, `alta-medicamento-habilitado`). |
| 9 | Cuentas en `/admin/usuarios` (`gestionar-usuarios`). |
| 10 | Landing. Pendiente. Empieza cuando cierre la sección 5. |

En el tablero, las tarjetas #27 y #24 tienen el título cruzado con el contenido. La fase 5 es publicar una donación. La fase 9 es la gestión de cuentas.

Confirmar la entrega, cancelar, dar de alta el vademécum y avisar por mail no tenían tarjeta. El mail no se hizo: no hay servicio de correo. El donante ve el resultado en «Mis donaciones».

---

## 2. Decisiones vigentes

### Cuenta

- Email y contraseña viven en `auth.users`. El perfil de dominio se crea con el trigger `handle_new_user`.
- La confirmación de email está apagada: `signUp` deja la sesión abierta.
- El trigger cancela el alta si falta la DDJJ o `name`, `dni`, `telefono`, `direccion` o `localidad`.
- Un DNI repetido llega como error genérico de Auth. El mensaje al usuario es general. No hay una RPC para consultar DNIs.
- `rol` arranca en `user`. `is_validado` arranca en `true`. Solo un admin los cambia, por la Edge Function `gestionar-usuarios`.
- El usuario edita `name`, `dni`, `telefono`, `direccion` y `localidad` con un `update` directo. El email se cambia con `auth.updateUser`. La DDJJ queda fuera de ese `update`.
- Suspender pone `is_validado` en `false` y no cierra la sesión ni el acceso de admin. Para sacar el rol admin hay que revocar. `gestionar-usuarios` no actúa sobre la propia cuenta ni deja el sistema sin admins.
- Donar, solicitar, confirmar y cancelar leen `is_validado` en la Edge Function y responden 403. No hay políticas de `INSERT` en `medicamentos` ni en `solicitudes`.

### Sesión y rutas

- La sesión se escucha solo con `onAuthStateChange`. `INITIAL_SESSION` trae la sesión guardada. El perfil se carga con `setTimeout`, fuera del callback, y solo si cambió el usuario.
- La escucha arranca en `router.beforeEach`, que espera `esperarSesionInicial()` antes de decidir. El guard de admin espera además `esperarPerfil()`.
- `requiereSesion` manda a `/login?redirect=`. `soloInvitados` manda al catálogo. `requiereAdmin` manda al catálogo si el rol no es `admin`. El registro siempre va al catálogo. El ingreso vuelve al `redirect` si empieza con `/`.
- `cargando` y `error` son de cada vista. `useAuth` comparte sesión, perfil y `errorPerfil`.

### Donaciones

- La coincidencia con el vademécum es exacta (`.eq`) por `principio_activo` + `concentracion` + `forma_farmaceutica`. El `%` de valores como «2 %» no puede ir en un `ilike`. El nombre comercial no entra en la búsqueda.
- Si hay coincidencia, se guarda `medicamento_habilitado_id` y el estado queda `disponible`. Si no, el vínculo queda `NULL` y el estado es `pendiente_revision`.
- `requiere_receta` es `true` en antibióticos y psicofármacos. Sin vínculo al vademécum se exige receta. La app solo comprueba que haya una foto. Al aprobar, el admin vincula una fila del vademécum.
- Concentración, forma farmacéutica y lote son obligatorios (`NOT NULL`).
- El formulario sugiere con `<datalist>` y `useVademecum`. Un valor escrito a mano es válido y manda la donación a revisión. No reemplazar ese control por un select cerrado.
- Fotos: 1 a 3, JPG, PNG o WEBP, hasta 5 MB, nombres distintos. El frontend sube al bucket público `fotos-envases` (`<user_id>/<uuid>.ext`) y después invoca la función. Si algo falla, borra lo subido. No hay política de `update` en Storage.
- La fecha de hoy en `publicar-medicamento` usa la zona horaria de Argentina.
- El catálogo filtra `estado = 'disponible'` y `fecha_vencimiento >= hoy` en la consulta, además de la RLS: con sesión las políticas se suman y un donante o un admin verían otros estados. La búsqueda por nombre y principio activo es en memoria.

### Solicitudes y chat

- No hay puntos de entrega fijos. El encuentro se coordina por el chat.
- `crear-solicitud` es la única vía de alta. Rechaza al donante de ese medicamento, la cuenta suspendida, la falta de DDJJ, el tercero sin nombre y la receta faltante. Reserva con `update … where estado = 'disponible'` (0 filas → 409). Si el insert falla, devuelve el medicamento a `disponible`. El código de 6 dígitos no sale en la respuesta.
- El receptor lee el código con `rpc('obtener_codigo_confirmacion')`. Las consultas de `solicitudes` listan columnas y omiten `codigo_confirmacion`.
- Los participantes se ven por `rpc('participantes_solicitud')`, que devuelve solo el nombre.
- `confirmar-entrega` la usa el donante. `cancelar-solicitud` la usa cualquiera de los dos. Las dos actualizan en condicional y, si el medicamento no cambia, vuelven la solicitud atrás. Una cuenta suspendida no puede ninguna de las dos.
- El estado `en_camino` existe en el esquema y todavía ninguna acción lo asigna. Confirmar y cancelar valen desde `pendiente_coordinacion`.
- El chat es Realtime Postgres Changes sobre `solicitud_mensajes`. Cada suscriptor recibe solo las filas que puede leer. Si superara unos 3.000 suscriptores concurrentes, conviene Broadcast.
- La receta va al bucket privado `recetas-medicas`, con los mismos límites que las fotos de envase.

### Moderación

- No hay tabla de alertas. Aprobar deja `disponible`, guarda el vínculo y limpia `motivo_rechazo`. Rechazar exige motivo y deja `rechazado`. Corregir no toca fotos, `user_id`, estado ni vínculo.
- `moderar-donacion` acepta `pendiente_revision`, `disponible` y `rechazado`.
- `alta-medicamento-habilitado` no inserta si ya existe la misma terna de principio, concentración y forma.
- `authenticated` no tiene `INSERT` ni `UPDATE` sobre `medicamentos` ni `medicamentos_habilitados`.

### Modelo

- `profiles.rol` y los `estado` de `medicamentos` y `solicitudes` son VARCHAR, no ENUM.
- `profiles`, `medicamentos` y `solicitudes` usan UUID. `medicamentos_habilitados` y `solicitud_mensajes` usan BIGINT identity.
- `solicitudes.medicamento_id` es `ON DELETE RESTRICT`.
- Las comprobaciones de las políticas están en funciones `security definer`: `es_admin`, `es_participante`, `solicito_medicamento`.
- El seed es de desarrollo (contraseñas públicas): `admin@ecofarma.test` y `donante@ecofarma.test`, contraseña `EcoFarma2026!`. Carga el vademécum Remediar y no inserta donaciones.

---

## 3. Sistema de diseño

Tokens en `@theme` de `src/style.css`. Fuentes desde Bunny Fonts en `index.html`. Los alias que shadcn espera (`destructive`, `card`, `border`, `accent` y el resto) apuntan a estos tokens. El detalle está en `docs/shadcn/vue-implementacion.md`.

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#215B8D` | Azul Océano |
| `secondary` | `#309AE6` | Azul Dodger |
| `icon` | `#52806C` | Verde Mar |
| `success` | `#43B75D` | Éxito |
| `danger` | `#FF3C3C` | Error y acciones destructivas |
| `warning` | `#FFAA00` | Advertencia |
| `background` | `#EEF4F6` | Fondo de página |
| `surface` | `#FFFFFF` | Tarjetas, diálogos y toasts |
| `foreground` | `#1A1A1A` | Texto |
| `muted` | `#6C757D` | Texto secundario e informativo |
| `line` | `#D3E0E6` | Bordes e inputs |
| `primary-soft` | `#CEDCEB` | Fondo suave. Alias `accent` |

Escala: 28, 22, 18, 16, 14 y 12 px. `h1` en Noto Sans 700. `h2`–`h5` en Noto Sans 600. El cuerpo es Source Sans Pro 400. Radios: `0.5rem`, `0.75rem` y `1rem`.

Cada vista usa `pagina` (64rem), `pagina-media` (48rem) o `pagina-formulario` (28rem).

---

## 4. Esquema

Migraciones en `supabase/migrations/`. Salvo el chat, cada tabla tiene `created_at` y `updated_at` (TIMESTAMPTZ, default `now()`). Orden: `profiles`, `medicamentos_habilitados`, `medicamentos`, `solicitudes`, `solicitud_mensajes`.

### `profiles`

Se crea al registrarse, por trigger sobre `auth.users`.

- `id`: UUID, PK, FK → `auth.users(id)` ON DELETE CASCADE
- `name`, `dni` (UNIQUE), `telefono`, `direccion`, `localidad`: VARCHAR
- `rol`: VARCHAR, default `'user'` — `user` | `admin`
- `is_validado`: BOOLEAN, default `true`
- `acepto_ddjj`: BOOLEAN, default `false`
- `fecha_aceptacion_ddjj`: TIMESTAMPTZ, nullable

### `medicamentos_habilitados`

Vademécum Remediar. Nombres genéricos: `nombre_comercial` es opcional.

- `id`: BIGINT, PK, identity
- `nombre_comercial`: VARCHAR, nullable
- `principio_activo`: VARCHAR
- `concentracion`, `forma_farmaceutica`, `presentacion`: VARCHAR, nullable
- `requiere_receta`: BOOLEAN, default `false`

### `medicamentos`

- `id`: UUID, PK, default `gen_random_uuid()`
- `user_id`: UUID, FK → `profiles(id)` ON DELETE CASCADE
- `medicamento_habilitado_id`: BIGINT, FK → `medicamentos_habilitados(id)` ON DELETE SET NULL, nullable
- `nombre_comercial`, `principio_activo`, `concentracion`, `forma_farmaceutica`, `lote`: VARCHAR (`concentracion`, `forma_farmaceutica` y `lote` son `NOT NULL`)
- `cantidad_disponible`: INTEGER
- `fecha_vencimiento`: DATE
- `fotos_envase`: JSONB — hasta 3 URLs
- `descripcion`: TEXT, nullable
- `estado`: VARCHAR, default `'disponible'` — `disponible` | `pendiente_revision` | `reservado` | `entregado` | `rechazado`
- `motivo_rechazo`: TEXT, nullable
- Índices: `(nombre_comercial, principio_activo, estado)`, `user_id`, `medicamento_habilitado_id`

### `solicitudes`

- `id`: UUID, PK, default `gen_random_uuid()`
- `medicamento_id`: UUID, FK → `medicamentos(id)` ON DELETE RESTRICT
- `receptor_id`: UUID, FK → `profiles(id)` ON DELETE CASCADE
- `es_para_tercero`: BOOLEAN, default `false`
- `nombre_destinatario_final`: VARCHAR, nullable
- `receta_medica_url`: VARCHAR, nullable
- `codigo_confirmacion`: VARCHAR(6). No se selecciona desde el frontend.
- `acepto_ddjj_receptor`: BOOLEAN, default `false`
- `fecha_aceptacion_ddjj`: TIMESTAMPTZ, nullable
- `estado`: VARCHAR, default `'pendiente_coordinacion'` — `pendiente_coordinacion` | `en_camino` | `completado` | `cancelado`
- `fecha_entrega`: TIMESTAMPTZ, nullable

### `solicitud_mensajes`

Sin `updated_at`. Solo leen y escriben donante y receptor.

- `id`: BIGINT, PK, identity
- `solicitud_id`: UUID, FK → `solicitudes(id)` ON DELETE CASCADE
- `user_id`: UUID, FK → `profiles(id)` ON DELETE CASCADE
- `mensaje`: TEXT
- `created_at`: TIMESTAMPTZ, default `now()`

---

## 5. Fidelidad visual

Trabajo actual. La funcionalidad de las fases 1 a 9 se queda como está. `src/style.css` y `src/components/ui` ya cubren controles, estados y confirmaciones. Cada pantalla se marca cuando se lee como terminada y el flujo sigue igual: mismos campos, mismas validaciones y las mismas llamadas a Supabase.

- [x] Barra de navegación (`components/layout/BarraNavegacion`).
- [x] Catálogo, `/catalogo`.
- [x] Detalle y solicitud, `/medicamento/:id`.
- [x] Ingreso, `/login`.
- [x] Registro, `/registro`.
- [ ] Perfil, `/perfil`.
- [ ] Publicar donación, `/donar`.
- [ ] Chat, `/solicitud/:solicitudId/chat`.
- [ ] Administración: `/admin/donaciones`, `/admin/vademecum` y `/admin/usuarios`.

La landing no entra en esta sección.

El catálogo muestra el texto introductorio, búsqueda con lupa, filtros por receta, orden por recientes o vencimiento, el total visible y tarjetas con foto, datos e iconos.

### Inventario

Todo usa el cliente de `src/lib/supabase.js` y la `anon` key.

| Funcionalidad | Ruta | Vista y componentes | Composable | Supabase |
|---|---|---|---|---|
| Catálogo | `/catalogo` | `CatalogoView`, `components/medicamentos/` | `useMedicamentos` | `select` de `medicamentos` disponibles y no vencidos |
| Registro | `/registro` | `RegistroView`, `FormularioRegistro` | `useAuth` | `auth.signUp` con metadatos; el trigger crea el perfil |
| Ingreso | `/login` | `LoginView`, `FormularioLogin` | `useAuth` | `auth.signInWithPassword`; acepta `?redirect=` |
| Sesión | todas | `BarraNavegacion` | `useAuth` | `onAuthStateChange`, `signOut`, `select` del perfil. El menú muestra la bienvenida, Administrador si `rol = admin` y «Cerrar sesión» |
| Mis datos | `/perfil` | `PerfilView`, `FormularioPerfil` | `usePerfil` | `update` de `profiles` y `auth.updateUser` para el email |
| Mis donaciones | `/perfil` | `ListaMisDonaciones` | `useDonaciones` | `select` de `medicamentos` por `user_id`; si está `reservado`, la solicitud activa |
| Mis solicitudes | `/perfil` | `ListaMisSolicitudes` | `useSolicitudes` | `select` por `receptor_id` (sin el código) y `rpc('obtener_codigo_confirmacion')` |
| Chat | `/solicitud/:solicitudId/chat` | `ChatView`, `components/chat/` | `useMensajes`, `useSolicitudes` | mensajes, `rpc('participantes_solicitud')`, Realtime, `confirmar-entrega`, `cancelar-solicitud` |
| Solicitar | `/medicamento/:id` | `MedicamentoDetalleView`, `DetalleMedicamento`, `PanelSolicitar` | `useMedicamentos`, `useSolicitudes` | Storage `recetas-medicas` y `crear-solicitud` |
| Donar | `/donar` | `DonarView`, `FormularioDonacion` | `useVademecum`, `useDonaciones` | sugerencias, bucket `fotos-envases`, `publicar-medicamento` |
| Moderación | `/admin/donaciones` | `AdminDonacionesView`, `ListaModeracion`, `TarjetaModeracion` | `useModeracion`, `useVademecum` | `select` en revisión, disponibles y rechazados; `moderar-donacion` |
| Vademécum | `/admin/vademecum` | `AdminVademecumView`, `FormularioAltaVademecum` | `useVademecum` | `alta-medicamento-habilitado` |
| Cuentas | `/admin/usuarios` | `AdminUsuariosView`, `TablaUsuarios` | `useUsuariosAdmin` | `gestionar-usuarios` (`listar`, `suspender`, `rehabilitar`, `promover`, `revocar`) |
| Guard | todas | `src/router/index.js` | `useAuth` | `requiereSesion`, `soloInvitados`, `requiereAdmin` |

`NavAdmin` es el subnav de `/admin/*`. `/` redirige al catálogo. La fase 10 no suma Edge Functions.

---

## 6. Landing (fase 10)

Última del tablero. Hoy `/` redirige al catálogo. Esta fase crea pantallas: Inicio, Información/Ayuda, Sobre nosotros, Contacto y Legales.

- [ ] Rutas de esa arquitectura, más Donar y Recibir.
- [ ] Home con el propósito, cómo donar, cómo recibir, contacto y enlace al catálogo, con los tokens de la sección 3.
