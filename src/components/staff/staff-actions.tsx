"use client";

import * as React from "react";

import { callAction } from "@/components/call-action";
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
import { toast } from "@/components/ui/sonner";
import type { ActionResult } from "@/lib/action-result";
import { fieldErrors } from "@/lib/validation/auth";
import { resetStaffPasswordSchema } from "@/lib/validation/staff";
import { TempPasswordField } from "./temp-password-field";

type SetStaffActive = (input: {
  userId: string;
  isActive: boolean;
}) => Promise<ActionResult<null>>;

type ResetStaffPassword = (input: {
  userId: string;
  tempPassword: string;
}) => Promise<ActionResult<null>>;

interface StaffIdentity {
  userId: string;
  name: string;
}

interface ResetPasswordState {
  tempPassword?: string;
  error?: string;
}

function ResetPasswordForm({
  staff,
  action,
  onDone,
}: {
  staff: StaffIdentity;
  action: ResetStaffPassword;
  onDone: () => void;
}) {
  async function submit(
    _previous: ResetPasswordState,
    formData: FormData,
  ): Promise<ResetPasswordState> {
    const tempPassword = String(formData.get("tempPassword"));
    const input = { userId: staff.userId, tempPassword };
    const parsed = resetStaffPasswordSchema.safeParse(input);
    if (!parsed.success) {
      return { tempPassword, error: fieldErrors(parsed.error).tempPassword };
    }

    const result = await callAction(() => action(input));
    if (result.ok) {
      toast.success(`Password ${staff.name} direset`);
      onDone();
      return { tempPassword };
    }
    return { tempPassword, error: result.error.fields?.tempPassword };
  }

  const [state, formAction, pending] = React.useActionState(submit, {});

  return (
    <form action={formAction} noValidate className="grid gap-4">
      <TempPasswordField
        defaultValue={state.tempPassword}
        error={state.error}
      />
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Batal
          </Button>
        </DialogClose>
        <Button type="submit" loading={pending}>
          Simpan
        </Button>
      </DialogFooter>
    </form>
  );
}

function ResetPasswordDialog({
  staff,
  action,
}: {
  staff: StaffIdentity;
  action: ResetStaffPassword;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" aria-label={`Reset password ${staff.name}`}>
          Reset password
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password {staff.name}</DialogTitle>
          <DialogDescription>
            Password lama langsung tidak berlaku dan sesi yang terbuka dicabut.
          </DialogDescription>
        </DialogHeader>
        <ResetPasswordForm
          staff={staff}
          action={action}
          onDone={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function DeactivateDialog({
  staff,
  action,
}: {
  staff: StaffIdentity;
  action: SetStaffActive;
}) {
  const [open, setOpen] = React.useState(false);

  async function submit() {
    const result = await callAction(() =>
      action({ userId: staff.userId, isActive: false }),
    );
    if (result.ok) {
      toast.success(`${staff.name} dinonaktifkan`);
      setOpen(false);
    }
    return null;
  }

  const [, formAction, pending] = React.useActionState(submit, null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-danger"
          aria-label={`Nonaktifkan ${staff.name}`}
        >
          Nonaktifkan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nonaktifkan {staff.name}?</DialogTitle>
          <DialogDescription>
            Semua sesinya langsung dicabut dan akun ini tidak bisa login sampai
            diaktifkan lagi.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" variant="danger" loading={pending}>
              Nonaktifkan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ActivateButton({
  staff,
  action,
}: {
  staff: StaffIdentity;
  action: SetStaffActive;
}) {
  const [pending, startTransition] = React.useTransition();

  function activate() {
    startTransition(async () => {
      const result = await callAction(() =>
        action({ userId: staff.userId, isActive: true }),
      );
      if (result.ok) {
        toast.success(`${staff.name} diaktifkan`);
      }
    });
  }

  return (
    <Button
      variant="secondary"
      loading={pending}
      onClick={activate}
      aria-label={`Aktifkan ${staff.name}`}
    >
      Aktifkan
    </Button>
  );
}

interface StaffActionsProps extends StaffIdentity {
  isActive: boolean;
  /** Passed in by the server: Client Components never import src/server/**. */
  setActive: SetStaffActive;
  resetPassword: ResetStaffPassword;
}

export function StaffActions({
  userId,
  name,
  isActive,
  setActive,
  resetPassword,
}: StaffActionsProps) {
  const staff = { userId, name };

  return (
    <div className="flex flex-wrap gap-2 sm:justify-end">
      <ResetPasswordDialog staff={staff} action={resetPassword} />
      {isActive ? (
        <DeactivateDialog staff={staff} action={setActive} />
      ) : (
        <ActivateButton staff={staff} action={setActive} />
      )}
    </div>
  );
}
