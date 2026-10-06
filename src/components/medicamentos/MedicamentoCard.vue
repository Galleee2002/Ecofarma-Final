<script setup>
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
    <article class="flex flex-col gap-1 rounded border p-4">
        <img
            v-if="medicamento.fotos_envase.length > 0"
            :src="medicamento.fotos_envase[0]"
            :alt="'Foto de ' + medicamento.nombre_comercial"
            class="h-40 w-full object-cover"
        />
        <h2 class="text-lg text-primary">{{ medicamento.nombre_comercial }}</h2>
        <p>{{ medicamento.principio_activo }}</p>
        <p>{{ medicamento.concentracion }} {{ medicamento.forma_farmaceutica }}</p>
        <p>Cantidad: {{ medicamento.cantidad_disponible }}</p>
        <p>Vence: {{ formatearFecha(medicamento.fecha_vencimiento) }}</p>
    </article>
</template>
