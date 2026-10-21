<script setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { NavigationMenuViewport, useForwardProps } from "reka-ui";

const props = defineProps({
  class: { type: null, required: false },
});

const delegatedProps = reactiveOmit(props, "class");
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <div class="absolute top-full left-0 isolate z-50 flex justify-center">
    <NavigationMenuViewport
      data-slot="navigation-menu-viewport"
      v-bind="forwardedProps"
      :class="
        cn(
          'relative mt-1.5 h-(--reka-navigation-menu-viewport-height) w-full origin-top overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg data-open:animate-in data-closed:animate-out data-closed:zoom-out-95 data-open:zoom-in-95 md:w-(--reka-navigation-menu-viewport-width)',
          props.class,
        )
      "
    />
  </div>
</template>
