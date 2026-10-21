<script setup>
import { ref } from 'vue';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const props = defineProps({
    cargando: {
        type: Boolean,
        required: true,
    },
    error: {
        type: String,
        required: true,
    },
    tipoError: {
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
    nombre_comercial: '',
    principio_activo: '',
    concentracion: '',
    forma_farmaceutica: '',
    presentacion: '',
    requiere_receta: false,
});

function varianteError() {
    if (props.tipoError === 'advertencia') {
        return 'warning';
    }
    return 'danger';
}

function enviar() {
    emit('guardar', datos.value);
}
</script>

<template>
    <form class="grid grid-cols-1 gap-4 lg:grid-cols-2" novalidate @submit.prevent="enviar">
        <div class="flex flex-col gap-1">
            <Label for="vademecum-principio">Principio activo</Label>
            <Input id="vademecum-principio" v-model="datos.principio_activo" type="text" />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="vademecum-nombre">Nombre comercial (opcional)</Label>
            <Input id="vademecum-nombre" v-model="datos.nombre_comercial" type="text" />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="vademecum-concentracion">Concentración (opcional)</Label>
            <Input id="vademecum-concentracion" v-model="datos.concentracion" type="text" />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="vademecum-forma">Forma farmacéutica (opcional)</Label>
            <Input id="vademecum-forma" v-model="datos.forma_farmaceutica" type="text" />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="vademecum-presentacion">Presentación (opcional)</Label>
            <Input id="vademecum-presentacion" v-model="datos.presentacion" type="text" />
        </div>

        <div class="flex items-start gap-2">
            <Checkbox id="vademecum-receta" v-model="datos.requiere_receta" class="mt-0.5" />
            <Label for="vademecum-receta">Requiere receta</Label>
        </div>

        <Alert v-if="error !== ''" :variant="varianteError()" class="lg:col-span-2">
            <p>{{ error }}</p>
        </Alert>

        <Alert v-if="mensaje !== ''" variant="success" class="lg:col-span-2">
            <p>{{ mensaje }}</p>
        </Alert>

        <Button type="submit" class="lg:col-span-2 lg:w-fit" :cargando="cargando">
            Agregar al vademécum
        </Button>
    </form>
</template>
