"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { formatAmount, parseRupiahInput } from "@/lib/money";
import { cn } from "@/lib/utils";

type MoneyInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange" | "name"
> & {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (amount: number | null) => void;
  /** Submitted as a hidden integer field (Rupiah), not the formatted text. */
  name?: string;
};

// "Rp" prefix + live thousands grouping; emits integer Rupiah (DBD section 3).
function MoneyInput({
  value,
  defaultValue = null,
  onValueChange,
  name,
  className,
  ...props
}: MoneyInputProps) {
  const [internal, setInternal] = React.useState<number | null>(defaultValue);
  const amount = value !== undefined ? value : internal;

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-body text-text-muted"
      >
        Rp
      </span>
      <Input
        {...props}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={amount === null ? "" : formatAmount(amount)}
        onChange={(event) => {
          const next = parseRupiahInput(event.target.value);
          setInternal(next);
          onValueChange?.(next);
        }}
        className={cn("pl-10 text-right tabular-nums", className)}
      />
      {name && <input type="hidden" name={name} value={amount ?? ""} />}
    </div>
  );
}

export { MoneyInput };
