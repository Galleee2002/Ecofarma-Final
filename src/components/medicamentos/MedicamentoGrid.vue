<script setup>
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
    <p v-if="cargando" class="text-muted">Cargando medicamentos...</p>

    <Alert v-else-if="error !== ''" variant="danger" class="flex flex-col items-start gap-2">
        <p>{{ error }}</p>
        <Button type="button" variant="destructive" @click="reintentar">Reintentar</Button>
    </Alert>

    <Alert v-else-if="medicamentos.length === 0" variant="muted">
        <p>No encontramos medicamentos disponibles que coincidan con tu búsqueda.</p>
    </Alert>

    <div v-else class="grid gap-4">
        <MedicamentoCard v-for="medicamento in medicamentos" :key="medicamento.id" :medicamento="medicamento" />
    </div>
</template>
