# shadcn/vue — implementación

Los componentes de la sección 2 ya están en `src/components/ui`. Las pantallas de las fases 2 a 9 de «Pantallas listas para maquetar» ya están maquetadas. Este documento describe qué ya se trajo, qué falta en las pantallas, qué dejar para después y qué no instalar.

Reglas que siguen valiendo (`AGENTS.md` y `ROADMAP.md`, sección «Pendiente: componentes shadcn/vue»):

- Vue 3, Vite, Tailwind CSS 4, JavaScript y pnpm. Sin TypeScript.
- El CLI copia cada componente al proyecto (por ejemplo `src/components/ui`). No es un paquete cerrado.
- Generar los componentes en JavaScript (`typescript: false` en `components.json`).
- Conservar `src/style.css`, los tokens (`primary`, `secondary`, `icon`, `success`, `danger`, `warning`, `background`, `foreground`, `muted`) y las fuentes de `index.html`. El init no reemplaza ese archivo.
- El alias `@` en Vite y un `jsconfig.json` alcanzan para los imports.
- Colores solo con esos tokens, nunca con hex sueltos.
- La lógica de datos queda en los composables. Las vistas pasan los datos por props.
- Mensajes personalizados en español. Nunca mostrar el error crudo de Supabase, de una Edge Function o de JavaScript.
- No exponer la `service_role` key.

Los componentes usan nombres de shadcn que no están en la paleta. En `@theme` de `src/style.css` esos nombres son alias de tokens que ya existen, sin hex nuevos: `primary-foreground` y `secondary-foreground` apuntan a `background`, `muted-foreground` a `muted`, `destructive` a `danger`, `card` a `background`, `card-foreground` a `foreground`, `border` e `input` a `muted`, `ring` a `primary`, `popover` y `popover-foreground` a `background` y `foreground`, y `accent` a `primary-soft` con `accent-foreground` en `foreground`. `muted` sigue siendo `#6C757D`, así que un `bg-muted` se ve gris. `cn-font-heading` usa Noto Sans. No reemplazar estos alias por la paleta por defecto del CLI. Un `shadcn-vue add` puede pisar `src/style.css`; hay que revisar ese archivo después.

---

## Pantallas listas para maquetar

La funcionalidad de las fases 2 a 9 ya está. Estas pantallas se maquetan con los componentes de la sección 2. El casillero se marca cuando esa pantalla quedó maquetada.

- [x] **Catálogo** — `/catalogo`. `CatalogoView` y `components/medicamentos/` (`MedicamentoSearch`, `MedicamentoGrid`, `MedicamentoCard`).
- [x] **Detalle y solicitud** — `/medicamento/:id`. `MedicamentoDetalleView`, `DetalleMedicamento` y `PanelSolicitar`.
- [x] **Ingreso** — `/login`. `LoginView` y `FormularioLogin`. Acepta `?redirect=`.
- [x] **Registro** — `/registro`. `RegistroView` y `FormularioRegistro`.
- [x] **Perfil** — `/perfil`. `PerfilView` con las pestañas Mis datos (`FormularioPerfil`), Mis donaciones (`ListaMisDonaciones`) y Mis solicitudes (`ListaMisSolicitudes`).
- [x] **Publicar donación** — `/donar`. `DonarView` y `FormularioDonacion`. El `<datalist>` del vademécum se conserva.
- [x] **Chat** — `/solicitud/:solicitudId/chat`. `ChatView` y `components/chat/` (`ListaMensajes`, `FormularioMensaje`, `FormularioEncuentro`, `FormularioConfirmarEntrega`, `PanelCancelarSolicitud`).
- [x] **Barra de navegación** — todas las rutas. `components/layout/BarraNavegacion`. No es una pantalla, pero se maqueta junto con el resto.
- [x] **Moderación de donaciones** — `/admin/donaciones`. `AdminDonacionesView`, `NavAdmin`, `ListaModeracion` y `TarjetaModeracion`. El vínculo al vademécum usa **Select**.
- [x] **Alta del vademécum** — `/admin/vademecum`. `AdminVademecumView`, `NavAdmin` y `FormularioAltaVademecum`.
- [x] **Gestión de usuarios** — `/admin/usuarios`. `AdminUsuariosView`, `NavAdmin` y `TablaUsuarios`. Usa **Table** y **Select** para los filtros.

Todavía no tienen pantalla ni flujo, así que no se marcan acá:

- Landing (fase 10): Inicio, Información/Ayuda, Sobre nosotros, Contacto y Legales. `/` redirige al catálogo.

---

## 1. Dependencias

`ROADMAP.md` pide estas dependencias de apoyo, que acompañan a los componentes y no reemplazan Vue, Vite ni Tailwind:

- `reka-ui`
- `clsx`
- `tailwind-merge`
- `class-variance-authority`
- `lucide-vue-next`

El CLI actual de shadcn/vue no usa `lucide-vue-next` ni un helper local armado con `clsx` y `tailwind-merge`. Los componentes copiados importan iconos desde `@lucide/vue` y `cn` desde el paquete npm `cn`. Esas dos dependencias ya estaban. No hay que sumar las otras al lado: quedarían las dos formas instaladas.

Al traer la sección 2, el CLI agregó solo lo que faltaba:

- [x] `reka-ui`
- [x] `@vueuse/core` (lo usa `ScrollArea`)
- [x] `class-variance-authority` y `tw-animate-css` ya estaban. `tw-animate-css` sigue como devDependency; no se importó en `src/style.css` para no pisar los tokens ni las fuentes.
- [x] `@lucide/vue` y el paquete `cn` ya estaban. No se instalaron `lucide-vue-next`, `clsx` ni `tailwind-merge`.

---

## 2. Traer ahora

Cubren los controles de las fases 2 a 9 (catálogo, registro, login, perfil, donar, solicitar, chat, moderación y gestión de usuarios). Ya están copiados y esas pantallas ya los usan.

| | Componente | Dónde entra |
|---|---|---|
| [x] | **Button** | Login, registro, perfil, donar, solicitar, quitar foto o receta, reintentar, cerrar sesión y enviar en el chat |
| [x] | **Input** | Texto, email, contraseña, teléfono, número, fecha y hora |
| [x] | **Label** | Las etiquetas de esos formularios |
| [x] | **Textarea** | Descripción de la donación (`FormularioDonacion.vue`) |
| [x] | **Checkbox** | DDJJ del registro, DDJJ al solicitar y «es para un tercero» (`FormularioRegistro.vue`, `PanelSolicitar.vue`) |
| [x] | **Card** | Tarjeta del catálogo (`MedicamentoCard.vue`), ficha del medicamento y cada ítem de «Mis donaciones» y «Mis solicitudes» |
| [x] | **Badge** | Estados de la donación (En revisión, Disponible, Reservado, Entregado, Rechazado), de la solicitud y de las cuentas (Activa, Suspendida, Administrador, Usuario) |
| [x] | **Alert** | Errores, éxitos, advertencias y avisos informativos. Variantes `danger`, `success`, `warning` y `muted`. |
| [x] | **Tabs** | Las tres pestañas de `/perfil` y las de `/admin/donaciones` (`PerfilView.vue`, `AdminDonacionesView.vue`) |
| [x] | **Scroll area** | La lista de mensajes del chat (`ListaMensajes.vue`), que ya hace scroll al final |
| [x] | **Select** | El vínculo al vademécum al aprobar una donación (`TarjetaModeracion.vue`) y los filtros de estado y rol en `/admin/usuarios`. No reemplaza el `<datalist>` de `/donar`. |
| [x] | **Table** | La lista de cuentas en `/admin/usuarios` (`TablaUsuarios.vue`). |

### Alert y los cuatro tipos de mensaje

**Alert** es el componente que tiene que respetar la regla de mensajes de `AGENTS.md`. El texto sigue en español y el color sale del token que corresponda:

| Tipo | Token | Dónde se usa hoy |
|---|---|---|
| Error | `danger` | Fallo de carga, error de formulario, cierre de sesión |
| Éxito | `success` | Registro, ingreso, datos guardados, donación publicada como `disponible` |
| Advertencia | `warning` | Cuenta con `is_validado = false`, sugerencias del vademécum que fallan, motivo de rechazo, normas del chat |
| Informativo | `muted` | Donación en `pendiente_revision`, listas vacías, chat cerrado, código de retiro que no se pudo leer |

Las variantes de `src/components/ui/alert` usan `text-danger`, `border-danger`, `bg-danger/10` y los equivalentes de `success`, `warning` y `muted`. No usar hex ni los colores por defecto de Tailwind (`red-500`, `green-500`, etc.).

---

## 3. Dejar para más adelante

No hace falta traerlos para el frontend de lo que ya existe.

| Componente | Cuándo |
|---|---|
| **Alert dialog** | Solo si más adelante se quiere un modal para confirmar la entrega o cancelar. Hoy esas acciones están en la misma pantalla del chat, sin modal. La gestión de usuarios también confirma en la fila. |
| **Skeleton** | Opcional, si se quiere reemplazar los textos «Cargando…». Hoy ese estado es un párrafo con `text-muted`. |

La fase 10 (landing) es la última del tablero. No anticipar componentes de marketing (accordion, carrusel, etc.) hasta esa etapa.

---

## 4. No traer

| Componente | Por qué |
|---|---|
| **Form** | Arrastra `vee-validate` y Zod. La validación ya vive en los composables (`useAuth`, `useDonaciones`, `useSolicitudes`). Con Input, Label, Textarea y Checkbox alcanza, y el proyecto pide sintaxis básica sin librerías de más. |
| **Combobox** o **Command** para el vademécum al donar | `FormularioDonacion.vue` usa `<datalist>` a propósito. El donante puede escribir un valor que no está en `medicamentos_habilitados`; en ese caso la Edge Function `publicar-medicamento` deja la donación en `pendiente_revision`. Un select cerrado perdería ese comportamiento. El **Select** de shadcn sí se usa en la moderación, donde el admin elige una fila existente. |
| **Sonner** o **Toast** | Los mensajes están en el formulario o en la barra de navegación, no son notificaciones flotantes. El cierre de sesión, por ejemplo, se muestra en `BarraNavegacion.vue` con un botón «Cerrar». |
| **Navigation menu**, **Dropdown menu**, **Sheet** | `BarraNavegacion.vue` es un `nav` simple (catálogo, donar, perfil, cerrar sesión). |
| **Calendar** y selector de fecha de shadcn | Las fechas y horas usan `input type="date"` y `input type="time"` (vencimiento de la donación, día y hora del encuentro). |
| **Avatar** | No hay fotos de perfil. Las imágenes son fotos de envase y de receta. |

El input de archivo (fotos del envase y foto de la receta) se queda nativo. shadcn/vue no trae un file input que reemplace ese control, y los límites (1 a 3 fotos, JPG/PNG/WEBP, 5 MB) siguen validados en el composable y en la Edge Function.

---

## 5. Al implementar

1. [x] Instalar solo cuando se pida de forma explícita.
2. [x] Dejar que el CLI agregue las dependencias de la sección 1. No instalar `lucide-vue-next`, `clsx` ni `tailwind-merge` al lado de `@lucide/vue` y del paquete `cn`.
3. [x] `typescript: false`. Componentes en `src/components/ui`. No tocar los tokens, los alias de tema ni las fuentes.
4. [x] Traer la lista de la sección 2, **Select** para el vínculo al vademécum en la moderación y **Table** para `/admin/usuarios`.
5. [x] Ajustar las variantes de **Alert** a los tokens de `src/style.css` (`danger`, `success`, `warning` y `muted`). **Badge** conserva las variantes del CLI y suma variantes con esos tokens para los estados de donación, de solicitud y de cuenta.
6. [x] Reemplazar el HTML mínimo de los componentes de dominio (`components/auth`, `components/medicamentos`, `components/donaciones`, `components/perfil`, `components/chat`, `components/layout`). No mover la lógica de Supabase a `src/components/ui`. Al terminar una pantalla, marcar su casillero en «Pantallas listas para maquetar».
7. [x] Mantener el `<datalist>` del vademécum al maquetar `/donar`. Sigue en `FormularioDonacion.vue`.
8. [x] No agregar **Form**, toasts ni modales en este paso.
