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

const emit = defineEmits(['ingresar']);

const email = ref('');
const password = ref('');

function enviar() {
    emit('ingresar', email.value, password.value);
}
</script>

<template>
    <form class="flex flex-col gap-4" novalidate @submit.prevent="enviar">
        <div class="flex flex-col gap-1">
            <label for="login-email">Email</label>
            <input id="login-email" v-model="email" type="email" autocomplete="email" class="rounded border px-3 py-2" />
        </div>

        <div class="flex flex-col gap-1">
            <label for="login-password">Contraseña</label>
            <input id="login-password" v-model="password" type="password" autocomplete="current-password" class="rounded border px-3 py-2" />
        </div>

        <p v-if="error !== ''" class="rounded border border-danger bg-danger/10 p-4 text-danger">{{ error }}</p>

        <button type="submit" class="rounded border border-primary px-3 py-2 text-primary" :disabled="cargando">
            {{ cargando ? 'Ingresando...' : 'Ingresar' }}
        </button>
    </form>
</template>
