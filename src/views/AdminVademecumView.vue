<script setup>
import { ref, onMounted } from 'vue';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseCheckbox from '../components/ui/BaseCheckbox.vue';
import BaseInput from '../components/ui/BaseInput.vue';
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
    <main class="flex min-w-0 w-full max-w-3xl flex-col gap-6">
        <header class="flex flex-col gap-2">
            <h1 class="text-balance text-primary">Alta del vademécum</h1>
            <p class="text-pretty text-muted">Agregá una fila al vademécum Remediar.</p>
        </header>

        <BaseAlert v-if="error !== ''" variant="warning" :message="error" />

        <form class="flex min-w-0 flex-col gap-4" novalidate @submit.prevent="guardar">
            <BaseInput
                id="vademecum-principio"
                v-model="datos.principio_activo"
                label="Principio activo"
                placeholder="Ej. Amoxicilina"
            />
            <div class="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                <BaseInput
                    id="vademecum-nombre"
                    v-model="datos.nombre_comercial"
                    label="Nombre comercial (opcional)"
                    placeholder="Ej. Amoxidal"
                />
                <BaseInput
                    id="vademecum-concentracion"
                    v-model="datos.concentracion"
                    label="Concentración (opcional)"
                    placeholder="Ej. 500 mg"
                />
                <BaseInput
                    id="vademecum-forma"
                    v-model="datos.forma_farmaceutica"
                    label="Forma farmacéutica (opcional)"
                    placeholder="Ej. Comprimido"
                />
                <BaseInput
                    id="vademecum-presentacion"
                    v-model="datos.presentacion"
                    label="Presentación (opcional)"
                    placeholder="Ej. Caja x 21 comprimidos"
                />
            </div>
            <BaseCheckbox
                id="vademecum-receta"
                v-model="datos.requiere_receta"
                label="Requiere receta"
            />
            <BaseAlert
                v-if="errorAlta !== ''"
                :variant="tipoErrorAlta === 'advertencia' ? 'warning' : 'error'"
                :message="errorAlta"
            />
            <BaseAlert v-if="mensajeAlta !== ''" variant="success" :message="mensajeAlta" />
            <div>
                <BaseButton type="submit" class="w-full sm:w-auto" :loading="guardando">
                    Agregar al vademécum
                </BaseButton>
            </div>
        </form>
    </main>
</template>
