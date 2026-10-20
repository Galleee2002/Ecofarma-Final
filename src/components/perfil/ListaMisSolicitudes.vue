<script setup>
defineProps({
    solicitudes: {
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
    pendiente_coordinacion: 'Coordinando entrega',
    en_camino: 'En camino',
    completado: 'Entregado',
    cancelado: 'Cancelada',
};

function textoEstado(estado) {
    if (textosEstado[estado]) {
        return textosEstado[estado];
    }
    return estado;
}

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-AR');
}

function reintentar() {
    emit('reintentar');
}
</script>

<template>
    <p v-if="cargando" class="text-muted">Cargando tus solicitudes...</p>

    <div v-else-if="error !== ''" class="flex flex-col items-start gap-2 rounded border border-danger bg-danger/10 p-4 text-danger">
        <p>{{ error }}</p>
        <button type="button" class="rounded border border-danger px-3 py-1" @click="reintentar">Reintentar</button>
    </div>

    <p v-else-if="solicitudes.length === 0" class="rounded border border-muted bg-muted/10 p-4 text-muted">
        Todavía no hiciste solicitudes.
    </p>

    <ul v-else class="flex flex-col gap-4">
        <li v-for="solicitud in solicitudes" :key="solicitud.id" class="flex flex-col gap-1 rounded border p-4">
            <template v-if="solicitud.medicamentos">
                <h2 class="text-lg text-primary">{{ solicitud.medicamentos.nombre_comercial }}</h2>
                <p>{{ solicitud.medicamentos.principio_activo }}</p>
            </template>
            <p v-if="solicitud.es_para_tercero">Para: {{ solicitud.nombre_destinatario_final }}</p>
            <p>Solicitado el {{ formatearFecha(solicitud.created_at) }}</p>
            <p>Estado: {{ textoEstado(solicitud.estado) }}</p>
            <p v-if="solicitud.fecha_entrega">Entregado el {{ formatearFecha(solicitud.fecha_entrega) }}</p>
            <p v-if="solicitud.codigo">Código de retiro: <strong>{{ solicitud.codigo }}</strong></p>
            <p v-if="solicitud.errorCodigo" class="rounded border border-warning bg-warning/10 p-2 text-warning">
                Código no disponible. Recargá la página para intentar de nuevo.
            </p>
            <RouterLink
                v-if="solicitud.estado === 'pendiente_coordinacion' || solicitud.estado === 'en_camino'"
                :to="{ name: 'chat-solicitud', params: { solicitudId: solicitud.id } }"
                class="text-primary"
            >
                Abrir chat
            </RouterLink>
        </li>
    </ul>
</template>
