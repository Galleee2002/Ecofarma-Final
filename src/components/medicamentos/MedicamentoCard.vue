<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import BaseBadge from '../ui/BaseBadge.vue';
import BaseButton from '../ui/BaseButton.vue';
import BaseCard from '../ui/BaseCard.vue';

const props = defineProps({
    medicamento: {
        type: Object,
        required: true,
    },
});

const router = useRouter();

const textosEstado = {
    pendiente_revision: 'En revisión',
    disponible: 'Disponible',
    reservado: 'Reservado',
    entregado: 'Entregado',
    rechazado: 'Rechazado',
};

const variantesEstado = {
    pendiente_revision: 'warning',
    disponible: 'success',
    reservado: 'info',
    entregado: 'success',
    rechazado: 'danger',
};

const etiquetaEstado = computed(function () {
    return textosEstado[props.medicamento.estado] || props.medicamento.estado;
});

const varianteEstado = computed(function () {
    return variantesEstado[props.medicamento.estado] || 'info';
});

const fechaPublicacion = computed(function () {
    if (!props.medicamento.created_at) {
        return '';
    }
    return new Date(props.medicamento.created_at).toLocaleDateString('es-AR');
});

function verDetalle() {
    router.push({ name: 'medicamento-detalle', params: { id: props.medicamento.id } });
}

function solicitar() {
    router.push({ name: 'medicamento-solicitar', params: { id: props.medicamento.id } });
}
</script>

<template>
    <BaseCard variant="surface" padding="md" bordered class="rounded-lg shadow-sm">
        <div class="flex flex-col gap-3">
            <h2 class="text-balance text-primary">{{ medicamento.nombre_comercial }}</h2>
            <p class="text-foreground">
                {{ medicamento.concentracion }} · cantidad {{ medicamento.cantidad_disponible }}
            </p>
            <p v-if="fechaPublicacion !== ''" class="text-sm text-muted">
                Publicado el {{ fechaPublicacion }}
            </p>
            <BaseBadge class="self-start" size="sm" :variant="varianteEstado">
                {{ etiquetaEstado }}
            </BaseBadge>
            <div class="flex flex-col gap-3 sm:flex-row">
                <BaseButton
                    type="button"
                    variant="outline"
                    size="md"
                    class="w-full bg-surface sm:flex-1"
                    @click="verDetalle"
                >
                    Ver detalle
                </BaseButton>
                <BaseButton
                    type="button"
                    variant="primary"
                    size="md"
                    class="w-full sm:flex-1"
                    @click="solicitar"
                >
                    Solicitar
                </BaseButton>
            </div>
        </div>
    </BaseCard>
</template>
