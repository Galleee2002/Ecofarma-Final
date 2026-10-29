<script setup>
import { onMounted } from 'vue';
import { useMedicamentos } from '../composables/useMedicamentos';

const { cargando, error, busqueda, filtroReceta, orden, medicamentosFiltrados, cargarMedicamentos } = useMedicamentos();

onMounted(cargarMedicamentos);
</script>

<template>
    <main class="pagina">
        <h1 class="text-primary">Catálogo de medicamentos</h1>
        <p class="text-muted">Explorá los medicamentos donados disponibles para solicitar.</p>

        <div class="flex flex-col gap-1">
            <label for="catalogo-busqueda">Buscar</label>
            <input
                id="catalogo-busqueda"
                v-model="busqueda"
                type="search"
                class="border border-line bg-surface px-3 py-2"
                placeholder="Nombre o principio activo"
            />
        </div>

        <div class="flex flex-wrap gap-2" aria-label="Filtrar medicamentos por receta">
            <button type="button" class="border border-line bg-surface px-3 py-2" :class="filtroReceta === 'todos' ? 'border-primary text-primary' : ''" @click="filtroReceta = 'todos'">
                Todos
            </button>
            <button type="button" class="border border-line bg-surface px-3 py-2" :class="filtroReceta === 'con_receta' ? 'border-primary text-primary' : ''" @click="filtroReceta = 'con_receta'">
                Con receta
            </button>
            <button type="button" class="border border-line bg-surface px-3 py-2" :class="filtroReceta === 'sin_receta' ? 'border-primary text-primary' : ''" @click="filtroReceta = 'sin_receta'">
                Sin receta
            </button>
        </div>

        <div class="flex flex-col gap-1">
            <label for="catalogo-orden">Ordenar</label>
            <select id="catalogo-orden" v-model="orden" class="border border-line bg-surface px-3 py-2">
                <option value="recientes">Más recientes</option>
                <option value="vencimiento">Próximos a vencer</option>
            </select>
        </div>

        <p v-if="!cargando && error === ''" class="text-muted">{{ medicamentosFiltrados.length }} medicamentos disponibles</p>
        <p v-if="cargando" class="text-muted">Cargando medicamentos...</p>
        <div v-else-if="error !== ''" class="flex flex-col items-start gap-2 border border-danger bg-danger/10 p-3 text-danger">
            <p>{{ error }}</p>
            <button type="button" class="border border-danger px-3 py-1" @click="cargarMedicamentos">Reintentar</button>
        </div>
        <p v-else-if="medicamentosFiltrados.length === 0" class="border border-line bg-muted/10 p-3 text-muted">No hay medicamentos para mostrar.</p>
        <ul v-else class="flex flex-col gap-4">
            <li v-for="medicamento in medicamentosFiltrados" :key="medicamento.id" class="border border-line bg-surface p-4">
                <h2 class="text-primary">{{ medicamento.nombre_comercial }}</h2>
                <p>{{ medicamento.principio_activo }} {{ medicamento.concentracion }}</p>
                <p class="text-sm text-muted">{{ medicamento.forma_farmaceutica }} · cantidad {{ medicamento.cantidad_disponible }}</p>
                <RouterLink :to="'/medicamento/' + medicamento.id" class="text-secondary">Ver detalle</RouterLink>
            </li>
        </ul>
    </main>
</template>
