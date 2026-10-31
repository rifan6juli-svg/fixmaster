"use client";

import * as React from "react";

import { callAction } from "@/components/call-action";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { useFocusFirstError } from "@/components/use-focus-first-error";
import type { ActionResult } from "@/lib/action-result";
import {
  changePasswordSchema,
  fieldErrors,
  type ChangePasswordInput,
} from "@/lib/validation/auth";

interface ChangePasswordFormProps {
  /** Passed in by the page: Client Components never import src/server/**. */
  action: (input: ChangePasswordInput) => Promise<ActionResult<null>>;
  homeHref: string;
  /** The user is here on a temporary password from their owner (AFD F-02). */
  forced: boolean;
}

interface ChangePasswordState {
  values: Partial<ChangePasswordInput>;
  errors: Record<string, string>;
  /** Keeps the button busy until the next page has loaded. */
  done?: boolean;
}

export function ChangePasswordForm({
  action,
  homeHref,
  forced,
}: ChangePasswordFormProps) {
  const formRef = React.useRef<HTMLFormElement>(null);

  async function submit(
    _previous: ChangePasswordState,
    formData: FormData,
  ): Promise<ChangePasswordState> {
    const values = Object.fromEntries(
      formData,
    ) as ChangePasswordState["values"];
    const parsed = changePasswordSchema.safeParse(values);
    if (!parsed.success) {
      return { values, errors: fieldErrors(parsed.error) };
    }

    const result = await callAction(() => action(parsed.data));
    if (result.ok) {
      // A full load, not the router: it still holds the home page's redirect to
      // S-03 from sign-in and replays it without asking the server.
      const home = new URL(homeHref, window.location.href);
      home.searchParams.set("password", "changed");
      window.location.assign(home);
      return { values, errors: {}, done: true };
    }
    return { values, errors: result.error.fields ?? {} };
  }

  const [state, formAction, pending] = React.useActionState(submit, {
    values: {},
    errors: {},
  });
  useFocusFirstError(formRef, state);

  return (
    <form ref={formRef} action={formAction} noValidate className="grid gap-4">
      <Field
        label={forced ? "Password sementara" : "Password saat ini"}
        error={state.errors.currentPassword}
      >
        {(control) => (
          <PasswordInput
            {...control}
            name="currentPassword"
            autoComplete="current-password"
            defaultValue={state.values.currentPassword}
            required
          />
        )}
      </Field>
      <Field
        label="Password baru"
        hint="Minimal 8 karakter"
        error={state.errors.newPassword}
      >
        {(control) => (
          <PasswordInput
            {...control}
            name="newPassword"
            autoComplete="new-password"
            defaultValue={state.values.newPassword}
            required
          />
        )}
      </Field>
      <Button
        type="submit"
        size="lg"
        loading={pending || state.done}
        className="mt-2 w-full"
      >
        Simpan password
      </Button>
    </form>
  );
}
