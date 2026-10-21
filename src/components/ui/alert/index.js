import { cva } from "class-variance-authority";

export { default as Alert } from "./Alert.vue";
export { default as AlertAction } from "./AlertAction.vue";
export { default as AlertDescription } from "./AlertDescription.vue";
export { default as AlertTitle } from "./AlertTitle.vue";

export const alertVariants = cva(
  "group/alert relative grid w-full gap-1 rounded-md border px-3 py-2.5 text-left text-sm has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*=size-])]:size-4",
  {
    variants: {
      variant: {
        danger: "text-danger border-danger bg-danger/10",
        success: "text-success border-success bg-success/10",
        warning: "text-warning border-warning bg-warning/10",
        muted: "text-muted border-muted bg-muted/10",
        primary: "text-foreground border-primary bg-primary-soft",
      },
    },
    defaultVariants: {
      variant: "muted",
    },
  },
);
