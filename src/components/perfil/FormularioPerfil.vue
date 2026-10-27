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
    name: props.perfil.name || '',
    email: props.email,
    dni: props.perfil.dni || '',
    telefono: props.perfil.telefono,
    direccion: props.perfil.direccion,
    localidad: props.perfil.localidad,
});

const editando = ref({
    name: false,
    email: false,
    dni: false,
    telefono: false,
    direccion: false,
    localidad: false,
});

watch(function () {
    return props.perfil;
}, function (perfil) {
    datos.value.name = perfil.name || '';
    datos.value.dni = perfil.dni || '';
    datos.value.telefono = perfil.telefono;
    datos.value.direccion = perfil.direccion;
    datos.value.localidad = perfil.localidad;
});

watch(function () {
    return props.email;
}, function (email) {
    datos.value.email = email;
});

watch(function () {
    return props.mensaje;
}, function (mensaje) {
    if (mensaje !== '') {
        editando.value.name = false;
        editando.value.email = false;
        editando.value.dni = false;
        editando.value.telefono = false;
        editando.value.direccion = false;
        editando.value.localidad = false;
        datos.value.email = props.email;
    }
});

function enviar() {
    emit('guardar', datos.value);
}
</script>

<template>
    <form class="flex flex-col gap-4" novalidate @submit.prevent="enviar">
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <Label for="perfil-nombre" class="text-sm font-semibold text-muted">Nombre</Label>
                <div class="flex h-9 items-center rounded-md border border-input bg-surface pr-1 pl-3 shadow-sm">
                    <p v-if="!editando.name" class="min-w-0 flex-1 truncate text-base">{{ datos.name }}</p>
                    <Input
                        v-else
                        id="perfil-nombre"
                        v-model="datos.name"
                        type="text"
                        autocomplete="name"
                        class="h-8 flex-1 border-0 bg-transparent px-0 shadow-none"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        class="text-icon"
                        aria-label="Editar nombre"
                        @click="editando.name = true"
                    >
                        <PencilIcon />
                    </Button>
                </div>
            </div>

            <div class="flex flex-col gap-1">
                <Label for="perfil-email" class="text-sm font-semibold text-muted">Email</Label>
                <div class="flex h-9 items-center rounded-md border border-input bg-surface pr-1 pl-3 shadow-sm">
                    <p v-if="!editando.email" class="min-w-0 flex-1 truncate text-base">{{ datos.email }}</p>
                    <Input
                        v-else
                        id="perfil-email"
                        v-model="datos.email"
                        type="email"
                        autocomplete="email"
                        class="h-8 flex-1 border-0 bg-transparent px-0 shadow-none"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        class="text-icon"
                        aria-label="Editar email"
                        @click="editando.email = true"
                    >
                        <PencilIcon />
                    </Button>
                </div>
            </div>

            <div class="flex flex-col gap-1">
                <Label for="perfil-dni" class="text-sm font-semibold text-muted">DNI</Label>
                <div class="flex h-9 items-center rounded-md border border-input bg-surface pr-1 pl-3 shadow-sm">
                    <p v-if="!editando.dni" class="min-w-0 flex-1 truncate text-base">{{ datos.dni }}</p>
                    <Input
                        v-else
                        id="perfil-dni"
                        v-model="datos.dni"
                        type="text"
                        inputmode="numeric"
                        class="h-8 flex-1 border-0 bg-transparent px-0 shadow-none"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        class="text-icon"
                        aria-label="Editar DNI"
                        @click="editando.dni = true"
                    >
                        <PencilIcon />
                    </Button>
                </div>
            </div>

            <div class="flex flex-col gap-1">
                <Label for="perfil-telefono" class="text-sm font-semibold text-muted">Teléfono</Label>
                <div class="flex h-9 items-center rounded-md border border-input bg-surface pr-1 pl-3 shadow-sm">
                    <p v-if="!editando.telefono" class="min-w-0 flex-1 truncate text-base">{{ datos.telefono }}</p>
                    <Input
                        v-else
                        id="perfil-telefono"
                        v-model="datos.telefono"
                        type="tel"
                        autocomplete="tel"
                        class="h-8 flex-1 border-0 bg-transparent px-0 shadow-none"
                    />
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
            </div>

            <div class="flex flex-col gap-1">
                <Label for="perfil-direccion" class="text-sm font-semibold text-muted">Dirección</Label>
                <div class="flex h-9 items-center rounded-md border border-input bg-surface pr-1 pl-3 shadow-sm">
                    <p v-if="!editando.direccion" class="min-w-0 flex-1 truncate text-base">{{ datos.direccion }}</p>
                    <Input
                        v-else
                        id="perfil-direccion"
                        v-model="datos.direccion"
                        type="text"
                        autocomplete="street-address"
                        class="h-8 flex-1 border-0 bg-transparent px-0 shadow-none"
                    />
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
            </div>

            <div class="flex flex-col gap-1">
                <Label for="perfil-localidad" class="text-sm font-semibold text-muted">Localidad</Label>
                <div class="flex h-9 items-center rounded-md border border-input bg-surface pr-1 pl-3 shadow-sm">
                    <p v-if="!editando.localidad" class="min-w-0 flex-1 truncate text-base">{{ datos.localidad }}</p>
                    <Input
                        v-else
                        id="perfil-localidad"
                        v-model="datos.localidad"
                        type="text"
                        class="h-8 flex-1 border-0 bg-transparent px-0 shadow-none"
                    />
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
