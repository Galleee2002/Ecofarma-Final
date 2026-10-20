# shadcn/vue — implementación

Notas para cuando se pida instalar y usar [shadcn/vue](https://www.shadcn-vue.com/). Hasta ese pedido, la interfaz sigue con clases de Tailwind mínimas. Este documento no autoriza a instalarlo: describe qué traer, qué dejar para después y qué no instalar, en base a las fases 2 a 7 ya hechas.

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

Los componentes usan nombres de shadcn que no están en la paleta. En `@theme` de `src/style.css` esos nombres son alias de tokens que ya existen, sin hex nuevos: `primary-foreground` y `secondary-foreground` apuntan a `background`, `muted-foreground` a `muted`, `destructive` a `danger`, `card` a `background`, `card-foreground` a `foreground`, `border` e `input` a `muted`, y `ring` a `primary`. `muted` sigue siendo `#6C757D`, así que un `bg-muted` se ve gris. `cn-font-heading` usa Noto Sans. No reemplazar estos alias por la paleta por defecto del CLI. Un `shadcn-vue add` puede pisar `src/style.css`; hay que revisar ese archivo después.

---

## Pantallas listas para maquetar

La funcionalidad de las fases 2 a 7 ya está, con estilos mínimos. Estas pantallas se pueden maquetar con los componentes de la sección 2. El casillero se marca cuando esa pantalla quedó maquetada. Hoy todos están sin marcar.

- [ ] **Catálogo** — `/catalogo`. `CatalogoView` y `components/medicamentos/` (`MedicamentoSearch`, `MedicamentoGrid`, `MedicamentoCard`).
- [ ] **Detalle y solicitud** — `/medicamento/:id`. `MedicamentoDetalleView`, `DetalleMedicamento` y `PanelSolicitar`.
- [ ] **Ingreso** — `/login`. `LoginView` y `FormularioLogin`. Acepta `?redirect=`.
- [ ] **Registro** — `/registro`. `RegistroView` y `FormularioRegistro`.
- [ ] **Perfil** — `/perfil`. `PerfilView` con las pestañas Mis datos (`FormularioPerfil`), Mis donaciones (`ListaMisDonaciones`) y Mis solicitudes (`ListaMisSolicitudes`).
- [ ] **Publicar donación** — `/donar`. `DonarView` y `FormularioDonacion`. El `<datalist>` del vademécum se conserva.
- [ ] **Chat** — `/solicitud/:solicitudId/chat`. `ChatView` y `components/chat/` (`ListaMensajes`, `FormularioMensaje`, `FormularioEncuentro`, `FormularioConfirmarEntrega`, `PanelCancelarSolicitud`).
- [ ] **Barra de navegación** — todas las rutas. `components/layout/BarraNavegacion`. No es una pantalla, pero se maqueta junto con el resto.

Todavía no tienen pantalla ni flujo, así que no se marcan acá:

- Moderación de donaciones (fase 8): rutas `/admin/*`.
- Gestión de usuarios, roles y bloqueos (fase 9).
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

- `reka-ui`
- `@vueuse/core` (lo usa `ScrollArea`)

`class-variance-authority` y `tw-animate-css` ya estaban. `tw-animate-css` sigue como devDependency; no se importó en `src/style.css` para no pisar los tokens ni las fuentes.

---

## 2. Traer ahora

Cubren los controles que hoy son HTML con clases mínimas en las fases 2 a 7 (catálogo, registro, login, perfil, donar, solicitar y chat).

| Componente | Dónde entra |
|---|---|
| **Button** | Login, registro, perfil, donar, solicitar, quitar foto o receta, reintentar, cerrar sesión y enviar en el chat |
| **Input** | Texto, email, contraseña, teléfono, número, fecha y hora |
| **Label** | Las etiquetas de esos formularios |
| **Textarea** | Descripción de la donación (`FormularioDonacion.vue`) |
| **Checkbox** | DDJJ del registro, DDJJ al solicitar y «es para un tercero» (`FormularioRegistro.vue`, `PanelSolicitar.vue`) |
| **Card** | Tarjeta del catálogo (`MedicamentoCard.vue`), ficha del medicamento y cada ítem de «Mis donaciones» y «Mis solicitudes» |
| **Badge** | Estados de la donación (En revisión, Disponible, Reservado, Entregado, Rechazado) y de la solicitud |
| **Alert** | Errores, éxitos, advertencias y avisos informativos |
| **Tabs** | Las tres pestañas de `/perfil`: Mis datos, Mis donaciones, Mis solicitudes (`PerfilView.vue`) |
| **Scroll area** | La lista de mensajes del chat (`ListaMensajes.vue`), que ya hace scroll al final |

### Alert y los cuatro tipos de mensaje

**Alert** es el componente que tiene que respetar la regla de mensajes de `AGENTS.md`. El texto sigue en español y el color sale del token que corresponda:

| Tipo | Token | Dónde se usa hoy |
|---|---|---|
| Error | `danger` | Fallo de carga, error de formulario, cierre de sesión |
| Éxito | `success` | Registro, ingreso, datos guardados, donación publicada como `disponible` |
| Advertencia | `warning` | Cuenta con `is_validado = false`, sugerencias del vademécum que fallan, motivo de rechazo, normas del chat |
| Informativo | `muted` | Donación en `pendiente_revision`, listas vacías, chat cerrado, código de retiro que no se pudo leer |

Las variantes por defecto de shadcn no coinciden con esos cuatro tokens. Hay que ajustarlas en el componente copiado a `src/components/ui`, usando `text-danger`, `border-danger`, `bg-danger/10` y los equivalentes de `success`, `warning` y `muted`. No usar hex ni los colores por defecto de Tailwind (`red-500`, `green-500`, etc.).

---

## 3. Dejar para más adelante

No hace falta traerlos para el frontend de lo que ya existe.

| Componente | Cuándo |
|---|---|
| **Alert dialog** | Solo si más adelante se quiere un modal para confirmar la entrega o cancelar. Hoy esas acciones están en la misma pantalla del chat, sin modal. |
| **Table**, **Select** y **Tabs** de nuevo | Moderación de donaciones (fase 8) y gestión de usuarios (fase 9): pestañas con contador, filtros por estado y rol, búsqueda por nombre, email o DNI. |
| **Skeleton** | Opcional, si se quiere reemplazar los textos «Cargando…». Hoy ese estado es un párrafo con `text-muted`. |

La fase 10 (landing) es la última del tablero. No anticipar componentes de marketing (accordion, carrusel, etc.) hasta esa etapa.

---

## 4. No traer

| Componente | Por qué |
|---|---|
| **Form** | Arrastra `vee-validate` y Zod. La validación ya vive en los composables (`useAuth`, `useDonaciones`, `useSolicitudes`). Con Input, Label, Textarea y Checkbox alcanza, y el proyecto pide sintaxis básica sin librerías de más. |
| **Select**, **Combobox** o **Command** para el vademécum | `FormularioDonacion.vue` usa `<datalist>` a propósito. El donante puede escribir un valor que no está en `medicamentos_habilitados`; en ese caso la Edge Function `publicar-medicamento` deja la donación en `pendiente_revision`. Un select cerrado perdería ese comportamiento. |
| **Sonner** o **Toast** | Los mensajes están en el formulario o en la barra de navegación, no son notificaciones flotantes. El cierre de sesión, por ejemplo, se muestra en `BarraNavegacion.vue` con un botón «Cerrar». |
| **Navigation menu**, **Dropdown menu**, **Sheet** | `BarraNavegacion.vue` es un `nav` simple (catálogo, donar, perfil, cerrar sesión). |
| **Calendar** y selector de fecha de shadcn | Las fechas y horas usan `input type="date"` y `input type="time"` (vencimiento de la donación, día y hora del encuentro). |
| **Avatar** | No hay fotos de perfil. Las imágenes son fotos de envase y de receta. |

El input de archivo (fotos del envase y foto de la receta) se queda nativo. shadcn/vue no trae un file input que reemplace ese control, y los límites (1 a 3 fotos, JPG/PNG/WEBP, 5 MB) siguen validados en el composable y en la Edge Function.

---

## 5. Al implementar

1. Instalar solo cuando se pida de forma explícita.
2. Dejar que el CLI agregue las dependencias de la sección 1. No instalar `lucide-vue-next`, `clsx` ni `tailwind-merge` al lado de `@lucide/vue` y del paquete `cn`.
3. `typescript: false`. Componentes en `src/components/ui`. No tocar los tokens, los alias de tema ni las fuentes.
4. Traer únicamente la lista de la sección 2.
5. Ajustar las variantes de **Alert** (y, si hace falta, **Badge**) a los tokens de `src/style.css`.
6. Reemplazar el HTML mínimo de los componentes de dominio (`components/auth`, `components/medicamentos`, `components/donaciones`, `components/perfil`, `components/chat`, `components/layout`). No mover la lógica de Supabase a `src/components/ui`. Al terminar una pantalla, marcar su casillero en «Pantallas listas para maquetar».
7. Mantener el `<datalist>` del vademécum.
8. No agregar **Form**, toasts ni modales en este paso.
