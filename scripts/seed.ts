import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/server/db/schema";
import { assertLocalDatabaseUrl } from "../src/server/db/url";
import { seedDatabase } from "./seed-data";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  assertLocalDatabaseUrl(url);

  const client = postgres(url, {
    prepare: false,
    max: 1,
    onnotice: () => {},
  });

  try {
    const seeded = await seedDatabase(drizzle({ client, schema }));
    process.stdout.write(
      seeded
        ? "Seed data inserted\n"
        : "Database already has data, run pnpm db:reset first\n",
    );
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Seed failed: ${message}\n`);
  process.exitCode = 1;
});
