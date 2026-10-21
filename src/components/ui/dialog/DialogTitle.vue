<script setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { DialogTitle, useForwardProps } from "reka-ui";

const props = defineProps({
  class: { type: null, required: false },
});

const delegatedProps = reactiveOmit(props, "class");
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DialogTitle
    data-slot="dialog-title"
    v-bind="forwardedProps"
    :class="cn('font-heading text-lg leading-snug font-semibold text-primary', props.class)"
  >
    <slot />
  </DialogTitle>
</template>
