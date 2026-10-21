<script setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { NavigationMenuLink, useForwardPropsEmits } from "reka-ui";

const props = defineProps({
  active: { type: Boolean, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: null, required: false },
});
const emits = defineEmits(["select"]);

const delegatedProps = reactiveOmit(props, "class");
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <NavigationMenuLink
    data-slot="navigation-menu-link"
    v-bind="forwarded"
    :class="
      cn(
        'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-foreground transition-colors outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring/40 data-active:bg-primary-soft data-active:text-secondary',
        props.class,
      )
    "
  >
    <slot />
  </NavigationMenuLink>
</template>
