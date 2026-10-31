// `user_role` values from docs/BSD.md section 4, with their UI labels.
export const USER_ROLES = [
  "owner",
  "admin",
  "technician",
  "super_admin",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  owner: "Owner",
  admin: "Admin/Kasir",
  technician: "Teknisi",
  super_admin: "Super-admin",
};
