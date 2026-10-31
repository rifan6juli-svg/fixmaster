"use client";

import * as React from "react";

import { callAction } from "@/components/call-action";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { useFocusFirstError } from "@/components/use-focus-first-error";
import type { ActionResult } from "@/lib/action-result";
import { formatPhoneWa } from "@/lib/phone";
import { fieldErrors } from "@/lib/validation/auth";
import {
  saveCustomerSchema,
  type SaveCustomerForm,
} from "@/lib/validation/customers";

export type SaveCustomerAction = (
  input: SaveCustomerForm,
) => Promise<ActionResult<{ customerId: string }>>;

interface CustomerFormProps {
  customer: { id: string; name: string; phoneWa: string; notes: string | null };
  action: SaveCustomerAction;
  onSaved: () => void;
  onCancel: () => void;
}

interface CustomerFormState {
  values: SaveCustomerForm;
  errors: Record<string, string>;
}

export function CustomerForm({
  customer,
  action,
  onSaved,
  onCancel,
}: CustomerFormProps) {
  const formRef = React.useRef<HTMLFormElement>(null);

  async function submit(
    _previous: CustomerFormState,
    formData: FormData,
  ): Promise<CustomerFormState> {
    const values = {
      ...Object.fromEntries(formData),
      id: customer.id,
    } as SaveCustomerForm;
    const parsed = saveCustomerSchema.safeParse(values);
    if (!parsed.success) {
      return { values, errors: fieldErrors(parsed.error) };
    }

    const result = await callAction(() => action(values));
    if (result.ok) {
      toast.success("Data pelanggan tersimpan");
      onSaved();
      return { values, errors: {} };
    }
    return { values, errors: result.error.fields ?? {} };
  }

  const [state, formAction, pending] = React.useActionState(submit, {
    values: {
      id: customer.id,
      name: customer.name,
      phoneWa: formatPhoneWa(customer.phoneWa),
      notes: customer.notes ?? "",
    },
    errors: {},
  });
  useFocusFirstError(formRef, state);

  return (
    <form ref={formRef} action={formAction} noValidate className="grid gap-4">
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
      <Field
        label="Nomor WA"
        hint="Contoh: 0812 3456 7890"
        error={state.errors.phoneWa}
      >
        {(control) => (
          <Input
            {...control}
            name="phoneWa"
            type="tel"
            autoComplete="off"
            defaultValue={state.values.phoneWa}
            required
          />
        )}
      </Field>
      <Field label="Catatan" error={state.errors.notes}>
        {(control) => (
          <Textarea
            {...control}
            name="notes"
            maxLength={500}
            defaultValue={state.values.notes ?? ""}
          />
        )}
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={pending}>
          Simpan
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </form>
  );
}
