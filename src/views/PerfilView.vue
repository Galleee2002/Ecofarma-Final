<script setup>
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';
import { usePerfil } from '../composables/usePerfil';
import { useDonaciones } from '../composables/useDonaciones';
import { useSolicitudes } from '../composables/useSolicitudes';
import FormularioPerfil from '../components/perfil/FormularioPerfil.vue';
import ListaMisDonaciones from '../components/perfil/ListaMisDonaciones.vue';
import ListaMisSolicitudes from '../components/perfil/ListaMisSolicitudes.vue';

const { sesion, perfil, errorPerfil } = useAuth();
const { cargando: guardando, error: errorGuardar, mensaje: mensajeGuardar, actualizarDatos } = usePerfil();
const { donaciones, cargando: cargandoDonaciones, cargado: donacionesCargadas, error: errorDonaciones, cargarMisDonaciones } = useDonaciones();
const { solicitudes, cargando: cargandoSolicitudes, cargado: solicitudesCargadas, error: errorSolicitudes, cargarMisSolicitudes } = useSolicitudes();

const pestanaActiva = ref('datos');

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

function clasePestana(pestana) {
    if (pestanaActiva.value === pestana) {
        return 'border-b-2 border-primary text-primary';
    }
    return '';
}
</script>

<template>
    <main class="mx-auto flex max-w-md flex-col gap-4 p-6">
        <h1 class="text-2xl text-primary">Mi perfil</h1>

        <p v-if="errorPerfil !== ''" class="rounded border border-danger bg-danger/10 p-4 text-danger">{{ errorPerfil }}</p>

        <p v-else-if="perfil === null" class="text-muted">Cargando tus datos...</p>

        <template v-else>
            <nav class="flex gap-4">
                <button type="button" class="px-1 py-2" :class="clasePestana('datos')" @click="abrirPestana('datos')">Mis datos</button>
                <button type="button" class="px-1 py-2" :class="clasePestana('donaciones')" @click="abrirPestana('donaciones')">Mis donaciones</button>
                <button type="button" class="px-1 py-2" :class="clasePestana('solicitudes')" @click="abrirPestana('solicitudes')">Mis solicitudes</button>
            </nav>

            <FormularioPerfil
                v-if="pestanaActiva === 'datos'"
                :perfil="perfil"
                :email="sesion.user.email"
                :cargando="guardando"
                :error="errorGuardar"
                :mensaje="mensajeGuardar"
                @guardar="actualizarDatos"
            />

            <ListaMisDonaciones
                v-if="pestanaActiva === 'donaciones'"
                :donaciones="donaciones"
                :cargando="cargandoDonaciones"
                :error="errorDonaciones"
                @reintentar="recargarDonaciones"
            />

            <ListaMisSolicitudes
                v-if="pestanaActiva === 'solicitudes'"
                :solicitudes="solicitudes"
                :cargando="cargandoSolicitudes"
                :error="errorSolicitudes"
                @reintentar="recargarSolicitudes"
            />
        </template>
    </main>
</template>
