# Auditoría — EcoFARMA

Estado del proyecto al 29 de octubre de 2026. Resume lo que hay hoy en frontend y backend, sin reescribir el detalle de columnas ni de políticas: eso sigue en [`ROADMAP.md`](ROADMAP.md) y [`docs/base-de-datos.md`](docs/base-de-datos.md). Las reglas de trabajo están en [`AGENTS.md`](AGENTS.md).

---

## 1. Estado general

EcoFARMA es un MVP de donación de medicamentos entre particulares: el donante publica un envase, el receptor lo solicita y ambos coordinan la entrega por un chat en tiempo real. Un administrador modera donaciones que no coinciden con el vademécum, carga filas nuevas al listado oficial y gestiona cuentas.

Las fases 1 a 9 están **cerradas en funcionalidad**. La interfaz es HTML nativo con las clases de Tailwind mínimas para probar cada flujo. Falta el pulido visual de cada pantalla ([`ROADMAP.md`](ROADMAP.md), sección 5) y la landing (fase 10).

No hay servicio de correo. Confirmar entrega, cancelar, dar de alta el vademécum y avisar por mail no tenían tarjeta en el tablero. El mail no se implementó: el donante ve el resultado de una publicación en «Mis donaciones». El estado `en_camino` existe en `solicitudes` y ninguna acción lo asigna; confirmar y cancelar valen desde `pendiente_coordinacion`.

---

## 2. Stack

Un solo repositorio: `src/` en la raíz y `supabase/` al lado. No hay `/frontend` ni `/backend` separados.

| Capa | Tecnología | Versión en `package.json` |
|---|---|---|
| UI | Vue 3 (SPA, Composition API) | `^3.5.43` |
| Rutas | Vue Router | `^5.3.1` |
| Estilos | Tailwind CSS 4 (CSS-first, plugin Vite) | `^4.0.0` |
| Bundler | Vite + `@vitejs/plugin-vue` | `^8` / `^6.0.9` |
| Cliente API | `@supabase/supabase-js` | `^2.116.0` |
| Backend | Supabase: PostgreSQL 17, Auth, Storage, Realtime | — |
| Servidor | Edge Functions en **JavaScript** sobre Deno | CLI `supabase` `^2.118.0` |
| Paquetes | pnpm | `10.28.2` |

No hay Laravel, PHP ni TypeScript en el código de la app. [`README.md`](README.md) todavía dice que las Edge Functions están en TypeScript; el código real es JS (`supabase/functions/<nombre>/index.js`), alineado con `AGENTS.md`.

Variables del frontend (`.env.local`, plantilla en `.env.example`): `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. La `service_role` key no va al cliente: solo vive como secreto dentro de las funciones.

Git: `main` es producción, `dev` es integración, las features salen de `dev` como `featureNN/<nombre>`.

---

## 3. Frontend

### Arranque y capas

```
index.html → src/main.js → src/App.vue + src/router/index.js
                              ↓
                         src/views/*
                              ↓
                         src/composables/*
                              ↓
                         src/lib/supabase.js  (único cliente, anon key)
```

- [`src/main.js`](src/main.js) importa [`src/style.css`](src/style.css), crea la app y monta el router.
- [`src/App.vue`](src/App.vue) es el shell: navegación, aviso de ingreso/registro/cierre de sesión (`mensajeExito`), errores de perfil y de `useAuth`, y `RouterView`.
- No hay capa `services/`. Cada vista llama al composable y renderiza el formulario o la lista.
- Alias Vite `@` → `src` ([`vite.config.js`](vite.config.js)). Tailwind entra por `@tailwindcss/vite`; no hay `tailwind.config.js`.

### Rutas y guards

Definidas en [`src/router/index.js`](src/router/index.js). `/` redirige a `/catalogo`.

| Ruta | Nombre | Acceso |
|---|---|---|
| `/catalogo` | `catalogo` | Pública |
| `/medicamento/:id` | `medicamento-detalle` | Pública (solicitar exige sesión) |
| `/login` | `login` | Solo invitados |
| `/registro` | `registro` | Solo invitados |
| `/perfil` | `perfil` | Sesión |
| `/donar` | `donar` | Sesión |
| `/solicitud/:solicitudId/chat` | `chat-solicitud` | Sesión |
| `/admin` + hijos | `admin-donaciones`, `admin-vademecum`, `admin-usuarios` | Sesión y `rol = admin` |

El guard espera `esperarSesionInicial()` (la sesión se escucha solo con `onAuthStateChange`; `INITIAL_SESSION` trae la sesión guardada). El perfil se carga con `setTimeout` fuera del callback, y solo si cambió el usuario. El guard de admin espera además `esperarPerfil()`.

- `requiereSesion` → `/login?redirect=`
- `soloInvitados` → catálogo
- `requiereAdmin` → catálogo si el rol no es `admin` (aviso de advertencia)
- El registro siempre va al catálogo. El ingreso vuelve al `redirect` si empieza con `/`.

`cargando` y `error` son de cada vista. `useAuth` comparte sesión, perfil y `errorPerfil`.

### Vistas

Una página por ruta en [`src/views/`](src/views/): `CatalogoView`, `MedicamentoDetalleView`, `LoginView`, `RegistroView`, `PerfilView`, `DonarView`, `ChatView`, `AdminLayout` (subnav), `AdminDonacionesView`, `AdminVademecumView`, `AdminUsuariosView`. HTML nativo: `input`, `select`, `textarea`, `button`, `table`. Sin shadcn/vue ni librerías de UI en lo que corre.

### Composables

| Composable | Rol |
|---|---|
| `useAuth` | Sesión, perfil, registro, ingreso, cierre, avisos globales |
| `useMedicamentos` | Catálogo (filtra `disponible` y no vencidos; búsqueda en memoria) y ficha |
| `useDonaciones` | Publicar (`publicar-medicamento` + fotos) y «Mis donaciones» |
| `useSolicitudes` | Crear solicitud, listar las del receptor, código por RPC, confirmar y cancelar |
| `useMensajes` | Chat y Realtime sobre `solicitud_mensajes` |
| `usePerfil` | Editar datos de `profiles` y el email con `auth.updateUser` |
| `useVademecum` | Sugerencias (`<datalist>`) y alta admin |
| `useModeracion` | Aprobar, rechazar y corregir donaciones |
| `useUsuariosAdmin` | Listar, suspender, rehabilitar, promover, revocar |
| `usePaginacion` | Paginado de listas admin |

### Estilos y marca

Tokens en `@theme` de [`src/style.css`](src/style.css). Fuentes desde Bunny Fonts en [`index.html`](index.html): Noto Sans 600/700 (`font-heading`) y Source Sans Pro 400/600 (`font-sans`). Cada vista usa `pagina` (64 rem), `pagina-media` (48 rem) o `pagina-formulario` (28 rem).

Colores del manual: `primary` `#215B8D`, `secondary` `#309AE6`, `icon` `#52806C`, `success` `#43B75D`, `danger` `#FF3C3C`, `warning` `#FFAA00`, `background` `#EEF4F6`, `surface` `#FFFFFF`, `foreground` `#1A1A1A`, `muted` `#6C757D`, `line` `#D3E0E6`, `primary-soft` `#CEDCEB`. Escala 28 / 22 / 18 / 16 / 14 / 12 px. Radios 0.5 / 0.75 / 1 rem. Hay sombras propias; las vistas casi no usan `rounded-*` ni `shadow-*`. Falta el alias `accent` → `primary-soft` documentado en el ROADMAP. `h4` y `h5` no tienen el tamaño del manual (solo `font-weight: 600`).

Mensajes en español. Error: `danger`. Éxito: `success`. Advertencia: `warning`. Informativo: `muted`. El error crudo va a consola.

Assets en `public/` sin usar en la UI: `logo.webp`, `background-tramas.webp`. El favicon sí está referenciado.

### Componentes Vue

Las vistas **no importan** `src/components/`. Toda la UI vive en la vista. Queda rastro de una etapa con shadcn/vue (Button, Card, Input, Alert, Badge, Tabs, Checkbox, etc.) y componentes de dominio (`FormularioLogin`, `MedicamentoCard`, `BarraNavegacion`, …). Esos archivos se importan entre sí y dependen de paquetes que **ya no están** (`reka-ui`, `class-variance-authority`, `cn`, `@lucide/vue`). No forman parte de la app que corre y no hay que reutilizarlos: `AGENTS.md` manda HTML nativo.

Las vistas duplican las mismas clases: campo (`border border-line bg-surface px-3 py-2`), botón primario (`bg-primary px-4 py-2 text-surface`), avisos (`border border-danger bg-danger/10 …`) y tarjetas (`border border-line bg-surface p-4`).

---

## 4. Backend

### Modelo

Cinco tablas. Columnas, tipos y FKs: [`ROADMAP.md`](ROADMAP.md) sección 4. Protección (GRANT, RLS, Storage): [`docs/base-de-datos.md`](docs/base-de-datos.md).

| Tabla | Qué guarda | `id` |
|---|---|---|
| `profiles` | Datos de dominio (no el email ni la contraseña) | UUID → `auth.users` |
| `medicamentos_habilitados` | Vademécum Remediar | BIGINT identity |
| `medicamentos` | Donaciones | UUID |
| `solicitudes` | Pedidos | UUID |
| `solicitud_mensajes` | Chat | BIGINT identity |

`profiles.rol` y los `estado` de `medicamentos` y `solicitudes` son VARCHAR, no ENUM. `solicitudes.medicamento_id` es `ON DELETE RESTRICT`. Todas tienen `created_at`; `updated_at` está en todas menos el chat (los mensajes no se editan).

Estados de donación: `disponible` · `pendiente_revision` · `reservado` · `entregado` · `rechazado`.

Estados de solicitud: `pendiente_coordinacion` · `en_camino` (sin uso) · `completado` · `cancelado`.

### Auth y cuentas

- Email y contraseña en `auth.users`. El perfil lo crea el trigger `handle_new_user`.
- Confirmación de email apagada: `signUp` deja la sesión abierta.
- El trigger cancela el alta si falta la DDJJ o `name`, `dni`, `telefono`, `direccion` o `localidad`.
- DNI único. Un DNI repetido llega como error genérico de Auth (`unexpected_failure`); el mensaje al usuario es general. No hay RPC para consultar DNIs.
- `rol` arranca en `user`. `is_validado` arranca en `true`. Solo un admin los cambia, por `gestionar-usuarios`.
- El usuario edita `name`, `dni`, `telefono`, `direccion` y `localidad` con un `update` directo. El email se cambia con `auth.updateUser`. La DDJJ queda fuera de ese `update`.
- Suspender pone `is_validado` en `false` y **no** cierra la sesión ni el acceso de admin. Para sacar el rol admin hay que revocar. `gestionar-usuarios` no actúa sobre la propia cuenta ni deja el sistema sin admins.
- Donar, solicitar, confirmar y cancelar leen `is_validado` en la Edge Function y responden 403 si la cuenta está suspendida.

### GRANT y RLS

Hay que pasar los dos candados: GRANT de tabla/columna y política RLS. `anon` y `authenticated` no reciben permisos por defecto: cada tabla nueva necesita `GRANT` (migración `table_grants`). `service_role` los tiene y **ignora RLS**; solo se usa en Edge Functions.

| Tabla | Visitante (`anon`) | Con sesión (`authenticated`) |
|---|---|---|
| `profiles` | Nada | Leer. Modificar `name`, `dni`, `telefono`, `direccion`, `localidad` |
| `medicamentos_habilitados` | Leer | Leer |
| `medicamentos` | Leer | Leer. Sin `INSERT` ni `UPDATE` |
| `solicitudes` | Nada | Leer todas las columnas menos `codigo_confirmacion`. Sin `INSERT` |
| `solicitud_mensajes` | Nada | Leer y crear mensajes |

RLS activo en todas las tablas:

- **profiles:** cada uno ve y edita el propio; el admin ve todos.
- **medicamentos_habilitados:** lectura pública.
- **medicamentos:** cualquiera ve los `disponible` y no vencidos; el donante ve las suyas; el receptor ve las que pidió; el admin ve todas. Con sesión esas reglas se suman: por eso el catálogo filtra otra vez `estado` y vencimiento en la consulta.
- **solicitudes:** las leen los dos participantes y el admin. El alta es solo por Edge Function.
- **solicitud_mensajes:** leen los dos participantes. Para escribir: ser participante, usar el propio usuario, `is_validado = true` y solicitud en `pendiente_coordinacion` o `en_camino`.

Funciones `security definer`: `es_admin()`, `es_participante(solicitud)`, `solicito_medicamento(medicamento)`. El frontend llama por `rpc`: `participantes_solicitud` (solo el nombre) y `obtener_codigo_confirmacion` (solo el receptor).

### Storage y Realtime

| Bucket | Acceso | Uso |
|---|---|---|
| `fotos-envases` | Público | 1 a 3 fotos de envase. El catálogo las muestra sin sesión |
| `recetas-medicas` | Privado | Receta cuando hace falta |

JPG, PNG o WEBP, hasta 5 MB, nombres distintos. Ruta `<user_id>/<uuid>.ext`. Cada usuario sube, ve y borra solo en su carpeta. No hay política de `update`: no se reemplaza un archivo. El frontend sube y después invoca la función; si algo falla, borra lo subido.

El chat es Realtime **Postgres Changes** sobre `solicitud_mensajes`. Cada suscriptor recibe solo las filas que puede leer. Si superara unos 3.000 suscriptores concurrentes, conviene Broadcast.

### Edge Functions

JavaScript con `Deno.serve`, imports `npm:` / `jsr:`. Registradas en [`supabase/config.toml`](supabase/config.toml) con `entrypoint` a `index.js`. `verify_jwt = false` (las claves `sb_publishable_...` no pasan el gateway): cada función valida el JWT con `auth.getUser(token)` y responde 401 si no hay sesión. CORS habilitado para `supabase.functions.invoke`. Error: `{ "error": "<mensaje en español>" }` y el HTTP que corresponda. La `service_role` solo adentro.

| Función | Quién | Qué hace |
|---|---|---|
| `publicar-medicamento` | Donante validado | Inserta la donación. Coincidencia **exacta** (`.eq`) por principio activo + concentración + forma. Si hay match: `medicamento_habilitado_id` y `disponible`. Si no: vínculo `NULL` y `pendiente_revision`. Fecha de hoy en zona Argentina. |
| `crear-solicitud` | Receptor validado | Única vía de alta. Rechaza al donante de ese medicamento, cuenta suspendida, DDJJ faltante, tercero sin nombre y receta faltante. Reserva con `update … where estado = 'disponible'` (0 filas → 409). Si el insert falla, devuelve el medicamento a `disponible`. El código de 6 dígitos **no** sale en la respuesta. |
| `confirmar-entrega` | Donante | Cierra con el código. Actualiza en condicional; si el medicamento no cambia, vuelve la solicitud atrás. |
| `cancelar-solicitud` | Donante o receptor | Libera el medicamento. Misma precaución condicional. |
| `moderar-donacion` | Admin | Acepta `pendiente_revision`, `disponible` y `rechazado`. Aprobar: `disponible`, vínculo al vademécum, limpia `motivo_rechazo`. Rechazar: motivo obligatorio → `rechazado`. Corregir: no toca fotos, `user_id`, estado ni vínculo. No hay tabla de alertas. |
| `alta-medicamento-habilitado` | Admin | No inserta si ya existe la misma terna principio + concentración + forma. |
| `gestionar-usuarios` | Admin | `listar`, `suspender`, `rehabilitar`, `promover`, `revocar`. |

`requiere_receta` es `true` en antibióticos y psicofármacos. Sin vínculo al vademécum se exige receta. La app solo comprueba que haya una foto; al aprobar, el admin vincula una fila del vademécum.

Concentración, forma farmacéutica y lote son `NOT NULL`. El formulario de donar sugiere con `<datalist>` y `useVademecum`; un valor escrito a mano es válido y manda la donación a revisión. No reemplazar ese control por un select cerrado. El `%` de valores como «2 %» no puede ir en un `ilike`. El nombre comercial no entra en la coincidencia.

No hay puntos de entrega fijos: el encuentro se coordina por el chat.

### Migraciones y seed

Trece migraciones en `supabase/migrations/`, aplicadas una vez, en orden. No se editan las ya aplicadas.

1. `create_profiles` — tabla y trigger de alta  
2. `create_medicamentos_habilitados`  
3. `create_medicamentos`  
4. `create_solicitudes`  
5. `create_solicitud_mensajes`  
6. `rls_policies` — funciones, RLS y permisos por columna  
7. `table_grants`  
8. `realtime_solicitud_mensajes`  
9. `validar_registro` — trigger exige DDJJ y datos obligatorios  
10. `bucket_fotos_envases`  
11. `bucket_recetas_medicas`  
12. `editar_nombre_dni_perfil` — el usuario puede modificar `name` y `dni`  
13. `concentracion_forma_lote_obligatorios` — esas tres columnas `NOT NULL`

[`supabase/seed.sql`](supabase/seed.sql) es de desarrollo (contraseñas públicas). No cargarlo en producción. Carga el vademécum Remediar (`requiere_receta = true` en antibióticos y psicofármacos) y dos usuarios. **No inserta donaciones**: el catálogo arranca vacío.

| Email | Rol | Contraseña |
|---|---|---|
| `admin@ecofarma.test` | Administrador | `EcoFarma2026!` |
| `donante@ecofarma.test` | Usuario | `EcoFarma2026!` |

---

## 5. Qué hace el cliente y qué hace el servidor

| Acción | Dónde |
|---|---|
| Editar nombre, DNI, teléfono, dirección, localidad | Frontend → `profiles` |
| Cambiar el email | Frontend → `auth.updateUser` |
| Enviar un mensaje | Frontend → `solicitud_mensajes` |
| Publicar una donación | `publicar-medicamento` |
| Crear una solicitud | `crear-solicitud` |
| Confirmar la entrega | `confirmar-entrega` |
| Cancelar y liberar el medicamento | `cancelar-solicitud` |
| Aprobar, corregir o rechazar | `moderar-donacion` |
| Sumar una fila al vademécum | `alta-medicamento-habilitado` |
| Listar cuentas, suspender, rehabilitar, promover, revocar | `gestionar-usuarios` |

Las funciones corren en el servidor porque comprueban reglas que el navegador podría saltear: coincidencia con el vademécum, receta, código, reserva del medicamento, rol de admin.

### Inventario de pantallas que ya corren

Todo usa el cliente de `src/lib/supabase.js` y la `anon` key.

| Funcionalidad | Ruta | Vista | Composable | Supabase |
|---|---|---|---|---|
| Catálogo | `/catalogo` | `CatalogoView` | `useMedicamentos` | `select` de `medicamentos` disponibles y no vencidos |
| Registro | `/registro` | `RegistroView` | `useAuth` | `auth.signUp` con metadatos; el trigger crea el perfil |
| Ingreso | `/login` | `LoginView` | `useAuth` | `auth.signInWithPassword`; acepta `?redirect=` |
| Sesión | todas | `App.vue` | `useAuth` | `onAuthStateChange`, `signOut`, `select` del perfil |
| Mis datos | `/perfil` | `PerfilView` | `usePerfil` | `update` de `profiles` y `auth.updateUser` |
| Mis donaciones | `/perfil` | `PerfilView` | `useDonaciones` | `select` por `user_id`; si está `reservado`, la solicitud activa |
| Mis solicitudes | `/perfil` | `PerfilView` | `useSolicitudes` | `select` por `receptor_id` (sin el código) y `rpc('obtener_codigo_confirmacion')` |
| Chat | `/solicitud/:solicitudId/chat` | `ChatView` | `useMensajes`, `useSolicitudes` | mensajes, `rpc('participantes_solicitud')`, Realtime, confirmar y cancelar |
| Solicitar | `/medicamento/:id` | `MedicamentoDetalleView` | `useMedicamentos`, `useSolicitudes` | Storage `recetas-medicas` y `crear-solicitud` |
| Donar | `/donar` | `DonarView` | `useVademecum`, `useDonaciones` | sugerencias, `fotos-envases`, `publicar-medicamento` |
| Moderación | `/admin/donaciones` | `AdminDonacionesView` | `useModeracion`, `useVademecum` | `select` en revisión, disponibles y rechazados; `moderar-donacion` |
| Vademécum | `/admin/vademecum` | `AdminVademecumView` | `useVademecum` | `alta-medicamento-habilitado` |
| Cuentas | `/admin/usuarios` | `AdminUsuariosView` | `useUsuariosAdmin` | `gestionar-usuarios` |
| Guard | todas | `src/router/index.js` | `useAuth` | `requiereSesion`, `soloInvitados`, `requiereAdmin` |

---

## 6. Pendiente y deuda

**Producto**

- Pulido visual de navegación, catálogo, detalle, ingreso, registro, perfil, donar, chat y admin ([`ROADMAP.md`](ROADMAP.md) §5). La funcionalidad de las fases 1–9 se queda como está.
- Landing (fase 10): hoy `/` redirige al catálogo. Faltan Inicio, Información/Ayuda, Sobre nosotros, Contacto y Legales, más Donar y Recibir como pantallas de esa arquitectura. No suma Edge Functions.
- Avisos por mail: no hay proveedor ni envío.
- Estado `en_camino`: previsto en el esquema, sin acción que lo asigne.

**Frontend**

- Tokens incompletos respecto del manual: falta alias `accent`; `h4`/`h5` sin tamaño; radios y sombras definidos pero casi no usados.
- `logo.webp` y `background-tramas.webp` no están cableados.
- Clases de campo, botón, aviso y tarjeta repetidas en cada vista.
- Rastro de shadcn y componentes de dominio: no usarlos. Limpieza aparte si siguen en disco.

**Documentación**

- [`README.md`](README.md) desactualizado: habla de Edge Functions en TypeScript, omite `src/views`, `src/composables` y `src/router`, y muestra comandos `supabase` a secas (el repo usa `pnpm supabase ...`).
- En el tablero, las tarjetas #27 y #24 tenían el título cruzado con el contenido (fase 5 = publicar donación; fase 9 = gestión de cuentas).
