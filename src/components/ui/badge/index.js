import { cva } from "class-variance-authority";

export { default as Badge } from "./Badge.vue";

export const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border border-transparent px-2 py-0.5 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/30 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-primary/10 [a]:hover:text-primary",
        ghost: "hover:bg-primary/10 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        pendiente_revision: "border-muted bg-muted/10 text-muted",
        disponible: "border-success bg-success/10 text-success",
        reservado: "border-primary bg-primary/10 text-primary",
        entregado: "border-success bg-success/10 text-success",
        rechazado: "border-danger bg-danger/10 text-danger",
        pendiente_coordinacion: "border-warning bg-warning/10 text-warning",
        en_camino: "border-primary bg-primary/10 text-primary",
        completado: "border-success bg-success/10 text-success",
        cancelado: "border-muted bg-muted/10 text-muted",
        activa: "border-success bg-success/10 text-success",
        suspendida: "border-danger bg-danger/10 text-danger",
        admin: "border-primary bg-primary/10 text-primary",
        usuario: "border-muted bg-muted/10 text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
