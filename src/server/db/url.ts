const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function isLocalDatabaseUrl(url: string) {
  try {
    return LOCAL_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** Guards destructive tooling: tests, seed, and reset never touch a hosted project. */
export function assertLocalDatabaseUrl(url: string) {
  if (!isLocalDatabaseUrl(url)) {
    throw new Error("Refusing to run against a non-local database");
  }
}
