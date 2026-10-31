import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import * as schema from "@/server/db/schema";

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;

function createAuth() {
  const db = getDb();

  return betterAuth({
    appName: "Fixmaster",
    baseURL: process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, { provider: "pg", schema, usePlural: true }),
    advanced: { database: { generateId: "uuid" } },
    logger: { level: "error" },
    // Accounts are only created server-side (registerShop, createStaff).
    emailAndPassword: { enabled: true, disableSignUp: true },
    // BSD section 6 exposes sign-in, sign-out, and session only. These two would
    // let a user skip the validation in the Server Actions that own those changes.
    disabledPaths: ["/update-user", "/change-password"],
    user: {
      additionalFields: {
        tenantId: { type: "string", required: false, input: false },
        role: { type: [...schema.userRole.enumValues], input: false },
        isActive: { type: "boolean", defaultValue: true, input: false },
        mustChangePassword: {
          type: "boolean",
          defaultValue: false,
          input: false,
        },
      },
    },
    session: { expiresIn: SEVEN_DAYS_IN_SECONDS },
    rateLimit: {
      enabled: true,
      storage: "database",
      // PRD F-01. Better Auth counts every attempt, not only failed ones.
      customRules: { "/sign-in/email": { window: 60, max: 5 } },
    },
    databaseHooks: {
      session: {
        create: {
          // Runs after the password check, so it never reveals that an email exists.
          before: async (session) => {
            const [user] = await db
              .select({ isActive: schema.users.isActive })
              .from(schema.users)
              .where(eq(schema.users.id, session.userId));

            if (!user?.isActive) {
              throw new APIError("FORBIDDEN", {
                code: "ACCOUNT_DISABLED",
                message: "Akun Anda dinonaktifkan. Hubungi pemilik toko.",
              });
            }
          },
        },
      },
    },
    plugins: [nextCookies()],
  });
}

let auth: ReturnType<typeof createAuth> | undefined;

// Lazy, so `next build` needs neither a database nor the auth secret.
export function getAuth() {
  auth ??= createAuth();
  return auth;
}
