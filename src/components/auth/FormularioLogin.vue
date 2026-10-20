<script setup>
import { ref } from 'vue';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
            <Label for="login-email">Email</Label>
            <Input id="login-email" v-model="email" type="email" autocomplete="email" />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="login-password">Contraseña</Label>
            <Input id="login-password" v-model="password" type="password" autocomplete="current-password" />
        </div>

        <Alert v-if="error !== ''" variant="danger">
            <p>{{ error }}</p>
        </Alert>

        <Button type="submit" :disabled="cargando">
            {{ cargando ? 'Ingresando...' : 'Ingresar' }}
        </Button>
    </form>
</template>
