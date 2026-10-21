<script setup>
import { cn } from "cn";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div
    data-slot="card-footer"
    :class="
      cn(
        'flex items-center rounded-b-lg border-t border-border bg-primary-soft/40 p-4 group-data-[size=sm]/card:p-3',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
