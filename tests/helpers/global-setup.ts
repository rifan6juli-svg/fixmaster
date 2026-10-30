import {
  dropTestTemplate,
  prepareTestTemplate,
  testDatabaseUrl,
} from "./test-db";

export default async function setup() {
  // Vite's module runner crashes while source-mapping stacks here (it receives
  // module code as a Buffer), which replaces every error below with a TypeError.
  Reflect.deleteProperty(Error, "prepareStackTrace");

  const url = testDatabaseUrl();

  try {
    await prepareTestTemplate(url);
  } catch (error) {
    if ((error as { code?: string }).code === "ECONNREFUSED") {
      throw new Error(
        "Local Supabase is not reachable. Start Docker Desktop, then run pnpm db:start.",
      );
    }
    throw error;
  }

  return () => dropTestTemplate(url);
}
