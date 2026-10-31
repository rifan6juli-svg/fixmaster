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
  /** "hero" is the screen's whole message, with the display type from DBD section 2. */
  size?: "default" | "hero";
  /** 1 when the panel replaces the page, as on the 404 and error screens. */
  headingLevel?: 1 | 2;
  className?: string;
}

// Chamfered panel on `surface` with a border-strong bezel, so the cut corners
// stay visible against the page in both modes (DBD section 2).
function EmptyState({
  title,
  description,
  action,
  showMascot = true,
  size = "default",
  headingLevel = 2,
  className,
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const;
  const isHero = size === "hero";

  return (
    <div
      data-slot="empty-state"
      className={cn(
        "chamfer bg-border-strong p-px [--chamfer-size:12px]",
        isHero && "mx-auto w-full max-w-2xl",
        className,
      )}
    >
      <div
        className={cn(
          "chamfer flex flex-col items-center gap-3 bg-surface px-6 py-8 text-center [--chamfer-size:11.5px]",
          isHero && "gap-4 py-10",
        )}
      >
        {showMascot && <Mascot variant="full" size={isHero ? 160 : 120} />}
        <Heading
          className={cn(
            "font-semibold wrap-anywhere",
            isHero ? "text-display" : "text-h3",
          )}
        >
          {title}
        </Heading>
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
