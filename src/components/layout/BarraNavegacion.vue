<script setup>
import { useRoute, useRouter } from 'vue-router';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../composables/useAuth';

const route = useRoute();
const router = useRouter();
const { sesion, perfil, errorPerfil, mensajeExito, tipoMensaje, cargando, error, cerrarSesion, ocultarMensajeExito } = useAuth();

function varianteAviso() {
    if (tipoMensaje.value === 'cierre') {
        return 'danger';
    }
    if (tipoMensaje.value === 'advertencia') {
        return 'warning';
    }
    return 'success';
}

function nombreUsuario() {
    if (perfil.value !== null && perfil.value.name) {
        return perfil.value.name;
    }
    return sesion.value.user.email;
}

function claseEnlace(nombre) {
    if (route.name === nombre) {
        return 'text-secondary';
    }
    if (nombre === 'catalogo' && route.name === 'medicamento-detalle') {
        return 'text-secondary';
    }
    return 'text-primary';
}

async function salir() {
    const salio = await cerrarSesion();
    if (salio) {
        router.push({ name: 'catalogo' });
    }
}
</script>

<template>
    <header class="mx-auto flex max-w-5xl flex-col gap-2 p-6 pb-0">
        <nav class="flex flex-wrap items-center gap-4">
            <RouterLink :to="{ name: 'catalogo' }" :class="claseEnlace('catalogo')">Catálogo</RouterLink>

            <template v-if="sesion === null">
                <RouterLink :to="{ name: 'login' }" :class="claseEnlace('login')">Ingresar</RouterLink>
                <RouterLink :to="{ name: 'registro' }" :class="claseEnlace('registro')">Registrarse</RouterLink>
            </template>

            <template v-else>
                <RouterLink :to="{ name: 'donar' }" :class="claseEnlace('donar')">Donar</RouterLink>
                <RouterLink :to="{ name: 'perfil' }" :class="claseEnlace('perfil')">Mi perfil</RouterLink>
                <template v-if="perfil !== null && perfil.rol === 'admin'">
                    <RouterLink :to="{ name: 'admin-donaciones' }" :class="claseEnlace('admin-donaciones')">
                        Moderación
                    </RouterLink>
                    <RouterLink :to="{ name: 'admin-vademecum' }" :class="claseEnlace('admin-vademecum')">
                        Vademécum
                    </RouterLink>
                </template>
                <span class="text-icon">Hola, {{ nombreUsuario() }}</span>
                <Button
                    type="button"
                    class="border-danger bg-danger text-primary-foreground hover:border-danger hover:bg-danger/90 hover:text-primary-foreground"
                    :disabled="cargando"
                    @click="salir"
                >
                    {{ cargando ? 'Cerrando sesión...' : 'Cerrar sesión' }}
                </Button>
            </template>
        </nav>

        <Alert
            v-if="mensajeExito !== ''"
            :variant="varianteAviso()"
            class="flex items-start justify-between gap-2"
        >
            <p>{{ mensajeExito }}</p>
            <Button type="button" variant="ghost" @click="ocultarMensajeExito">Cerrar</Button>
        </Alert>

        <Alert v-if="errorPerfil !== ''" variant="danger">
            <p>{{ errorPerfil }}</p>
        </Alert>

        <Alert v-if="error !== ''" variant="danger">
            <p>{{ error }}</p>
        </Alert>
    </header>
</template>
