import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";
import { RegisterForm } from "@/components/auth/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { registerShop } from "@/server/actions/auth";

export const metadata: Metadata = { title: "Daftar toko | Fixmaster" };

export default function RegisterPage() {
  return (
    <Card>
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <CardHeader>
        <CardTitle asChild className="text-h1">
          <h1>Daftar toko</h1>
        </CardTitle>
        <CardDescription>
          Trial 14 hari, langsung bisa dipakai hari ini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm action={registerShop} />
      </CardContent>
      <CardFooter className="text-body-sm text-text-muted">
        <p>
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center text-brand-text underline"
          >
            Masuk
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
