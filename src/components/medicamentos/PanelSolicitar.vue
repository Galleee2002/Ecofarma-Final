<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    <Card>
        <CardHeader>
            <h2 class="text-lg text-primary">Solicitar este medicamento</h2>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
            <Alert v-if="errorPerfil !== ''" variant="danger">
                <p>{{ errorPerfil }}</p>
            </Alert>

            <template v-else-if="sesion === null">
                <Alert variant="muted">
                    <p>Para solicitar este medicamento tenés que iniciar sesión.</p>
                </Alert>
                <Button type="button" @click="irALogin">Iniciar sesión para solicitar</Button>
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

                <Button type="button" :disabled="!puedeSolicitar" @click="solicitar">
                    {{ creando ? 'Enviando...' : 'Solicitar' }}
                </Button>
            </template>
        </CardContent>
    </Card>
</template>
