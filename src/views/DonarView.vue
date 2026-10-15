<script setup>
import { computed, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useVademecum } from '../composables/useVademecum';
import { useDonaciones } from '../composables/useDonaciones';
import FormularioDonacion from '../components/donaciones/FormularioDonacion.vue';

const { perfil, errorPerfil } = useAuth();
const { filas: sugerencias, error: errorSugerencias, cargarSugerencias } = useVademecum();
const { publicando, errorPublicar, mensajePublicar, publicarDonacion } = useDonaciones();

const cuentaSuspendida = computed(function () {
    return perfil.value !== null && perfil.value.is_validado === false;
});

onMounted(function () {
    cargarSugerencias();
});
</script>

<template>
    <main class="mx-auto flex max-w-md flex-col gap-4 p-6">
        <h1 class="text-2xl text-primary">Donar un medicamento</h1>

        <p v-if="errorPerfil !== ''" class="rounded border border-danger bg-danger/10 p-4 text-danger">{{ errorPerfil }}</p>

        <p v-else-if="perfil === null" class="text-secondary">Cargando tus datos...</p>

        <FormularioDonacion
            v-else
            :sugerencias="sugerencias"
            :error-sugerencias="errorSugerencias"
            :cargando="publicando"
            :error="errorPublicar"
            :mensaje="mensajePublicar"
            :cuenta-suspendida="cuentaSuspendida"
            @publicar="publicarDonacion"
        />
    </main>
</template>
