import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import type { Database } from "@/server/db/client";
import * as schema from "@/server/db/schema";
import { assertLocalDatabaseUrl } from "@/server/db/url";

const TEMPLATE_DATABASE = "fixmaster_test_template";

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

  const template = connect(withDatabase(url, TEMPLATE_DATABASE));
  try {
    await migrate(drizzle({ client: template }), {
      migrationsFolder: "drizzle",
    });
  } finally {
    await template.end();
  }
}

export async function dropTestTemplate(url: string) {
  const admin = connect(url);
  try {
    await admin`DROP DATABASE IF EXISTS ${admin(TEMPLATE_DATABASE)} WITH (FORCE)`;
  } finally {
    await admin.end();
  }
}

/** Gives a test file its own migrated database, dropped by `cleanup`. */
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
