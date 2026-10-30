import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors duration-150 ease-out disabled:pointer-events-none disabled:not-aria-busy:opacity-50 aria-busy:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:bg-primary-hover",
        secondary:
          "border border-border-strong bg-surface text-text hover:bg-surface-sunken",
        ghost: "text-text hover:bg-surface-sunken",
        danger: "bg-danger text-on-danger hover:bg-danger-hover",
      },
      size: {
        md: "h-11 px-4 text-body-sm",
        lg: "h-12 px-6 text-body",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Disables the button and shows a spinner. Ignored with asChild. */
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";
  const isLoading = loading && !asChild;

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" aria-hidden="true" />}
      {children}
    </Comp>
  );
}

export { Button, buttonVariants };
