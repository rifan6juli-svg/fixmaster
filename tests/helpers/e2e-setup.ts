import { execSync } from "node:child_process";
import {
  e2eDatabaseUrl,
  recreateE2eDatabase,
  requireLocalSupabase,
  testDatabaseUrl,
} from "./test-db";

// Playwright runs this after webServer has started, which is safe: the app
// opens its database connection on the first request that needs one.
export default async function setup() {
  const url = testDatabaseUrl();
  await requireLocalSupabase(() => recreateE2eDatabase(url));

  execSync("pnpm db:seed", {
    env: { ...process.env, DATABASE_URL: e2eDatabaseUrl(url) },
    stdio: "inherit",
  });
}
