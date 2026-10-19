<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useMensajes } from '../composables/useMensajes';
import { useSolicitudes } from '../composables/useSolicitudes';
import ListaMensajes from '../components/chat/ListaMensajes.vue';
import FormularioEncuentro from '../components/chat/FormularioEncuentro.vue';
import FormularioMensaje from '../components/chat/FormularioMensaje.vue';
import FormularioConfirmarEntrega from '../components/chat/FormularioConfirmarEntrega.vue';
import PanelCancelarSolicitud from '../components/chat/PanelCancelarSolicitud.vue';

const route = useRoute();
const { sesion, perfil } = useAuth();
const {
    mensajes,
    solicitud,
    nombreOtro,
    cargando,
    enviando,
    error,
    errorEnvio,
    cargarChat,
    enviarMensaje,
} = useMensajes();
const {
    confirmando,
    errorConfirmar,
    mensajeConfirmar,
    cancelando,
    errorCancelar,
    mensajeCancelar,
    confirmarEntrega,
    cancelarSolicitud,
} = useSolicitudes();

const cuentaSuspendida = computed(function () {
    return perfil.value !== null && perfil.value.is_validado === false;
});

const puedeEscribir = computed(function () {
    if (cuentaSuspendida.value || solicitud.value === null) {
        return false;
    }
    return solicitud.value.estado === 'pendiente_coordinacion' || solicitud.value.estado === 'en_camino';
});

const esDonante = computed(function () {
    if (solicitud.value === null || solicitud.value.medicamentos === null || sesion.value === null) {
        return false;
    }
    return solicitud.value.medicamentos.user_id === sesion.value.user.id;
});

onMounted(function () {
    cargarChat(route.params.solicitudId, sesion.value.user.id);
});

async function alEnviar(texto, limpiar) {
    const ok = await enviarMensaje(route.params.solicitudId, sesion.value.user.id, texto);
    if (ok) {
        limpiar();
    }
}

async function alConfirmar(codigo) {
    const ok = await confirmarEntrega(route.params.solicitudId, codigo);
    if (ok) {
        await cargarChat(route.params.solicitudId, sesion.value.user.id);
    }
}

async function alCancelar() {
    const ok = await cancelarSolicitud(route.params.solicitudId);
    if (ok) {
        await cargarChat(route.params.solicitudId, sesion.value.user.id);
    }
}
</script>

<template>
    <main class="mx-auto flex max-w-md flex-col gap-4 p-6">
        <RouterLink :to="{ name: 'perfil' }" class="text-secondary">Volver al perfil</RouterLink>

        <h1 class="text-2xl text-primary">Chat</h1>

        <p v-if="mensajeConfirmar !== ''" class="rounded border border-success bg-success/10 p-4 text-success">
            {{ mensajeConfirmar }}
        </p>
        <p v-if="mensajeCancelar !== ''" class="rounded border border-success bg-success/10 p-4 text-success">
            {{ mensajeCancelar }}
        </p>

        <p v-if="cargando" class="text-secondary">Cargando la conversación...</p>

        <p v-else-if="error !== ''" class="rounded border border-danger bg-danger/10 p-4 text-danger">{{ error }}</p>

        <template v-else-if="solicitud !== null">
            <div class="rounded border border-warning bg-warning/10 p-4 text-warning">
                <p>Normas de convivencia</p>
                <ul class="list-disc pl-5">
                    <li>Coordiná el encuentro en un lugar público.</li>
                    <li>No compartas por el chat tu DNI ni la dirección de tu casa.</li>
                    <li>Al recibir el medicamento, revisá el envase y la fecha de vencimiento.</li>
                    <li>Tratá con respeto a la otra persona.</li>
                </ul>
            </div>

            <p v-if="solicitud.medicamentos">{{ solicitud.medicamentos.nombre_comercial }}</p>
            <p v-if="nombreOtro !== ''">Con {{ nombreOtro }}</p>

            <ListaMensajes :mensajes="mensajes" :user-id="sesion.user.id" />

            <p v-if="cuentaSuspendida" class="rounded border border-warning bg-warning/10 p-4 text-warning">
                Tu cuenta está suspendida y no podés enviar mensajes.
            </p>
            <p v-else-if="!puedeEscribir" class="rounded border border-secondary bg-secondary/10 p-4 text-secondary">
                Esta solicitud ya no admite mensajes nuevos. Podés leer los anteriores.
            </p>

            <FormularioEncuentro :enviando="enviando" :deshabilitado="!puedeEscribir" @proponer="alEnviar" />

            <FormularioMensaje
                :enviando="enviando"
                :deshabilitado="!puedeEscribir"
                :error="errorEnvio"
                @enviar="alEnviar"
            />

            <FormularioConfirmarEntrega
                v-if="puedeEscribir && esDonante"
                :confirmando="confirmando"
                :error="errorConfirmar"
                @confirmar="alConfirmar"
            />

            <PanelCancelarSolicitud
                v-if="puedeEscribir"
                :cancelando="cancelando"
                :error="errorCancelar"
                @cancelar="alCancelar"
            />
        </template>
    </main>
</template>
