import { getAuth } from "@/server/auth/auth";

let lastOctet = 0;

/** A new client IP, so one test's attempts never count against another's. */
export function uniqueIp() {
  lastOctet += 1;
  return `203.0.113.${lastOctet}`;
}

/** Calls the /api/auth route the way a browser does, rate limiter included. */
export function callAuth(
  path: string,
  { body, headers }: { body?: object; headers?: Record<string, string> } = {},
) {
  const baseUrl = process.env.BETTER_AUTH_URL;
  return getAuth().handler(
    new Request(`${baseUrl}/api/auth${path}`, {
      method: body ? "POST" : "GET",
      headers: {
        "content-type": "application/json",
        origin: baseUrl!,
        "x-forwarded-for": uniqueIp(),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    }),
  );
}

/** Signs in and returns the response plus the cookie header for later requests. */
export async function signIn(email: string, password: string, ip = uniqueIp()) {
  const response = await callAuth("/sign-in/email", {
    body: { email, password },
    headers: { "x-forwarded-for": ip },
  });
  const cookie = response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  return { response, cookie };
}
