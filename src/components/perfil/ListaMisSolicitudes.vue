<script setup>
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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

function varianteEstado(estado) {
    if (textosEstado[estado]) {
        return estado;
    }
    return 'default';
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

    <Alert v-else-if="error !== ''" variant="danger" class="flex flex-col items-start gap-2">
        <p>{{ error }}</p>
        <Button type="button" variant="destructive" @click="reintentar">Reintentar</Button>
    </Alert>

    <Alert v-else-if="solicitudes.length === 0" variant="muted">
        <p>Todavía no hiciste solicitudes.</p>
    </Alert>

    <ul v-else class="flex flex-col gap-4">
        <li v-for="solicitud in solicitudes" :key="solicitud.id">
            <Card>
                <CardHeader v-if="solicitud.medicamentos">
                    <h2 class="text-lg text-primary">{{ solicitud.medicamentos.nombre_comercial }}</h2>
                </CardHeader>
                <CardContent class="flex flex-col gap-1">
                    <p v-if="solicitud.medicamentos">{{ solicitud.medicamentos.principio_activo }}</p>
                    <p v-if="solicitud.es_para_tercero">Para: {{ solicitud.nombre_destinatario_final }}</p>
                    <p>Solicitado el {{ formatearFecha(solicitud.created_at) }}</p>
                    <Badge :variant="varianteEstado(solicitud.estado)">{{ textoEstado(solicitud.estado) }}</Badge>
                    <p v-if="solicitud.fecha_entrega">Entregado el {{ formatearFecha(solicitud.fecha_entrega) }}</p>
                    <p v-if="solicitud.codigo">Código de retiro: <strong>{{ solicitud.codigo }}</strong></p>
                    <Alert v-if="solicitud.errorCodigo" variant="warning">
                        <p>Código no disponible. Recargá la página para intentar de nuevo.</p>
                    </Alert>
                    <RouterLink
                        v-if="solicitud.estado === 'pendiente_coordinacion' || solicitud.estado === 'en_camino'"
                        :to="{ name: 'chat-solicitud', params: { solicitudId: solicitud.id } }"
                        class="text-primary"
                    >
                        Abrir chat
                    </RouterLink>
                </CardContent>
            </Card>
        </li>
    </ul>
</template>
