<script setup>
import { computed, useId } from 'vue';

defineOptions({
    inheritAttrs: false,
});

const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: '',
    },
    id: {
        type: String,
        default: '',
    },
    label: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        default: 'text',
    },
    placeholder: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    required: {
        type: Boolean,
        default: false,
    },
    error: {
        type: String,
        default: '',
    },
    hint: {
        type: String,
        default: '',
    },
    size: {
        type: String,
        default: 'md',
    },
});

const emit = defineEmits(['update:modelValue']);

const idAutomatico = useId();

const idInput = computed(function () {
    if (props.id !== '') {
        return props.id;
    }
    return idAutomatico;
});

const idError = computed(function () {
    return idInput.value + '-error';
});

const idHint = computed(function () {
    return idInput.value + '-hint';
});

const tieneError = computed(function () {
    return props.error !== '';
});

const descripcion = computed(function () {
    const ids = [];
    if (tieneError.value) {
        ids.push(idError.value);
    }
    if (props.hint !== '') {
        ids.push(idHint.value);
    }
    if (ids.length === 0) {
        return undefined;
    }
    return ids.join(' ');
});

const clasesBase = [
    'w-full min-w-0 border bg-surface font-sans text-foreground shadow-sm',
    'rounded-md placeholder:text-muted',
    'transition duration-150 ease-out motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:bg-muted/10',
].join(' ');

const tamanos = {
    sm: 'min-h-8 px-3 text-sm',
    md: 'min-h-10 px-3 text-base',
    lg: 'min-h-12 px-4 text-lg',
};

const clases = computed(function () {
    const tamano = tamanos[props.size] ?? tamanos.md;
    const estado = tieneError.value
        ? 'border-danger hover:border-danger focus:border-danger focus-visible:ring-danger'
        : 'border-line hover:border-primary focus:border-primary focus-visible:ring-primary';
    return [clasesBase, tamano, estado].join(' ');
});

function actualizarValor(evento) {
    emit('update:modelValue', evento.target.value);
}
</script>

<template>
    <div class="flex w-full flex-col gap-1" :class="{ 'opacity-50': disabled }">
        <label v-if="label !== ''" class="font-sans text-sm text-foreground" :for="idInput">
            {{ label }}
        </label>
        <input
            v-bind="$attrs"
            :id="idInput"
            :type="type"
            :value="modelValue"
            :placeholder="placeholder"
            :disabled="disabled"
            :required="required"
            :class="clases"
            :aria-invalid="tieneError ? true : undefined"
            :aria-describedby="descripcion"
            @input="actualizarValor"
        />
        <p v-if="tieneError" :id="idError" class="text-xs text-danger" role="alert">
            {{ error }}
        </p>
        <p v-if="hint !== ''" :id="idHint" class="text-xs text-muted">
            {{ hint }}
        </p>
    </div>
</template>
