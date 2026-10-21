<script setup>
import { useVModel } from "@vueuse/core";
import { cn } from "cn";

const props = defineProps({
  class: { type: null, required: false },
  defaultValue: { type: [String, Number], required: false },
  modelValue: { type: [String, Number], required: false },
});

const emits = defineEmits(["update:modelValue"]);

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
});
</script>

<template>
  <textarea
    v-model="modelValue"
    data-slot="textarea"
    :class="
      cn(
        'flex field-sizing-content min-h-24 w-full rounded-md border border-input bg-surface px-3 py-2 text-base shadow-sm transition-colors outline-none placeholder:text-muted-foreground hover:border-primary/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:bg-muted/10 disabled:opacity-50',
        props.class,
      )
    "
  />
</template>
