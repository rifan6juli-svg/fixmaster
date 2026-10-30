"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, toastError } from "@/components/ui/sonner";

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Buka dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Catat pembayaran</DialogTitle>
          <DialogDescription>
            Contoh form singkat di dalam dialog.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="demo-amount">Jumlah</Label>
          <Input id="demo-amount" inputMode="numeric" placeholder="150.000" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Batal</Button>
          </DialogClose>
          <Button>Simpan</Button>
        </DialogFooter>
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
