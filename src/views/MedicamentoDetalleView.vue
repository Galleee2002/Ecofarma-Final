<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useMedicamentos } from '../composables/useMedicamentos';
import { useSolicitudes } from '../composables/useSolicitudes';

const route = useRoute();
const router = useRouter();
const { sesion, perfil, errorPerfil } = useAuth();
const { medicamento, cargando, error, cargarMedicamentoPorId } = useMedicamentos();
const { creando, errorCrear, mensajeCrear, crearSolicitud } = useSolicitudes();

const aceptoDdjj = ref(false);
const esParaTercero = ref(false);
const nombreDestinatario = ref('');
const archivoReceta = ref(null);

const requiereReceta = computed(function () {
    if (medicamento.value === null) {
        return false;
    }
    if (medicamento.value.medicamento_habilitado_id === null) {
        return true;
    }
    const vademecum = medicamento.value.medicamentos_habilitados;
    return vademecum !== null && vademecum.requiere_receta === true;
});

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
    if (requiereReceta.value && archivoReceta.value === null) {
        return false;
    }
    return true;
});

function formatearFecha(fecha) {
    const partes = fecha.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function irALogin() {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
}

function elegirReceta(evento) {
    archivoReceta.value = evento.target.files[0] || null;
}

watch(
    function () {
        return route.params.id;
    },
    function (id) {
        cargarMedicamentoPorId(id);
    },
    { immediate: true },
);

async function solicitar() {
    if (sesion.value === null) {
        irALogin();
        return;
    }

    const creada = await crearSolicitud(
        sesion.value.user.id,
        {
            medicamentoId: medicamento.value.id,
            aceptoDdjj: aceptoDdjj.value,
            esParaTercero: esParaTercero.value,
            nombreDestinatario: nombreDestinatario.value,
            requiereReceta: requiereReceta.value,
        },
        archivoReceta.value,
    );

    if (creada) {
        aceptoDdjj.value = false;
        esParaTercero.value = false;
        nombreDestinatario.value = '';
        archivoReceta.value = null;
    }
}
</script>

<template>
    <main class="pagina">
        <RouterLink :to="{ name: 'catalogo' }" class="text-primary">Volver al catálogo</RouterLink>
        <h1 class="text-primary">Detalle del medicamento</h1>

        <p v-if="cargando" class="text-muted">Cargando medicamento...</p>
        <p v-else-if="error !== ''" class="border border-danger bg-danger/10 p-3 text-danger">{{ error }}</p>

        <template v-else-if="medicamento !== null">
            <h2 class="text-primary">{{ medicamento.nombre_comercial }}</h2>
            <p>{{ medicamento.principio_activo }} {{ medicamento.concentracion }}</p>
            <p>Forma farmacéutica: {{ medicamento.forma_farmaceutica || 'No informada' }}</p>
            <p>Cantidad: {{ medicamento.cantidad_disponible }}</p>
            <p>Vence: {{ formatearFecha(medicamento.fecha_vencimiento) }}</p>
            <p>Lote: {{ medicamento.lote || 'No informado' }}</p>
            <p v-if="medicamento.descripcion">{{ medicamento.descripcion }}</p>

            <div v-if="medicamento.fotos_envase.length > 0" class="flex flex-wrap gap-2">
                <img
                    v-for="(foto, indice) in medicamento.fotos_envase"
                    :key="indice"
                    :src="foto"
                    :alt="'Foto ' + (indice + 1) + ' de ' + medicamento.nombre_comercial"
                    class="h-32 w-32 object-cover"
                />
            </div>
            <p v-else class="text-muted">Este medicamento no tiene fotos del envase.</p>

            <section class="flex flex-col gap-4 border border-line bg-surface p-4">
                <h3 class="text-primary">Solicitar este medicamento</h3>
                <p v-if="errorPerfil !== ''" class="border border-danger bg-danger/10 p-3 text-danger">{{ errorPerfil }}</p>
                <template v-else-if="sesion === null">
                    <p class="text-muted">Iniciá sesión para enviar tu solicitud y coordinar la entrega.</p>
                    <button type="button" class="bg-primary px-4 py-2 text-surface" @click="irALogin">Iniciar sesión</button>
                </template>
                <p v-else-if="perfil === null" class="text-muted">Cargando tus datos...</p>
                <template v-else>
                    <p v-if="cuentaSuspendida" class="border border-warning bg-warning/10 p-3 text-warning">
                        Tu cuenta está suspendida, no podés solicitar medicamentos.
                    </p>
                    <template v-else>
                        <div class="flex items-start gap-2">
                            <input id="solicitud-tercero" v-model="esParaTercero" type="checkbox" class="mt-1" />
                            <label for="solicitud-tercero">Solicito este medicamento para otra persona</label>
                        </div>
                        <div v-if="esParaTercero" class="flex flex-col gap-1">
                            <label for="solicitud-destinatario">Nombre del destinatario</label>
                            <input id="solicitud-destinatario" v-model="nombreDestinatario" type="text" class="border border-line bg-surface px-3 py-2" />
                        </div>
                        <div v-if="requiereReceta" class="flex flex-col gap-1">
                            <label for="solicitud-receta">Foto de la receta médica (JPG, PNG o WEBP, hasta 5 MB)</label>
                            <input id="solicitud-receta" type="file" accept="image/jpeg,image/png,image/webp" @change="elegirReceta" />
                        </div>
                        <div class="flex items-start gap-2">
                            <input id="solicitud-ddjj" v-model="aceptoDdjj" type="checkbox" class="mt-1" />
                            <label for="solicitud-ddjj">Acepto los Términos y Condiciones y la Declaración Jurada de EcoFARMA.</label>
                        </div>
                    </template>
                    <p v-if="errorCrear !== ''" class="border border-danger bg-danger/10 p-3 text-danger">{{ errorCrear }}</p>
                    <p v-if="mensajeCrear !== ''" class="border border-success bg-success/10 p-3 text-success">{{ mensajeCrear }}</p>
                    <button type="button" class="bg-primary px-4 py-2 text-surface" :disabled="!puedeSolicitar" @click="solicitar">
                        {{ creando ? 'Enviando...' : 'Enviar solicitud' }}
                    </button>
                </template>
            </section>
        </template>
    </main>
</template>
