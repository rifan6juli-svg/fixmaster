"use client";

import * as React from "react";

import { callAction } from "@/components/call-action";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
      window.location.assign(homeHref);
      return { values, errors: {}, done: true };
    }
    return { values, errors: result.error.fields ?? {} };
  }

  const [state, formAction, pending] = React.useActionState(submit, {
    values: {},
    errors: {},
  });

  return (
    <form action={formAction} noValidate className="grid gap-4">
      <Field
        label={forced ? "Password sementara" : "Password saat ini"}
        error={state.errors.currentPassword}
      >
        {(control) => (
          <Input
            {...control}
            name="currentPassword"
            type="password"
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
          <Input
            {...control}
            name="newPassword"
            type="password"
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
