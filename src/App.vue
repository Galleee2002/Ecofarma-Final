<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from './composables/useAuth';
import ToastViewport from './components/ui/ToastViewport.vue';

const router = useRouter();
const { sesion, perfil, errorPerfil, mensajeExito, tipoMensaje, cargando, error, cerrarSesion, ocultarMensajeExito } =
    useAuth();

const esAdmin = computed(function () {
    return perfil.value !== null && perfil.value.rol === 'admin';
});

function claseAviso() {
    if (tipoMensaje.value === 'advertencia') {
        return 'border-warning bg-warning/10 text-warning';
    }
    return 'border-success bg-success/10 text-success';
}

async function salir() {
    if (!window.confirm('Vas a salir de EcoFARMA en este dispositivo.')) {
        return;
    }

    const salio = await cerrarSesion();
    if (salio) {
        router.push({ name: 'catalogo' });
    }
}
</script>

<template>
    <header class="border-b border-line bg-surface">
        <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-6 py-4">
            <RouterLink :to="{ name: 'catalogo' }" class="font-heading font-bold text-primary">EcoFARMA</RouterLink>
            <nav class="flex flex-wrap items-center gap-3">
                <RouterLink :to="{ name: 'catalogo' }" class="text-primary">Catálogo</RouterLink>
                <RouterLink v-if="sesion !== null" :to="{ name: 'donar' }" class="text-primary">Donar</RouterLink>
                <RouterLink v-if="sesion !== null" :to="{ name: 'perfil' }" class="text-primary">Mi perfil</RouterLink>
                <RouterLink v-if="esAdmin" :to="{ name: 'admin-donaciones' }" class="text-primary">Administración</RouterLink>
            </nav>
            <div class="ml-auto flex flex-wrap items-center gap-3">
                <template v-if="sesion === null">
                    <RouterLink :to="{ name: 'login' }" class="text-primary">Ingresar</RouterLink>
                    <RouterLink :to="{ name: 'registro' }" class="text-primary">Registrarse</RouterLink>
                </template>
                <button v-else type="button" class="text-danger" :disabled="cargando" @click="salir">Cerrar sesión</button>
            </div>
        </div>
    </header>

    <div v-if="mensajeExito !== ''" class="mx-auto mt-4 flex max-w-5xl items-start justify-between gap-2 border px-6 py-3" :class="claseAviso()">
        <p>{{ mensajeExito }}</p>
        <button type="button" @click="ocultarMensajeExito">Cerrar</button>
    </div>
    <p v-if="errorPerfil !== ''" class="mx-auto mt-4 max-w-5xl border border-danger bg-danger/10 px-6 py-3 text-danger">{{ errorPerfil }}</p>
    <p v-if="error !== ''" class="mx-auto mt-4 max-w-5xl border border-danger bg-danger/10 px-6 py-3 text-danger">{{ error }}</p>

    <RouterView />
    <ToastViewport />
</template>
