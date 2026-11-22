# Nuevas implementaciones

Bitácora breve de cambios listos para llevar al MVP. Solo lo esencial: qué, dónde y cómo portarlo.

---

## 1. Navbar inferior (pill)

**Qué:** Reemplaza el header azul + menú hamburguesa por una pastilla fija abajo (mobile-first, sin variante desktop).

**Pestañas**

| Tab | Ruta | Icono Lucide | Notas |
|-----|------|--------------|--------|
| Inicio | `/recibir` | `House` | Activa también en `catalogo` y `medicamento-detalle` |
| Donar | `/donar` | `HandHeart` | `requiereSesion` |
| Adheridos | `/adheridos` | `Building2` | Vista vacía |
| Perfil | `/perfil` | `User` | `requiereSesion` |

El chat de solicitud (`/solicitud/:id/chat`) no va en la pill: se sigue abriendo desde el perfil.

**Estilo**

- Contenedor: `bg-surface`, `rounded-full`, `shadow-md`, `max-w-md`, safe-area inferior.
- Activa: `bg-primary-soft` + `text-icon`.
- Inactiva: `text-muted`.
- Icono arriba, etiqueta abajo (`font-heading`, `text-xs`).

**Archivos**

- `src/components/layout/AppNavbar.vue` — reescrito (ya no usa `BaseNavbar` / `UserMenu`).
- `src/App.vue` — sin header; padding inferior `pb-[calc(5.5rem+env(safe-area-inset-bottom))]`.
- `src/router/index.js` — ruta `adheridos`.
- `src/views/AdheridosView.vue` — `<main class="pagina">` vacío.

**Queda fuera de la UI (temporal)**

Ingresar, Registrarse, Cerrar sesión y admin. La parte superior se arma después. `BaseNavbar.vue` y `UserMenu.vue` quedan en disco sin montar.

**Portar al MVP**

1. Copiar `AppNavbar.vue` y `AdheridosView.vue`.
2. Registrar `/adheridos` en el router.
3. En el shell (`App.vue` o equivalente): montar la barra fija abajo y reservar espacio inferior.
4. Quitar el menú desplegable / header viejo de la navegación principal.
