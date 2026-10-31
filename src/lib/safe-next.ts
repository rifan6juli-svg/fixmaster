const BASE = "http://fixmaster.invalid";

/**
 * Keeps ?next= on this site (AFD section 5). Parsed as a URL rather than matched
 * by prefix because browsers treat "/\evil.com" and "/<tab>/evil.com" as "//evil.com".
 */
export function safeNextPath(next: string | null, fallback = "/dashboard") {
  if (!next?.startsWith("/")) {
    return fallback;
  }
  try {
    const url = new URL(next, BASE);
    return url.origin === BASE
      ? `${url.pathname}${url.search}${url.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
