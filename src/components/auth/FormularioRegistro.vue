<script setup>
import { ref } from 'vue';

defineProps({
    cargando: {
        type: Boolean,
        required: true,
    },
    error: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['registrar']);

const datos = ref({
    name: '',
    dni: '',
    telefono: '',
    direccion: '',
    localidad: '',
    email: '',
    password: '',
    aceptoDdjj: false,
});

function enviar() {
    emit('registrar', datos.value);
}
</script>

<template>
    <form class="flex flex-col gap-4" novalidate @submit.prevent="enviar">
        <div class="flex flex-col gap-1">
            <label for="registro-nombre">Nombre y apellido</label>
            <input id="registro-nombre" v-model="datos.name" type="text" autocomplete="name" class="rounded border px-3 py-2" />
        </div>

        <div class="flex flex-col gap-1">
            <label for="registro-dni">DNI</label>
            <input id="registro-dni" v-model="datos.dni" type="text" inputmode="numeric" class="rounded border px-3 py-2" />
        </div>

        <div class="flex flex-col gap-1">
            <label for="registro-telefono">Teléfono</label>
            <input id="registro-telefono" v-model="datos.telefono" type="tel" autocomplete="tel" class="rounded border px-3 py-2" />
        </div>

        <div class="flex flex-col gap-1">
            <label for="registro-direccion">Dirección</label>
            <input id="registro-direccion" v-model="datos.direccion" type="text" autocomplete="street-address" class="rounded border px-3 py-2" />
        </div>

        <div class="flex flex-col gap-1">
            <label for="registro-localidad">Localidad</label>
            <input id="registro-localidad" v-model="datos.localidad" type="text" class="rounded border px-3 py-2" />
        </div>

        <div class="flex flex-col gap-1">
            <label for="registro-email">Email</label>
            <input id="registro-email" v-model="datos.email" type="email" autocomplete="email" class="rounded border px-3 py-2" />
        </div>

        <div class="flex flex-col gap-1">
            <label for="registro-password">Contraseña (mínimo 6 caracteres)</label>
            <input id="registro-password" v-model="datos.password" type="password" autocomplete="new-password" class="rounded border px-3 py-2" />
        </div>

        <label class="flex items-start gap-2">
            <input v-model="datos.aceptoDdjj" type="checkbox" class="mt-1" />
            <span>Acepto los Términos y Condiciones y la Declaración Jurada de EcoFARMA.</span>
        </label>

        <p v-if="error !== ''" class="rounded border border-danger bg-danger/10 p-4 text-danger">{{ error }}</p>

        <button type="submit" class="rounded border border-primary px-3 py-2 text-primary" :disabled="cargando">
            {{ cargando ? 'Creando cuenta...' : 'Crear cuenta' }}
        </button>
    </form>
</template>
