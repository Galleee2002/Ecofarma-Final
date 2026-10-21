<script setup>
import { watch, computed } from 'vue';
import { useRoute } from 'vue-router';
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
    <main class="pagina">
        <RouterLink to="/catalogo" class="text-sm text-secondary">Volver al catálogo</RouterLink>

        <p v-if="cargando" class="text-muted">Cargando medicamento...</p>

        <Alert v-else-if="error !== ''" variant="danger">
            <p>{{ error }}</p>
        </Alert>

        <template v-else-if="medicamento !== null">
            <div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <DetalleMedicamento :medicamento="medicamento" />
                <PanelSolicitar :medicamento-id="medicamento.id" :requiere-receta="requiereReceta" />
            </div>
        </template>
    </main>
</template>
