<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';

const MAXIMO_FOTOS = 3;

const props = defineProps({
    sugerencias: {
        type: Array,
        required: true,
    },
    errorSugerencias: {
        type: String,
        required: true,
    },
    cargando: {
        type: Boolean,
        required: true,
    },
    error: {
        type: String,
        required: true,
    },
    mensaje: {
        type: String,
        required: true,
    },
    cuentaSuspendida: {
        type: Boolean,
        required: true,
    },
});

const emit = defineEmits(['publicar']);

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

const filasDelPrincipioActivo = computed(function () {
    const texto = datos.value.principio_activo.trim().toLowerCase();

    const coincidentes = props.sugerencias.filter(function (fila) {
        return fila.principio_activo.toLowerCase() === texto;
    });

    if (coincidentes.length === 0) {
        return props.sugerencias;
    }
    return coincidentes;
});

const principiosActivos = computed(function () {
    return valoresUnicos(props.sugerencias, 'principio_activo');
});

const concentraciones = computed(function () {
    return valoresUnicos(filasDelPrincipioActivo.value, 'concentracion');
});

const formasFarmaceuticas = computed(function () {
    return valoresUnicos(filasDelPrincipioActivo.value, 'forma_farmaceutica');
});

function agregarFotos(evento) {
    avisoFotos.value = '';
    const archivos = evento.target.files;

    for (const archivo of archivos) {
        if (fotos.value.length < MAXIMO_FOTOS) {
            fotos.value.push({ archivo: archivo, url: URL.createObjectURL(archivo) });
        } else {
            avisoFotos.value = 'Podés subir hasta 3 fotos. Solo se agregaron las primeras.';
        }
    }

    evento.target.value = '';
}

function quitarFoto(indice) {
    URL.revokeObjectURL(fotos.value[indice].url);
    fotos.value.splice(indice, 1);
    avisoFotos.value = '';
}

onBeforeUnmount(function () {
    for (const foto of fotos.value) {
        URL.revokeObjectURL(foto.url);
    }
});

function enviar() {
    const archivos = [];
    for (const foto of fotos.value) {
        archivos.push(foto.archivo);
    }
    emit('publicar', datos.value, archivos);
}
</script>

<template>
    <form class="flex flex-col gap-4" novalidate @submit.prevent="enviar">
        <p v-if="cuentaSuspendida" class="rounded border border-warning bg-warning/10 p-4 text-warning">
            Tu cuenta está suspendida, no podés publicar donaciones.
        </p>

        <p v-if="errorSugerencias !== ''" class="rounded border border-warning bg-warning/10 p-4 text-warning">{{ errorSugerencias }}</p>

        <div class="flex flex-col gap-1">
            <label for="donacion-nombre">Nombre comercial</label>
            <input id="donacion-nombre" v-model="datos.nombre_comercial" type="text" class="rounded border px-3 py-2" />
        </div>

        <div class="flex flex-col gap-1">
            <label for="donacion-principio">Principio activo</label>
            <input id="donacion-principio" v-model="datos.principio_activo" type="text" list="lista-principios" autocomplete="off" class="rounded border px-3 py-2" />
            <datalist id="lista-principios">
                <option v-for="valor in principiosActivos" :key="valor" :value="valor" />
            </datalist>
        </div>

        <div class="flex flex-col gap-1">
            <label for="donacion-concentracion">Concentración (opcional)</label>
            <input id="donacion-concentracion" v-model="datos.concentracion" type="text" list="lista-concentraciones" autocomplete="off" class="rounded border px-3 py-2" />
            <datalist id="lista-concentraciones">
                <option v-for="valor in concentraciones" :key="valor" :value="valor" />
            </datalist>
        </div>

        <div class="flex flex-col gap-1">
            <label for="donacion-forma">Forma farmacéutica (opcional)</label>
            <input id="donacion-forma" v-model="datos.forma_farmaceutica" type="text" list="lista-formas" autocomplete="off" class="rounded border px-3 py-2" />
            <datalist id="lista-formas">
                <option v-for="valor in formasFarmaceuticas" :key="valor" :value="valor" />
            </datalist>
        </div>

        <div class="flex flex-col gap-1">
            <label for="donacion-cantidad">Cantidad</label>
            <input id="donacion-cantidad" v-model="datos.cantidad_disponible" type="number" min="1" step="1" class="rounded border px-3 py-2" />
        </div>

        <div class="flex flex-col gap-1">
            <label for="donacion-lote">Lote (opcional)</label>
            <input id="donacion-lote" v-model="datos.lote" type="text" class="rounded border px-3 py-2" />
        </div>

        <div class="flex flex-col gap-1">
            <label for="donacion-vencimiento">Fecha de vencimiento</label>
            <input id="donacion-vencimiento" v-model="datos.fecha_vencimiento" type="date" :min="fechaMinima" class="rounded border px-3 py-2" />
        </div>

        <div class="flex flex-col gap-1">
            <label for="donacion-descripcion">Descripción (opcional)</label>
            <textarea id="donacion-descripcion" v-model="datos.descripcion" rows="3" class="rounded border px-3 py-2"></textarea>
        </div>

        <div class="flex flex-col gap-2">
            <label for="donacion-fotos">Fotos del envase (de 1 a 3, JPG, PNG o WEBP, hasta 5 MB cada una)</label>
            <input
                id="donacion-fotos"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                :disabled="fotos.length >= MAXIMO_FOTOS"
                @change="agregarFotos"
            />

            <p v-if="avisoFotos !== ''" class="rounded border border-warning bg-warning/10 p-4 text-warning">{{ avisoFotos }}</p>

            <ul v-if="fotos.length > 0" class="flex flex-wrap gap-2">
                <li v-for="(foto, indice) in fotos" :key="foto.url" class="flex flex-col gap-1">
                    <img :src="foto.url" :alt="'Foto ' + (indice + 1) + ' del envase'" class="h-24 w-24 object-cover" />
                    <button type="button" class="rounded border border-danger px-2 py-1 text-danger" @click="quitarFoto(indice)">Quitar</button>
                </li>
            </ul>
        </div>

        <p v-if="error !== ''" class="rounded border border-danger bg-danger/10 p-4 text-danger">{{ error }}</p>

        <p v-if="mensaje !== ''" class="rounded border border-secondary bg-secondary/10 p-4 text-secondary">{{ mensaje }}</p>

        <button type="submit" class="rounded border border-primary px-3 py-2 text-primary" :disabled="cargando || cuentaSuspendida">
            {{ cargando ? 'Publicando...' : 'Publicar donación' }}
        </button>
    </form>
</template>
