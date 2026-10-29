# Convenciones visuales — EcoFARMA

Guía para la etapa de fidelidad visual y la landing. Los fundamentos y la paleta canónica están en la sección 3 de `ROADMAP.md`; las reglas de implementación están en `AGENTS.md`.

## Dirección visual

La referencia aprobada es [Bagó](https://www.bago.com.ar/). La interfaz debe sentirse editorial, institucional, moderna y minimalista:

- Dar espacio a la composición y a la tipografía; usar fotografías como protagonistas cuando aporten al contenido.
- Preferir secciones amplias, banners horizontales y títulos con jerarquía clara.
- Usar esquinas redondeadas con moderación y reservar sombras para elementos que necesiten separación.
- Mantener la navegación limpia y profesional, con acentos de marca.
- Evitar la estética genérica de dashboard, las tarjetas con bordes o sombras excesivos, la iconografía decorativa repetida, los gradientes innecesarios y los fondos pastel extendidos por toda la pantalla.

Esta dirección orienta la fidelidad visual; no cambia la prioridad de datos y funcionalidad definida en `AGENTS.md`. No inventar capacidades del producto. En particular, las entregas se coordinan entre usuarios, no hay puntos de entrega fijos ni notificaciones por correo.

## Tokens y fuentes

Tailwind 4 es CSS-first. Los tokens viven en `@theme` de `src/style.css`; no hay `tailwind.config.js`. Usar las clases de tokens y no escribir valores hexadecimales en las vistas o componentes. No usar la paleta por defecto de Tailwind.

Las fuentes se cargan desde Bunny Fonts en `index.html`: Lato 400/700 y Source Sans Pro 400/600.

- Títulos: `font-heading` (Lato), peso 700. Bunny Fonts no sirve Lato 600.
- Cuerpo: `font-sans` (Source Sans Pro), peso 400. El peso 600 se reserva para énfasis en texto, no para títulos.

## Escala tipográfica

Los tamaños corresponden a los tokens configurados en `src/style.css`.

| Token | Tamaño | Uso |
|---|---:|---|
| `text-2xl` | 28 px | `h1` |
| `text-xl` | 22 px | `h2` |
| `text-lg` | 18 px | `h3` |
| `text-base` | 16 px | `h4` y cuerpo |
| `text-sm` | 14 px | `h5` |
| `text-xs` | 12 px | Texto auxiliar |

Los encabezados HTML `h1`–`h5` ya reciben su familia, tamaño y peso en la capa base de `src/style.css`. Mantener el orden semántico de encabezados; ajustar el tamaño visual con intención cuando la composición lo requiera.

## Colores

Usar las clases `bg-*`, `text-*` y `border-*` de los tokens. Para avisos y superficies suaves se admite la opacidad de Tailwind, por ejemplo `bg-success/10`.

| Token | Clases habituales | Uso |
|---|---|---|
| `primary` | `bg-primary`, `text-primary`, `border-primary` | Acciones principales y enlaces |
| `secondary` | `bg-secondary`, `text-secondary`, `border-secondary` | Acento azul secundario |
| `icon` | `text-icon` | Iconos y acentos verdes |
| `success` | `text-success`, `border-success`, `bg-success/10` | Éxito |
| `danger` | `text-danger`, `border-danger`, `bg-danger/10` | Errores y acciones destructivas |
| `warning` | `text-warning`, `border-warning`, `bg-warning/10` | Advertencias |
| `muted` | `text-muted`, `bg-muted/10` | Texto secundario e información |
| `background` | `bg-background` | Fondo de página |
| `surface` | `bg-surface`, `text-surface` | Superficies y texto sobre `primary` |
| `foreground` | `text-foreground` | Texto principal |
| `line` | `border-line` | Bordes e inputs |
| `primary-soft` | `bg-primary-soft` | Fondo azul suave |
| `accent` | `bg-accent`, `text-accent`, `border-accent` | Alias de `primary-soft` |

No agregar alias de shadcn como `primary-foreground`, `destructive`, `muted-foreground` o `ring`.

## Iconos

Usar Lucide mediante `@lucide/vue` e importar solo los iconos necesarios. El color debe venir de los tokens (`text-icon`, por ejemplo) o de `currentColor` cuando lo herede de la variante. Los iconos deben ayudar a identificar una acción o estado; no agregarlos como decoración repetida. No dibujar paths a mano ni reutilizar los componentes antiguos de shadcn que también importaban Lucide.

## Radios, bordes y sombras

- Radios disponibles: `rounded-sm` (0.5rem), `rounded-md` (0.75rem) y `rounded-lg` (1rem).
- Sombras disponibles: `shadow-sm`, `shadow-md` y `shadow-lg`, con tinte `primary` definido en `src/style.css`.
- Usar bordes y sombras con moderación. No convertir cada sección en una tarjeta; separar contenido primero con espacio, tipografía y composición.

## Layout y responsive

Utilidades de ancho de página definidas en `src/style.css`:

| Clase | Ancho máximo |
|---|---:|
| `pagina` | 64 rem |
| `pagina-media` | 48 rem |
| `pagina-formulario` | 28 rem |

Para componentes y pantallas nuevas, implementar con enfoque mobile-first. Comenzar por una composición legible en pantallas estrechas y sumar distribución horizontal en los breakpoints de Tailwind cuando el contenido lo permita. Evitar anchos fijos que provoquen desbordamiento; comprobar estados de navegación, formularios, botones e imágenes en móvil y escritorio.

## Mensajes de estado

Usar el color semántico correspondiente: error `danger`, éxito `success`, advertencia `warning` e información `muted`. El mensaje para la persona debe ser claro y estar en español. El error crudo (`error.message`, códigos de Postgres o stack) solo se escribe en consola. En avisos, combinar texto, borde y fondo suave del mismo token.

## Componentes y estructura

La fidelidad visual se construye con HTML nativo y Tailwind, sin librerías de UI. Destinos previstos:

- `src/components/ui/`
- `src/components/layout/`
- `src/components/landing/`
- `src/components/medicamentos/`

Las vistas actuales de `src/views/` llaman a composables y renderizan formularios o listas; no importan `src/components/`. `App.vue` monta `ToastViewport` una sola vez para las notificaciones globales.

La implementación visual se trabaja de forma incremental por componente o pantalla: analizar, definir diseño, implementar, revisar funcionalidad y compilación, inspeccionar el resultado visual y avanzar cuando esté aprobado. No generar una vista completa de una sola vez.

### Navegación

La landing y la plataforma comparten la identidad visual del navbar: fondo `primary` (`#215b8d`) y textos e iconos `surface` (`#ffffff`). `BaseNavbar.vue` proporciona la estructura visual reutilizable; `LandingNavbar.vue` y `AppNavbar.vue` definen sus enlaces y comportamientos de navegación. Ambos se implementan mobile-first, con menú hamburguesa accesible en móvil y composición horizontal en pantallas mayores. La transición del menú se hace con Vue `Transition` y debe respetar `prefers-reduced-motion`.

Usar el recurso original del proyecto (`public/logo.webp`) o el recurso oficial de Figma. No agregar el nombre EcoFARMA al lado del logo, reconstruir el logo con texto ni alterar sus proporciones. Sobre el fondo azul, los controles y enlaces deben conservar contraste y estados de foco visibles; los botones pueden adaptar su variante para seguir siendo legibles.

### Landing

El hero aprobado usa video de fondo, overlay oscuro semitransparente y el título «Compartir también es cuidar». Asegurar contraste suficiente para el texto y una alternativa visual adecuada si el video no está disponible. Motion for Vue se prevé para animaciones de la landing cuando aporten a la experiencia; las animaciones sencillas existentes usan `Transition` y `TransitionGroup` de Vue.

### Rastro antiguo que no se reutiliza

Este código sigue en disco y depende de paquetes que ya no están (`reka-ui`, `class-variance-authority`, `cn`, `@vueuse/core`). No importarlo ni borrarlo hasta verificar sus referencias. `@lucide/vue` volvió para la iconografía nueva; no usarlo desde estos componentes antiguos.

- UI antigua: `alert`, `badge`, `button`, `card`, `checkbox`, `input`, `label`, `scroll-area`, `tabs`, `textarea`.
- Dominio sin uso: `layout/BarraNavegacion.vue`; `medicamentos/` (`DetalleMedicamento`, `MedicamentoCard`, `MedicamentoGrid`, `MedicamentoSearch`, `PanelSolicitar`); `auth/` (`FormularioLogin`, `FormularioRegistro`); `chat/` (`FormularioConfirmarEntrega`, `FormularioEncuentro`, `FormularioMensaje`, `ListaMensajes`, `PanelCancelarSolicitud`); `perfil/` (`FormularioPerfil`, `ListaMisDonaciones`, `ListaMisSolicitudes`); `donaciones/FormularioDonacion.vue`.
