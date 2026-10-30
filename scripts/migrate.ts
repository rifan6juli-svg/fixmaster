import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import {
  assertLocalDatabaseUrl,
  isLocalDatabaseUrl,
} from "../src/server/db/url";

async function main() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  if (process.argv.includes("--local-only")) {
    assertLocalDatabaseUrl(url);
  }

  const client = postgres(url, {
    prepare: false,
    max: 1,
    ssl: isLocalDatabaseUrl(url) ? false : "require",
    onnotice: () => {},
  });

  try {
    await migrate(drizzle({ client }), { migrationsFolder: "drizzle" });
  } finally {
    await client.end();
  }
  process.stdout.write("Migrations applied\n");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Migration failed: ${message}\n`);
  process.exitCode = 1;
});
