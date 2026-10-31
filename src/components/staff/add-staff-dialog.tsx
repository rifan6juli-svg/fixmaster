"use client";

import * as React from "react";

import { callAction } from "@/components/call-action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import type { ActionResult } from "@/lib/action-result";
import { USER_ROLE_LABELS } from "@/lib/user-role";
import { fieldErrors } from "@/lib/validation/auth";
import {
  createStaffSchema,
  type CreateStaffForm,
} from "@/lib/validation/staff";
import { TempPasswordField } from "./temp-password-field";

type CreateStaffAction = (
  input: CreateStaffForm,
) => Promise<ActionResult<{ userId: string }>>;

interface AddStaffState {
  values: Partial<CreateStaffForm>;
  errors: Record<string, string>;
}

function AddStaffForm({
  action,
  onDone,
}: {
  action: CreateStaffAction;
  onDone: () => void;
}) {
  async function submit(
    _previous: AddStaffState,
    formData: FormData,
  ): Promise<AddStaffState> {
    const values = Object.fromEntries(formData) as unknown as CreateStaffForm;
    const parsed = createStaffSchema.safeParse(values);
    if (!parsed.success) {
      return { values, errors: fieldErrors(parsed.error) };
    }

    const result = await callAction(() => action(values));
    if (result.ok) {
      toast.success(`Akun ${parsed.data.name} dibuat`);
      onDone();
      return { values, errors: {} };
    }
    return { values, errors: result.error.fields ?? {} };
  }

  const [state, formAction, pending] = React.useActionState(submit, {
    values: {},
    errors: {},
  });

  return (
    <form action={formAction} noValidate className="grid gap-4">
      <Field label="Nama" error={state.errors.name}>
        {(control) => (
          <Input
            {...control}
            name="name"
            autoComplete="off"
            defaultValue={state.values.name}
            required
          />
        )}
      </Field>
      <Field label="Email" error={state.errors.email}>
        {(control) => (
          <Input
            {...control}
            name="email"
            type="email"
            autoComplete="off"
            defaultValue={state.values.email}
            required
          />
        )}
      </Field>
      <Field label="Peran" error={state.errors.role}>
        {(control) => (
          <Select
            {...control}
            name="role"
            defaultValue={state.values.role ?? "technician"}
          >
            <option value="technician">{USER_ROLE_LABELS.technician}</option>
            <option value="admin">{USER_ROLE_LABELS.admin}</option>
          </Select>
        )}
      </Field>
      <TempPasswordField
        defaultValue={state.values.tempPassword}
        error={state.errors.tempPassword}
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

export function AddStaffDialog({ action }: { action: CreateStaffAction }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Tambah staf</Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Tambah staf</DialogTitle>
        </DialogHeader>
        <AddStaffForm action={action} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
