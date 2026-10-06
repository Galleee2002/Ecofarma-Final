<script setup>
import MedicamentoCard from './MedicamentoCard.vue';

defineProps({
    medicamentos: {
        type: Array,
        required: true,
    },
    cargando: {
        type: Boolean,
        required: true,
    },
    error: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['reintentar']);

function reintentar() {
    emit('reintentar');
}
</script>

<template>
    <p v-if="cargando">Cargando medicamentos...</p>

    <div v-else-if="error !== ''" class="flex flex-col items-start gap-2 rounded border border-danger bg-danger/10 p-4 text-danger">
        <p>{{ error }}</p>
        <button type="button" class="rounded border border-danger px-3 py-1" @click="reintentar">Reintentar</button>
    </div>

    <p v-else-if="medicamentos.length === 0" class="rounded border border-secondary bg-secondary/10 p-4 text-secondary">
        No encontramos medicamentos disponibles que coincidan con tu búsqueda.
    </p>

    <div v-else class="grid gap-4">
        <MedicamentoCard v-for="medicamento in medicamentos" :key="medicamento.id" :medicamento="medicamento" />
    </div>
</template>
