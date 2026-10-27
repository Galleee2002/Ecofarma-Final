<script setup>
import { ref, onMounted } from 'vue';
import { Alert } from '@/components/ui/alert';
import { useVademecum } from '../composables/useVademecum';
import FormularioAltaVademecum from '../components/admin/FormularioAltaVademecum.vue';

const {
    error,
    guardando,
    errorAlta,
    tipoErrorAlta,
    mensajeAlta,
    cargarSugerencias,
    darDeAlta,
} = useVademecum();

const claveFormulario = ref(0);

async function guardar(datos) {
    const guardado = await darDeAlta(datos);
    if (guardado) {
        claveFormulario.value = claveFormulario.value + 1;
    }
}

onMounted(function () {
    cargarSugerencias();
});
</script>

<template>
    <main class="flex max-w-3xl flex-col gap-6">
        <h1 class="text-2xl font-bold text-primary">Alta del vademécum</h1>

        <Alert v-if="error !== ''" variant="warning">
            <p>{{ error }}</p>
        </Alert>

        <FormularioAltaVademecum
            :key="claveFormulario"
            :cargando="guardando"
            :error="errorAlta"
            :tipo-error="tipoErrorAlta"
            :mensaje="mensajeAlta"
            @guardar="guardar"
        />
    </main>
</template>
