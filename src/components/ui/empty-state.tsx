import * as React from "react";

import { Mascot } from "@/components/brand/mascot";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Usually one primary Button. */
  action?: React.ReactNode;
  /** DBD section 6: at most one mascot per screen; turn off when another is visible. */
  showMascot?: boolean;
  className?: string;
}

// Chamfered panel on `surface` with a border-strong bezel, so the cut corners
// stay visible against the page in both modes (DBD section 2).
function EmptyState({
  title,
  description,
  action,
  showMascot = true,
  className,
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "chamfer bg-border-strong p-px [--chamfer-size:12px]",
        className,
      )}
    >
      <div className="chamfer flex flex-col items-center gap-3 bg-surface px-6 py-8 text-center [--chamfer-size:11.5px]">
        {showMascot && <Mascot variant="full" size={120} />}
        <h2 className="text-h3 font-semibold">{title}</h2>
        {description && (
          <p className="max-w-prose text-body-sm text-text-muted">
            {description}
          </p>
        )}
        {action}
      </div>
    </div>
  );
}

export { EmptyState };
