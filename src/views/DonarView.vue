<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useVademecum } from '../composables/useVademecum';
import { useDonaciones } from '../composables/useDonaciones';

const MAXIMO_FOTOS = 3;
const { sesion, perfil, errorPerfil } = useAuth();
const { filas: sugerencias, error: errorSugerencias, cargarSugerencias } = useVademecum();
const { publicando, errorPublicar, mensajePublicar, tipoMensajePublicar, publicarDonacion } = useDonaciones();

const datos = ref({
    nombre_comercial: '',
    principio_activo: '',
    concentracion: '',
    forma_farmaceutica: '',
    cantidad_disponible: '',
    lote: '',
    fecha_vencimiento: '',
    descripcion: '',
});
const fotos = ref([]);
const avisoFotos = ref('');

const cuentaSuspendida = computed(function () {
    return perfil.value !== null && perfil.value.is_validado === false;
});

function obtenerFechaDeManiana() {
    const maniana = new Date();
    maniana.setDate(maniana.getDate() + 1);
    const anio = maniana.getFullYear();
    const mes = String(maniana.getMonth() + 1).padStart(2, '0');
    const dia = String(maniana.getDate()).padStart(2, '0');
    return anio + '-' + mes + '-' + dia;
}

const fechaMinima = obtenerFechaDeManiana();

function valoresUnicos(filas, campo) {
    const valores = [];
    for (const fila of filas) {
        const valor = fila[campo];
        if (valor && !valores.includes(valor)) {
            valores.push(valor);
        }
    }
    return valores;
}

function filtrarPorCampo(filas, campo, texto) {
    if (texto === '') {
        return filas;
    }

    const coincidentes = [];
    for (const fila of filas) {
        const valor = fila[campo];
        if (valor && valor.toLowerCase() === texto) {
            coincidentes.push(fila);
        }
    }

    if (coincidentes.length === 0) {
        return filas;
    }
    return coincidentes;
}

const filasDelPrincipioActivo = computed(function () {
    return filtrarPorCampo(sugerencias.value, 'principio_activo', datos.value.principio_activo.trim().toLowerCase());
});

const filasDeLaConcentracion = computed(function () {
    return filtrarPorCampo(filasDelPrincipioActivo.value, 'concentracion', datos.value.concentracion.trim().toLowerCase());
});

const filasDeLaForma = computed(function () {
    return filtrarPorCampo(filasDeLaConcentracion.value, 'forma_farmaceutica', datos.value.forma_farmaceutica.trim().toLowerCase());
});

const principiosActivos = computed(function () {
    return valoresUnicos(sugerencias.value, 'principio_activo');
});

const concentraciones = computed(function () {
    return valoresUnicos(filasDelPrincipioActivo.value, 'concentracion');
});

const formasFarmaceuticas = computed(function () {
    return valoresUnicos(filasDeLaConcentracion.value, 'forma_farmaceutica');
});

const nombresComerciales = computed(function () {
    return valoresUnicos(filasDeLaForma.value, 'nombre_comercial');
});

function yaEstaCargada(nombre) {
    for (const foto of fotos.value) {
        if (foto.archivo.name.toLowerCase() === nombre.toLowerCase()) {
            return true;
        }
    }
    return false;
}

function agregarFotos(evento) {
    avisoFotos.value = '';
    const archivos = evento.target.files;
    let nombreRepetido = false;

    for (const archivo of archivos) {
        if (yaEstaCargada(archivo.name)) {
            nombreRepetido = true;
            continue;
        }
        if (fotos.value.length < MAXIMO_FOTOS) {
            fotos.value.push({
                archivo: archivo,
                url: URL.createObjectURL(archivo),
            });
        } else {
            avisoFotos.value = 'Podés subir hasta 3 fotos. Solo se agregaron las primeras.';
        }
    }

    if (nombreRepetido && avisoFotos.value === '') {
        avisoFotos.value = 'No podés subir dos fotos con el mismo nombre.';
    }

    evento.target.value = '';
}

function quitarFoto(indice) {
    URL.revokeObjectURL(fotos.value[indice].url);
    fotos.value.splice(indice, 1);
    avisoFotos.value = '';
}

function limpiarFotos() {
    for (const foto of fotos.value) {
        URL.revokeObjectURL(foto.url);
    }
    fotos.value = [];
}

async function publicar() {
    const archivos = [];
    for (const foto of fotos.value) {
        archivos.push(foto.archivo);
    }

    const publicada = await publicarDonacion(sesion.value.user.id, datos.value, archivos);
    if (publicada) {
        datos.value = {
            nombre_comercial: '',
            principio_activo: '',
            concentracion: '',
            forma_farmaceutica: '',
            cantidad_disponible: '',
            lote: '',
            fecha_vencimiento: '',
            descripcion: '',
        };
        limpiarFotos();
    }
}

onMounted(cargarSugerencias);

onBeforeUnmount(limpiarFotos);
</script>

<template>
    <main class="pagina-media">
        <h1 class="text-primary">Donar un medicamento</h1>

        <p v-if="errorPerfil !== ''" class="border border-danger bg-danger/10 p-3 text-danger">{{ errorPerfil }}</p>
        <p v-else-if="perfil === null" class="text-muted">Cargando tus datos...</p>

        <form v-else class="flex flex-col gap-4" novalidate @submit.prevent="publicar">
            <p v-if="cuentaSuspendida" class="border border-warning bg-warning/10 p-3 text-warning">
                Tu cuenta está suspendida, no podés publicar donaciones.
            </p>
            <p v-if="errorSugerencias !== ''" class="border border-warning bg-warning/10 p-3 text-warning">{{ errorSugerencias }}</p>
            <p
                v-if="mensajePublicar !== ''"
                class="p-3"
                :class="tipoMensajePublicar === 'exito' ? 'border border-success bg-success/10 text-success' : 'border border-icon bg-icon/10 text-icon'"
            >
                {{ mensajePublicar }}
            </p>

            <div class="flex flex-col gap-1">
                <label for="donacion-principio">Principio activo</label>
                <input id="donacion-principio" v-model="datos.principio_activo" type="text" list="lista-principios" autocomplete="off" class="border border-line bg-surface px-3 py-2" />
                <datalist id="lista-principios">
                    <option v-for="valor in principiosActivos" :key="valor" :value="valor" />
                </datalist>
            </div>
            <div class="flex flex-col gap-1">
                <label for="donacion-concentracion">Concentración</label>
                <input id="donacion-concentracion" v-model="datos.concentracion" type="text" list="lista-concentraciones" autocomplete="off" class="border border-line bg-surface px-3 py-2" />
                <datalist id="lista-concentraciones">
                    <option v-for="valor in concentraciones" :key="valor" :value="valor" />
                </datalist>
            </div>
            <div class="flex flex-col gap-1">
                <label for="donacion-forma">Forma farmacéutica</label>
                <input id="donacion-forma" v-model="datos.forma_farmaceutica" type="text" list="lista-formas" autocomplete="off" class="border border-line bg-surface px-3 py-2" />
                <datalist id="lista-formas">
                    <option v-for="valor in formasFarmaceuticas" :key="valor" :value="valor" />
                </datalist>
            </div>
            <div class="flex flex-col gap-1">
                <label for="donacion-nombre">Nombre comercial</label>
                <input id="donacion-nombre" v-model="datos.nombre_comercial" type="text" list="lista-nombres" autocomplete="off" class="border border-line bg-surface px-3 py-2" />
                <datalist id="lista-nombres">
                    <option v-for="valor in nombresComerciales" :key="valor" :value="valor" />
                </datalist>
            </div>
            <div class="flex flex-col gap-1">
                <label for="donacion-cantidad">Cantidad</label>
                <input id="donacion-cantidad" v-model="datos.cantidad_disponible" type="number" min="1" step="1" class="border border-line bg-surface px-3 py-2" />
            </div>
            <div class="flex flex-col gap-1">
                <label for="donacion-lote">Lote</label>
                <input id="donacion-lote" v-model="datos.lote" type="text" class="border border-line bg-surface px-3 py-2" />
            </div>
            <div class="flex flex-col gap-1">
                <label for="donacion-vencimiento">Fecha de vencimiento</label>
                <input id="donacion-vencimiento" v-model="datos.fecha_vencimiento" type="date" :min="fechaMinima" class="border border-line bg-surface px-3 py-2" />
            </div>
            <div class="flex flex-col gap-1">
                <label for="donacion-descripcion">Descripción (opcional)</label>
                <textarea id="donacion-descripcion" v-model="datos.descripcion" rows="3" class="border border-line bg-surface px-3 py-2"></textarea>
            </div>
            <div class="flex flex-col gap-1">
                <label for="donacion-fotos">Fotos del envase (1 a 3, JPG, PNG o WEBP, hasta 5 MB)</label>
                <input
                    id="donacion-fotos"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    :disabled="fotos.length >= MAXIMO_FOTOS"
                    @change="agregarFotos"
                />
                <ul v-if="fotos.length > 0" class="flex flex-col gap-2">
                    <li v-for="(foto, indice) in fotos" :key="foto.url" class="flex items-center gap-2">
                        <span>{{ foto.archivo.name }}</span>
                        <button type="button" class="text-danger" @click="quitarFoto(indice)">Quitar</button>
                    </li>
                </ul>
                <p v-if="avisoFotos !== ''" class="border border-warning bg-warning/10 p-3 text-warning">{{ avisoFotos }}</p>
            </div>
            <p v-if="errorPublicar !== ''" class="border border-danger bg-danger/10 p-3 text-danger">{{ errorPublicar }}</p>
            <button type="submit" class="bg-primary px-4 py-2 text-surface" :disabled="publicando || cuentaSuspendida">
                {{ publicando ? 'Publicando...' : 'Publicar donación' }}
            </button>
        </form>
    </main>
</template>
