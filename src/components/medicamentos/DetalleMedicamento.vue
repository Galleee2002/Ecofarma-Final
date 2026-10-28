<script setup>
import { ref, watch } from 'vue';
import { Alert } from '@/components/ui/alert';

const props = defineProps({
    medicamento: {
        type: Object,
        required: true,
    },
});

const fotoActiva = ref(0);

watch(function () {
    return props.medicamento.id;
}, function () {
    fotoActiva.value = 0;
});
</script>

<template>
    <section class="flex min-w-0 flex-col gap-4 p-4 sm:p-6" aria-label="Fotos del medicamento">
        <template v-if="medicamento.fotos_envase.length > 0">
            <img
                :src="medicamento.fotos_envase[fotoActiva]"
                :alt="'Foto ' + (fotoActiva + 1) + ' de ' + medicamento.nombre_comercial"
                class="aspect-[4/3] w-full rounded-md bg-background object-contain"
            />
            <div class="flex flex-wrap gap-2" aria-label="Elegir foto del medicamento">
                <button
                    v-for="(foto, indice) in medicamento.fotos_envase.slice(0, 3)"
                    :key="indice"
                    type="button"
                    :aria-label="'Ver foto ' + (indice + 1) + ' de ' + medicamento.nombre_comercial"
                    :aria-pressed="fotoActiva === indice"
                    class="size-20 overflow-hidden rounded-sm border-2 bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    :class="fotoActiva === indice ? 'border-primary' : 'border-line hover:border-primary/50'"
                    @click="fotoActiva = indice"
                >
                    <img :src="foto" alt="" class="h-full w-full object-cover" />
                </button>
            </div>
            <p class="text-xs text-muted">Fotos del medicamento donado</p>
        </template>
        <Alert v-else variant="muted">
            <p>Este medicamento no tiene fotos del envase.</p>
        </Alert>
    </section>
</template>
