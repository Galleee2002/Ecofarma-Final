<script setup>
import { useAuth } from './composables/useAuth';
import AppNavbar from './components/layout/AppNavbar.vue';
import ToastViewport from './components/ui/ToastViewport.vue';

const { errorPerfil, error } = useAuth();

const vistasConBorrador = ['RegistroView', 'DonarView', 'MedicamentoDetalleView'];
</script>

<template>
    <AppNavbar />

    <p v-if="errorPerfil !== ''" class="mx-auto mt-4 max-w-5xl border border-danger bg-danger/10 px-6 py-3 text-danger">{{ errorPerfil }}</p>
    <p v-if="error !== ''" class="mx-auto mt-4 max-w-5xl border border-danger bg-danger/10 px-6 py-3 text-danger">{{ error }}</p>

    <RouterView v-slot="{ Component }">
        <KeepAlive :include="vistasConBorrador">
            <component :is="Component" />
        </KeepAlive>
    </RouterView>
    <ToastViewport />
</template>
