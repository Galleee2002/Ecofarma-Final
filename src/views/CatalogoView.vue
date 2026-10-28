<script setup>
import { onMounted } from 'vue';
import { ArrowDownUpIcon, FileTextIcon, LayoutGridIcon, LeafIcon } from '@lucide/vue';
import { useMedicamentos } from '../composables/useMedicamentos';
import MedicamentoSearch from '../components/medicamentos/MedicamentoSearch.vue';
import MedicamentoGrid from '../components/medicamentos/MedicamentoGrid.vue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const { cargando, error, busqueda, filtroReceta, orden, medicamentosFiltrados, cargarMedicamentos } = useMedicamentos();

const clasesFiltro = 'inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30';

function seleccionarFiltro(valor) {
    filtroReceta.value = valor;
}

onMounted(cargarMedicamentos);
</script>

<template>
    <main class="pagina relative isolate">
        <div
            class="pointer-events-none fixed inset-0 -z-10 bg-[url('/background-tramas.webp')] bg-repeat opacity-10"
            aria-hidden="true"
        ></div>
        <h1 class="text-2xl font-bold text-primary">Catálogo de medicamentos</h1>
        <p class="-mt-5 text-muted">Explorá los medicamentos donados disponibles para solicitar. Juntos, damos más vida a cada tratamiento.</p>
        <MedicamentoSearch v-model="busqueda" />
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-col gap-2">
                <div class="flex flex-wrap gap-2" aria-label="Filtrar medicamentos por receta">
                    <button
                        type="button"
                        :aria-pressed="filtroReceta === 'todos'"
                        :class="[clasesFiltro, filtroReceta === 'todos' ? 'border-secondary bg-secondary text-white' : 'border-line bg-surface text-primary hover:border-primary/40']"
                        @click="seleccionarFiltro('todos')"
                    >
                        <LayoutGridIcon class="size-4" /> Todos
                    </button>
                    <button
                        type="button"
                        :aria-pressed="filtroReceta === 'con_receta'"
                        :class="[clasesFiltro, filtroReceta === 'con_receta' ? 'border-secondary bg-secondary text-white' : 'border-line bg-surface text-primary hover:border-primary/40']"
                        @click="seleccionarFiltro('con_receta')"
                    >
                        <FileTextIcon class="size-4" /> Con receta
                    </button>
                    <button
                        type="button"
                        :aria-pressed="filtroReceta === 'sin_receta'"
                        :class="[clasesFiltro, filtroReceta === 'sin_receta' ? 'border-secondary bg-secondary text-white' : 'border-line bg-surface text-primary hover:border-primary/40']"
                        @click="seleccionarFiltro('sin_receta')"
                    >
                        <LeafIcon class="size-4" /> Sin receta
                    </button>
                </div>
                <p v-if="!cargando && error === ''" class="text-sm text-muted" aria-live="polite">
                    <span class="font-semibold text-primary">{{ medicamentosFiltrados.length }}</span>
                    {{ medicamentosFiltrados.length === 1 ? 'medicamento disponible' : 'medicamentos disponibles' }}
                </p>
            </div>
            <Select v-model="orden">
                <SelectTrigger class="w-full sm:w-52" aria-label="Ordenar medicamentos">
                    <ArrowDownUpIcon class="size-4 text-primary" />
                    <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent class="p-1.5">
                    <SelectItem value="recientes" class="pl-3">Más recientes</SelectItem>
                    <SelectItem value="vencimiento" class="pl-3">Próximos a vencer</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <MedicamentoGrid
            :medicamentos="medicamentosFiltrados"
            :busqueda="busqueda"
            :cargando="cargando"
            :error="error"
            @reintentar="cargarMedicamentos"
        />
    </main>
</template>
