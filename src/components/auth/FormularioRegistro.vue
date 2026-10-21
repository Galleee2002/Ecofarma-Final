<script setup>
import { ref } from 'vue';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
const enviado = ref(false);

function campoVacio(valor) {
    return enviado.value && String(valor).trim() === '';
}

function enviar() {
    enviado.value = true;
    emit('registrar', datos.value);
}
</script>

<template>
    <form class="flex flex-col gap-4" novalidate @submit.prevent="enviar">
        <div class="flex flex-col gap-1">
            <Label for="registro-nombre">Nombre y apellido</Label>
            <Input id="registro-nombre" v-model="datos.name" type="text" autocomplete="name" :aria-invalid="campoVacio(datos.name)" />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="registro-dni">DNI</Label>
            <Input id="registro-dni" v-model="datos.dni" type="text" inputmode="numeric" :aria-invalid="campoVacio(datos.dni)" />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="registro-telefono">Teléfono</Label>
            <Input id="registro-telefono" v-model="datos.telefono" type="tel" autocomplete="tel" :aria-invalid="campoVacio(datos.telefono)" />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="registro-direccion">Dirección</Label>
            <Input id="registro-direccion" v-model="datos.direccion" type="text" autocomplete="street-address" :aria-invalid="campoVacio(datos.direccion)" />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="registro-localidad">Localidad</Label>
            <Input id="registro-localidad" v-model="datos.localidad" type="text" :aria-invalid="campoVacio(datos.localidad)" />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="registro-email">Email</Label>
            <Input id="registro-email" v-model="datos.email" type="email" autocomplete="email" :aria-invalid="campoVacio(datos.email)" />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="registro-password">Contraseña (mínimo 6 caracteres)</Label>
            <Input id="registro-password" v-model="datos.password" type="password" autocomplete="new-password" :aria-invalid="campoVacio(datos.password)" />
        </div>

        <div class="flex items-start gap-2">
            <Checkbox id="registro-ddjj" v-model="datos.aceptoDdjj" class="mt-0.5" :aria-invalid="enviado && datos.aceptoDdjj === false" />
            <Label for="registro-ddjj">Acepto los Términos y Condiciones y la Declaración Jurada de EcoFARMA.</Label>
        </div>

        <Alert v-if="error !== ''" variant="danger">
            <p>{{ error }}</p>
        </Alert>

        <Button type="submit" :cargando="cargando">
            Crear cuenta
        </Button>
    </form>
</template>
