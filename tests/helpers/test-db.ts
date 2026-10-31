import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import type { Database } from "@/server/db/client";
import * as schema from "@/server/db/schema";
import { assertLocalDatabaseUrl } from "@/server/db/url";

const TEMPLATE_DATABASE = "fixmaster_test_template";
const E2E_DATABASE = "fixmaster_e2e";

export function testDatabaseUrl() {
  if (existsSync(".env")) {
    process.loadEnvFile(".env");
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  assertLocalDatabaseUrl(url);
  return url;
}

function withDatabase(url: string, database: string) {
  const parsed = new URL(url);
  parsed.pathname = `/${database}`;
  return parsed.toString();
}

function connect(url: string) {
  return postgres(url, { max: 1, prepare: false, onnotice: () => {} });
}

async function migrateDatabase(url: string) {
  const client = connect(url);
  try {
    await migrate(drizzle({ client }), { migrationsFolder: "drizzle" });
  } finally {
    await client.end();
  }
}

/** Turns a refused connection into the step the developer has to take. */
export async function requireLocalSupabase<T>(run: () => Promise<T>) {
  try {
    return await run();
  } catch (error) {
    if ((error as { code?: string }).code === "ECONNREFUSED") {
      throw new Error(
        "Local Supabase is not reachable. Start Docker Desktop, then run pnpm db:start.",
      );
    }
    throw error;
  }
}

/** Runs once per test run: one migrated template, copied by every test file. */
export async function prepareTestTemplate(url: string) {
  const admin = connect(url);
  try {
    const leftovers = await admin<{ datname: string }[]>`
      SELECT datname FROM pg_database WHERE datname LIKE 'fixmaster_test_%'
    `;
    for (const { datname } of leftovers) {
      await admin`DROP DATABASE ${admin(datname)} WITH (FORCE)`;
    }
    await admin`CREATE DATABASE ${admin(TEMPLATE_DATABASE)}`;
  } finally {
    await admin.end();
  }

  await migrateDatabase(withDatabase(url, TEMPLATE_DATABASE));
}

export async function dropTestTemplate(url: string) {
  const admin = connect(url);
  try {
    await admin`DROP DATABASE IF EXISTS ${admin(TEMPLATE_DATABASE)} WITH (FORCE)`;
  } finally {
    await admin.end();
  }
}

export function e2eDatabaseUrl(url = testDatabaseUrl()) {
  return withDatabase(url, E2E_DATABASE);
}

/** Gives a Playwright run a freshly migrated, empty database. */
export async function recreateE2eDatabase(url: string) {
  const admin = connect(url);
  try {
    await admin`DROP DATABASE IF EXISTS ${admin(E2E_DATABASE)} WITH (FORCE)`;
    await admin`CREATE DATABASE ${admin(E2E_DATABASE)}`;
  } finally {
    await admin.end();
  }

  await migrateDatabase(e2eDatabaseUrl(url));
}

/**
 * Gives a test file its own migrated database, dropped by `cleanup`. It also
 * becomes what getDb() returns, so services and auth run against it unchanged.
 */
export async function createTestDb(url = testDatabaseUrl()) {
  assertLocalDatabaseUrl(url);

  const name = `fixmaster_test_${randomBytes(6).toString("hex")}`;
  const admin = connect(url);
  try {
    await admin`CREATE DATABASE ${admin(name)} TEMPLATE ${admin(TEMPLATE_DATABASE)}`;
  } finally {
    await admin.end();
  }

  const client = postgres(withDatabase(url, name), {
    prepare: false,
    onnotice: () => {},
  });
  const db: Database = drizzle({ client, schema });
  (globalThis as typeof globalThis & { fixmasterDb?: Database }).fixmasterDb =
    db;

  return {
    db,
    cleanup: async () => {
      await client.end();
      const dropper = connect(url);
      try {
        await dropper`DROP DATABASE IF EXISTS ${dropper(name)} WITH (FORCE)`;
      } finally {
        await dropper.end();
      }
    },
  };
}
