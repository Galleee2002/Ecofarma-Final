<script setup>
import { ref, onMounted } from 'vue';
import { Alert } from '@/components/ui/alert';
import { useVademecum } from '../composables/useVademecum';
import FormularioAltaVademecum from '../components/admin/FormularioAltaVademecum.vue';
import NavAdmin from '../components/admin/NavAdmin.vue';

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
    <main class="mx-auto flex max-w-md flex-col gap-4 p-6">
        <h1 class="text-2xl text-primary">Alta del vademécum</h1>

        <NavAdmin />

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
