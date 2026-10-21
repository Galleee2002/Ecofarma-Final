<script setup>
import { cn } from "cn";
import { Primitive } from "reka-ui";
import { buttonVariants } from ".";

const props = defineProps({
  variant: { type: null, required: false },
  size: { type: null, required: false },
  class: { type: null, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false, default: "button" },
  cargando: { type: Boolean, required: false, default: false },
  disabled: { type: Boolean, required: false, default: false },
});
</script>

<template>
  <Primitive
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :as="as"
    :as-child="asChild"
    :aria-busy="cargando ? true : undefined"
    :disabled="disabled || cargando"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <span
      v-if="cargando && !asChild"
      class="size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <slot />
  </Primitive>
</template>
