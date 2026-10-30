"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { MoneyInput } from "@/components/ui/money-input";
import { Readout } from "@/components/ui/readout";
import { toast, toastError } from "@/components/ui/sonner";
import { formatRupiah } from "@/lib/money";

export function DialogDemo() {
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState<number | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string>();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!amount) {
      setError("Isi jumlah pembayaran lebih dari Rp 0.");
      return;
    }
    setSaving(true);
    // Demo only: stands in for a Server Action round-trip.
    setTimeout(() => {
      setSaving(false);
      setOpen(false);
      setAmount(null);
      toast.success(`Pembayaran ${formatRupiah(amount)} tercatat.`);
    }, 800);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(undefined);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary">Catat pembayaran</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Catat pembayaran</DialogTitle>
            <DialogDescription>
              Tiket SRV-00042 · sisa Rp 450.000
            </DialogDescription>
          </DialogHeader>
          <Field
            label="Jumlah"
            hint="Tekan Enter untuk menyimpan."
            error={error}
          >
            {(control) => (
              <MoneyInput
                {...control}
                value={amount}
                onValueChange={(next) => {
                  setAmount(next);
                  setError(undefined);
                }}
              />
            )}
          </Field>
          {amount ? (
            <p className="flex items-center justify-between gap-2 text-body-sm text-text-muted">
              Akan dicatat
              <Readout>{formatRupiah(amount)}</Readout>
            </p>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" loading={saving}>
              {saving ? "Menyimpan" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        onClick={() => toast.success("Tiket SRV-00042 tersimpan.")}
      >
        Toast sukses
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toastError("Stok tidak cukup (sisa 2).", {
            action: {
              label: "Tambah sebagai part non-stok",
              onClick: () => {},
            },
          })
        }
      >
        Toast error
      </Button>
    </div>
  );
}
