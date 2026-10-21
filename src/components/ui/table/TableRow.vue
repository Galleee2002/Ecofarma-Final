<script setup>
import { cn } from "cn";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <tr
    data-slot="table-row"
    :class="
      cn(
        'border-b transition-colors hover:bg-primary/15 data-[state=selected]:bg-primary/15 has-aria-expanded:bg-primary/15',
        props.class,
      )
    "
  >
    <slot />
  </tr>
</template>
