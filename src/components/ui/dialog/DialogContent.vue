<script setup>
import { XIcon } from "@lucide/vue";
import { cn } from "cn";
import { DialogClose, DialogContent, DialogPortal } from "reka-ui";
import { Button } from "@/components/ui/button";
import DialogOverlay from "./DialogOverlay.vue";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  class: { type: null, required: false },
  showCloseButton: { type: Boolean, required: false, default: true },
});
</script>

<template>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent
      data-slot="dialog-content"
      v-bind="$attrs"
      :class="
        cn(
          'fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-border bg-popover p-6 text-popover-foreground shadow-lg outline-none data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 sm:max-w-md',
          props.class,
        )
      "
    >
      <slot />
      <DialogClose v-if="showCloseButton" as-child>
        <Button variant="ghost" class="absolute top-3 right-3" size="icon-sm">
          <XIcon />
          <span class="sr-only">Cerrar</span>
        </Button>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
