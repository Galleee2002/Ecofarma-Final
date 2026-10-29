<script setup>
import { ref, onMounted } from 'vue';
import { useVademecum } from '../composables/useVademecum';

const { error, guardando, errorAlta, tipoErrorAlta, mensajeAlta, cargarSugerencias, darDeAlta } = useVademecum();

const datos = ref({
    nombre_comercial: '',
    principio_activo: '',
    concentracion: '',
    forma_farmaceutica: '',
    presentacion: '',
    requiere_receta: false,
});

async function guardar() {
    const guardado = await darDeAlta(datos.value);
    if (guardado) {
        datos.value = {
            nombre_comercial: '',
            principio_activo: '',
            concentracion: '',
            forma_farmaceutica: '',
            presentacion: '',
            requiere_receta: false,
        };
    }
}

onMounted(cargarSugerencias);
</script>

<template>
    <main class="flex max-w-3xl flex-col gap-6">
        <h1 class="text-primary">Alta del vademécum</h1>
        <p v-if="error !== ''" class="border border-warning bg-warning/10 p-3 text-warning">{{ error }}</p>

        <form class="flex flex-col gap-4" novalidate @submit.prevent="guardar">
            <div class="flex flex-col gap-1">
                <label for="vademecum-principio">Principio activo</label>
                <input id="vademecum-principio" v-model="datos.principio_activo" type="text" class="border border-line bg-surface px-3 py-2" />
            </div>
            <div class="flex flex-col gap-1">
                <label for="vademecum-nombre">Nombre comercial (opcional)</label>
                <input id="vademecum-nombre" v-model="datos.nombre_comercial" type="text" class="border border-line bg-surface px-3 py-2" />
            </div>
            <div class="flex flex-col gap-1">
                <label for="vademecum-concentracion">Concentración (opcional)</label>
                <input id="vademecum-concentracion" v-model="datos.concentracion" type="text" class="border border-line bg-surface px-3 py-2" />
            </div>
            <div class="flex flex-col gap-1">
                <label for="vademecum-forma">Forma farmacéutica (opcional)</label>
                <input id="vademecum-forma" v-model="datos.forma_farmaceutica" type="text" class="border border-line bg-surface px-3 py-2" />
            </div>
            <div class="flex flex-col gap-1">
                <label for="vademecum-presentacion">Presentación (opcional)</label>
                <input id="vademecum-presentacion" v-model="datos.presentacion" type="text" class="border border-line bg-surface px-3 py-2" />
            </div>
            <div class="flex items-start gap-2">
                <input id="vademecum-receta" v-model="datos.requiere_receta" type="checkbox" class="mt-1" />
                <label for="vademecum-receta">Requiere receta</label>
            </div>
            <p v-if="errorAlta !== ''" class="p-3" :class="tipoErrorAlta === 'advertencia' ? 'border border-warning bg-warning/10 text-warning' : 'border border-danger bg-danger/10 text-danger'">
                {{ errorAlta }}
            </p>
            <p v-if="mensajeAlta !== ''" class="border border-success bg-success/10 p-3 text-success">{{ mensajeAlta }}</p>
            <button type="submit" class="bg-primary px-4 py-2 text-surface" :disabled="guardando">
                {{ guardando ? 'Guardando...' : 'Agregar al vademécum' }}
            </button>
        </form>
    </main>
</template>
