<script setup>
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

defineProps({
    medicamento: {
        type: Object,
        required: true,
    },
});

function formatearFecha(fecha) {
    const partes = fecha.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}
</script>

<template>
    <Card>
        <CardHeader>
            <h1 class="text-2xl text-primary">{{ medicamento.nombre_comercial }}</h1>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <p>Principio activo: {{ medicamento.principio_activo }}</p>
                <p v-if="medicamento.concentracion">Concentración: {{ medicamento.concentracion }}</p>
                <p v-if="medicamento.forma_farmaceutica">Forma farmacéutica: {{ medicamento.forma_farmaceutica }}</p>
                <p>Cantidad: {{ medicamento.cantidad_disponible }}</p>
                <p>Vence: {{ formatearFecha(medicamento.fecha_vencimiento) }}</p>
                <p v-if="medicamento.lote">Lote: {{ medicamento.lote }}</p>
                <p v-if="medicamento.descripcion">{{ medicamento.descripcion }}</p>
            </div>

            <div v-if="medicamento.fotos_envase.length > 0" class="flex flex-col gap-2">
                <h2 class="text-lg text-primary">Fotos del envase</h2>
                <div class="flex flex-wrap gap-2">
                    <img
                        v-for="(foto, indice) in medicamento.fotos_envase"
                        :key="indice"
                        :src="foto"
                        :alt="'Foto ' + (indice + 1) + ' de ' + medicamento.nombre_comercial"
                        class="h-48 w-full max-w-xs object-cover"
                    />
                </div>
            </div>

            <Alert v-else variant="muted">
                <p>Este medicamento no tiene fotos del envase.</p>
            </Alert>
        </CardContent>
    </Card>
</template>
