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
- [x] Migración de stack: se retiraron Laravel, PHP y sus dependencias; el frontend quedó como SPA de Vite.
- [ ] Base de datos limpia: eliminar las tablas que habían creado las migraciones de Laravel.
- [ ] Inicializar `supabase/` con Supabase CLI (`supabase init` + `supabase link`).
- [ ] Migraciones SQL de las 6 tablas del dominio (0 de 6).

### Decisiones de modelo

- Autenticación con Supabase Auth: credenciales y email viven en `auth.users`; los datos de dominio en `profiles`.
- Sin puntos de entrega fijos: donante y receptor coordinan día, hora y lugar por el chat de la solicitud.
- `profiles.is_validado` arranca en `true`; el admin lo pasa a `false` para suspender una cuenta.
- `profiles.rol` e `is_validado` solo los modifica un admin (RLS / Edge Function), nunca el propio usuario.
- `medicamentos.lote` da trazabilidad sanitaria; `motivo_rechazo` se comunica al donante.
- `solicitudes.medicamento_id` usa `ON DELETE RESTRICT` para no perder el historial de intercambios.
- `alertas_moderacion.referencia_id` apunta al registro asociado sin FK polimórfica.
- Fotos de envases y recetas se guardan en Supabase Storage; las tablas guardan solo las rutas.

---

## 3. Esquema de Base de Datos

Migraciones en SQL dentro de `supabase/migrations/` (`supabase migrations new <nombre>`), con RLS habilitado en todas las tablas.
Salvo aclaración, cada tabla tiene `id` (BIGINT identity, PK) y `created_at` / `updated_at` (TIMESTAMPTZ, default `now()`).
Orden de creación: `profiles`, `medicamentos_habilitados` → `medicamentos` → `solicitudes` → `solicitud_mensajes`, `alertas_moderacion`.

| # | Tabla | Estado |
|---|---|---|
| 1 | `profiles` | Pendiente |
| 2 | `medicamentos_habilitados` | Pendiente |
| 3 | `medicamentos` | Pendiente |
| 4 | `solicitudes` | Pendiente |
| 5 | `solicitud_mensajes` | Pendiente |
| 6 | `alertas_moderacion` | Pendiente |

### 1. `profiles`

Datos de contacto, rol y Declaración Jurada de cada usuario. Reemplaza a la tabla `users` de Laravel. Se crea automáticamente al registrarse mediante un trigger sobre `auth.users`.

- `id`: UUID, PK, FK → `auth.users.id`, ON DELETE CASCADE
- `name`, `dni` (UNIQUE), `telefono`, `direccion`, `localidad`: VARCHAR
- `rol`: ENUM `user` | `admin`, default `user`
- `is_validado`: BOOLEAN, default `true`
- `acepto_ddjj`: BOOLEAN, default `false`
- `fecha_aceptacion_ddjj`: TIMESTAMPTZ, NULLABLE

Email, contraseña y verificación de email los gestiona Supabase Auth.

### 2. `medicamentos_habilitados`

Vademécum de referencia para aprobar en automático o retener publicaciones fuera de catálogo.

- `nombre_comercial`, `principio_activo`: VARCHAR
- `concentracion`, `forma_farmaceutica`, `presentacion`: VARCHAR, NULLABLE
- `requiere_receta`: BOOLEAN, default `false`

### 3. `medicamentos`

Publicaciones de donación cargadas por los donantes.

- `user_id`: UUID, FK → `profiles.id`, ON DELETE CASCADE
- `nombre_comercial`, `principio_activo`: VARCHAR
- `concentracion`, `forma_farmaceutica`, `lote`: VARCHAR, NULLABLE
- `cantidad_disponible`: INTEGER
- `fecha_vencimiento`: DATE
- `fotos_envase`: JSONB (hasta 3 rutas de Storage)
- `descripcion`, `motivo_rechazo`: TEXT, NULLABLE
- `estado`: ENUM `disponible` | `pendiente_revision` | `reservado` | `entregado` | `rechazado`, default `disponible`
- Índice: `(nombre_comercial, principio_activo, estado)`

### 4. `solicitudes`

Reserva, destinatario, receta y código de cierre de la entrega.

- `medicamento_id`: FK → `medicamentos.id`, ON DELETE RESTRICT
- `receptor_id`: UUID, FK → `profiles.id`, ON DELETE CASCADE
- `es_para_tercero`: BOOLEAN, default `false`
- `nombre_destinatario_final`, `receta_medica_url`: VARCHAR, NULLABLE
- `codigo_confirmacion`: VARCHAR(6)
- `acepto_ddjj_receptor`: BOOLEAN, default `false`
- `fecha_aceptacion_ddjj`, `fecha_entrega`: TIMESTAMPTZ, NULLABLE
- `estado`: ENUM `pendiente_coordinacion` | `en_camino` | `completado` | `cancelado`, default `pendiente_coordinacion`

### 5. `solicitud_mensajes`

Chat Realtime de la solicitud, con RLS: solo leen y escriben el donante y el receptor. Sin `updated_at`.

- `solicitud_id`: FK → `solicitudes.id`, ON DELETE CASCADE
- `user_id`: UUID, FK → `profiles.id`, ON DELETE CASCADE
- `mensaje`: TEXT
- `created_at`: TIMESTAMPTZ, default `now()`

### 6. `alertas_moderacion`

Reportes de chat, publicaciones fuera de catálogo, entregas fallidas y posibles fraudes.

- `user_id`: UUID, FK → `profiles.id`, ON DELETE SET NULL, NULLABLE
- `tipo`: ENUM `medicamento_fuera_catalogo` | `reporte_chat` | `entrega_fallida` | `posible_fraude`
- `referencia_id`: BIGINT
- `motivo`: TEXT
- `resuelto`: BOOLEAN, default `false`

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
- [ ] Edge Function `publicar-medicamento`: valida contra `medicamentos_habilitados`; si coincide queda `disponible`, si no `pendiente_revision` con alerta `medicamento_fuera_catalogo`.
- [ ] Rechazo con `motivo_rechazo` y aviso al donante.

### Fase 5: Quiero Recibir y Coordinación

- [ ] Edge Function `crear-solicitud`: reserva el medicamento, genera el código de 6 dígitos y exige receta (si `requiere_receta`), destinatario (si `es_para_tercero`) y DDJJ del receptor.
- [ ] Chat de la solicitud con suscripción Realtime en Vue.
- [ ] Edge Function `confirmar-entrega`: el donante ingresa el código → solicitud `completado`, medicamento `entregado`, `fecha_entrega` registrada.
- [ ] Alerta `entrega_fallida` ante cancelaciones o entregas fallidas.

### Fase 6: Panel de Administración

- [ ] Moderar donaciones en `pendiente_revision`.
- [ ] Alta en `medicamentos_habilitados`.
- [ ] Suspender o rehabilitar usuarios (`is_validado`).
- [ ] Bandeja de `alertas_moderacion` (filtro por `tipo`, marcar `resuelto`).
