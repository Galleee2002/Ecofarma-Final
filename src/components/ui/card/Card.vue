<script setup>
import { cn } from "cn";

const props = defineProps({
  class: { type: null, required: false },
  size: { type: String, required: false, default: "default" },
});
</script>

<template>
  <div
    data-slot="card"
    :data-size="size"
    :class="
      cn(
        'group/card flex flex-col gap-4 overflow-hidden rounded-lg border border-border bg-card py-4 text-base text-card-foreground shadow-md has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
