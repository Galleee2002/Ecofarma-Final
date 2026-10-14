<script setup>
import { useRouter } from 'vue-router';
import { useAuth } from '../../composables/useAuth';

const router = useRouter();
const { sesion, perfil, mensajeExito, tipoMensaje, cargando, error, cerrarSesion, ocultarMensajeExito } = useAuth();

function nombreUsuario() {
    if (perfil.value !== null && perfil.value.name) {
        return perfil.value.name;
    }
    return sesion.value.user.email;
}

async function salir() {
    const salio = await cerrarSesion();
    if (salio) {
        router.push({ name: 'catalogo' });
    }
}
</script>

<template>
    <header class="mx-auto flex max-w-3xl flex-col gap-2 p-6 pb-0">
        <nav class="flex flex-wrap items-center gap-4">
            <RouterLink :to="{ name: 'catalogo' }" class="text-primary">Catálogo</RouterLink>

            <template v-if="sesion === null">
                <RouterLink :to="{ name: 'login' }" class="text-primary">Ingresar</RouterLink>
                <RouterLink :to="{ name: 'registro' }" class="text-primary">Registrarse</RouterLink>
            </template>

            <template v-else>
                <RouterLink :to="{ name: 'perfil' }" class="text-primary">Mi perfil</RouterLink>
                <span>Hola, {{ nombreUsuario() }}</span>
                <button type="button" class="rounded border px-3 py-1" :disabled="cargando" @click="salir">
                    {{ cargando ? 'Cerrando sesión...' : 'Cerrar sesión' }}
                </button>
            </template>
        </nav>

        <div
            v-if="mensajeExito !== ''"
            class="flex items-start justify-between gap-2 rounded border p-4"
            :class="tipoMensaje === 'cierre' ? 'border-danger bg-danger/10 text-danger' : 'border-success bg-success/10 text-success'"
        >
            <p>{{ mensajeExito }}</p>
            <button type="button" @click="ocultarMensajeExito">Cerrar</button>
        </div>

        <p v-if="error !== ''" class="rounded border border-danger bg-danger/10 p-4 text-danger">{{ error }}</p>
    </header>
</template>
