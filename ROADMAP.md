# ROADMAP.md — EcoFARMA (MVP)

Documento técnico de seguimiento para desarrollo y agentes de IA. Contiene el estado actual del proyecto, el esquema relacional de la base de datos y la secuencia de implementación.

---

## 1. Stack Tecnológico
- **Backend:** Laravel 11 (API REST)
- **Frontend:** Vue 3 (SPA) + Tailwind CSS
- **Base de Datos:** PostgreSQL en Supabase
- **Metodología:** Scrumban (Trello)

---

## 2. Estado Actual del Desarrollo

### ✅ Completado
- **Configuración de Entorno:** Repositorio Laravel + Vue inicializado y conexión a PostgreSQL (Supabase) configurada vía `.env`.
- **Tokens de Diseño:** Tailwind CSS configurado con la paleta y tipografías oficiales.

### 🟡 En Curso (Paso Inmediato)
- **Migraciones de la DB:** Creación y ejecución de las 5 tablas relacionales base.

---

## 3. Esquema Relacional de la Base de Datos

### 1. `users` (Usuarios y Roles)
*Donantes, receptores y administradores.*
- `id` (BIGINT, PK)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR)
- `dni` (VARCHAR, UNIQUE)
- `telefono` (VARCHAR)
- `direccion` (VARCHAR)
- `localidad` (VARCHAR)
- `rol` (ENUM: `'user'`, `'admin'` | Default: `'user'`)
- `is_validado` (BOOLEAN | Default: `false`)
- `acepto_ddjj` (BOOLEAN | Default: `false`)
- `fecha_aceptacion_ddjj` (TIMESTAMP, NULLABLE)
- `email_verified_at` (TIMESTAMP, NULLABLE)
- `remember_token` (VARCHAR, NULLABLE)
- `created_at` / `updated_at` (TIMESTAMPS)

### 2. `puntos_entrega` (Puntos Adheridos)
*Farmacias y ONGs intermediarias para entrega/retiro seguro.*
- `id` (BIGINT, PK)
- `nombre` (VARCHAR)
- `direccion` (VARCHAR)
- `localidad` (VARCHAR)
- `telefono` (VARCHAR, NULLABLE)
- `horario_atencion` (VARCHAR, NULLABLE)
- `imagen_url` (VARCHAR, NULLABLE)
- `activo` (BOOLEAN | Default: `true`)
- `created_at` / `updated_at` (TIMESTAMPS)

### 3. `medicamentos_habilitados` (Catálogo Oficial de Referencia)
*Vademécum para validación automática de publicaciones.*
- `id` (BIGINT, PK)
- `nombre_comercial` (VARCHAR)
- `principio_activo` (VARCHAR)
- `concentracion` (VARCHAR, NULLABLE)
- `forma_farmaceutica` (VARCHAR, NULLABLE)
- `presentacion` (VARCHAR, NULLABLE)
- `requiere_receta` (BOOLEAN | Default: `false`)
- `created_at` / `updated_at` (TIMESTAMPS)

### 4. `medicamentos` (Publicaciones de Donación)
*Unidades físicas cargadas por los donantes.*
- `id` (BIGINT, PK)
- `user_id` (BIGINT, FK -> `users.id`, ON DELETE CASCADE)
- `nombre_comercial` (VARCHAR)
- `principio_activo` (VARCHAR)
- `concentracion` (VARCHAR, NULLABLE)
- `forma_farmaceutica` (VARCHAR, NULLABLE)
- `cantidad_disponible` (INTEGER)
- `fecha_vencimiento` (DATE)
- `fotos_envase` (JSON — hasta 3 URLs de almacenamiento)
- `descripcion` (TEXT, NULLABLE)
- `estado` (ENUM: `'disponible'`, `'pendiente_revision'`, `'reservado'`, `'entregado'`, `'rechazado'` | Default: `'disponible'`)
- `created_at` / `updated_at` (TIMESTAMPS)
- *Índice:* `['nombre_comercial', 'principio_activo', 'estado']`

### 5. `solicitudes` (Intercambios y Trazabilidad)
*Vinculación entre receptor, publicación y punto de encuentro.*
- `id` (BIGINT, PK)
- `medicamento_id` (BIGINT, FK -> `medicamentos.id`, ON DELETE CASCADE)
- `receptor_id` (BIGINT, FK -> `users.id`, ON DELETE CASCADE)
- `punto_entrega_id` (BIGINT, FK -> `puntos_entrega.id`, ON DELETE SET NULL, NULLABLE)
- `receta_medica_url` (VARCHAR, NULLABLE)
- `es_para_tercero` (BOOLEAN | Default: `false`)
- `notas_coordinacion` (TEXT, NULLABLE)
- `codigo_confirmacion` (VARCHAR(6))
- `acepto_ddjj_receptor` (BOOLEAN | Default: `false`)
- `fecha_aceptacion_ddjj` (TIMESTAMP, NULLABLE)
- `estado` (ENUM: `'pendiente_coordinacion'`, `'en_camino'`, `'completado'`, `'cancelado'` | Default: `'pendiente_coordinacion'`)
- `fecha_entrega` (TIMESTAMP, NULLABLE)
- `created_at` / `updated_at` (TIMESTAMPS)

---

### Fase 1: Persistencia y Datos Semilla
- [ ] Ejecutar migraciones en Supabase respetando el orden relacional:
  1. `users`, `puntos_entrega`, `medicamentos_habilitados`
  2. `medicamentos`
  3. `solicitudes`
- [ ] Implementar `DatabaseSeeder`:
  - 10-15 fármacos en `medicamentos_habilitados`.
  - 3 puntos de entrega en `puntos_entrega`.
  - 2 usuarios de prueba (1 admin, 1 donante validado).
  - 5 registros de prueba en `medicamentos` con `estado = 'disponible'`.

### Fase 2: Feature Inicial (First-Feature)
*Objetivo: Comprobar el flujo Supabase -> Laravel -> Vue sin dependencia de Auth.*
- [ ] Backend: `GET /api/medicamentos` (filtrar `estado = 'disponible'` y `fecha_vencimiento >= now()`).
- [ ] Frontend: Vista de catálogo/marketplace con barra de búsqueda reactiva por nombre comercial y principio activo.

### Fase 3: Autenticación y Cuentas
- [ ] Configurar Laravel Sanctum (`/api/register`, `/api/login`, `/api/logout`).
- [ ] Middleware para restringir acciones si `is_validado == false`.
- [ ] Vistas de Login y Registro en Vue integrando checkbox de Declaración Jurada.
- [ ] Vista de Perfil (consulta de datos e historial).

### Fase 4: Módulo "Quiero Donar"
- [ ] Endpoint `POST /api/medicamentos` con subida de hasta 3 fotos.
- [ ] Lógica de validación cruzada con `medicamentos_habilitados`:
  - Coincide -> `estado = 'disponible'`.
  - No coincide -> `estado = 'pendiente_revision'`.

### Fase 5: Módulo "Quiero Recibir" & Trazabilidad
- [ ] Endpoint `POST /api/solicitudes`:
  - Reserva de medicamento (`estado = 'reservado'`).
  - Generación de `codigo_confirmacion` de 6 dígitos.
  - Subida de `receta_medica_url` (si `requiere_receta == true`).
- [ ] Endpoint para confirmación de entrega (validación de código -> `estado = 'entregado'`).

### Fase 6: Panel de Administración
- [ ] Listado y moderación de donaciones en `pendiente_revision`.
- [ ] Alta de medicamentos en el catálogo oficial (`medicamentos_habilitados`).
- [ ] Validación manual de usuarios registrados (`is_validado = true`).
- [ ] CRUD de `puntos_entrega`.