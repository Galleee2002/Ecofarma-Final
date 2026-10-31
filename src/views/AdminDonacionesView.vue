<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ChevronDown } from '@lucide/vue';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseBadge from '../components/ui/BaseBadge.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseInput from '../components/ui/BaseInput.vue';
import BaseModal from '../components/ui/BaseModal.vue';
import BaseSelect from '../components/ui/BaseSelect.vue';
import BaseTextarea from '../components/ui/BaseTextarea.vue';
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
const fichaAbiertaId = ref('');

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

const bandejas = computed(function () {
    return [
        { valor: 'pendiente_revision', etiqueta: 'Pendientes', cantidad: pendientes.value.length },
        { valor: 'disponible', etiqueta: 'Disponibles', cantidad: disponibles.value.length },
        { valor: 'rechazado', etiqueta: 'Rechazados', cantidad: rechazados.value.length },
        { valor: 'todos', etiqueta: 'Todos', cantidad: donaciones.value.length },
    ];
});

const opcionesVademecum = computed(function () {
    return filas.value.map(function (fila) {
        return {
            value: String(fila.id),
            label: etiquetaVademecum(fila),
        };
    });
});

const modalRechazoAbierto = computed({
    get: function () {
        return confirmarRechazoId.value !== '';
    },
    set: function (abierto) {
        if (!abierto && !guardando.value) {
            confirmarRechazoId.value = '';
        }
    },
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

function varianteEstado(estado) {
    if (estado === 'pendiente_revision') {
        return 'warning';
    }
    if (estado === 'disponible') {
        return 'success';
    }
    if (estado === 'rechazado') {
        return 'danger';
    }
    return 'neutral';
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

function claseBandeja(valor) {
    const clases = [
        'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border px-4 font-sans text-sm',
        'transition duration-150 ease-out motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    ];

    if (filtroEstado.value === valor) {
        clases.push('border-primary bg-primary-soft font-semibold text-primary');
    } else {
        clases.push('border-line bg-surface text-foreground hover:border-primary hover:bg-primary-soft/70');
    }

    return clases.join(' ');
}

function claseConteo(valor) {
    if (filtroEstado.value === valor) {
        return 'rounded-full bg-primary px-2 py-0.5 text-xs text-surface tabular-nums';
    }
    return 'rounded-full bg-muted/15 px-2 py-0.5 text-xs text-muted tabular-nums';
}

function estaAbierta(id) {
    return fichaAbiertaId.value === id;
}

function alternarFicha(id) {
    if (fichaAbiertaId.value === id) {
        fichaAbiertaId.value = '';
        return;
    }
    fichaAbiertaId.value = id;
}

function donacionARechazar() {
    if (confirmarRechazoId.value === '') {
        return null;
    }
    for (let i = 0; i < donaciones.value.length; i++) {
        if (donaciones.value[i].id === confirmarRechazoId.value) {
            return donaciones.value[i];
        }
    }
    return null;
}

function textoRechazo() {
    const donacion = donacionARechazar();
    if (donacion === null) {
        return 'Esta donación no va a publicarse en el catálogo.';
    }
    return donacion.nombre_comercial + ' no va a publicarse en el catálogo.';
}

function pedirRechazo(donacionId) {
    confirmarRechazoId.value = donacionId;
}

function cancelarRechazo() {
    if (guardando.value) {
        return;
    }
    confirmarRechazoId.value = '';
}

async function confirmarRechazo() {
    if (confirmarRechazoId.value === '') {
        return;
    }
    const id = confirmarRechazoId.value;
    const datos = formularios.value[id];
    const ok = await rechazarDonacion(id, datos);
    confirmarRechazoId.value = '';
    if (ok) {
        fichaAbiertaId.value = '';
    }
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

watch(filtroEstado, function () {
    fichaAbiertaId.value = '';
});

onMounted(function () {
    cargarDonaciones();
    cargarSugerencias();
});
</script>

<template>
    <main class="flex flex-col gap-6">
        <header class="flex flex-col gap-2">
            <h1 class="text-primary">Moderación de donaciones</h1>
            <p class="text-pretty text-muted">Revisá el envase, corregí la ficha y publicá o rechazá cada donación.</p>
        </header>

        <BaseAlert v-if="errorVademecum !== ''" variant="warning" :message="errorVademecum" />
        <BaseAlert
            v-if="errorAccion !== ''"
            :variant="tipoErrorAccion === 'advertencia' ? 'warning' : 'error'"
            :message="errorAccion"
        />
        <BaseAlert v-if="mensajeAccion !== ''" variant="success" :message="mensajeAccion" />

        <div
            id="donaciones-estado"
            class="-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-1"
            role="tablist"
            aria-label="Estado de las donaciones"
        >
            <button
                v-for="bandeja in bandejas"
                :key="bandeja.valor"
                type="button"
                role="tab"
                :aria-selected="filtroEstado === bandeja.valor ? 'true' : 'false'"
                :class="claseBandeja(bandeja.valor)"
                @click="filtroEstado = bandeja.valor"
            >
                <span>{{ bandeja.etiqueta }}</span>
                <span :class="claseConteo(bandeja.valor)">{{ bandeja.cantidad }}</span>
            </button>
        </div>

        <p v-if="cargando" class="text-muted">Cargando donaciones...</p>
        <div v-else-if="error !== ''" class="flex flex-col items-start gap-3">
            <BaseAlert variant="error" :message="error" />
            <BaseButton variant="outline" @click="cargarDonaciones">Reintentar</BaseButton>
        </div>
        <BaseAlert v-else-if="visibles.length === 0" variant="info" :message="mensajeVacio()" />
        <TransitionGroup v-else name="ficha-lista" tag="ul" class="flex flex-col gap-4">
            <li
                v-for="donacion in visibles"
                :key="donacion.id"
                class="overflow-hidden rounded-lg border border-line bg-surface shadow-sm"
            >
                <button
                    type="button"
                    class="flex w-full items-start gap-3 p-4 text-left transition duration-150 ease-out hover:bg-primary-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset motion-reduce:transition-none"
                    :aria-expanded="estaAbierta(donacion.id) ? 'true' : 'false'"
                    :aria-controls="'ficha-' + donacion.id"
                    @click="alternarFicha(donacion.id)"
                >
                    <div class="min-w-0 flex-1">
                        <h2 class="text-balance text-primary">{{ donacion.nombre_comercial }}</h2>
                        <p class="mt-1 text-sm text-muted">Donante: {{ nombreDonante(donacion) }}</p>
                        <p class="text-sm text-icon">Vence: {{ formatearFecha(donacion.fecha_vencimiento) }}</p>
                    </div>
                    <BaseBadge :variant="varianteEstado(donacion.estado)" size="sm">
                        {{ textoEstado(donacion.estado) }}
                    </BaseBadge>
                    <ChevronDown
                        class="mt-1 shrink-0 text-icon transition duration-150 ease-out motion-reduce:transition-none"
                        :class="estaAbierta(donacion.id) ? 'rotate-180' : ''"
                        :size="20"
                        aria-hidden="true"
                    />
                </button>

                <Transition name="ficha">
                    <div v-if="estaAbierta(donacion.id) && formularios[donacion.id]" :id="'ficha-' + donacion.id" class="border-t border-line px-4 pb-5 pt-4">
                        <div class="flex flex-col gap-6">
                            <section class="flex flex-col gap-3">
                                <p class="font-sans text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                                    Evidencia
                                </p>
                                <div v-if="fotos(donacion).length > 0" class="flex flex-wrap gap-3">
                                    <img
                                        v-for="(foto, indice) in fotos(donacion)"
                                        :key="indice"
                                        :src="foto"
                                        :alt="'Foto ' + (indice + 1) + ' de ' + donacion.nombre_comercial"
                                        class="size-32 rounded-md object-cover shadow-sm sm:size-40"
                                    />
                                </div>
                                <p v-else class="text-sm text-muted">Esta donación no tiene fotos del envase.</p>
                                <BaseAlert
                                    v-if="donacion.estado === 'rechazado' && donacion.motivo_rechazo"
                                    variant="warning"
                                    :message="'Motivo del rechazo: ' + donacion.motivo_rechazo"
                                />
                            </section>

                            <form class="flex flex-col gap-4" novalidate @submit.prevent="corregirDonacion(donacion.id, formularios[donacion.id])">
                                <p class="font-sans text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                                    Ficha
                                </p>
                                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <BaseInput
                                        :id="'moderar-nombre-' + donacion.id"
                                        v-model="formularios[donacion.id].nombre_comercial"
                                        label="Nombre comercial"
                                    />
                                    <BaseInput
                                        :id="'moderar-principio-' + donacion.id"
                                        v-model="formularios[donacion.id].principio_activo"
                                        label="Principio activo"
                                    />
                                    <BaseInput
                                        :id="'moderar-concentracion-' + donacion.id"
                                        v-model="formularios[donacion.id].concentracion"
                                        label="Concentración"
                                    />
                                    <BaseInput
                                        :id="'moderar-forma-' + donacion.id"
                                        v-model="formularios[donacion.id].forma_farmaceutica"
                                        label="Forma farmacéutica"
                                    />
                                    <BaseInput
                                        :id="'moderar-cantidad-' + donacion.id"
                                        v-model="formularios[donacion.id].cantidad_disponible"
                                        type="number"
                                        min="1"
                                        step="1"
                                        label="Cantidad"
                                    />
                                    <BaseInput
                                        :id="'moderar-lote-' + donacion.id"
                                        v-model="formularios[donacion.id].lote"
                                        label="Lote"
                                    />
                                    <BaseInput
                                        :id="'moderar-vencimiento-' + donacion.id"
                                        v-model="formularios[donacion.id].fecha_vencimiento"
                                        type="date"
                                        :min="fechaMinima"
                                        label="Fecha de vencimiento"
                                    />
                                </div>
                                <BaseTextarea
                                    :id="'moderar-descripcion-' + donacion.id"
                                    v-model="formularios[donacion.id].descripcion"
                                    label="Descripción"
                                    :rows="3"
                                />
                                <div>
                                    <BaseButton type="submit" variant="outline" :loading="guardando">
                                        Guardar cambios
                                    </BaseButton>
                                </div>
                            </form>

                            <section class="flex flex-col gap-4">
                                <p class="font-sans text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                                    Dictamen
                                </p>
                                <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    <div class="flex flex-col gap-3">
                                        <BaseSelect
                                            :id="'moderar-vademecum-' + donacion.id"
                                            v-model="formularios[donacion.id].medicamento_habilitado_id"
                                            label="Medicamento del vademécum"
                                            placeholder="Elegí una fila del vademécum"
                                            :options="opcionesVademecum"
                                        />
                                        <div>
                                            <BaseButton
                                                :loading="guardando"
                                                @click="aprobarDonacion(donacion.id, formularios[donacion.id])"
                                            >
                                                Aprobar
                                            </BaseButton>
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-3">
                                        <BaseTextarea
                                            :id="'moderar-motivo-' + donacion.id"
                                            v-model="formularios[donacion.id].motivo_rechazo"
                                            label="Motivo del rechazo"
                                            :rows="2"
                                        />
                                        <div>
                                            <BaseButton
                                                variant="danger"
                                                :disabled="guardando"
                                                @click="pedirRechazo(donacion.id)"
                                            >
                                                Rechazar
                                            </BaseButton>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </Transition>
            </li>
        </TransitionGroup>

        <div v-if="!cargando && error === '' && total > 15" class="flex flex-wrap items-center gap-3">
            <BaseButton variant="outline" size="sm" :disabled="pagina === 1" @click="pagina = pagina - 1">
                Anterior
            </BaseButton>
            <span class="font-sans text-sm text-muted tabular-nums">Página {{ pagina }}</span>
            <BaseButton variant="outline" size="sm" :disabled="pagina * 15 >= total" @click="pagina = pagina + 1">
                Siguiente
            </BaseButton>
        </div>

        <BaseModal
            v-model:open="modalRechazoAbierto"
            variant="danger"
            title="Rechazar donación"
            :description="textoRechazo()"
            :locked="guardando"
        >
            <template #footer>
                <BaseButton variant="outline" :disabled="guardando" @click="cancelarRechazo">Cancelar</BaseButton>
                <BaseButton variant="danger" :loading="guardando" @click="confirmarRechazo">Rechazar</BaseButton>
            </template>
        </BaseModal>
    </main>
</template>

<style scoped>
.ficha-lista-enter-active,
.ficha-lista-leave-active,
.ficha-enter-active,
.ficha-leave-active {
    transition: opacity 180ms ease-out;
}

.ficha-lista-move {
    transition: transform 180ms ease-out;
}

.ficha-lista-enter-from,
.ficha-lista-leave-to,
.ficha-enter-from,
.ficha-leave-to {
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    .ficha-lista-enter-active,
    .ficha-lista-leave-active,
    .ficha-lista-move,
    .ficha-enter-active,
    .ficha-leave-active {
        transition: none;
    }
}
</style>
