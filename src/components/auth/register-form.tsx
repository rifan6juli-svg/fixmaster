"use client";

import * as React from "react";

import { callAction } from "@/components/call-action";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useFocusFirstError } from "@/components/use-focus-first-error";
import type { ActionResult } from "@/lib/action-result";
import {
  fieldErrors,
  registerShopSchema,
  type RegisterShopForm,
} from "@/lib/validation/auth";

interface RegisterFormProps {
  /** Passed in by the page: Client Components never import src/server/**. */
  action: (input: RegisterShopForm) => Promise<ActionResult<never>>;
}

interface RegisterState {
  values: Partial<RegisterShopForm>;
  errors: Record<string, string>;
}

export function RegisterForm({ action }: RegisterFormProps) {
  const formRef = React.useRef<HTMLFormElement>(null);

  async function submit(
    _previous: RegisterState,
    formData: FormData,
  ): Promise<RegisterState> {
    const values = Object.fromEntries(formData) as unknown as RegisterShopForm;
    const parsed = registerShopSchema.safeParse(values);
    if (!parsed.success) {
      return { values, errors: fieldErrors(parsed.error) };
    }

    const result = await callAction(() => action(values));
    return { values, errors: result.ok ? {} : (result.error.fields ?? {}) };
  }

  // A form action rather than onSubmit: React holds a submit made before
  // hydration and replays it, so the browser never sends the form itself.
  const [state, formAction, pending] = React.useActionState(submit, {
    values: {},
    errors: {},
  });

  useFocusFirstError(formRef, state);

  return (
    <form ref={formRef} action={formAction} noValidate className="grid gap-4">
      <Field label="Nama toko" error={state.errors.shopName}>
        {(control) => (
          <Input
            {...control}
            name="shopName"
            autoComplete="organization"
            defaultValue={state.values.shopName}
            required
          />
        )}
      </Field>
      <Field label="Nama pemilik toko" error={state.errors.ownerName}>
        {(control) => (
          <Input
            {...control}
            name="ownerName"
            autoComplete="name"
            defaultValue={state.values.ownerName}
            required
          />
        )}
      </Field>
      <Field
        label="Nomor WA toko"
        hint="Contoh: 0812 3456 7890"
        error={state.errors.phoneWa}
      >
        {(control) => (
          <Input
            {...control}
            name="phoneWa"
            type="tel"
            autoComplete="tel"
            defaultValue={state.values.phoneWa}
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
            autoComplete="email"
            defaultValue={state.values.email}
            required
          />
        )}
      </Field>
      <Field
        label="Password"
        hint="Minimal 8 karakter"
        error={state.errors.password}
      >
        {(control) => (
          <PasswordInput
            {...control}
            name="password"
            autoComplete="new-password"
            defaultValue={state.values.password}
            required
          />
        )}
      </Field>
      <Button type="submit" size="lg" loading={pending} className="mt-2 w-full">
        Daftar & mulai trial
      </Button>
    </form>
  );
}
