<script setup>
import { computed, ref } from 'vue';

defineProps({
    confirmando: {
        type: Boolean,
        required: true,
    },
    error: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['confirmar']);

const codigo = ref('');

const codigoValido = computed(function () {
    return /^[0-9]{6}$/.test(codigo.value.trim());
});

function confirmar() {
    emit('confirmar', codigo.value);
}
</script>

<template>
    <form class="flex flex-col gap-2 rounded border p-4" @submit.prevent="confirmar">
        <p>Cuando se encuentren, pedile el código de 6 dígitos al receptor y cargalo acá.</p>

        <p v-if="error !== ''" class="rounded border border-danger bg-danger/10 p-2 text-danger">{{ error }}</p>

        <label class="flex flex-col gap-1">
            Código de retiro
            <input
                v-model="codigo"
                type="text"
                inputmode="numeric"
                maxlength="6"
                class="rounded border px-3 py-2"
                :disabled="confirmando"
            />
        </label>

        <button
            type="submit"
            class="rounded border border-primary px-3 py-2 text-primary"
            :disabled="confirmando || !codigoValido"
        >
            {{ confirmando ? 'Confirmando...' : 'Confirmar entrega' }}
        </button>
    </form>
</template>
