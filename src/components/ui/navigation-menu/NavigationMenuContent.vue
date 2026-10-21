<script setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { NavigationMenuContent, useForwardPropsEmits } from "reka-ui";

const props = defineProps({
  disableOutsidePointerEvents: { type: Boolean, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: null, required: false },
});
const emits = defineEmits(["escapeKeyDown", "pointerDownOutside", "focusOutside", "interactOutside"]);

const delegatedProps = reactiveOmit(props, "class");
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <NavigationMenuContent
    data-slot="navigation-menu-content"
    v-bind="forwarded"
    :class="
      cn(
        'top-0 left-0 w-full p-1 md:absolute md:w-auto',
        'group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-lg group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:border-border group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow-lg',
        props.class,
      )
    "
  >
    <slot />
  </NavigationMenuContent>
</template>
