<script setup>
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "@lucide/vue";
import { reactiveOmit } from "@vueuse/core";
import { cn } from "cn";
import { Toaster as Sonner } from "vue-sonner";

const props = defineProps({
  id: { type: String, required: false },
  invert: { type: Boolean, required: false },
  theme: { type: String, required: false },
  position: { type: String, required: false },
  closeButtonPosition: { type: String, required: false },
  hotkey: { type: Array, required: false },
  richColors: { type: Boolean, required: false },
  expand: { type: Boolean, required: false },
  duration: { type: Number, required: false },
  gap: { type: Number, required: false },
  visibleToasts: { type: Number, required: false },
  closeButton: { type: Boolean, required: false },
  toastOptions: { type: Object, required: false },
  class: { type: String, required: false },
  style: { type: null, required: false },
  offset: { type: [Object, String, Number], required: false },
  mobileOffset: { type: [Object, String, Number], required: false },
  dir: { type: String, required: false },
  swipeDirections: { type: Array, required: false },
  icons: { type: Object, required: false },
  containerAriaLabel: { type: String, required: false },
});
const delegatedProps = reactiveOmit(props, "class", "toastOptions", "style", "theme", "duration", "richColors", "position");
</script>

<template>
  <Sonner
    v-bind="delegatedProps"
    :class="cn('toaster group', props.class)"
    theme="light"
    position="top-center"
    :close-button="true"
    :rich-colors="true"
    :duration="3000"
    :style="{
      fontFamily: 'var(--font-sans)',
      '--normal-bg': 'var(--color-surface)',
      '--normal-text': 'var(--color-foreground)',
      '--normal-border': 'var(--color-icon)',
      '--border-radius': 'var(--radius-lg)',
      '--gray2': 'var(--color-background)',
      '--gray3': 'var(--color-line)',
      '--gray4': 'var(--color-line)',
      '--gray5': 'var(--color-line)',
      '--gray12': 'var(--color-foreground)',
      '--success-bg': 'var(--color-surface)',
      '--success-border': 'var(--color-success)',
      '--success-text': 'var(--color-foreground)',
      '--info-bg': 'var(--color-surface)',
      '--info-border': 'var(--color-icon)',
      '--info-text': 'var(--color-foreground)',
    }"
    :toast-options="
      props.toastOptions ?? {
        classes: {
          toast: 'rounded-lg',
        },
      }
    "
  >
    <template #success-icon>
      <CircleCheckIcon class="size-4" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-4" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <XIcon class="size-4" />
    </template>
  </Sonner>
</template>

<style>
[data-sonner-toaster] [data-sonner-toast][data-styled='true'] {
  padding-right: 3rem;
}

[data-sonner-toaster] [data-sonner-toast][data-styled='true'] [data-close-button] {
  border: 0;
  left: auto;
  right: 0.75rem;
  top: 50%;
  bottom: auto;
  transform: translateY(-50%);
}
</style>
