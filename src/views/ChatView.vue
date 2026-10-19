<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useMensajes } from '../composables/useMensajes';
import ListaMensajes from '../components/chat/ListaMensajes.vue';
import FormularioMensaje from '../components/chat/FormularioMensaje.vue';

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

const cuentaSuspendida = computed(function () {
    return perfil.value !== null && perfil.value.is_validado === false;
});

const puedeEscribir = computed(function () {
    if (cuentaSuspendida.value || solicitud.value === null) {
        return false;
    }
    return solicitud.value.estado === 'pendiente_coordinacion' || solicitud.value.estado === 'en_camino';
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
</script>

<template>
    <main class="mx-auto flex max-w-md flex-col gap-4 p-6">
        <RouterLink :to="{ name: 'perfil' }" class="text-secondary">Volver al perfil</RouterLink>

        <h1 class="text-2xl text-primary">Chat</h1>

        <p v-if="cargando" class="text-secondary">Cargando la conversación...</p>

        <p v-else-if="error !== ''" class="rounded border border-danger bg-danger/10 p-4 text-danger">{{ error }}</p>

        <template v-else-if="solicitud !== null">
            <p v-if="solicitud.medicamentos">{{ solicitud.medicamentos.nombre_comercial }}</p>
            <p v-if="nombreOtro !== ''">Con {{ nombreOtro }}</p>

            <ListaMensajes :mensajes="mensajes" :user-id="sesion.user.id" />

            <p v-if="cuentaSuspendida" class="rounded border border-warning bg-warning/10 p-4 text-warning">
                Tu cuenta está suspendida y no podés enviar mensajes.
            </p>
            <p v-else-if="!puedeEscribir" class="rounded border border-secondary bg-secondary/10 p-4 text-secondary">
                Esta solicitud ya no admite mensajes nuevos. Podés leer los anteriores.
            </p>

            <FormularioMensaje
                :enviando="enviando"
                :deshabilitado="!puedeEscribir"
                :error="errorEnvio"
                @enviar="alEnviar"
            />
        </template>
    </main>
</template>
