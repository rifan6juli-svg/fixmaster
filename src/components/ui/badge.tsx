import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// tone = color, fill = shape (DBD section 2). Tint: token color at 12% with
// text in the token color. Solid is reserved for active work (brand tone).
// Outline/dashed carry meaning by shape, so states stay distinct without color.
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-sm border border-transparent px-2 py-0.5 text-caption font-medium whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3.5",
  {
    variants: {
      tone: {
        neutral: "text-text-muted",
        accent: "text-accent",
        brand: "text-brand-text",
        warning: "text-warning",
        success: "text-success",
        danger: "text-danger",
      },
      fill: {
        tint: "",
        solid: "",
        outline: "border-current",
        dashed: "border-dashed border-current",
      },
    },
    compoundVariants: [
      { fill: "tint", tone: "neutral", className: "bg-text-muted/12" },
      { fill: "tint", tone: "accent", className: "bg-accent/12" },
      { fill: "tint", tone: "brand", className: "bg-brand-text/12" },
      { fill: "tint", tone: "warning", className: "bg-warning/12" },
      { fill: "tint", tone: "success", className: "bg-success/12" },
      { fill: "tint", tone: "danger", className: "bg-danger/12" },
      { fill: "solid", tone: "brand", className: "bg-primary text-on-primary" },
    ],
    defaultVariants: {
      tone: "neutral",
      fill: "tint",
    },
  },
);

function Badge({
  className,
  tone,
  fill,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ tone, fill }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
