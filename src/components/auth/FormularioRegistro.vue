<script setup>
import { EyeIcon, EyeOffIcon, IdCardIcon, LockKeyholeIcon, MailIcon, MapPinIcon, PhoneIcon, HouseIcon, UserRoundIcon } from '@lucide/vue';
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
const mostrarPassword = ref(false);

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
        <div class="grid gap-x-5 gap-y-4 md:grid-cols-2">
            <div class="flex min-w-0 flex-col gap-1 md:col-span-2">
                <Label for="registro-nombre">Nombre y apellido</Label>
                <div class="relative">
                    <UserRoundIcon class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-icon" aria-hidden="true" />
                    <Input id="registro-nombre" v-model="datos.name" type="text" autocomplete="name" placeholder="Ej.: María González" class="pl-10" :aria-invalid="campoVacio(datos.name)" />
                </div>
            </div>

            <div class="flex min-w-0 flex-col gap-1">
                <Label for="registro-dni">DNI</Label>
                <div class="relative">
                    <IdCardIcon class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-icon" aria-hidden="true" />
                    <Input id="registro-dni" v-model="datos.dni" type="text" inputmode="numeric" placeholder="Ej.: 30123456" class="pl-10" :aria-invalid="campoVacio(datos.dni)" />
                </div>
            </div>

            <div class="flex min-w-0 flex-col gap-1">
                <Label for="registro-telefono">Teléfono</Label>
                <div class="relative">
                    <PhoneIcon class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-icon" aria-hidden="true" />
                    <Input id="registro-telefono" v-model="datos.telefono" type="tel" autocomplete="tel" placeholder="Ej.: 11 1234-5678" class="pl-10" :aria-invalid="campoVacio(datos.telefono)" />
                </div>
            </div>

            <div class="flex min-w-0 flex-col gap-1">
                <Label for="registro-direccion">Dirección</Label>
                <div class="relative">
                    <HouseIcon class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-icon" aria-hidden="true" />
                    <Input id="registro-direccion" v-model="datos.direccion" type="text" autocomplete="street-address" placeholder="Calle y número" class="pl-10" :aria-invalid="campoVacio(datos.direccion)" />
                </div>
            </div>

            <div class="flex min-w-0 flex-col gap-1">
                <Label for="registro-localidad">Localidad</Label>
                <div class="relative">
                    <MapPinIcon class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-icon" aria-hidden="true" />
                    <Input id="registro-localidad" v-model="datos.localidad" type="text" placeholder="Ej.: La Plata" class="pl-10" :aria-invalid="campoVacio(datos.localidad)" />
                </div>
            </div>

            <div class="flex min-w-0 flex-col gap-1">
                <Label for="registro-email">Email</Label>
                <div class="relative">
                    <MailIcon class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-icon" aria-hidden="true" />
                    <Input id="registro-email" v-model="datos.email" type="email" autocomplete="email" placeholder="nombre@ejemplo.com" class="pl-10" :aria-invalid="campoVacio(datos.email)" />
                </div>
            </div>

            <div class="flex min-w-0 flex-col gap-1">
                <Label for="registro-password">Contraseña</Label>
                <div class="relative">
                    <LockKeyholeIcon class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-icon" aria-hidden="true" />
                    <Input id="registro-password" v-model="datos.password" :type="mostrarPassword ? 'text' : 'password'" autocomplete="new-password" placeholder="Mínimo 6 caracteres" class="pr-10 pl-10" :aria-invalid="campoVacio(datos.password)" />
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
