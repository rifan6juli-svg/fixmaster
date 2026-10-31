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
import { useFocusFirstError } from "@/components/use-focus-first-error";
import type { ActionResult } from "@/lib/action-result";
import { fieldErrors } from "@/lib/validation/auth";
import { resetStaffPasswordSchema } from "@/lib/validation/staff";
import { TempPasswordField } from "./temp-password-field";
import { TempPasswordHandoff } from "./temp-password-handoff";

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
  email: string;
}

interface ResetPasswordState {
  tempPassword?: string;
  error?: string;
}

function ResetPasswordForm({
  staff,
  action,
  onReset,
}: {
  staff: StaffIdentity;
  action: ResetStaffPassword;
  onReset: (tempPassword: string) => void;
}) {
  const formRef = React.useRef<HTMLFormElement>(null);

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
      onReset(tempPassword);
      return { tempPassword };
    }
    return { tempPassword, error: result.error.fields?.tempPassword };
  }

  const [state, formAction, pending] = React.useActionState(submit, {});
  useFocusFirstError(formRef, state);

  return (
    <form ref={formRef} action={formAction} noValidate className="grid gap-4">
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
          Reset password
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
  const [newPassword, setNewPassword] = React.useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setNewPassword(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" aria-label={`Reset password ${staff.name}`}>
          Reset password
        </Button>
      </DialogTrigger>
      <DialogContent
        // A stray tap must not lose the only view of the new password.
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {newPassword
              ? `Password ${staff.name} direset`
              : `Reset password ${staff.name}`}
          </DialogTitle>
          <DialogDescription>
            {newPassword
              ? "Akun ini sudah keluar dari semua perangkat."
              : "Password lama langsung tidak berlaku dan akun ini keluar dari semua perangkat."}
          </DialogDescription>
        </DialogHeader>
        {newPassword ? (
          <TempPasswordHandoff
            email={staff.email}
            password={newPassword}
            onDone={() => handleOpenChange(false)}
          />
        ) : (
          <ResetPasswordForm
            staff={staff}
            action={action}
            onReset={setNewPassword}
          />
        )}
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
            Akun ini langsung keluar dari semua perangkat dan tidak bisa login
            sampai diaktifkan lagi. Tiket dan riwayatnya tetap tersimpan.
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
  email,
  isActive,
  setActive,
  resetPassword,
}: StaffActionsProps) {
  const staff = { userId, name, email };

  return (
    <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:justify-end">
      <ResetPasswordDialog staff={staff} action={resetPassword} />
      {isActive ? (
        <DeactivateDialog staff={staff} action={setActive} />
      ) : (
        <ActivateButton staff={staff} action={setActive} />
      )}
    </div>
  );
}
