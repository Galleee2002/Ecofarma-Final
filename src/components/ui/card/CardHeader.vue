<script setup>
import { cn } from "cn";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div
    data-slot="card-header"
    :class="
      cn(
        'group/card-header grid auto-rows-min items-start gap-1 rounded-t-lg px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
