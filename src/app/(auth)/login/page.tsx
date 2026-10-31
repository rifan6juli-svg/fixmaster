import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Masuk | Fixmaster" };

export default function LoginPage() {
  return (
    <Card>
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <CardHeader>
        <CardTitle asChild className="text-h1">
          <h1>Masuk</h1>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-body-sm text-text-muted">
        <p>
          Lupa password? Staf meminta pemilik toko meresetnya. Pemilik toko
          menghubungi admin Fixmaster.
        </p>
        <p>
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="inline-flex min-h-11 items-center text-brand-text underline"
          >
            Daftarkan toko
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
