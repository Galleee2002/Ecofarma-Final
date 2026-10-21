<script setup>
import { cn } from "cn";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div
    data-slot="dialog-footer"
    :class="cn('flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end', props.class)"
  >
    <slot />
  </div>
</template>
