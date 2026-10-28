<script setup>
import { EyeIcon, EyeOffIcon } from '@lucide/vue';
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
const mostrarPassword = ref(false);
const enviado = ref(false);

function campoVacio(valor) {
    return enviado.value && valor.trim() === '';
}

function enviar() {
    enviado.value = true;
    emit('ingresar', email.value, password.value);
}
</script>

<template>
    <form class="flex flex-col gap-4" novalidate @submit.prevent="enviar">
        <div class="flex flex-col gap-1">
            <Label for="login-email">Correo electrónico</Label>
            <Input id="login-email" v-model="email" type="email" autocomplete="email" placeholder="nombre@ejemplo.com" :aria-invalid="campoVacio(email)" />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="login-password">Contraseña</Label>
            <div class="relative">
                <Input
                    id="login-password"
                    v-model="password"
                    :type="mostrarPassword ? 'text' : 'password'"
                    class="pr-10"
                    autocomplete="current-password"
                    :aria-invalid="campoVacio(password)"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="absolute top-0 right-0 text-icon shadow-none"
                    :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    @click="mostrarPassword = !mostrarPassword"
                >
                    <EyeOffIcon v-if="mostrarPassword" />
                    <EyeIcon v-else />
                </Button>
            </div>
        </div>

        <Alert v-if="error !== ''" variant="danger">
            <p>{{ error }}</p>
        </Alert>

        <Button type="submit" :cargando="cargando" class="w-full">
            Iniciar sesión
        </Button>
    </form>
</template>
