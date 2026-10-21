<script setup>
import { ref, computed, onMounted } from 'vue';
import { Alert } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useModeracion } from '../composables/useModeracion';
import { useVademecum } from '../composables/useVademecum';
import ListaModeracion from '../components/admin/ListaModeracion.vue';
import NavAdmin from '../components/admin/NavAdmin.vue';

const {
    donaciones,
    cargando,
    error,
    guardando,
    errorAccion,
    tipoErrorAccion,
    mensajeAccion,
    cargarDonaciones,
    corregirDonacion,
    aprobarDonacion,
    rechazarDonacion,
} = useModeracion();

const { filas, error: errorVademecum, cargarSugerencias } = useVademecum();

const pestanaActiva = ref('pendientes');

const pendientes = computed(function () {
    return donaciones.value.filter(function (donacion) {
        return donacion.estado === 'pendiente_revision';
    });
});

const disponibles = computed(function () {
    return donaciones.value.filter(function (donacion) {
        return donacion.estado === 'disponible';
    });
});

const rechazados = computed(function () {
    return donaciones.value.filter(function (donacion) {
        return donacion.estado === 'rechazado';
    });
});

function varianteErrorAccion() {
    if (tipoErrorAccion.value === 'advertencia') {
        return 'warning';
    }
    return 'danger';
}

onMounted(function () {
    cargarDonaciones();
    cargarSugerencias();
});
</script>

<template>
    <main class="pagina-media">
        <h1 class="text-2xl font-bold text-primary">Moderación de donaciones</h1>

        <NavAdmin />

        <Alert v-if="errorVademecum !== ''" variant="warning">
            <p>{{ errorVademecum }}</p>
        </Alert>

        <Alert v-if="errorAccion !== ''" :variant="varianteErrorAccion()">
            <p>{{ errorAccion }}</p>
        </Alert>

        <Alert v-if="mensajeAccion !== ''" variant="success">
            <p>{{ mensajeAccion }}</p>
        </Alert>

        <Tabs :model-value="pestanaActiva" class="flex-col gap-4" @update:model-value="pestanaActiva = $event">
            <TabsList variant="line" class="w-full">
                <TabsTrigger value="pendientes">Pendientes ({{ pendientes.length }})</TabsTrigger>
                <TabsTrigger value="disponibles">Disponibles</TabsTrigger>
                <TabsTrigger value="rechazados">Rechazados</TabsTrigger>
            </TabsList>

            <TabsContent value="pendientes">
                <ListaModeracion
                    :donaciones="pendientes"
                    :filas-vademecum="filas"
                    :cargando="cargando"
                    :error="error"
                    :guardando="guardando"
                    vacio="No hay donaciones pendientes de revisión."
                    @reintentar="cargarDonaciones"
                    @corregir="corregirDonacion"
                    @aprobar="aprobarDonacion"
                    @rechazar="rechazarDonacion"
                />
            </TabsContent>

            <TabsContent value="disponibles">
                <ListaModeracion
                    :donaciones="disponibles"
                    :filas-vademecum="filas"
                    :cargando="cargando"
                    :error="error"
                    :guardando="guardando"
                    vacio="No hay donaciones disponibles para moderar."
                    @reintentar="cargarDonaciones"
                    @corregir="corregirDonacion"
                    @aprobar="aprobarDonacion"
                    @rechazar="rechazarDonacion"
                />
            </TabsContent>

            <TabsContent value="rechazados">
                <ListaModeracion
                    :donaciones="rechazados"
                    :filas-vademecum="filas"
                    :cargando="cargando"
                    :error="error"
                    :guardando="guardando"
                    vacio="No hay donaciones rechazadas."
                    @reintentar="cargarDonaciones"
                    @corregir="corregirDonacion"
                    @aprobar="aprobarDonacion"
                    @rechazar="rechazarDonacion"
                />
            </TabsContent>
        </Tabs>
    </main>
</template>
