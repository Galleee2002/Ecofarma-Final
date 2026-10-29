<script setup>
import { useAuth } from './composables/useAuth';
import AppNavbar from './components/layout/AppNavbar.vue';
import ToastViewport from './components/ui/ToastViewport.vue';

const { errorPerfil, mensajeExito, tipoMensaje, error, ocultarMensajeExito } = useAuth();

function claseAviso() {
    if (tipoMensaje.value === 'advertencia') {
        return 'border-warning bg-warning/10 text-warning';
    }
    return 'border-success bg-success/10 text-success';
}

</script>

<template>
    <AppNavbar />

    <div v-if="mensajeExito !== ''" class="mx-auto mt-4 flex max-w-5xl items-start justify-between gap-2 border px-6 py-3" :class="claseAviso()">
        <p>{{ mensajeExito }}</p>
        <button type="button" @click="ocultarMensajeExito">Cerrar</button>
    </div>
    <p v-if="errorPerfil !== ''" class="mx-auto mt-4 max-w-5xl border border-danger bg-danger/10 px-6 py-3 text-danger">{{ errorPerfil }}</p>
    <p v-if="error !== ''" class="mx-auto mt-4 max-w-5xl border border-danger bg-danger/10 px-6 py-3 text-danger">{{ error }}</p>

    <RouterView />
    <ToastViewport />
</template>
