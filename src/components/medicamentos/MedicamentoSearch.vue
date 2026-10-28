<script setup>
import { SearchIcon } from '@lucide/vue';
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
        <div class="relative">
            <SearchIcon class="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-primary" aria-hidden="true" />
            <Input
                id="busqueda-medicamentos"
                type="search"
                placeholder="Nombre comercial o principio activo"
                :model-value="modelValue"
                class="pl-10"
                @update:model-value="actualizarBusqueda"
            />
        </div>
    </div>
</template>
