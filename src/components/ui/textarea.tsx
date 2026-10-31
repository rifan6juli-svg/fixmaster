import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Always >= 16px so iOS does not zoom on focus (DBD section 2).
        "min-h-24 w-full min-w-0 rounded-md border border-border-strong bg-surface px-3 py-2 text-body text-text transition-colors duration-150 placeholder:text-text-muted disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-danger aria-invalid:outline-danger",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
