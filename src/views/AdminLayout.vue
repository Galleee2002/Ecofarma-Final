<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

function claseSeccion(nombre) {
    if (route.name === nombre) {
        return 'font-semibold text-primary';
    }
    return 'text-foreground';
}
</script>

<template>
    <div class="pagina">
        <p class="text-muted">Administración</p>
        <nav class="flex flex-wrap gap-3" aria-label="Secciones de administración">
            <RouterLink :to="{ name: 'admin-donaciones' }" :class="claseSeccion('admin-donaciones')">Donaciones</RouterLink>
            <RouterLink :to="{ name: 'admin-vademecum' }" :class="claseSeccion('admin-vademecum')">Vademécum</RouterLink>
            <RouterLink :to="{ name: 'admin-usuarios' }" :class="claseSeccion('admin-usuarios')">Usuarios</RouterLink>
        </nav>
        <RouterView />
    </div>
</template>
