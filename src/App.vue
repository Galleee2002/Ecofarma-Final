<script setup>
import { ref } from 'vue';
import { useAuth } from './composables/useAuth';
import AppNavbar from './components/layout/AppNavbar.vue';
import PantallaCarga from './components/layout/PantallaCarga.vue';
import BaseFieldError from './components/ui/BaseFieldError.vue';
import ToastViewport from './components/ui/ToastViewport.vue';

const { errorPerfil, error } = useAuth();
const inicioVisible = ref(true);

const vistasConBorrador = ['RegistroView', 'DonarView', 'MedicamentoDetalleView'];

function cerrarInicio() {
    inicioVisible.value = false;
}
</script>

<template>
    <div :inert="inicioVisible ? true : undefined">
        <AppNavbar />

        <BaseFieldError
            v-if="errorPerfil !== ''"
            class="mx-auto mt-4 max-w-5xl px-6"
            :message="errorPerfil"
        />
        <BaseFieldError
            v-if="error !== ''"
            class="mx-auto mt-4 max-w-5xl px-6"
            :message="error"
        />

        <RouterView v-slot="{ Component }">
            <KeepAlive :include="vistasConBorrador">
                <component :is="Component" />
            </KeepAlive>
        </RouterView>
        <ToastViewport />
    </div>
    <PantallaCarga v-if="inicioVisible" @listo="cerrarInicio" />
</template>
