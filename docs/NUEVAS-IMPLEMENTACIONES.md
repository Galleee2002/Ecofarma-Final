# Nuevas implementaciones

Bitácora breve de cambios listos para llevar al MVP. Solo lo esencial: qué, dónde y cómo portarlo.

---

## 1. Navbar inferior (pill)

**Qué:** Pastilla fija abajo (mobile-first). Reemplaza header azul + hamburguesa.

| Tab | Ruta | Icono | Activa en |
|-----|------|-------|-----------|
| Inicio | `/recibir` | `House` | `recibir`, `catalogo`, `medicamento-detalle` |
| Donar | `/donar` | `HandHeart` | `donar` |
| Adheridos | `/adheridos` | `Building2` | `adheridos` |
| Perfil | `/perfil` | `User` | `perfil` |

Chat (`/solicitud/:id/chat`) solo desde perfil. Estilo: `bg-surface` + `rounded-full` + `shadow-md` + safe-area; activa `bg-primary-soft` / `text-icon`.

**Archivos:** `AppNavbar.vue`, `App.vue` (`pb-[calc(5.5rem+env(safe-area-inset-bottom))]`), ruta + `AdheridosView.vue` (vacía). Auth/admin quedan fuera de la pill.

**Portar:** copiar navbar + vista adheridos; registrar ruta; montar barra fija y reservar padding inferior; quitar header/hamburguesa viejos. Al portar la ruta de solicitud (§4), sumar `medicamento-solicitar` a la pestaña Inicio si corresponde.

---

## 2. Header de inicio (catálogo)

**Qué:** Cabecera del home/catálogo con saludo, avatar/inicial, campana (UI sin lógica) y búsqueda pill. Reemplaza el `h1` + `BaseInput`/`BaseSelect` de orden.

- `v-model` → `busqueda` de `useMedicamentos`.
- Saludo: `Hola` o `Hola {perfil.name}`; inicial o icono `User`.
- `Bell` solo visual. UI de orden sacada (`orden` queda en composable, default `recientes`).

**Archivos:** `HeaderInicio.vue`; `CatalogoView.vue` monta `<HeaderInicio v-model="busqueda" />`.

**Portar:** copiar componente; cablear a la búsqueda del listado; quitar título viejo y select de orden.

---

## 3. Card de medicamento + lugares en catálogo

**Qué:** Lista del catálogo con card nueva y bloque de lugares adheridos al pie.

**Card (`MedicamentoCard.vue`)**

- Título: `nombre_comercial`
- Línea: `concentracion · cantidad {cantidad_disponible}`
- Fecha: `created_at` → `toLocaleDateString('es-AR')` (auto de BD; el usuario no la elige)
- Badge de `estado` (en catálogo suele ser `disponible`)
- Botones: **Ver detalle** (`outline` + `bg-surface`) → `medicamento-detalle`; **Solicitar** (`primary`) → `medicamento-solicitar`
- Ya no muestra badge con/sin receta ni principio activo / forma en la card

**Listado:** `useMedicamentos` agrega `estado` al `select`. `CatalogoView` usa `<MedicamentoCard>` en el `v-for`.

**Lugares (`LugaresAdheridos.vue`)**

- Grilla 2 columnas: Clínica EKA, Farmacia Calvagni (datos hardcodeados).
- Imágenes: `public/clinica-eka.jpg`, `public/farmacia-calvagni.webp`.
- Link “Ver más” → `/adheridos`. Montado al final de `CatalogoView`.

**Portar:** copiar `MedicamentoCard`, `LugaresAdheridos` + assets; actualizar select del listado; reemplazar markup viejo de la card; montar lugares al pie.

---

## 4. Formulario de solicitud separado

**Qué:** El pedido sale del detalle. Nueva pantalla `/medicamento/:id/solicitar` (`meta.requiereSesion`).

**Flujo**

```
Catálogo (Solicitar / Ver detalle) → Detalle (solo ficha + Solicitar) → Form solicitud → crear-solicitud
```

**Detalle:** `MedicamentoDetalleView` solo `FichaMedicamento` + botón Solicitar. Se eliminó `PanelSolicitud.vue`.

**Form (`SolicitarMedicamentoView.vue`)**

| Campo | Comportamiento |
|-------|----------------|
| Nombre / teléfono | De `perfil`, solo lectura (`disabled`) |
| Motivo | Obligatorio; se guarda en `solicitudes.motivo` |
| Para otra persona + destinatario | Igual que antes |
| Receta | Siempre visible; obligatoria solo si el medicamento la requiere |
| DDJJ / términos | Checkbox con `RouterLink` + `@click.stop` |

**Backend**

- Migración `20261122224818_agregar_motivo_solicitud.sql`: columna `motivo` + `GRANT SELECT` (incluir `motivo` en la lista de columnas).
- Edge `crear-solicitud`: valida motivo no vacío e inserta.
- `useSolicitudes`: valida y envía `motivo` en el body.

**Archivos:** ruta en `router/index.js` (`medicamento-solicitar`); vista nueva; cambios en detalle, edge, composable, migración. Borrar `PanelSolicitud` si existía.

**Portar**

1. Aplicar migración y redeploy de `crear-solicitud`.
2. Copiar vista + actualizar router / detalle / composable / edge.
3. Eliminar panel embebido del detalle.
4. Ajustar navbar Inicio para incluir `medicamento-solicitar` si querés el mismo highlight.
