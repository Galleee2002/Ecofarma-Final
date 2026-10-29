<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useMensajes } from '../composables/useMensajes';
import { useSolicitudes } from '../composables/useSolicitudes';

const route = useRoute();
const { sesion, perfil } = useAuth();
const { mensajes, solicitud, nombreOtro, cargando, enviando, error, errorEnvio, cargarChat, enviarMensaje } = useMensajes();
const { confirmando, errorConfirmar, mensajeConfirmar, cancelando, errorCancelar, mensajeCancelar, confirmarEntrega, cancelarSolicitud } =
    useSolicitudes();

const texto = ref('');
const codigo = ref('');
const dia = ref('');
const hora = ref('');
const lugar = ref('');
const errorEncuentro = ref('');
const confirmarCancelacion = ref(false);
const codigoValido = computed(function () {
    return /^[0-9]{6}$/.test(codigo.value.trim());
});

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

function esPropio(mensaje) {
    return mensaje.user_id === sesion.value.user.id;
}

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleString('es-AR');
}

function fechaMinima() {
    const maniana = new Date();
    maniana.setDate(maniana.getDate() + 1);
    const anio = maniana.getFullYear();
    const mes = String(maniana.getMonth() + 1).padStart(2, '0');
    const diaManiana = String(maniana.getDate()).padStart(2, '0');
    return anio + '-' + mes + '-' + diaManiana;
}

function formatearDia(valor) {
    const partes = valor.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}

onMounted(function () {
    cargarChat(route.params.solicitudId, sesion.value.user.id);
});

async function alEnviar() {
    const ok = await enviarMensaje(route.params.solicitudId, sesion.value.user.id, texto.value);
    if (ok) {
        texto.value = '';
    }
}

async function alProponer() {
    errorEncuentro.value = '';
    const lugarTexto = lugar.value.trim();

    if (dia.value === '' || hora.value === '' || lugarTexto === '') {
        errorEncuentro.value = 'Completá el día, la hora y el lugar del encuentro.';
        return;
    }

    if (dia.value < fechaMinima()) {
        errorEncuentro.value = 'El día del encuentro tiene que ser a partir de mañana.';
        return;
    }

    const mensaje = 'Propongo encontrarnos el ' + formatearDia(dia.value) + ' a las ' + hora.value + ' en ' + lugarTexto + '.';
    const ok = await enviarMensaje(route.params.solicitudId, sesion.value.user.id, mensaje);
    if (ok) {
        dia.value = '';
        hora.value = '';
        lugar.value = '';
    }
}

async function alConfirmar() {
    const ok = await confirmarEntrega(route.params.solicitudId, codigo.value);
    if (ok) {
        codigo.value = '';
        await cargarChat(route.params.solicitudId, sesion.value.user.id);
    }
}

async function alCancelar() {
    const ok = await cancelarSolicitud(route.params.solicitudId);
    if (ok) {
        confirmarCancelacion.value = false;
        await cargarChat(route.params.solicitudId, sesion.value.user.id);
    }
}
</script>

<template>
    <main class="pagina">
        <RouterLink :to="{ name: 'perfil' }" class="text-primary">Volver al perfil</RouterLink>
        <h1 class="text-primary">Chat</h1>

        <p v-if="mensajeConfirmar !== ''" class="border border-success bg-success/10 p-3 text-success">{{ mensajeConfirmar }}</p>
        <p v-if="mensajeCancelar !== ''" class="border border-success bg-success/10 p-3 text-success">{{ mensajeCancelar }}</p>
        <p v-if="cargando" class="text-muted">Cargando la conversación...</p>
        <p v-else-if="error !== ''" class="border border-danger bg-danger/10 p-3 text-danger">{{ error }}</p>

        <template v-else-if="solicitud !== null">
            <div class="border border-warning bg-warning/10 p-3 text-warning">
                <p>Normas de convivencia</p>
                <ul class="list-disc pl-5">
                    <li>Coordiná el encuentro en un lugar público.</li>
                    <li>No compartas por el chat tu DNI ni la dirección de tu casa.</li>
                    <li>Al recibir el medicamento, revisá el envase y la fecha de vencimiento.</li>
                    <li>Tratá con respeto a la otra persona.</li>
                </ul>
            </div>

            <p v-if="solicitud.medicamentos" class="text-primary">{{ solicitud.medicamentos.nombre_comercial }}</p>
            <p v-if="nombreOtro !== ''" class="text-muted">Con {{ nombreOtro }}</p>

            <p v-if="cuentaSuspendida" class="border border-warning bg-warning/10 p-3 text-warning">Tu cuenta está suspendida y no podés enviar mensajes.</p>
            <p v-else-if="!puedeEscribir" class="border border-line bg-muted/10 p-3 text-muted">Esta solicitud ya no admite mensajes nuevos. Podés leer los anteriores.</p>

            <div class="flex max-h-80 flex-col gap-2 overflow-y-auto border border-line bg-surface p-3">
                <p v-if="mensajes.length === 0" class="text-muted">Todavía no hay mensajes. Proponé el día, la hora y el lugar con el formulario de encuentro.</p>
                <article v-for="mensaje in mensajes" :key="mensaje.id" class="border border-line p-3" :class="esPropio(mensaje) ? 'bg-primary-soft' : 'bg-surface'">
                    <p>{{ mensaje.mensaje }}</p>
                    <p class="text-sm text-muted">{{ formatearFecha(mensaje.created_at) }}</p>
                </article>
            </div>

            <form class="flex flex-col gap-2" @submit.prevent="alEnviar">
                <p v-if="errorEnvio !== ''" class="border border-danger bg-danger/10 p-3 text-danger">{{ errorEnvio }}</p>
                <label for="chat-mensaje">Mensaje</label>
                <input
                    id="chat-mensaje"
                    v-model="texto"
                    type="text"
                    class="border border-line bg-surface px-3 py-2"
                    :disabled="!puedeEscribir || enviando"
                />
                <button type="submit" class="bg-primary px-4 py-2 text-surface" :disabled="!puedeEscribir || enviando || texto.trim() === ''">
                    {{ enviando ? 'Enviando...' : 'Enviar' }}
                </button>
            </form>

            <form class="flex flex-col gap-2 border border-line bg-surface p-4" @submit.prevent="alProponer">
                <p class="text-primary">Proponer encuentro</p>
                <p v-if="errorEncuentro !== ''" class="border border-danger bg-danger/10 p-3 text-danger">{{ errorEncuentro }}</p>
                <div class="flex flex-col gap-1">
                    <label for="encuentro-dia">Día</label>
                    <input id="encuentro-dia" v-model="dia" type="date" :min="fechaMinima()" :disabled="!puedeEscribir || enviando" class="border border-line bg-surface px-3 py-2" />
                </div>
                <div class="flex flex-col gap-1">
                    <label for="encuentro-hora">Hora</label>
                    <input id="encuentro-hora" v-model="hora" type="time" :disabled="!puedeEscribir || enviando" class="border border-line bg-surface px-3 py-2" />
                </div>
                <div class="flex flex-col gap-1">
                    <label for="encuentro-lugar">Lugar</label>
                    <input id="encuentro-lugar" v-model="lugar" type="text" :disabled="!puedeEscribir || enviando" class="border border-line bg-surface px-3 py-2" />
                </div>
                <button type="submit" class="bg-primary px-4 py-2 text-surface" :disabled="!puedeEscribir || enviando">Proponer encuentro</button>
            </form>

            <form v-if="puedeEscribir && esDonante" class="flex flex-col gap-2 border border-line bg-surface p-4" @submit.prevent="alConfirmar">
                <p>Cuando se encuentren, pedile el código de 6 dígitos al receptor y cargalo acá.</p>
                <p v-if="errorConfirmar !== ''" class="border border-danger bg-danger/10 p-3 text-danger">{{ errorConfirmar }}</p>
                <div class="flex flex-col gap-1">
                    <label for="codigo-retiro">Código de retiro</label>
                    <input id="codigo-retiro" v-model="codigo" type="text" inputmode="numeric" maxlength="6" :disabled="confirmando" class="border border-line bg-surface px-3 py-2" />
                </div>
                <button type="submit" class="bg-primary px-4 py-2 text-surface" :disabled="confirmando || !codigoValido">
                    {{ confirmando ? 'Confirmando...' : 'Confirmar entrega' }}
                </button>
            </form>

            <div v-if="puedeEscribir" class="flex flex-col gap-2">
                <button type="button" class="bg-danger px-4 py-2 text-surface" @click="confirmarCancelacion = true">Cancelar solicitud</button>
                <div v-if="confirmarCancelacion" class="border border-danger bg-danger/10 p-3">
                    <p>El medicamento vuelve a estar disponible para otra persona.</p>
                    <p v-if="errorCancelar !== ''" class="text-danger">{{ errorCancelar }}</p>
                    <div class="mt-2 flex gap-2">
                        <button type="button" class="border border-line bg-surface px-3 py-2" :disabled="cancelando" @click="confirmarCancelacion = false">No, volver</button>
                        <button type="button" class="bg-danger px-3 py-2 text-surface" :disabled="cancelando" @click="alCancelar">
                            {{ cancelando ? 'Cancelando...' : 'Sí, cancelar' }}
                        </button>
                    </div>
                </div>
            </div>
        </template>
    </main>
</template>
