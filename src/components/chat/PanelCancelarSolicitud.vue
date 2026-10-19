<script setup>
import { ref } from 'vue';

defineProps({
    cancelando: {
        type: Boolean,
        required: true,
    },
    error: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['cancelar']);

const pideConfirmacion = ref(false);

function pedir() {
    pideConfirmacion.value = true;
}

function volver() {
    pideConfirmacion.value = false;
}

function confirmar() {
    emit('cancelar');
}
</script>

<template>
    <div class="flex flex-col gap-2 rounded border p-4">
        <p v-if="error !== ''" class="rounded border border-danger bg-danger/10 p-2 text-danger">{{ error }}</p>

        <template v-if="pideConfirmacion">
            <p>¿Confirmás la cancelación? El medicamento vuelve a estar disponible para otra persona.</p>
            <div class="flex gap-2">
                <button
                    type="button"
                    class="rounded border border-danger px-3 py-2 text-danger"
                    :disabled="cancelando"
                    @click="confirmar"
                >
                    {{ cancelando ? 'Cancelando...' : 'Sí, cancelar' }}
                </button>
                <button type="button" class="rounded border px-3 py-2" :disabled="cancelando" @click="volver">
                    No, volver
                </button>
            </div>
        </template>

        <button v-else type="button" class="rounded border border-danger px-3 py-2 text-danger" @click="pedir">
            Cancelar solicitud
        </button>
    </div>
</template>
