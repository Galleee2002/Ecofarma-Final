<script setup>
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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

function varianteEstado(estado) {
    if (textosEstado[estado]) {
        return estado;
    }
    return 'default';
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
    <p v-if="cargando" class="text-muted">Cargando tus donaciones...</p>

    <Alert v-else-if="error !== ''" variant="danger" class="flex flex-col items-start gap-2">
        <p>{{ error }}</p>
        <Button type="button" variant="destructive" @click="reintentar">Reintentar</Button>
    </Alert>

    <Alert v-else-if="donaciones.length === 0" variant="muted">
        <p>Todavía no publicaste donaciones.</p>
    </Alert>

    <ul v-else class="flex flex-col gap-6">
        <li v-for="donacion in donaciones" :key="donacion.id">
            <Card>
                <CardHeader>
                    <h2 class="text-lg text-primary">{{ donacion.nombre_comercial }}</h2>
                </CardHeader>
                <CardContent class="flex flex-col gap-1">
                    <p>{{ donacion.principio_activo }} {{ donacion.concentracion }}</p>
                    <p class="text-sm">Cantidad: {{ donacion.cantidad_disponible }}</p>
                    <p class="text-sm text-icon">Vence: {{ formatearFecha(donacion.fecha_vencimiento) }}</p>
                    <Badge :variant="varianteEstado(donacion.estado)">{{ textoEstado(donacion.estado) }}</Badge>
                    <Alert
                        v-if="donacion.estado === 'rechazado' && donacion.motivo_rechazo"
                        variant="warning"
                    >
                        <p>Motivo del rechazo: {{ donacion.motivo_rechazo }}</p>
                    </Alert>
                    <RouterLink
                        v-if="donacion.estado === 'reservado' && donacion.solicitud_id"
                        :to="{ name: 'chat-solicitud', params: { solicitudId: donacion.solicitud_id } }"
                        class="text-sm text-secondary"
                    >
                        Abrir chat
                    </RouterLink>
                </CardContent>
            </Card>
        </li>
    </ul>
</template>
