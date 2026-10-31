"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { formatPhoneWa } from "@/lib/phone";
import { CustomerForm, type SaveCustomerAction } from "./customer-form";

interface CustomerPanelProps {
  customer: { id: string; name: string; phoneWa: string; notes: string | null };
  /** Passed in by the page: Client Components never import src/server/**. */
  action: SaveCustomerAction;
}

// Staff open S-11 to see what a customer has with the shop, so details start
// read-only beside the ticket history and editing is a deliberate step.
export function CustomerPanel({ customer, action }: CustomerPanelProps) {
  const [editing, setEditing] = React.useState(false);

  if (editing) {
    return (
      <CustomerForm
        customer={customer}
        action={action}
        onSaved={() => setEditing(false)}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 justify-items-start gap-4">
      <dl className="grid w-full gap-3">
        <div className="grid gap-1">
          <dt className="text-body-sm text-text-muted">Nomor WA</dt>
          <dd>
            <a
              href={`https://wa.me/${customer.phoneWa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-medium text-brand-text underline"
            >
              {formatPhoneWa(customer.phoneWa)}
            </a>
          </dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-body-sm text-text-muted">Catatan</dt>
          <dd className="whitespace-pre-wrap wrap-anywhere">
            {customer.notes || "Belum ada catatan."}
          </dd>
        </div>
      </dl>
      <Button variant="secondary" onClick={() => setEditing(true)}>
        Ubah
      </Button>
    </div>
  );
}
