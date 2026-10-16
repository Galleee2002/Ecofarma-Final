<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '../../composables/useAuth';
import { useSolicitudes } from '../../composables/useSolicitudes';

const props = defineProps({
    medicamentoId: {
        type: String,
        required: true,
    },
    requiereReceta: {
        type: Boolean,
        required: true,
    },
});

const router = useRouter();
const route = useRoute();
const { sesion, perfil, errorPerfil } = useAuth();
const { creando, errorCrear, mensajeCrear, tipoMensajeCrear, crearSolicitud } = useSolicitudes();

const aceptoDdjj = ref(false);
const esParaTercero = ref(false);
const nombreDestinatario = ref('');
const archivoReceta = ref(null);
const vistaPreviaReceta = ref('');

const cuentaSuspendida = computed(function () {
    return perfil.value !== null && perfil.value.is_validado === false;
});

const puedeSolicitar = computed(function () {
    if (sesion.value === null || perfil.value === null || cuentaSuspendida.value || aceptoDdjj.value !== true || creando.value) {
        return false;
    }

    if (esParaTercero.value && nombreDestinatario.value.trim() === '') {
        return false;
    }

    if (props.requiereReceta && archivoReceta.value === null) {
        return false;
    }

    return true;
});

const claseMensaje = computed(function () {
    if (tipoMensajeCrear.value === 'exito') {
        return 'border-success bg-success/10 text-success';
    }
    return 'border-secondary bg-secondary/10 text-secondary';
});

function irALogin() {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
}

function elegirReceta(evento) {
    const archivo = evento.target.files[0];
    evento.target.value = '';

    if (!archivo) {
        return;
    }

    if (vistaPreviaReceta.value !== '') {
        URL.revokeObjectURL(vistaPreviaReceta.value);
    }

    archivoReceta.value = archivo;
    vistaPreviaReceta.value = URL.createObjectURL(archivo);
}

function quitarReceta() {
    if (vistaPreviaReceta.value !== '') {
        URL.revokeObjectURL(vistaPreviaReceta.value);
    }
    archivoReceta.value = null;
    vistaPreviaReceta.value = '';
}

async function solicitar() {
    if (sesion.value === null) {
        irALogin();
        return;
    }

    if (!puedeSolicitar.value) {
        return;
    }

    const creada = await crearSolicitud(
        sesion.value.user.id,
        {
            medicamentoId: props.medicamentoId,
            aceptoDdjj: aceptoDdjj.value,
            esParaTercero: esParaTercero.value,
            nombreDestinatario: nombreDestinatario.value,
            requiereReceta: props.requiereReceta,
        },
        archivoReceta.value,
    );

    if (creada) {
        aceptoDdjj.value = false;
        esParaTercero.value = false;
        nombreDestinatario.value = '';
        quitarReceta();
    }
}
</script>

<template>
    <section class="flex flex-col gap-4 rounded border p-4">
        <h2 class="text-lg text-primary">Solicitar este medicamento</h2>

        <p v-if="errorPerfil !== ''" class="rounded border border-danger bg-danger/10 p-4 text-danger">{{ errorPerfil }}</p>

        <template v-else-if="sesion === null">
            <p class="rounded border border-secondary bg-secondary/10 p-4 text-secondary">
                Para solicitar este medicamento tenés que iniciar sesión.
            </p>
            <button type="button" class="rounded border border-primary px-3 py-2 text-primary" @click="irALogin">
                Iniciar sesión para solicitar
            </button>
        </template>

        <template v-else-if="perfil === null">
            <p class="text-secondary">Cargando tus datos...</p>
        </template>

        <template v-else>
            <p v-if="cuentaSuspendida" class="rounded border border-warning bg-warning/10 p-4 text-warning">
                Tu cuenta está suspendida, no podés solicitar medicamentos.
            </p>

            <template v-else>
                <label class="flex items-start gap-2">
                    <input v-model="esParaTercero" type="checkbox" class="mt-1" />
                    <span>Solicito este medicamento para otra persona</span>
                </label>

                <div v-if="esParaTercero" class="flex flex-col gap-1">
                    <label for="solicitud-destinatario">Nombre del destinatario</label>
                    <input
                        id="solicitud-destinatario"
                        v-model="nombreDestinatario"
                        type="text"
                        class="rounded border px-3 py-2"
                    />
                </div>

                <div v-if="requiereReceta" class="flex flex-col gap-2">
                    <label for="solicitud-receta">Foto de la receta médica (JPG, PNG o WEBP, hasta 5 MB)</label>
                    <input
                        id="solicitud-receta"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        class="rounded border px-3 py-2"
                        @change="elegirReceta"
                    />
                    <div v-if="vistaPreviaReceta !== ''" class="flex flex-col gap-1">
                        <img :src="vistaPreviaReceta" alt="Vista previa de la receta" class="h-32 w-32 object-cover" />
                        <button type="button" class="rounded border border-danger px-2 py-1 text-danger" @click="quitarReceta">
                            Quitar
                        </button>
                    </div>
                </div>

                <label class="flex items-start gap-2">
                    <input v-model="aceptoDdjj" type="checkbox" class="mt-1" />
                    <span>Acepto los Términos y Condiciones y la Declaración Jurada de EcoFARMA.</span>
                </label>
            </template>

            <p v-if="errorCrear !== ''" class="rounded border border-danger bg-danger/10 p-4 text-danger">{{ errorCrear }}</p>
            <p v-if="mensajeCrear !== ''" class="rounded border p-4" :class="claseMensaje">{{ mensajeCrear }}</p>

            <button
                type="button"
                class="rounded border border-primary px-3 py-2 text-primary"
                :disabled="!puedeSolicitar"
                @click="solicitar"
            >
                {{ creando ? 'Enviando...' : 'Solicitar' }}
            </button>
        </template>
    </section>
</template>
