# shadcn/vue

Qué hay en `src/components/ui`, qué no se usa y qué no hay que traer. Lenguaje, tokens, mensajes y la `service_role` key se rigen por `AGENTS.md`. El pulido de cada pantalla es la sección 5 de `ROADMAP.md`: tener el componente no cierra esa fidelidad. La landing (fase 10) todavía no usa esta carpeta.

El CLI copia el componente al proyecto. No es un paquete cerrado. Se generan en JavaScript (`typescript: false` en `components.json`). Un `shadcn-vue add` puede pisar `src/style.css`: después hay que dejar los tokens y las fuentes como estaban.

## Alias

shadcn nombra colores que no están en la paleta. En `@theme` son alias, sin hex nuevos:

| Alias | Apunta a |
|---|---|
| `primary-foreground`, `secondary-foreground` | `background` |
| `muted-foreground` | `muted` |
| `destructive` | `danger` |
| `card`, `popover` | `surface` |
| `card-foreground`, `popover-foreground`, `accent-foreground` | `foreground` |
| `border`, `input` | `line` |
| `ring` | `primary` |
| `accent` | `primary-soft` |

`muted` sigue siendo el gris `#6C757D`: un `bg-muted` no es un fondo neutro claro. `cn-font-heading` usa Noto Sans. No reemplazar estos alias por la paleta por defecto del CLI.

## Dependencias

Ya están `reka-ui`, `@vueuse/core`, `class-variance-authority`, `@lucide/vue`, el paquete `cn` y `vue-sonner`. El CSS de Sonner entra desde `App.vue`. `tw-animate-css` está como devDependency y no se importa en `src/style.css`.

No instalar al lado `lucide-vue-next`, `clsx` ni `tailwind-merge`: el CLI de este proyecto no los usa.

## En uso

| Componente | Dónde |
|---|---|
| Button | Acciones de formularios, chat, fotos y reintento |
| Input, Label | Campos de texto, email, contraseña, número, fecha y hora |
| Textarea | Descripción de la donación |
| Checkbox | DDJJ y «es para un tercero» |
| Card | Catálogo, ficha, «Mis donaciones» y «Mis solicitudes» |
| Badge | Estados de donación, de solicitud y de cuenta |
| Alert | Errores, advertencias y avisos que quedan en la pantalla |
| Sonner | Resultado de ingresar, cerrar sesión, registrarse y publicar |
| Tabs | `/perfil` y `/admin/donaciones` |
| Scroll area | Lista de mensajes del chat |
| Select | Vínculo al vademécum al aprobar, y filtros de `/admin/usuarios` |
| Table | Cuentas en `/admin/usuarios` |
| Dropdown menu | Menú de perfil en la barra |
| Navigation menu | Enlaces de la barra |
| Dialog | Cerrar sesión, cancelar solicitud, rechazar donación y acciones de cuenta |

El `<datalist>` de `/donar` se conserva. El input de archivo (envase y receta) sigue nativo: los límites los validan el composable y la Edge Function.

### Alert

Variantes con los tokens `danger`, `success`, `warning` y `muted` (`text-*`, `border-*`, `bg-*/10`).

| Tipo | Token | Dónde |
|---|---|---|
| Error | `danger` | Carga, formulario, cierre de sesión que falla |
| Éxito | `success` | Confirmaciones que quedan en la pantalla |
| Advertencia | `warning` | Cuenta suspendida, sugerencias que fallan, motivo de rechazo, normas del chat |
| Informativo | `muted` | Listas vacías, chat cerrado, código que no se pudo leer |

### Sonner

`Toaster` en `App.vue`: arriba al centro, 3 segundos, `rich-colors`, tema claro, radio `radius-lg`. Fondo `surface`, texto `foreground`.

- Éxito: borde `success`.
- Donación en revisión (`toast.info`): borde `icon`.
- Cerrar sesión: `toast.success` con borde `danger`.

Los textos de la donación se arman en `useDonaciones.js`. Los errores de esos formularios, las advertencias de `/donar` y el aviso de sección solo para administradores siguen en Alert.

## Copiado y sin uso

**Pagination** está en `src/components/ui/pagination` y no entra en ninguna pantalla. Los textos del CLI están en inglés (`First`, `Previous`, `Next`, `Last`, `More pages`). El slot de cada control reemplaza ícono y texto juntos: al usarlo, los dos van en español. Se importa desde `@/components/ui/pagination`.

## No traer

| Componente | Motivo |
|---|---|
| Form | Trae `vee-validate` y Zod. La validación ya está en los composables. |
| Combobox o Command en `/donar` | Un select cerrado no deja escribir un valor fuera del vademécum. Select sí se usa cuando el admin elige una fila que ya existe. |
| Sheet | La barra usa Navigation menu y Dropdown menu. |
| Calendar | Fecha y hora son `input type="date"` y `input type="time"`. |
| Avatar | No hay fotos de perfil. |
| Alert dialog | Las confirmaciones ya usan Dialog. |
| Skeleton | Opcional. Hoy la carga es un párrafo con `text-muted`. |

No anticipar componentes de marketing (accordion, carrusel) hasta la fase 10.

## Al agregar uno

1. Solo si el usuario lo pide.
2. `typescript: false`, destino `src/components/ui`.
3. Revisar `src/style.css` y descartar el cambio de tema que haga el CLI.
4. No mover lógica de Supabase a `src/components/ui`.
5. Textos visibles en español.
