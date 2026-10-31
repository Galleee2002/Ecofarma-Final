<script setup>
import { computed, useId } from 'vue';
import { Check } from '@lucide/vue';

defineOptions({
    inheritAttrs: false,
});

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    id: {
        type: String,
        default: '',
    },
    label: {
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
});

const emit = defineEmits(['update:modelValue']);

const marcado = computed({
    get: function () {
        return props.modelValue;
    },
    set: function (valor) {
        emit('update:modelValue', valor);
    },
});

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

const clasesInput = computed(function () {
    const estado = tieneError.value
        ? 'border-danger hover:border-danger focus-visible:ring-danger'
        : 'border-line hover:border-primary focus-visible:ring-primary';

    return [
        'peer size-5 shrink-0 cursor-pointer appearance-none rounded-sm border bg-surface shadow-sm',
        'transition duration-150 ease-out motion-reduce:transition-none',
        'checked:border-primary checked:bg-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:bg-muted/10',
        estado,
    ].join(' ');
});
</script>

<template>
    <div class="flex w-full flex-col gap-1" :class="{ 'opacity-50': disabled }">
        <label
            class="flex cursor-pointer items-start gap-3"
            :class="{ 'cursor-not-allowed': disabled }"
            :for="idInput"
        >
            <span class="relative mt-0.5 inline-flex size-5 shrink-0 items-center justify-center">
                <input
                    v-bind="$attrs"
                    :id="idInput"
                    type="checkbox"
                    :class="clasesInput"
                    v-model="marcado"
                    :disabled="disabled"
                    :required="required"
                    :aria-invalid="tieneError ? true : undefined"
                    :aria-describedby="descripcion"
                />
                <Check
                    class="pointer-events-none absolute inset-0 m-auto size-3.5 text-surface opacity-0 transition duration-150 ease-out peer-checked:opacity-100 motion-reduce:transition-none"
                    :stroke-width="3"
                    aria-hidden="true"
                />
            </span>
            <span v-if="label !== ''" class="min-w-0 pt-px font-sans text-sm text-foreground">
                {{ label }}
            </span>
        </label>
        <p v-if="tieneError" :id="idError" class="text-xs text-danger" role="alert">
            {{ error }}
        </p>
        <p v-if="hint !== ''" :id="idHint" class="pl-8 text-xs text-muted">
            {{ hint }}
        </p>
    </div>
</template>
