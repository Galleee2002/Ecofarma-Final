<script setup>
import { ref, watch } from 'vue';
import { useAuth } from '../composables/useAuth';
import { usePerfil } from '../composables/usePerfil';
import { useDonaciones } from '../composables/useDonaciones';
import { useSolicitudes } from '../composables/useSolicitudes';

const { sesion, perfil, errorPerfil } = useAuth();
const { cargando: guardando, error: errorGuardar, mensaje: mensajeGuardar, actualizarDatos } = usePerfil();
const { donaciones, cargando: cargandoDonaciones, cargado: donacionesCargadas, error: errorDonaciones, cargarMisDonaciones } = useDonaciones();
const { solicitudes, cargando: cargandoSolicitudes, cargado: solicitudesCargadas, error: errorSolicitudes, cargarMisSolicitudes } = useSolicitudes();

const pestanaActiva = ref('datos');
const datos = ref({
    name: '',
    email: '',
    dni: '',
    telefono: '',
    direccion: '',
    localidad: '',
});

const textosEstadoDonacion = {
    pendiente_revision: 'En revisión',
    disponible: 'Disponible',
    reservado: 'Reservado',
    entregado: 'Entregado',
    rechazado: 'Rechazado',
};

const textosEstadoSolicitud = {
    pendiente_coordinacion: 'Coordinando entrega',
    en_camino: 'En camino',
    completado: 'Entregado',
    cancelado: 'Cancelada',
};

watch(
    function () {
        return perfil.value;
    },
    function (valor) {
        if (valor === null) {
            return;
        }
        datos.value.name = valor.name || '';
        datos.value.dni = valor.dni || '';
        datos.value.telefono = valor.telefono;
        datos.value.direccion = valor.direccion;
        datos.value.localidad = valor.localidad;
    },
    { immediate: true },
);

watch(
    function () {
        return sesion.value;
    },
    function (valor) {
        if (valor === null) {
            return;
        }
        datos.value.email = valor.user.email;
    },
    { immediate: true },
);

function textoEstadoDonacion(estado) {
    if (textosEstadoDonacion[estado]) {
        return textosEstadoDonacion[estado];
    }
    return estado;
}

function textoEstadoSolicitud(estado) {
    if (textosEstadoSolicitud[estado]) {
        return textosEstadoSolicitud[estado];
    }
    return estado;
}

function formatearFecha(fecha) {
    const partes = fecha.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function formatearFechaHora(fecha) {
    return new Date(fecha).toLocaleDateString('es-AR');
}

function recargarDonaciones() {
    cargarMisDonaciones(sesion.value.user.id);
}

function recargarSolicitudes() {
    cargarMisSolicitudes(sesion.value.user.id);
}

function abrirPestana(pestana) {
    pestanaActiva.value = pestana;
    if (pestana === 'donaciones' && !donacionesCargadas.value) {
        recargarDonaciones();
    }
    if (pestana === 'solicitudes' && !solicitudesCargadas.value) {
        recargarSolicitudes();
    }
}
</script>

<template>
    <main class="pagina">
        <h1 class="text-primary">Mi perfil</h1>

        <p v-if="errorPerfil !== ''" class="border border-danger bg-danger/10 p-3 text-danger">{{ errorPerfil }}</p>
        <p v-else-if="perfil === null" class="text-muted">Cargando tus datos...</p>

        <template v-else>
            <div class="flex flex-wrap gap-2">
                <button type="button" class="border border-line bg-surface px-3 py-2" :class="pestanaActiva === 'datos' ? 'border-primary text-primary' : ''" @click="abrirPestana('datos')">
                    Mis datos
                </button>
                <button type="button" class="border border-line bg-surface px-3 py-2" :class="pestanaActiva === 'donaciones' ? 'border-primary text-primary' : ''" @click="abrirPestana('donaciones')">
                    Mis donaciones
                </button>
                <button type="button" class="border border-line bg-surface px-3 py-2" :class="pestanaActiva === 'solicitudes' ? 'border-primary text-primary' : ''" @click="abrirPestana('solicitudes')">
                    Mis solicitudes
                </button>
            </div>

            <form v-if="pestanaActiva === 'datos'" class="flex flex-col gap-4" novalidate @submit.prevent="actualizarDatos(datos)">
                <div class="flex flex-col gap-1">
                    <label for="perfil-nombre">Nombre</label>
                    <input id="perfil-nombre" v-model="datos.name" type="text" autocomplete="name" class="border border-line bg-surface px-3 py-2" />
                </div>
                <div class="flex flex-col gap-1">
                    <label for="perfil-email">Email</label>
                    <input id="perfil-email" v-model="datos.email" type="email" autocomplete="email" class="border border-line bg-surface px-3 py-2" />
                </div>
                <div class="flex flex-col gap-1">
                    <label for="perfil-dni">DNI</label>
                    <input id="perfil-dni" v-model="datos.dni" type="text" inputmode="numeric" class="border border-line bg-surface px-3 py-2" />
                </div>
                <div class="flex flex-col gap-1">
                    <label for="perfil-telefono">Teléfono</label>
                    <input id="perfil-telefono" v-model="datos.telefono" type="tel" autocomplete="tel" class="border border-line bg-surface px-3 py-2" />
                </div>
                <div class="flex flex-col gap-1">
                    <label for="perfil-direccion">Dirección</label>
                    <input id="perfil-direccion" v-model="datos.direccion" type="text" autocomplete="street-address" class="border border-line bg-surface px-3 py-2" />
                </div>
                <div class="flex flex-col gap-1">
                    <label for="perfil-localidad">Localidad</label>
                    <input id="perfil-localidad" v-model="datos.localidad" type="text" class="border border-line bg-surface px-3 py-2" />
                </div>
                <p v-if="errorGuardar !== ''" class="border border-danger bg-danger/10 p-3 text-danger">{{ errorGuardar }}</p>
                <p v-if="mensajeGuardar !== ''" class="border border-success bg-success/10 p-3 text-success">{{ mensajeGuardar }}</p>
                <button type="submit" class="bg-primary px-4 py-2 text-surface" :disabled="guardando">
                    {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
                </button>
            </form>

            <div v-else-if="pestanaActiva === 'donaciones'" class="flex flex-col gap-4">
                <p v-if="cargandoDonaciones" class="text-muted">Cargando tus donaciones...</p>
                <div v-else-if="errorDonaciones !== ''" class="flex flex-col items-start gap-2 border border-danger bg-danger/10 p-3 text-danger">
                    <p>{{ errorDonaciones }}</p>
                    <button type="button" @click="recargarDonaciones">Reintentar</button>
                </div>
                <p v-else-if="donaciones.length === 0" class="border border-line bg-muted/10 p-3 text-muted">Todavía no publicaste donaciones.</p>
                <ul v-else class="flex flex-col gap-4">
                    <li v-for="donacion in donaciones" :key="donacion.id" class="border border-line bg-surface p-4">
                        <h2 class="text-primary">{{ donacion.nombre_comercial }}</h2>
                        <p>{{ donacion.principio_activo }} {{ donacion.concentracion }}</p>
                        <p>Cantidad: {{ donacion.cantidad_disponible }}</p>
                        <p>Vence: {{ formatearFecha(donacion.fecha_vencimiento) }}</p>
                        <p>{{ textoEstadoDonacion(donacion.estado) }}</p>
                        <p v-if="donacion.estado === 'rechazado' && donacion.motivo_rechazo" class="border border-warning bg-warning/10 p-3 text-warning">
                            Motivo del rechazo: {{ donacion.motivo_rechazo }}
                        </p>
                        <RouterLink
                            v-if="donacion.estado === 'reservado' && donacion.solicitud_id"
                            :to="{ name: 'chat-solicitud', params: { solicitudId: donacion.solicitud_id } }"
                            class="text-secondary"
                        >
                            Abrir chat
                        </RouterLink>
                    </li>
                </ul>
            </div>

            <div v-else class="flex flex-col gap-4">
                <p v-if="cargandoSolicitudes" class="text-muted">Cargando tus solicitudes...</p>
                <div v-else-if="errorSolicitudes !== ''" class="flex flex-col items-start gap-2 border border-danger bg-danger/10 p-3 text-danger">
                    <p>{{ errorSolicitudes }}</p>
                    <button type="button" @click="recargarSolicitudes">Reintentar</button>
                </div>
                <p v-else-if="solicitudes.length === 0" class="border border-line bg-muted/10 p-3 text-muted">Todavía no hiciste solicitudes.</p>
                <ul v-else class="flex flex-col gap-4">
                    <li v-for="solicitud in solicitudes" :key="solicitud.id" class="border border-line bg-surface p-4">
                        <h2 v-if="solicitud.medicamentos" class="text-primary">{{ solicitud.medicamentos.nombre_comercial }}</h2>
                        <p v-if="solicitud.medicamentos">{{ solicitud.medicamentos.principio_activo }}</p>
                        <p v-if="solicitud.es_para_tercero">Para: {{ solicitud.nombre_destinatario_final }}</p>
                        <p class="text-muted">Solicitado el {{ formatearFechaHora(solicitud.created_at) }}</p>
                        <p>{{ textoEstadoSolicitud(solicitud.estado) }}</p>
                        <p v-if="solicitud.fecha_entrega">Entregado el {{ formatearFechaHora(solicitud.fecha_entrega) }}</p>
                        <p v-if="solicitud.codigo">Código de retiro: <strong>{{ solicitud.codigo }}</strong></p>
                        <p v-if="solicitud.errorCodigo" class="border border-warning bg-warning/10 p-3 text-warning">
                            Código no disponible. Recargá la página para intentar de nuevo.
                        </p>
                        <RouterLink
                            v-if="solicitud.estado === 'pendiente_coordinacion' || solicitud.estado === 'en_camino'"
                            :to="{ name: 'chat-solicitud', params: { solicitudId: solicitud.id } }"
                            class="text-secondary"
                        >
                            Abrir chat
                        </RouterLink>
                    </li>
                </ul>
            </div>
        </template>
    </main>
</template>
