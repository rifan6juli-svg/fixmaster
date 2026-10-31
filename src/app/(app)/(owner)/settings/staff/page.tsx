import type { Metadata } from "next";
import { Suspense } from "react";

import { BackLink } from "@/components/app-shell/back-link";
import { ContentSkeleton } from "@/components/app-shell/skeletons";
import { AddStaffDialog } from "@/components/staff/add-staff-dialog";
import { StaffList } from "@/components/staff/staff-list";
import { EmptyState } from "@/components/ui/empty-state";
import { Readout } from "@/components/ui/readout";
import { createStaff } from "@/server/actions/staff";
import { getTenantContext } from "@/server/auth/context";
import { listStaff } from "@/server/services/staff";

export const metadata: Metadata = { title: "Staf | Fixmaster" };

async function StaffContent() {
  const staff = await listStaff(await getTenantContext());

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-h1 font-semibold">Staf</h1>
        <Readout className="uppercase">{staff.length} akun</Readout>
        {/* One spot in every state: moving it would close the dialog mid-handoff. */}
        <div className="ml-auto">
          <AddStaffDialog action={createStaff} />
        </div>
      </div>
      <StaffList staff={staff} />
      {staff.length === 1 && (
        <EmptyState
          showMascot={false}
          title="Belum ada staf"
          description="Tambahkan admin atau teknisi agar mereka bisa memakai Fixmaster."
        />
      )}
    </>
  );
}

export default function StaffPage() {
  return (
    <div className="grid grid-cols-1 gap-4">
      <BackLink href="/settings">Pengaturan</BackLink>
      <div className="grid grid-cols-1 gap-6">
        <Suspense fallback={<ContentSkeleton />}>
          <StaffContent />
        </Suspense>
      </div>
    </div>
  );
}
