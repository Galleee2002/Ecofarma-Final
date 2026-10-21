<script setup>
import { cn } from "cn";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <th
    data-slot="table-head"
    :class="
      cn(
        'h-10 px-3 text-left align-middle text-sm font-semibold whitespace-nowrap text-primary [&:has([role=checkbox])]:pr-0',
        props.class,
      )
    "
  >
    <slot />
  </th>
</template>
