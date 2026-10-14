<script setup>
import { ref } from 'vue';

const props = defineProps({
    perfil: {
        type: Object,
        required: true,
    },
    email: {
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
});

const emit = defineEmits(['guardar']);

const datos = ref({
    telefono: props.perfil.telefono,
    direccion: props.perfil.direccion,
    localidad: props.perfil.localidad,
});

function enviar() {
    emit('guardar', datos.value);
}
</script>

<template>
    <form class="flex flex-col gap-4" novalidate @submit.prevent="enviar">
        <dl class="flex flex-col gap-2">
            <div>
                <dt class="font-semibold">Nombre</dt>
                <dd>{{ perfil.name }}</dd>
            </div>
            <div>
                <dt class="font-semibold">Email</dt>
                <dd>{{ email }}</dd>
            </div>
            <div>
                <dt class="font-semibold">DNI</dt>
                <dd>{{ perfil.dni }}</dd>
            </div>
        </dl>

        <div class="flex flex-col gap-1">
            <label for="perfil-telefono">Teléfono</label>
            <input id="perfil-telefono" v-model="datos.telefono" type="tel" autocomplete="tel" class="rounded border px-3 py-2" />
        </div>

        <div class="flex flex-col gap-1">
            <label for="perfil-direccion">Dirección</label>
            <input id="perfil-direccion" v-model="datos.direccion" type="text" autocomplete="street-address" class="rounded border px-3 py-2" />
        </div>

        <div class="flex flex-col gap-1">
            <label for="perfil-localidad">Localidad</label>
            <input id="perfil-localidad" v-model="datos.localidad" type="text" class="rounded border px-3 py-2" />
        </div>

        <p v-if="error !== ''" class="rounded border border-danger bg-danger/10 p-4 text-danger">{{ error }}</p>

        <p v-if="mensaje !== ''" class="rounded border border-success bg-success/10 p-4 text-success">{{ mensaje }}</p>

        <button type="submit" class="rounded border border-primary px-3 py-2 text-primary" :disabled="cargando">
            {{ cargando ? 'Guardando...' : 'Guardar cambios' }}
        </button>
    </form>
</template>
