import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

function Card({
  className,
  asChild = false,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & {
  /** Render as the child element, e.g. <Card asChild interactive><Link …/></Card>. */
  asChild?: boolean;
  /** Clickable card (S-04 drill-down): stronger edge and lift on hover. */
  interactive?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "div";

  return (
    <Comp
      data-slot="card"
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border bg-surface py-6 text-text",
        interactive &&
          "cursor-pointer transition-[border-color,box-shadow] duration-150 hover:border-border-strong hover:shadow-raised",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min items-start gap-1 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className,
      )}
      {...props}
    />
  );
}

// A heading by default so card titles show up in screen-reader heading navigation.
function CardTitle({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"h3"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "h3";

  return (
    <Comp
      data-slot="card-title"
      className={cn("text-h3 font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-body-sm text-text-muted", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-2 px-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
