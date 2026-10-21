<script setup>
import { cn } from "cn";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div data-slot="table-container" class="relative w-full overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
    <table
      data-slot="table"
      :class="cn('w-full caption-bottom text-sm', props.class)"
    >
      <slot />
    </table>
  </div>
</template>
