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
        'hover:bg-primary/15 dark:hover:bg-primary/20 data-[state=selected]:bg-primary/15 border-b transition-colors has-aria-expanded:bg-primary/15',
        props.class,
      )
    "
  >
    <slot />
  </tr>
</template>
