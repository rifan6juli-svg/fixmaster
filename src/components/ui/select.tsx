import * as React from "react";

import { cn } from "@/lib/utils";

// Native select: the system picker is the most usable one on a phone (DBD section 3).
function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "h-11 w-full min-w-0 rounded-md border border-border-strong bg-surface px-3 text-body text-text transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-danger aria-invalid:outline-danger",
        className,
      )}
      {...props}
    />
  );
}

export { Select };
