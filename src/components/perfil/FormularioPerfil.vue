<script setup>
import { ref } from 'vue';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
            <Label for="perfil-telefono">Teléfono</Label>
            <Input id="perfil-telefono" v-model="datos.telefono" type="tel" autocomplete="tel" />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="perfil-direccion">Dirección</Label>
            <Input id="perfil-direccion" v-model="datos.direccion" type="text" autocomplete="street-address" />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="perfil-localidad">Localidad</Label>
            <Input id="perfil-localidad" v-model="datos.localidad" type="text" />
        </div>

        <Alert v-if="error !== ''" variant="danger">
            <p>{{ error }}</p>
        </Alert>

        <Alert v-if="mensaje !== ''" variant="success">
            <p>{{ mensaje }}</p>
        </Alert>

        <Button type="submit" :disabled="cargando">
            {{ cargando ? 'Guardando...' : 'Guardar cambios' }}
        </Button>
    </form>
</template>
