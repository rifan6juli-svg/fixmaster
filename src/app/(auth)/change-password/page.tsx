import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { changePassword } from "@/server/actions/auth";
import { getSessionUser, homePath } from "@/server/auth/context";

export const metadata: Metadata = { title: "Ganti password | Fixmaster" };

async function ChangePasswordContent() {
  const user = await getSessionUser();
  const forced = user.mustChangePassword;

  return (
    <>
      <CardContent className="grid gap-4">
        {forced && (
          <CardDescription>
            Demi keamanan, buat password baru sebelum memakai Fixmaster.
          </CardDescription>
        )}
        <ChangePasswordForm
          action={changePassword}
          homeHref={homePath(user)}
          forced={forced}
        />
      </CardContent>
      <CardFooter className="text-body-sm">
        {forced ? (
          <LogoutButton />
        ) : (
          <Link href={homePath(user)} className="text-brand-text underline">
            Kembali
          </Link>
        )}
      </CardFooter>
    </>
  );
}

function FormSkeleton() {
  return (
    <CardContent aria-busy="true" className="grid gap-4">
      <span className="sr-only">Memuat data…</span>
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
    </CardContent>
  );
}

export default function ChangePasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle asChild className="text-h1">
          <h1>Ganti password</h1>
        </CardTitle>
      </CardHeader>
      <Suspense fallback={<FormSkeleton />}>
        <ChangePasswordContent />
      </Suspense>
    </Card>
  );
}
