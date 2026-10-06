<script setup>
defineProps({
    modelValue: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['update:modelValue']);

function actualizarBusqueda(evento) {
    emit('update:modelValue', evento.target.value);
}
</script>

<template>
    <div class="flex flex-col gap-1">
        <label for="busqueda-medicamentos">Buscar medicamento</label>
        <input
            id="busqueda-medicamentos"
            type="search"
            placeholder="Nombre comercial o principio activo"
            class="rounded border px-3 py-2"
            :value="modelValue"
            @input="actualizarBusqueda"
        />
    </div>
</template>
