import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ContentSkeleton } from "@/components/app-shell/skeletons";
import { AddStaffDialog } from "@/components/staff/add-staff-dialog";
import { StaffList } from "@/components/staff/staff-list";
import { EmptyState } from "@/components/ui/empty-state";
import { createStaff } from "@/server/actions/staff";
import { getTenantContext } from "@/server/auth/context";
import { listStaff } from "@/server/services/staff";

export const metadata: Metadata = { title: "Staf | Fixmaster" };

async function StaffContent() {
  const staff = await listStaff(await getTenantContext());
  const onlyOwner = staff.length === 1;
  const addStaff = <AddStaffDialog action={createStaff} />;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h1 font-semibold">Staf</h1>
        {!onlyOwner && addStaff}
      </div>
      <StaffList staff={staff} />
      {onlyOwner && (
        <EmptyState
          showMascot={false}
          title="Belum ada staf"
          description="Tambahkan admin atau teknisi agar mereka bisa memakai Fixmaster."
          action={addStaff}
        />
      )}
    </>
  );
}

export default function StaffPage() {
  return (
    <div className="grid gap-6">
      <Link
        href="/settings"
        className="justify-self-start text-body-sm text-brand-text underline"
      >
        Pengaturan
      </Link>
      <Suspense fallback={<ContentSkeleton />}>
        <StaffContent />
      </Suspense>
    </div>
  );
}
