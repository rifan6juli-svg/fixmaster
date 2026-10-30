import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// "LCD" chip for ticket numbers and totals: same colors in both modes (DBD section 2).
const readoutVariants = cva(
  "chamfer inline-flex items-center bg-readout-bg px-3 font-mono font-medium text-readout-text tabular-nums [--chamfer-size:7.5px]",
  {
    variants: {
      size: {
        md: "py-1 text-body-sm",
        lg: "py-1.5 text-h2",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

// The outer chamfer is a 1px instrument bezel (--volt-edge): clip-path would cut
// off a border, and without it the chip disappears against the dark page.
function Readout({
  className,
  size,
  children,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof readoutVariants>) {
  return (
    <span
      data-slot="readout"
      className={cn("chamfer inline-flex bg-(--volt-edge) p-px", className)}
      {...props}
    >
      <span className={readoutVariants({ size })}>{children}</span>
    </span>
  );
}

export { Readout };
