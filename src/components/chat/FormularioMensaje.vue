<script setup>
import { ref } from 'vue';

defineProps({
    enviando: {
        type: Boolean,
        required: true,
    },
    deshabilitado: {
        type: Boolean,
        required: true,
    },
    error: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['enviar']);

const texto = ref('');

function enviar() {
    const mensaje = texto.value.trim();
    if (mensaje === '') {
        return;
    }

    emit('enviar', mensaje, function () {
        texto.value = '';
    });
}
</script>

<template>
    <form class="flex flex-col gap-2" @submit.prevent="enviar">
        <p v-if="error !== ''" class="rounded border border-danger bg-danger/10 p-2 text-danger">{{ error }}</p>

        <label class="flex flex-col gap-1">
            Mensaje
            <input v-model="texto" type="text" class="rounded border px-3 py-2" :disabled="deshabilitado || enviando" />
        </label>

        <button
            type="submit"
            class="rounded border border-primary px-3 py-2 text-primary"
            :disabled="deshabilitado || enviando || texto.trim() === ''"
        >
            {{ enviando ? 'Enviando...' : 'Enviar' }}
        </button>
    </form>
</template>
