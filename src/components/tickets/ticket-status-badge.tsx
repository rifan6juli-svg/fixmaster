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

type BadgeStyle = Required<
  Pick<VariantProps<typeof badgeVariants>, "tone" | "fill">
>;

// Color is never the only cue: every status has an icon, a label, and a shape
// (DBD section 2). Solid = active work, dashed = waiting on someone else.
const STATUS_STYLE: Record<
  TicketStatus,
  {
    tone: NonNullable<BadgeStyle["tone"]>;
    fill: NonNullable<BadgeStyle["fill"]>;
    Icon: LucideIcon;
  }
> = {
  received: { tone: "neutral", fill: "tint", Icon: Inbox },
  diagnosing: { tone: "accent", fill: "tint", Icon: ScanSearch },
  awaiting_approval: { tone: "warning", fill: "dashed", Icon: Hourglass },
  in_progress: { tone: "brand", fill: "solid", Icon: Wrench },
  waiting_parts: { tone: "warning", fill: "dashed", Icon: Package },
  ready: { tone: "success", fill: "tint", Icon: CircleCheck },
  picked_up: { tone: "neutral", fill: "outline", Icon: CheckCheck },
  cancelled: { tone: "danger", fill: "tint", Icon: CircleX },
};

function TicketStatusBadge({
  status,
  className,
}: {
  status: TicketStatus;
  className?: string;
}) {
  const { tone, fill, Icon } = STATUS_STYLE[status];

  return (
    <Badge tone={tone} fill={fill} className={className} data-status={status}>
      <Icon aria-hidden="true" />
      {TICKET_STATUS_LABELS[status]}
    </Badge>
  );
}

export { TicketStatusBadge };
