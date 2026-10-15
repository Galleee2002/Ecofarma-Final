<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useVademecum } from '../composables/useVademecum';
import { useDonaciones } from '../composables/useDonaciones';
import FormularioDonacion from '../components/donaciones/FormularioDonacion.vue';

const { sesion, perfil, errorPerfil } = useAuth();
const { filas: sugerencias, error: errorSugerencias, cargarSugerencias } = useVademecum();
const { publicando, errorPublicar, mensajePublicar, tipoMensajePublicar, publicarDonacion } = useDonaciones();

const claveFormulario = ref(0);

const cuentaSuspendida = computed(function () {
    return perfil.value !== null && perfil.value.is_validado === false;
});

async function publicar(datos, fotos) {
    const publicada = await publicarDonacion(sesion.value.user.id, datos, fotos);
    if (publicada) {
        claveFormulario.value = claveFormulario.value + 1;
    }
}

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
            :key="claveFormulario"
            :sugerencias="sugerencias"
            :error-sugerencias="errorSugerencias"
            :cargando="publicando"
            :error="errorPublicar"
            :mensaje="mensajePublicar"
            :tipo-mensaje="tipoMensajePublicar"
            :cuenta-suspendida="cuentaSuspendida"
            @publicar="publicar"
        />
    </main>
</template>
