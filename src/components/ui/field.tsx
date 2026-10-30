import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
}

interface FieldProps {
  label: string;
  /** Format hint shown under the control, e.g. "Contoh: 0812 3456 7890". */
  hint?: string;
  /** Error text; also marks the control aria-invalid. */
  error?: string;
  className?: string;
  /** Render the control with the wiring props spread onto it. */
  children: (control: FieldControlProps) => React.ReactNode;
}

// Label + hint + error with ids wired automatically (DBD section 5). Use hints
// for format examples instead of placeholders that look like real data.
function Field({ label, hint, error, className, children }: FieldProps) {
  const id = React.useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div data-slot="field" className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}
      {hint && (
        <p id={hintId} className="text-body-sm text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-body-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export { Field, type FieldControlProps };
