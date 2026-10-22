<script setup>
import { PencilIcon } from '@lucide/vue';
import { ref, watch } from 'vue';
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

const editando = ref({
    telefono: false,
    direccion: false,
    localidad: false,
});

watch(function () {
    return props.perfil;
}, function (perfil) {
    datos.value.telefono = perfil.telefono;
    datos.value.direccion = perfil.direccion;
    datos.value.localidad = perfil.localidad;
});

watch(function () {
    return props.mensaje;
}, function (mensaje) {
    if (mensaje !== '') {
        editando.value.telefono = false;
        editando.value.direccion = false;
        editando.value.localidad = false;
    }
});

function enviar() {
    emit('guardar', datos.value);
}
</script>

<template>
    <form class="flex flex-col gap-4" novalidate @submit.prevent="enviar">
        <dl class="flex flex-col gap-2">
            <div>
                <dt class="text-sm font-semibold text-muted">Nombre</dt>
                <dd>{{ perfil.name }}</dd>
            </div>
            <div>
                <dt class="text-sm font-semibold text-muted">Email</dt>
                <dd>{{ email }}</dd>
            </div>
            <div>
                <dt class="text-sm font-semibold text-muted">DNI</dt>
                <dd>{{ perfil.dni }}</dd>
            </div>
        </dl>

        <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between gap-3">
                <div class="min-w-0 flex-1">
                    <Label for="perfil-telefono" class="text-sm font-semibold text-muted">Teléfono</Label>
                    <p v-if="!editando.telefono">{{ datos.telefono }}</p>
                    <Input v-else id="perfil-telefono" v-model="datos.telefono" type="tel" autocomplete="tel" />
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="text-icon"
                    aria-label="Editar teléfono"
                    @click="editando.telefono = true"
                >
                    <PencilIcon />
                </Button>
            </div>

            <div class="flex items-center justify-between gap-3">
                <div class="min-w-0 flex-1">
                    <Label for="perfil-direccion" class="text-sm font-semibold text-muted">Dirección</Label>
                    <p v-if="!editando.direccion">{{ datos.direccion }}</p>
                    <Input v-else id="perfil-direccion" v-model="datos.direccion" type="text" autocomplete="street-address" />
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="text-icon"
                    aria-label="Editar dirección"
                    @click="editando.direccion = true"
                >
                    <PencilIcon />
                </Button>
            </div>

            <div class="flex items-center justify-between gap-3">
                <div class="min-w-0 flex-1">
                    <Label for="perfil-localidad" class="text-sm font-semibold text-muted">Localidad</Label>
                    <p v-if="!editando.localidad">{{ datos.localidad }}</p>
                    <Input v-else id="perfil-localidad" v-model="datos.localidad" type="text" />
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="text-icon"
                    aria-label="Editar localidad"
                    @click="editando.localidad = true"
                >
                    <PencilIcon />
                </Button>
            </div>
        </div>

        <Alert v-if="error !== ''" variant="danger">
            <p>{{ error }}</p>
        </Alert>

        <Alert v-if="mensaje !== ''" variant="success">
            <p>{{ mensaje }}</p>
        </Alert>

        <Button type="submit" :cargando="cargando">
            Guardar cambios
        </Button>
    </form>
</template>
