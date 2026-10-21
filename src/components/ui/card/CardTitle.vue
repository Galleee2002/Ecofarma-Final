<script setup>
import { cn } from "cn";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div
    data-slot="card-title"
    :class="
      cn(
        'font-heading text-lg leading-snug font-semibold group-data-[size=sm]/card:text-base',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
