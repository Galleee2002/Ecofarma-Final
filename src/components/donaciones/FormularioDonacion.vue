<script setup>
import { CloudUploadIcon, Trash2Icon } from '@lucide/vue';
import { ref, computed, onBeforeUnmount } from 'vue';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
    const texto = datos.value.principio_activo.trim().toLowerCase();
    return filtrarPorCampo(props.sugerencias, 'principio_activo', texto);
});

const filasDeLaConcentracion = computed(function () {
    const texto = datos.value.concentracion.trim().toLowerCase();
    return filtrarPorCampo(filasDelPrincipioActivo.value, 'concentracion', texto);
});

const filasDeLaForma = computed(function () {
    const texto = datos.value.forma_farmaceutica.trim().toLowerCase();
    return filtrarPorCampo(filasDeLaConcentracion.value, 'forma_farmaceutica', texto);
});

const principiosActivos = computed(function () {
    return valoresUnicos(props.sugerencias, 'principio_activo');
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

function formatearFecha(fecha) {
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const hora = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    return dia + '/' + mes + '/' + anio + ', ' + hora + ':' + minutos;
}

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
                agregadoEn: new Date(),
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
    <form class="grid grid-cols-1 gap-4 lg:grid-cols-2" novalidate @submit.prevent="enviar">
        <Alert v-if="cuentaSuspendida" variant="warning" class="lg:col-span-2">
            <p>Tu cuenta está suspendida, no podés publicar donaciones.</p>
        </Alert>

        <Alert v-if="errorSugerencias !== ''" variant="warning" class="lg:col-span-2">
            <p>{{ errorSugerencias }}</p>
        </Alert>

        <div class="flex flex-col gap-1">
            <Label for="donacion-principio">Principio activo</Label>
            <Input
                id="donacion-principio"
                v-model="datos.principio_activo"
                type="text"
                list="lista-principios"
                autocomplete="off"
            />
            <datalist id="lista-principios">
                <option v-for="valor in principiosActivos" :key="valor" :value="valor" />
            </datalist>
        </div>

        <div class="flex flex-col gap-1">
            <Label for="donacion-concentracion">Concentración</Label>
            <Input
                id="donacion-concentracion"
                v-model="datos.concentracion"
                type="text"
                list="lista-concentraciones"
                autocomplete="off"
            />
            <datalist id="lista-concentraciones">
                <option v-for="valor in concentraciones" :key="valor" :value="valor" />
            </datalist>
        </div>

        <div class="flex flex-col gap-1">
            <Label for="donacion-forma">Forma farmacéutica</Label>
            <Input
                id="donacion-forma"
                v-model="datos.forma_farmaceutica"
                type="text"
                list="lista-formas"
                autocomplete="off"
            />
            <datalist id="lista-formas">
                <option v-for="valor in formasFarmaceuticas" :key="valor" :value="valor" />
            </datalist>
        </div>

        <div class="flex flex-col gap-1">
            <Label for="donacion-nombre">Nombre comercial</Label>
            <Input
                id="donacion-nombre"
                v-model="datos.nombre_comercial"
                type="text"
                list="lista-nombres"
                autocomplete="off"
            />
            <datalist id="lista-nombres">
                <option v-for="valor in nombresComerciales" :key="valor" :value="valor" />
            </datalist>
            <p class="text-sm text-muted">Si no conocés la marca, escribí la que figura en el envase o el principio activo.</p>
        </div>

        <div class="flex flex-col gap-1">
            <Label for="donacion-cantidad">Cantidad</Label>
            <Input id="donacion-cantidad" v-model="datos.cantidad_disponible" type="number" min="1" step="1" />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="donacion-lote">Lote</Label>
            <Input id="donacion-lote" v-model="datos.lote" type="text" />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="donacion-vencimiento">Fecha de vencimiento</Label>
            <Input id="donacion-vencimiento" v-model="datos.fecha_vencimiento" type="date" :min="fechaMinima" />
        </div>

        <div class="flex flex-col gap-1 lg:col-span-2">
            <Label for="donacion-descripcion">Descripción (opcional)</Label>
            <Textarea id="donacion-descripcion" v-model="datos.descripcion" rows="3" />
        </div>

        <div class="flex flex-col gap-2 lg:col-span-2">
            <Label for="donacion-fotos">Fotos del envase</Label>
            <label
                for="donacion-fotos"
                class="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-input bg-surface px-4 py-8 text-center shadow-sm transition-colors outline-none hover:border-primary/40 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30"
                :class="fotos.length >= MAXIMO_FOTOS ? 'pointer-events-none opacity-50' : ''"
            >
                <CloudUploadIcon class="size-8 text-foreground" />
                <p class="font-semibold">Elegí una foto.</p>
                <p class="text-sm text-muted">De 1 a 3 fotos, JPG, PNG o WEBP, hasta 5 MB cada una.</p>
            </label>
            <input
                id="donacion-fotos"
                class="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                :disabled="fotos.length >= MAXIMO_FOTOS"
                @change="agregarFotos"
            />

            <ul v-if="fotos.length > 0" class="flex flex-col gap-2">
                <li
                    v-for="(foto, indice) in fotos"
                    :key="foto.url"
                    class="flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2"
                >
                    <span class="min-w-0 flex-1 truncate text-sm">{{ foto.archivo.name }}</span>
                    <span class="shrink-0 text-sm text-muted">{{ formatearFecha(foto.agregadoEn) }}</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        class="text-muted hover:text-danger"
                        aria-label="Quitar foto"
                        @click="quitarFoto(indice)"
                    >
                        <Trash2Icon />
                    </Button>
                </li>
            </ul>

            <Alert v-if="avisoFotos !== ''" variant="warning">
                <p>{{ avisoFotos }}</p>
            </Alert>
        </div>

        <Alert v-if="error !== ''" variant="danger" class="lg:col-span-2">
            <p>{{ error }}</p>
        </Alert>

        <Button type="submit" class="lg:col-span-2 lg:w-fit" :cargando="cargando" :disabled="cuentaSuspendida">
            Publicar donación
        </Button>
    </form>
</template>
