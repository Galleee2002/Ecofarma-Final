<script setup>
import { computed } from 'vue';
import BaseBadge from '../ui/BaseBadge.vue';
import GaleriaEnvase from './GaleriaEnvase.vue';

const props = defineProps({
    medicamento: {
        type: Object,
        required: true,
    },
    requiereReceta: {
        type: Boolean,
        default: false,
    },
});

const fotos = computed(function () {
    if (!Array.isArray(props.medicamento.fotos_envase)) {
        return [];
    }
    return props.medicamento.fotos_envase;
});

const formaFarmaceutica = computed(function () {
    return props.medicamento.forma_farmaceutica || 'No informada';
});

const lote = computed(function () {
    return props.medicamento.lote || 'No informado';
});

function formatearFecha(fecha) {
    const partes = fecha.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}
</script>

<template>
    <article class="@container flex min-w-0 flex-col gap-6">
        <header class="flex flex-col gap-2">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <h1 class="text-balance text-primary">{{ medicamento.nombre_comercial }}</h1>
                <BaseBadge class="self-start" size="sm" :variant="requiereReceta ? 'warning' : 'success'">
                    {{ requiereReceta ? 'Con receta' : 'Sin receta' }}
                </BaseBadge>
            </div>
            <p class="text-pretty text-foreground">{{ medicamento.principio_activo }} {{ medicamento.concentracion }}</p>
        </header>

        <div class="grid min-w-0 grid-cols-1 gap-6 @md:grid-cols-2 @md:items-start">
            <GaleriaEnvase :fotos="fotos" :nombre="medicamento.nombre_comercial" />
            <dl class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="min-w-0">
                    <dt class="font-sans text-sm text-muted">Forma farmacéutica</dt>
                    <dd class="font-sans text-base text-foreground">{{ formaFarmaceutica }}</dd>
                </div>
                <div class="min-w-0">
                    <dt class="font-sans text-sm text-muted">Cantidad</dt>
                    <dd class="font-sans text-base text-foreground">{{ medicamento.cantidad_disponible }}</dd>
                </div>
                <div class="min-w-0">
                    <dt class="font-sans text-sm text-muted">Vencimiento</dt>
                    <dd class="font-sans text-base text-foreground">{{ formatearFecha(medicamento.fecha_vencimiento) }}</dd>
                </div>
                <div class="min-w-0">
                    <dt class="font-sans text-sm text-muted">Lote</dt>
                    <dd class="font-sans text-base text-foreground">{{ lote }}</dd>
                </div>
            </dl>
        </div>

        <p v-if="medicamento.descripcion" class="max-w-prose text-pretty text-foreground">{{ medicamento.descripcion }}</p>
    </article>
</template>
