<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useModeracion } from '../composables/useModeracion';
import { usePaginacion } from '../composables/usePaginacion';
import { useVademecum } from '../composables/useVademecum';

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
const formularios = ref({});
const confirmarRechazoId = ref('');

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

function textoOVacio(valor) {
    if (valor === null || valor === undefined) {
        return '';
    }
    return String(valor);
}

function copiarDatos(donacion) {
    let medicamentoHabilitadoId = '';
    if (donacion.medicamento_habilitado_id !== null && donacion.medicamento_habilitado_id !== undefined) {
        medicamentoHabilitadoId = String(donacion.medicamento_habilitado_id);
    }

    return {
        nombre_comercial: textoOVacio(donacion.nombre_comercial),
        principio_activo: textoOVacio(donacion.principio_activo),
        concentracion: textoOVacio(donacion.concentracion),
        forma_farmaceutica: textoOVacio(donacion.forma_farmaceutica),
        cantidad_disponible: textoOVacio(donacion.cantidad_disponible),
        lote: textoOVacio(donacion.lote),
        fecha_vencimiento: textoOVacio(donacion.fecha_vencimiento),
        descripcion: textoOVacio(donacion.descripcion),
        medicamento_habilitado_id: medicamentoHabilitadoId,
        motivo_rechazo: '',
    };
}

function textoEstado(estado) {
    if (estado === 'pendiente_revision') {
        return 'En revisión';
    }
    if (estado === 'disponible') {
        return 'Disponible';
    }
    if (estado === 'rechazado') {
        return 'Rechazado';
    }
    return estado;
}

function formatearFecha(fecha) {
    const partes = fecha.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function nombreDonante(donacion) {
    if (donacion.profiles && donacion.profiles.name) {
        return donacion.profiles.name;
    }
    return 'Donante';
}

function etiquetaVademecum(fila) {
    const partes = [fila.principio_activo];
    if (fila.concentracion) {
        partes.push(fila.concentracion);
    }
    if (fila.forma_farmaceutica) {
        partes.push(fila.forma_farmaceutica);
    }
    if (fila.nombre_comercial) {
        partes.push(fila.nombre_comercial);
    }
    return partes.join(' — ');
}

function obtenerFechaDeManiana() {
    const maniana = new Date();
    maniana.setDate(maniana.getDate() + 1);
    const anio = maniana.getFullYear();
    const mes = String(maniana.getMonth() + 1).padStart(2, '0');
    const dia = String(maniana.getDate()).padStart(2, '0');
    return anio + '-' + mes + '-' + dia;
}

const fechaMinima = obtenerFechaDeManiana();

function fotos(donacion) {
    if (Array.isArray(donacion.fotos_envase)) {
        return donacion.fotos_envase;
    }
    return [];
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

watch(donaciones, function (lista) {
    const siguientes = {};
    for (const donacion of lista) {
        if (formularios.value[donacion.id]) {
            siguientes[donacion.id] = formularios.value[donacion.id];
        } else {
            siguientes[donacion.id] = copiarDatos(donacion);
        }
    }
    formularios.value = siguientes;
});

onMounted(function () {
    cargarDonaciones();
    cargarSugerencias();
});
</script>

<template>
    <main class="flex flex-col gap-6">
        <h1 class="text-primary">Moderación de donaciones</h1>

        <p v-if="errorVademecum !== ''" class="border border-warning bg-warning/10 p-3 text-warning">{{ errorVademecum }}</p>
        <p
            v-if="errorAccion !== ''"
            class="p-3"
            :class="tipoErrorAccion === 'advertencia' ? 'border border-warning bg-warning/10 text-warning' : 'border border-danger bg-danger/10 text-danger'"
        >
            {{ errorAccion }}
        </p>
        <p v-if="mensajeAccion !== ''" class="border border-success bg-success/10 p-3 text-success">{{ mensajeAccion }}</p>

        <div class="flex flex-col gap-1">
            <label for="donaciones-estado">Estado</label>
            <select id="donaciones-estado" v-model="filtroEstado" class="w-56 border border-line bg-surface px-3 py-2">
                <option value="pendiente_revision">Pendientes ({{ pendientes.length }})</option>
                <option value="disponible">Disponibles ({{ disponibles.length }})</option>
                <option value="rechazado">Rechazados ({{ rechazados.length }})</option>
                <option value="todos">Todos ({{ donaciones.length }})</option>
            </select>
        </div>

        <p v-if="cargando" class="text-muted">Cargando donaciones...</p>
        <div v-else-if="error !== ''" class="flex flex-col items-start gap-2 border border-danger bg-danger/10 p-3 text-danger">
            <p>{{ error }}</p>
            <button type="button" @click="cargarDonaciones">Reintentar</button>
        </div>
        <p v-else-if="visibles.length === 0" class="border border-line bg-muted/10 p-3 text-muted">{{ mensajeVacio() }}</p>
        <ul v-else class="flex flex-col gap-6">
            <li v-for="donacion in visibles" :key="donacion.id" class="border border-line bg-surface p-4">
                <h2 class="text-primary">{{ donacion.nombre_comercial }}</h2>
                <p class="text-muted">Donante: {{ nombreDonante(donacion) }}</p>
                <p>{{ textoEstado(donacion.estado) }}</p>
                <p class="text-icon">Vence: {{ formatearFecha(donacion.fecha_vencimiento) }}</p>

                <div v-if="fotos(donacion).length > 0" class="mt-2 flex flex-wrap gap-2">
                    <img
                        v-for="(foto, indice) in fotos(donacion)"
                        :key="indice"
                        :src="foto"
                        :alt="'Foto ' + (indice + 1) + ' de ' + donacion.nombre_comercial"
                        class="h-24 w-24 object-cover"
                    />
                </div>
                <p v-else class="mt-2 text-muted">Esta donación no tiene fotos del envase.</p>
                <p v-if="donacion.estado === 'rechazado' && donacion.motivo_rechazo" class="mt-2 border border-warning bg-warning/10 p-3 text-warning">
                    Motivo del rechazo: {{ donacion.motivo_rechazo }}
                </p>

                <form v-if="formularios[donacion.id]" class="mt-4 flex flex-col gap-3" novalidate @submit.prevent="corregirDonacion(donacion.id, formularios[donacion.id])">
                    <div class="flex flex-col gap-1">
                        <label :for="'moderar-nombre-' + donacion.id">Nombre comercial</label>
                        <input :id="'moderar-nombre-' + donacion.id" v-model="formularios[donacion.id].nombre_comercial" type="text" class="border border-line bg-surface px-3 py-2" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label :for="'moderar-principio-' + donacion.id">Principio activo</label>
                        <input :id="'moderar-principio-' + donacion.id" v-model="formularios[donacion.id].principio_activo" type="text" class="border border-line bg-surface px-3 py-2" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label :for="'moderar-concentracion-' + donacion.id">Concentración</label>
                        <input :id="'moderar-concentracion-' + donacion.id" v-model="formularios[donacion.id].concentracion" type="text" class="border border-line bg-surface px-3 py-2" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label :for="'moderar-forma-' + donacion.id">Forma farmacéutica</label>
                        <input :id="'moderar-forma-' + donacion.id" v-model="formularios[donacion.id].forma_farmaceutica" type="text" class="border border-line bg-surface px-3 py-2" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label :for="'moderar-cantidad-' + donacion.id">Cantidad</label>
                        <input :id="'moderar-cantidad-' + donacion.id" v-model="formularios[donacion.id].cantidad_disponible" type="number" min="1" step="1" class="border border-line bg-surface px-3 py-2" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label :for="'moderar-lote-' + donacion.id">Lote</label>
                        <input :id="'moderar-lote-' + donacion.id" v-model="formularios[donacion.id].lote" type="text" class="border border-line bg-surface px-3 py-2" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label :for="'moderar-vencimiento-' + donacion.id">Fecha de vencimiento</label>
                        <input :id="'moderar-vencimiento-' + donacion.id" v-model="formularios[donacion.id].fecha_vencimiento" type="date" :min="fechaMinima" class="border border-line bg-surface px-3 py-2" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label :for="'moderar-descripcion-' + donacion.id">Descripción</label>
                        <textarea :id="'moderar-descripcion-' + donacion.id" v-model="formularios[donacion.id].descripcion" rows="3" class="border border-line bg-surface px-3 py-2"></textarea>
                    </div>
                    <button type="submit" class="border border-line bg-surface px-4 py-2" :disabled="guardando">Guardar cambios</button>
                </form>

                <div v-if="formularios[donacion.id]" class="mt-4 flex flex-col gap-2">
                    <label :for="'moderar-vademecum-' + donacion.id">Medicamento del vademécum</label>
                    <select :id="'moderar-vademecum-' + donacion.id" v-model="formularios[donacion.id].medicamento_habilitado_id" class="border border-line bg-surface px-3 py-2">
                        <option value="">Elegí una fila del vademécum</option>
                        <option v-for="fila in filas" :key="fila.id" :value="String(fila.id)">{{ etiquetaVademecum(fila) }}</option>
                    </select>
                    <button type="button" class="bg-primary px-4 py-2 text-surface" :disabled="guardando" @click="aprobarDonacion(donacion.id, formularios[donacion.id])">
                        Aprobar
                    </button>
                </div>

                <div v-if="formularios[donacion.id]" class="mt-4 flex flex-col gap-2">
                    <label :for="'moderar-motivo-' + donacion.id">Motivo del rechazo</label>
                    <textarea :id="'moderar-motivo-' + donacion.id" v-model="formularios[donacion.id].motivo_rechazo" rows="2" class="border border-line bg-surface px-3 py-2"></textarea>
                    <button type="button" class="bg-danger px-4 py-2 text-surface" :disabled="guardando" @click="confirmarRechazoId = donacion.id">Rechazar</button>
                    <div v-if="confirmarRechazoId === donacion.id" class="border border-danger bg-danger/10 p-3">
                        <p>{{ donacion.nombre_comercial }} no va a publicarse en el catálogo.</p>
                        <div class="mt-2 flex gap-2">
                            <button type="button" class="border border-line bg-surface px-3 py-2" :disabled="guardando" @click="confirmarRechazoId = ''">Cancelar</button>
                            <button type="button" class="bg-danger px-3 py-2 text-surface" :disabled="guardando" @click="rechazarDonacion(donacion.id, formularios[donacion.id])">
                                Rechazar
                            </button>
                        </div>
                    </div>
                </div>
            </li>
        </ul>

        <div v-if="!cargando && error === '' && total > 15" class="flex gap-2">
            <button type="button" class="border border-line bg-surface px-3 py-1" :disabled="pagina === 1" @click="pagina = pagina - 1">Anterior</button>
            <span>Página {{ pagina }}</span>
            <button type="button" class="border border-line bg-surface px-3 py-1" :disabled="pagina * 15 >= total" @click="pagina = pagina + 1">Siguiente</button>
        </div>
    </main>
</template>
