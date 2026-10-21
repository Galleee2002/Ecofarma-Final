import { cva } from "class-variance-authority";

export { default as Button } from "./Button.vue";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-transparent text-sm font-semibold whitespace-nowrap shadow-sm transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border-border bg-surface text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "shadow-none hover:bg-primary/10 hover:text-primary",
        destructive:
          "border-danger bg-danger/10 text-danger hover:bg-danger/20 focus-visible:ring-danger/30",
        link: "h-auto border-transparent bg-transparent px-0 text-primary shadow-none underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3",
        xs: "h-6 gap-1 px-2 text-xs",
        sm: "h-8 px-2.5",
        lg: "h-10 px-4",
        icon: "size-9",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
