<script setup>
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

defineProps({
    modelValue: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['update:modelValue']);

function actualizarBusqueda(valor) {
    emit('update:modelValue', valor);
}
</script>

<template>
    <div class="flex flex-col gap-1">
        <Label for="busqueda-medicamentos">Buscar medicamento</Label>
        <Input
            id="busqueda-medicamentos"
            type="search"
            placeholder="Nombre comercial o principio activo"
            :model-value="modelValue"
            @update:model-value="actualizarBusqueda"
        />
    </div>
</template>
