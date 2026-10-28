<script setup>
import { watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeftIcon } from '@lucide/vue';
import { Alert } from '@/components/ui/alert';
import { useMedicamentos } from '../composables/useMedicamentos';
import DetalleMedicamento from '../components/medicamentos/DetalleMedicamento.vue';
import PanelSolicitar from '../components/medicamentos/PanelSolicitar.vue';

const route = useRoute();
const { medicamento, cargando, error, cargarMedicamentoPorId } = useMedicamentos();

const requiereReceta = computed(function () {
    if (medicamento.value === null) {
        return false;
    }

    if (medicamento.value.medicamento_habilitado_id === null) {
        return true;
    }

    const vademecum = medicamento.value.medicamentos_habilitados;
    return vademecum !== null && vademecum.requiere_receta === true;
});

watch(
    function () {
        return route.params.id;
    },
    function (id) {
        cargarMedicamentoPorId(id);
    },
    { immediate: true },
);
</script>

<template>
    <main class="pagina max-w-6xl gap-5">
        <RouterLink to="/catalogo" class="inline-flex w-fit items-center gap-2 text-sm text-primary hover:text-secondary">
            <ArrowLeftIcon class="size-4" aria-hidden="true" />
            Volver al catálogo
        </RouterLink>

        <div class="flex flex-col gap-1">
            <h1 class="text-2xl font-bold text-primary">Detalle del medicamento</h1>
            <p class="text-muted">Conocé la información de esta donación.</p>
        </div>

        <p v-if="cargando" class="text-muted">Cargando medicamento...</p>

        <Alert v-else-if="error !== ''" variant="danger">
            <p>{{ error }}</p>
        </Alert>

        <template v-else-if="medicamento !== null">
            <div class="grid overflow-hidden rounded-lg border border-line bg-surface lg:grid-cols-2">
                <DetalleMedicamento :medicamento="medicamento" />
                <PanelSolicitar :medicamento="medicamento" :medicamento-id="medicamento.id" :requiere-receta="requiereReceta" class="border-t border-line lg:border-l lg:border-t-0" />
            </div>
        </template>
    </main>
</template>
