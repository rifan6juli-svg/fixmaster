import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// "LCD" chip for ticket numbers and totals: same colors in both modes (DBD section 2).
const readoutVariants = cva(
  "chamfer inline-flex items-center bg-readout-bg px-3 font-mono font-medium text-readout-text tabular-nums",
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

function Readout({
  className,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof readoutVariants>) {
  return (
    <span
      data-slot="readout"
      className={cn(readoutVariants({ size }), className)}
      {...props}
    />
  );
}

export { Readout };
