<script setup>
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import TarjetaModeracion from './TarjetaModeracion.vue';

defineProps({
    donaciones: {
        type: Array,
        required: true,
    },
    filasVademecum: {
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
    guardando: {
        type: Boolean,
        required: true,
    },
    vacio: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['reintentar', 'corregir', 'aprobar', 'rechazar']);

function reintentar() {
    emit('reintentar');
}

function corregir(id, datos) {
    emit('corregir', id, datos);
}

function aprobar(id, datos) {
    emit('aprobar', id, datos);
}

function rechazar(id, datos) {
    emit('rechazar', id, datos);
}
</script>

<template>
    <p v-if="cargando" class="text-muted">Cargando donaciones...</p>

    <Alert v-else-if="error !== ''" variant="danger" class="flex flex-col items-start gap-2">
        <p>{{ error }}</p>
        <Button type="button" variant="destructive" @click="reintentar">Reintentar</Button>
    </Alert>

    <Alert v-else-if="donaciones.length === 0" variant="muted">
        <p>{{ vacio }}</p>
    </Alert>

    <ul v-else class="flex flex-col gap-4">
        <li v-for="donacion in donaciones" :key="donacion.id">
            <TarjetaModeracion
                :donacion="donacion"
                :filas-vademecum="filasVademecum"
                :guardando="guardando"
                @corregir="corregir"
                @aprobar="aprobar"
                @rechazar="rechazar"
            />
        </li>
    </ul>
</template>
