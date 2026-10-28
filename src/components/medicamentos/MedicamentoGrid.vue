<script setup>
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import MedicamentoCard from './MedicamentoCard.vue';

defineProps({
    medicamentos: {
        type: Array,
        required: true,
    },
    busqueda: {
        type: String,
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
    <p v-if="cargando" class="text-muted">Cargando medicamentos...</p>

    <Alert v-else-if="error !== ''" variant="danger" class="flex flex-col items-start gap-2">
        <p>{{ error }}</p>
        <Button type="button" variant="destructive" @click="reintentar">Reintentar</Button>
    </Alert>

    <Alert v-else-if="medicamentos.length === 0 && busqueda.trim() === ''" variant="muted">
        <p>No hay medicamentos disponibles con los filtros seleccionados.</p>
    </Alert>

    <Alert v-else-if="medicamentos.length === 0" variant="muted">
        <p>No encontramos medicamentos que coincidan con la búsqueda y los filtros seleccionados.</p>
    </Alert>

    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <MedicamentoCard v-for="medicamento in medicamentos" :key="medicamento.id" :medicamento="medicamento" />
    </div>
</template>
