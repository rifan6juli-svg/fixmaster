"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { toastError } from "@/components/ui/sonner";
import { useFocusFirstError } from "@/components/use-focus-first-error";
import { authClient } from "@/lib/auth-client";
import { safeNextPath } from "@/lib/safe-next";
import { fieldErrors, loginSchema } from "@/lib/validation/auth";

const WRONG_CREDENTIALS = "Email atau password salah";

// Texts from AFD F-01, by the status code of /api/auth/sign-in/email.
const LOGIN_ERRORS: Record<number, string> = {
  400: WRONG_CREDENTIALS,
  401: WRONG_CREDENTIALS,
  403: "Akun Anda dinonaktifkan. Hubungi pemilik toko.",
  429: "Terlalu banyak percobaan, coba lagi dalam 1 menit",
};

interface LoginState {
  values: { email?: string; password?: string };
  errors: Record<string, string>;
  banner?: string;
}

export function LoginForm() {
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);

  async function submit(
    _previous: LoginState,
    formData: FormData,
  ): Promise<LoginState> {
    const values = Object.fromEntries(formData) as LoginState["values"];
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      return { values, errors: fieldErrors(parsed.error) };
    }

    try {
      const { error } = await authClient.signIn.email(parsed.data);
      if (error) {
        const banner = LOGIN_ERRORS[error.status];
        if (!banner) {
          toastError("Terjadi kesalahan, coba lagi.");
        }
        return { values, errors: {}, banner };
      }
    } catch {
      toastError("Koneksi terputus, coba lagi");
      return { values, errors: {} };
    }

    const next = new URLSearchParams(window.location.search).get("next");
    router.replace(safeNextPath(next));
    // The cookie was set outside Next, so drop what the router cached for a guest.
    router.refresh();
    return { values, errors: {} };
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
      {state.banner && (
        <p
          role="alert"
          className="rounded-md border border-danger bg-danger/12 px-3 py-2 text-body-sm text-danger"
        >
          {state.banner}
        </p>
      )}
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
      <Field label="Password" error={state.errors.password}>
        {(control) => (
          <PasswordInput
            {...control}
            name="password"
            autoComplete="current-password"
            defaultValue={state.values.password}
            required
          />
        )}
      </Field>
      <Button type="submit" size="lg" loading={pending} className="mt-2 w-full">
        Masuk
      </Button>
    </form>
  );
}
