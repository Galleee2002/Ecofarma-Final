<script setup>
import { cn } from "cn";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <td
    data-slot="table-cell"
    :class="
      cn(
        'p-3 align-middle text-sm whitespace-nowrap [&:has([role=checkbox])]:pr-0',
        props.class,
      )
    "
  >
    <slot />
  </td>
</template>
