"use client";

import { Check, Copy } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Readout } from "@/components/ui/readout";
import { toastError } from "@/components/ui/sonner";

interface TempPasswordHandoffProps {
  email: string;
  password: string;
  onDone: () => void;
}

// The only moment the password is on screen: it is stored hashed, so the owner
// has to pass it on from here (AFD F-02).
export function TempPasswordHandoff({
  email,
  password,
  onDone,
}: TempPasswordHandoffProps) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `Email: ${email}\nPassword sementara: ${password}`,
      );
      setCopied(true);
    } catch {
      toastError("Tidak bisa menyalin. Catat password ini secara manual.");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <dl className="grid gap-3">
        <div className="grid gap-1">
          <dt className="text-body-sm text-text-muted">Email</dt>
          <dd className="font-medium wrap-anywhere">{email}</dd>
        </div>
        <div className="grid justify-items-start gap-1">
          <dt className="text-body-sm text-text-muted">Password sementara</dt>
          <dd className="max-w-full">
            <Readout size="lg" className="max-w-full">
              <span className="wrap-anywhere">{password}</span>
            </Readout>
          </dd>
        </div>
      </dl>
      <p className="text-body-sm text-text-muted">
        Setelah dialog ini ditutup, password tidak bisa dilihat lagi. Staf wajib
        menggantinya saat login.
      </p>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={copy}>
          {copied ? (
            <Check strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Copy strokeWidth={1.75} aria-hidden="true" />
          )}
          {copied ? "Tersalin" : "Salin"}
        </Button>
        <Button type="button" onClick={onDone}>
          Selesai
        </Button>
      </DialogFooter>
    </div>
  );
}
