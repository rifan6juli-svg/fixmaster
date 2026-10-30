import { describe, expect, it } from "vitest";
import { assertLocalDatabaseUrl, isLocalDatabaseUrl } from "@/server/db/url";

describe("isLocalDatabaseUrl", () => {
  it.each([
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    "postgresql://postgres:postgres@localhost:54322/postgres",
    "postgresql://postgres:postgres@[::1]:54322/postgres",
  ])("accepts %s", (url) => {
    expect(isLocalDatabaseUrl(url)).toBe(true);
  });

  it.each([
    "postgresql://postgres.ref:pw@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres",
    "postgresql://postgres:pw@db.ref.supabase.co:5432/postgres",
    "postgresql://postgres:pw@127.0.0.1.example.com:5432/postgres",
    "postgresql://postgres:pw@localhost.example.com:5432/postgres",
    "not a url",
  ])("rejects %s", (url) => {
    expect(isLocalDatabaseUrl(url)).toBe(false);
  });
});

describe("assertLocalDatabaseUrl", () => {
  it("throws for a hosted database", () => {
    expect(() =>
      assertLocalDatabaseUrl(
        "postgresql://postgres:pw@db.ref.supabase.co:5432/postgres",
      ),
    ).toThrow("non-local");
  });
});
