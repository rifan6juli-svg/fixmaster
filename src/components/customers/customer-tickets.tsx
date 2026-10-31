import { TicketStatusBadge } from "@/components/tickets/ticket-status-badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/dates";
import type { CustomerTicket } from "@/server/services/customers";

// The customer's ticket history on S-11; a table from 640px and cards below it.
export function CustomerTickets({
  tickets,
  timezone,
}: {
  tickets: CustomerTicket[];
  timezone: string;
}) {
  if (tickets.length === 0) {
    return <EmptyState showMascot={false} title="Belum ada tiket" />;
  }

  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Diterima</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-mono font-medium">
                  {ticket.number}
                </TableCell>
                <TableCell>
                  {ticket.brand} {ticket.model}
                </TableCell>
                <TableCell>
                  <TicketStatusBadge status={ticket.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDateTime(ticket.createdAt, timezone)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:hidden">
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <Card className="gap-2 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono font-medium">{ticket.number}</span>
                <TicketStatusBadge status={ticket.status} />
              </div>
              <p className="text-body-sm">
                {ticket.brand} {ticket.model}
              </p>
              <p className="text-body-sm text-text-muted">
                {formatDateTime(ticket.createdAt, timezone)}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
