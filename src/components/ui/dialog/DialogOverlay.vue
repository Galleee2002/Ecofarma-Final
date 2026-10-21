<script setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { DialogOverlay } from "reka-ui";

const props = defineProps({
  class: { type: null, required: false },
});

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <DialogOverlay
    data-slot="dialog-overlay"
    v-bind="delegatedProps"
    :class="
      cn(
        'fixed inset-0 z-50 bg-foreground/40 data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0',
        props.class,
      )
    "
  >
    <slot />
  </DialogOverlay>
</template>
