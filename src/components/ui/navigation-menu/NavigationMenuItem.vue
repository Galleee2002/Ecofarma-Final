<script setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { NavigationMenuItem } from "reka-ui";

const props = defineProps({
  value: { type: String, required: false },
  class: { type: null, required: false },
});

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <NavigationMenuItem
    data-slot="navigation-menu-item"
    v-bind="delegatedProps"
    :class="cn('relative', props.class)"
  >
    <slot />
  </NavigationMenuItem>
</template>
