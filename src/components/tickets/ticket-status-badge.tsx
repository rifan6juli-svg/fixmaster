import {
  CheckCheck,
  CircleCheck,
  CircleX,
  Hourglass,
  Inbox,
  Package,
  ScanSearch,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Badge, type badgeVariants } from "@/components/ui/badge";
import { TICKET_STATUS_LABELS, type TicketStatus } from "@/lib/ticket-status";
import type { VariantProps } from "class-variance-authority";

type Tone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

// Color is never the only cue: every status has an icon and a label (DBD section 5).
const STATUS_STYLE: Record<TicketStatus, { tone: Tone; Icon: LucideIcon }> = {
  received: { tone: "neutral", Icon: Inbox },
  diagnosing: { tone: "accent", Icon: ScanSearch },
  awaiting_approval: { tone: "warning", Icon: Hourglass },
  in_progress: { tone: "brand", Icon: Wrench },
  waiting_parts: { tone: "warning", Icon: Package },
  ready: { tone: "success", Icon: CircleCheck },
  picked_up: { tone: "neutral", Icon: CheckCheck },
  cancelled: { tone: "danger", Icon: CircleX },
};

function TicketStatusBadge({
  status,
  className,
}: {
  status: TicketStatus;
  className?: string;
}) {
  const { tone, Icon } = STATUS_STYLE[status];

  return (
    <Badge tone={tone} className={className} data-status={status}>
      <Icon aria-hidden="true" />
      {TICKET_STATUS_LABELS[status]}
    </Badge>
  );
}

export { TicketStatusBadge };
