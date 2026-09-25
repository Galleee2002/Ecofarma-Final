# ROADMAP.md — EcoFARMA (MVP)

Seguimiento técnico del proyecto: estado, esquema de base de datos y fases de implementación.

---

## 1. Stack

- **Backend:** Laravel 13 (API REST)
- **Frontend:** Vue 3 (SPA) + Tailwind CSS
- **Base de Datos:** PostgreSQL en Supabase, con Realtime para el chat
- **Metodología:** Scrumban (Trello)

---

## 2. Estado

- [x] Entorno: Laravel + Vue inicializado y conexión a Supabase vía `.env`.
- [x] Tokens de diseño en Tailwind (paleta y tipografías).
- [ ] Migraciones de las 6 tablas del dominio (en curso: 1 de 6).

### Decisiones de modelo

- Sin puntos de entrega fijos: donante y receptor coordinan día, hora y lugar por el chat de la solicitud.
- `users.is_validado` arranca en `true`; el admin lo pasa a `false` para suspender una cuenta.
- `medicamentos.lote` da trazabilidad sanitaria; `motivo_rechazo` se comunica al donante.
- `solicitudes.medicamento_id` usa `ON DELETE RESTRICT` para no perder el historial de intercambios.
- `alertas_moderacion.referencia_id` apunta al registro asociado sin FK polimórfica.

---

## 3. Esquema de Base de Datos

Todas las tablas tienen `id` (BIGINT, PK autoincremental) y `created_at` / `updated_at`, salvo aclaración.
Orden de creación: `users`, `medicamentos_habilitados` → `medicamentos` → `solicitudes` → `solicitud_mensajes`, `alertas_moderacion`.

| # | Tabla | Estado |
|---|---|---|
| 1 | `users` | Finalizada |
| 2 | `medicamentos_habilitados` | Pendiente |
| 3 | `medicamentos` | Pendiente |
| 4 | `solicitudes` | Pendiente |
| 5 | `solicitud_mensajes` | Pendiente |
| 6 | `alertas_moderacion` | Pendiente |

### 1. `users` — Finalizada

Usuarios, contacto, rol y Declaración Jurada. Migración, modelo `User` y `UserFactory` actualizados.

- `name`, `email` (UNIQUE), `password`, `dni` (UNIQUE), `telefono`, `direccion`, `localidad`: VARCHAR
- `rol`: ENUM `user` | `admin`, default `user`
- `is_validado`: BOOLEAN, default `true`
- `acepto_ddjj`: BOOLEAN, default `false`
- `fecha_aceptacion_ddjj`, `email_verified_at`: TIMESTAMP, NULLABLE
- `remember_token`: VARCHAR, NULLABLE

### 2. `medicamentos_habilitados`

Vademécum de referencia para aprobar en automático o retener publicaciones fuera de catálogo.

- `nombre_comercial`, `principio_activo`: VARCHAR
- `concentracion`, `forma_farmaceutica`, `presentacion`: VARCHAR, NULLABLE
- `requiere_receta`: BOOLEAN, default `false`

### 3. `medicamentos`

Publicaciones de donación cargadas por los donantes.

- `user_id`: FK → `users.id`, ON DELETE CASCADE
- `nombre_comercial`, `principio_activo`: VARCHAR
- `concentracion`, `forma_farmaceutica`, `lote`: VARCHAR, NULLABLE
- `cantidad_disponible`: INTEGER
- `fecha_vencimiento`: DATE
- `fotos_envase`: JSON (hasta 3 URLs)
- `descripcion`, `motivo_rechazo`: TEXT, NULLABLE
- `estado`: ENUM `disponible` | `pendiente_revision` | `reservado` | `entregado` | `rechazado`, default `disponible`
- Índice: `['nombre_comercial', 'principio_activo', 'estado']`

### 4. `solicitudes`

Reserva, destinatario, receta y código de cierre de la entrega.

- `medicamento_id`: FK → `medicamentos.id`, ON DELETE RESTRICT
- `receptor_id`: FK → `users.id`, ON DELETE CASCADE
- `es_para_tercero`: BOOLEAN, default `false`
- `nombre_destinatario_final`, `receta_medica_url`: VARCHAR, NULLABLE
- `codigo_confirmacion`: VARCHAR(6)
- `acepto_ddjj_receptor`: BOOLEAN, default `false`
- `fecha_aceptacion_ddjj`, `fecha_entrega`: TIMESTAMP, NULLABLE
- `estado`: ENUM `pendiente_coordinacion` | `en_camino` | `completado` | `cancelado`, default `pendiente_coordinacion`

### 5. `solicitud_mensajes`

Chat Realtime de la solicitud, con RLS: solo escriben el donante y el receptor. Sin `updated_at`.

- `solicitud_id`: FK → `solicitudes.id`, ON DELETE CASCADE
- `user_id`: FK → `users.id`, ON DELETE CASCADE
- `mensaje`: TEXT
- `created_at`: TIMESTAMPTZ, default `now()`

### 6. `alertas_moderacion`

Reportes de chat, publicaciones fuera de catálogo, entregas fallidas y posibles fraudes.

- `user_id`: FK → `users.id`, ON DELETE SET NULL, NULLABLE
- `tipo`: ENUM `medicamento_fuera_catalogo` | `reporte_chat` | `entrega_fallida` | `posible_fraude`
- `referencia_id`: BIGINT
- `motivo`: TEXT
- `resuelto`: BOOLEAN, default `false`

---

## 4. Fases de Implementación

### Fase 1: Persistencia y Datos Semilla

- [x] Tabla `users` (migración, modelo y factory).
- [ ] Migraciones restantes, en el orden del esquema.
- [ ] Ejecutar las migraciones en Supabase.
- [ ] Realtime y RLS sobre `solicitud_mensajes`.
- [ ] `DatabaseSeeder`: 10-15 fármacos habilitados, 2 usuarios (1 admin, 1 donante) y 5 medicamentos `disponible`.

### Fase 2: Feature Inicial

Comprobar el flujo Supabase → Laravel → Vue sin Auth.

- [ ] `GET /api/medicamentos` (`estado = 'disponible'` y `fecha_vencimiento >= now()`).
- [ ] Catálogo en Vue con búsqueda por nombre comercial y principio activo.

### Fase 3: Autenticación y Cuentas

- [ ] Laravel Sanctum: `/api/register`, `/api/login`, `/api/logout`.
- [ ] Registro con checkbox de Declaración Jurada y `is_validado = true`.
- [ ] Middleware que bloquee donar y solicitar si `is_validado == false`.
- [ ] Vistas de Login, Registro y Perfil (datos e historial).

### Fase 4: Quiero Donar

- [ ] `POST /api/medicamentos` con `lote` opcional y hasta 3 fotos.
- [ ] Validación contra `medicamentos_habilitados`: si coincide queda `disponible`; si no, `pendiente_revision` con alerta `medicamento_fuera_catalogo`.
- [ ] Rechazo con `motivo_rechazo` y aviso al donante.

### Fase 5: Quiero Recibir y Coordinación

- [ ] `POST /api/solicitudes`: reserva el medicamento, genera el código de 6 dígitos y pide receta (si `requiere_receta`), destinatario (si `es_para_tercero`) y DDJJ del receptor.
- [ ] Chat de la solicitud con suscripción Realtime en Vue.
- [ ] Cierre: el donante ingresa el código → solicitud `completado`, medicamento `entregado`, `fecha_entrega` registrada.
- [ ] Alerta `entrega_fallida` ante cancelaciones o entregas fallidas.

### Fase 6: Panel de Administración

- [ ] Moderar donaciones en `pendiente_revision`.
- [ ] Alta en `medicamentos_habilitados`.
- [ ] Suspender o rehabilitar usuarios (`is_validado`).
- [ ] Bandeja de `alertas_moderacion` (filtro por `tipo`, marcar `resuelto`).
