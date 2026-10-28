<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { CalendarDaysIcon, FileTextIcon, InfoIcon, PackageIcon, PillIcon } from '@lucide/vue';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    medicamento: {
        type: Object,
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

function formatearFecha(fecha) {
    const partes = fecha.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
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
    <section class="flex min-w-0 flex-col gap-6 p-4 sm:p-6" aria-label="Información de la donación">
        <div class="flex flex-col gap-2 border-b border-line pb-5">
            <span class="inline-flex w-fit items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-sm text-success">
                <span class="size-2 rounded-full bg-success" aria-hidden="true"></span>
                Disponible
            </span>
            <h2 class="text-2xl font-bold text-primary">{{ medicamento.nombre_comercial }}</h2>
            <p class="text-muted">{{ medicamento.principio_activo }}<span v-if="medicamento.concentracion"> · {{ medicamento.concentracion }}</span></p>
        </div>

        <dl class="grid gap-5 sm:grid-cols-2">
            <div class="flex items-start gap-3">
                <span class="rounded-md bg-icon/10 p-2 text-icon"><PillIcon class="size-5" aria-hidden="true" /></span>
                <div><dt class="text-sm text-muted">Forma farmacéutica</dt><dd>{{ medicamento.forma_farmaceutica || 'No informada' }}</dd></div>
            </div>
            <div class="flex items-start gap-3">
                <span class="rounded-md bg-icon/10 p-2 text-icon"><PackageIcon class="size-5" aria-hidden="true" /></span>
                <div><dt class="text-sm text-muted">Cantidad disponible</dt><dd>{{ medicamento.cantidad_disponible }}</dd></div>
            </div>
            <div class="flex items-start gap-3">
                <span class="rounded-md bg-warning/10 p-2 text-warning"><CalendarDaysIcon class="size-5" aria-hidden="true" /></span>
                <div><dt class="text-sm text-muted">Fecha de vencimiento</dt><dd>{{ formatearFecha(medicamento.fecha_vencimiento) }}</dd></div>
            </div>
            <div class="flex items-start gap-3">
                <span class="rounded-md bg-primary/10 p-2 text-primary"><FileTextIcon class="size-5" aria-hidden="true" /></span>
                <div><dt class="text-sm text-muted">Lote</dt><dd>{{ medicamento.lote || 'No informado' }}</dd></div>
            </div>
        </dl>

        <p v-if="medicamento.descripcion" class="border-t border-line pt-5 text-sm text-muted">{{ medicamento.descripcion }}</p>

        <div class="flex flex-col gap-4 rounded-md bg-primary-soft/40 p-4 sm:p-5">
            <div class="flex items-start gap-3 rounded-md bg-surface/70 p-3 text-sm text-primary shadow-sm">
                <InfoIcon class="mt-0.5 size-5 shrink-0 text-secondary" aria-hidden="true" />
                <p>Revisá los datos y las fotos antes de solicitar el medicamento.</p>
            </div>
            <h3 class="text-lg font-semibold text-primary">Solicitar este medicamento</h3>
            <Alert v-if="errorPerfil !== ''" variant="danger">
                <p>{{ errorPerfil }}</p>
            </Alert>

            <template v-else-if="sesion === null">
                <p class="text-sm text-muted">Iniciá sesión para enviar tu solicitud y coordinar la entrega.</p>
                <Button type="button" @click="irALogin">Iniciar sesión</Button>
            </template>

            <template v-else-if="perfil === null">
                <p class="text-muted">Cargando tus datos...</p>
            </template>

            <template v-else>
                <Alert v-if="cuentaSuspendida" variant="warning">
                    <p>Tu cuenta está suspendida, no podés solicitar medicamentos.</p>
                </Alert>

                <template v-else>
                    <div class="flex items-start gap-2">
                        <Checkbox id="solicitud-tercero" v-model="esParaTercero" class="mt-0.5" />
                        <Label for="solicitud-tercero">Solicito este medicamento para otra persona</Label>
                    </div>

                    <div v-if="esParaTercero" class="flex flex-col gap-1">
                        <Label for="solicitud-destinatario">Nombre del destinatario</Label>
                        <Input id="solicitud-destinatario" v-model="nombreDestinatario" type="text" />
                    </div>

                    <div v-if="requiereReceta" class="flex flex-col gap-2">
                        <Label for="solicitud-receta">Foto de la receta médica (JPG, PNG o WEBP, hasta 5 MB)</Label>
                        <input
                            id="solicitud-receta"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            @change="elegirReceta"
                        />
                        <div v-if="vistaPreviaReceta !== ''" class="flex flex-col gap-1">
                            <img :src="vistaPreviaReceta" alt="Vista previa de la receta" class="h-32 w-32 object-cover" />
                            <Button type="button" variant="destructive" @click="quitarReceta">Quitar</Button>
                        </div>
                    </div>

                    <div class="flex items-start gap-2">
                        <Checkbox id="solicitud-ddjj" v-model="aceptoDdjj" class="mt-0.5" />
                        <Label for="solicitud-ddjj">Acepto los Términos y Condiciones y la Declaración Jurada de EcoFARMA.</Label>
                    </div>
                </template>

                <Alert v-if="errorCrear !== ''" variant="danger">
                    <p>{{ errorCrear }}</p>
                </Alert>
                <Alert v-if="mensajeCrear !== ''" :variant="tipoMensajeCrear === 'exito' ? 'success' : 'muted'">
                    <p>{{ mensajeCrear }}</p>
                </Alert>

                <Button type="button" :cargando="creando" :disabled="!puedeSolicitar" @click="solicitar">Enviar solicitud</Button>
            </template>
        </div>
    </section>
</template>
