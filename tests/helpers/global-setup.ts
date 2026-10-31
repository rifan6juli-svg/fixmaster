import {
  dropTestTemplate,
  prepareTestTemplate,
  requireLocalSupabase,
  testDatabaseUrl,
} from "./test-db";

export default async function setup() {
  // Vite's module runner crashes while source-mapping stacks here (it receives
  // module code as a Buffer), which replaces every error below with a TypeError.
  Reflect.deleteProperty(Error, "prepareStackTrace");

  const url = testDatabaseUrl();
  await requireLocalSupabase(() => prepareTestTemplate(url));

  return () => dropTestTemplate(url);
}
