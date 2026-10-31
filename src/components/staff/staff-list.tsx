import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { USER_ROLE_LABELS } from "@/lib/user-role";
import { resetStaffPassword, setStaffActive } from "@/server/actions/staff";
import type { StaffMember } from "@/server/services/staff";
import { StaffActions } from "./staff-actions";

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <Badge tone="success">Aktif</Badge>
  ) : (
    <Badge tone="neutral" fill="outline">
      Nonaktif
    </Badge>
  );
}

// No actions on the owner's row (AFD F-02): the owner cannot deactivate themself.
function RowActions({ member }: { member: StaffMember }) {
  if (member.role === "owner") {
    return null;
  }
  return (
    <StaffActions
      userId={member.id}
      name={member.name}
      isActive={member.isActive}
      setActive={setStaffActive}
      resetPassword={resetStaffPassword}
    />
  );
}

// A table from 640px and cards below it (DBD section 3).
export function StaffList({ staff }: { staff: StaffMember[] }) {
  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Aksi</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-text-muted">{member.email}</p>
                </TableCell>
                <TableCell>{USER_ROLE_LABELS[member.role]}</TableCell>
                <TableCell>
                  <StatusBadge isActive={member.isActive} />
                </TableCell>
                <TableCell>
                  <RowActions member={member} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="grid gap-3 sm:hidden">
        {staff.map((member) => (
          <li key={member.id}>
            <Card className="gap-3 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{member.name}</p>
                  <p className="truncate text-body-sm text-text-muted">
                    {member.email}
                  </p>
                  <p className="text-body-sm text-text-muted">
                    {USER_ROLE_LABELS[member.role]}
                  </p>
                </div>
                <StatusBadge isActive={member.isActive} />
              </div>
              <RowActions member={member} />
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
