<script setup>
import { ref, computed, onMounted } from 'vue';
import { Alert } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useModeracion } from '../composables/useModeracion';
import { usePaginacion } from '../composables/usePaginacion';
import { useVademecum } from '../composables/useVademecum';
import ListaModeracion from '../components/admin/ListaModeracion.vue';
import PaginadorLista from '../components/admin/PaginadorLista.vue';

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

const filtroEstado = ref('pendiente_revision');

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

const donacionesFiltradas = computed(function () {
    if (filtroEstado.value === 'pendiente_revision') {
        return pendientes.value;
    }
    if (filtroEstado.value === 'disponible') {
        return disponibles.value;
    }
    if (filtroEstado.value === 'rechazado') {
        return rechazados.value;
    }
    return donaciones.value;
});

const { pagina, total, visibles } = usePaginacion(donacionesFiltradas, function () {
    return filtroEstado.value;
});

function varianteErrorAccion() {
    if (tipoErrorAccion.value === 'advertencia') {
        return 'warning';
    }
    return 'danger';
}

function mensajeVacio() {
    if (filtroEstado.value === 'pendiente_revision') {
        return 'No hay donaciones pendientes de revisión.';
    }
    if (filtroEstado.value === 'disponible') {
        return 'No hay donaciones disponibles para moderar.';
    }
    if (filtroEstado.value === 'rechazado') {
        return 'No hay donaciones rechazadas.';
    }
    return 'No hay donaciones para moderar.';
}

onMounted(function () {
    cargarDonaciones();
    cargarSugerencias();
});
</script>

<template>
    <main class="flex flex-col gap-6">
        <h1 class="text-2xl font-bold text-primary">Moderación de donaciones</h1>

        <Alert v-if="errorVademecum !== ''" variant="warning">
            <p>{{ errorVademecum }}</p>
        </Alert>

        <Alert v-if="errorAccion !== ''" :variant="varianteErrorAccion()">
            <p>{{ errorAccion }}</p>
        </Alert>

        <Alert v-if="mensajeAccion !== ''" variant="success">
            <p>{{ mensajeAccion }}</p>
        </Alert>

        <div class="flex flex-col gap-1">
            <Label for="donaciones-estado">Estado</Label>
            <Select v-model="filtroEstado">
                <SelectTrigger id="donaciones-estado" class="w-56">
                    <SelectValue placeholder="Pendientes" />
                </SelectTrigger>
                <SelectContent position="popper">
                    <SelectItem value="pendiente_revision">Pendientes ({{ pendientes.length }})</SelectItem>
                    <SelectItem value="disponible">Disponibles ({{ disponibles.length }})</SelectItem>
                    <SelectItem value="rechazado">Rechazados ({{ rechazados.length }})</SelectItem>
                    <SelectItem value="todos">Todos ({{ donaciones.length }})</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <ListaModeracion
            :donaciones="visibles"
            :filas-vademecum="filas"
            :cargando="cargando"
            :error="error"
            :guardando="guardando"
            :vacio="mensajeVacio()"
            @reintentar="cargarDonaciones"
            @corregir="corregirDonacion"
            @aprobar="aprobarDonacion"
            @rechazar="rechazarDonacion"
        />

        <PaginadorLista
            v-if="!cargando && error === '' && total > 0"
            :pagina="pagina"
            :total="total"
            @update:pagina="pagina = $event"
        />
    </main>
</template>
