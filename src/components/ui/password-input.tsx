"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// A typo in a masked field can lock a staff member out until the owner resets
// it, and there is no reset by email (ASUMSI A-17), so every password can be seen.
function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = React.useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-12", className)}
      />
      <button
        type="button"
        aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        aria-pressed={visible}
        onClick={() => setVisible(!visible)}
        className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-md text-text-muted transition-colors duration-150 hover:text-text"
      >
        <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  );
}

export { PasswordInput };
