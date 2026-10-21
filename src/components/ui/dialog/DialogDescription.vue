<script setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { DialogDescription, useForwardProps } from "reka-ui";

const props = defineProps({
  class: { type: null, required: false },
});

const delegatedProps = reactiveOmit(props, "class");
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DialogDescription
    data-slot="dialog-description"
    v-bind="forwardedProps"
    :class="cn('text-sm text-muted', props.class)"
  >
    <slot />
  </DialogDescription>
</template>
