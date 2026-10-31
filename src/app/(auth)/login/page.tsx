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
      <CardFooter className="text-body-sm text-text-muted">
        <p>
          Belum punya akun?{" "}
          <Link href="/register" className="text-brand-text underline">
            Daftarkan toko
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
