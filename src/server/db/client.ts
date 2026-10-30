import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { isLocalDatabaseUrl } from "./url";

export type Database = PostgresJsDatabase<typeof schema>;

// Kept on globalThis so HMR does not open a new connection pool on every reload.
const store = globalThis as typeof globalThis & { fixmasterDb?: Database };

function createDb(): Database {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  // The Supabase transaction pooler does not support prepared statements.
  const client = postgres(url, {
    prepare: false,
    max: process.env.NODE_ENV === "production" ? 1 : 10,
    ssl: isLocalDatabaseUrl(url) ? false : "require",
  });

  return drizzle({ client, schema });
}

export function getDb(): Database {
  store.fixmasterDb ??= createDb();
  return store.fixmasterDb;
}
