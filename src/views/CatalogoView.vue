<script setup>
import { onMounted } from 'vue';
import { useMedicamentos } from '../composables/useMedicamentos';
import MedicamentoSearch from '../components/medicamentos/MedicamentoSearch.vue';
import MedicamentoGrid from '../components/medicamentos/MedicamentoGrid.vue';

const { cargando, error, busqueda, medicamentosFiltrados, cargarMedicamentos } = useMedicamentos();

onMounted(cargarMedicamentos);
</script>

<template>
    <main class="mx-auto flex max-w-3xl flex-col gap-4 p-6">
        <h1 class="text-2xl text-primary">Catálogo de medicamentos</h1>
        <MedicamentoSearch v-model="busqueda" />
        <MedicamentoGrid
            :medicamentos="medicamentosFiltrados"
            :cargando="cargando"
            :error="error"
            @reintentar="cargarMedicamentos"
        />
    </main>
</template>
