"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toastError } from "@/components/ui/sonner";
import type { ActionResult } from "@/lib/action-result";
import {
  fieldErrors,
  registerShopSchema,
  type RegisterShopForm,
} from "@/lib/validation/auth";

interface RegisterFormProps {
  /** Passed in by the page: Client Components never import src/server/**. */
  action: (input: RegisterShopForm) => Promise<ActionResult<null>>;
}

interface RegisterState {
  values: Partial<RegisterShopForm>;
  errors: Record<string, string>;
}

export function RegisterForm({ action }: RegisterFormProps) {
  const router = useRouter();
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

    try {
      const result = await action(values);
      if (result.ok) {
        router.replace("/dashboard");
        return { values, errors: {} };
      }
      if (result.error.fields) {
        return { values, errors: result.error.fields };
      }
      toastError(result.error.message);
    } catch {
      toastError("Koneksi terputus, coba lagi");
    }
    return { values, errors: {} };
  }

  // A form action rather than onSubmit: React holds a submit made before
  // hydration and replays it, so the browser never sends the form itself.
  const [state, formAction, pending] = React.useActionState(submit, {
    values: {},
    errors: {},
  });

  // On a phone the first error can be off-screen once the form is submitted.
  React.useEffect(() => {
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [state]);

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
      <Field label="Nama owner" error={state.errors.ownerName}>
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
          <Input
            {...control}
            name="password"
            type="password"
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
