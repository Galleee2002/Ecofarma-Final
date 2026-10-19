<script setup>
defineProps({
    donaciones: {
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

const textosEstado = {
    pendiente_revision: 'En revisión',
    disponible: 'Disponible',
    reservado: 'Reservado',
    entregado: 'Entregado',
    rechazado: 'Rechazado',
};

function textoEstado(estado) {
    if (textosEstado[estado]) {
        return textosEstado[estado];
    }
    return estado;
}

function formatearFecha(fecha) {
    const partes = fecha.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function reintentar() {
    emit('reintentar');
}
</script>

<template>
    <p v-if="cargando" class="text-secondary">Cargando tus donaciones...</p>

    <div v-else-if="error !== ''" class="flex flex-col items-start gap-2 rounded border border-danger bg-danger/10 p-4 text-danger">
        <p>{{ error }}</p>
        <button type="button" class="rounded border border-danger px-3 py-1" @click="reintentar">Reintentar</button>
    </div>

    <p v-else-if="donaciones.length === 0" class="rounded border border-secondary bg-secondary/10 p-4 text-secondary">
        Todavía no publicaste donaciones.
    </p>

    <ul v-else class="flex flex-col gap-4">
        <li v-for="donacion in donaciones" :key="donacion.id" class="flex flex-col gap-1 rounded border p-4">
            <h2 class="text-lg text-primary">{{ donacion.nombre_comercial }}</h2>
            <p>{{ donacion.principio_activo }} {{ donacion.concentracion }}</p>
            <p>Cantidad: {{ donacion.cantidad_disponible }}</p>
            <p>Vence: {{ formatearFecha(donacion.fecha_vencimiento) }}</p>
            <p>Estado: {{ textoEstado(donacion.estado) }}</p>
            <p
                v-if="donacion.estado === 'rechazado' && donacion.motivo_rechazo"
                class="rounded border border-warning bg-warning/10 p-2 text-warning"
            >
                Motivo del rechazo: {{ donacion.motivo_rechazo }}
            </p>
            <RouterLink
                v-if="donacion.estado === 'reservado' && donacion.solicitud_id"
                :to="{ name: 'chat-solicitud', params: { solicitudId: donacion.solicitud_id } }"
                class="text-primary"
            >
                Abrir chat
            </RouterLink>
        </li>
    </ul>
</template>
