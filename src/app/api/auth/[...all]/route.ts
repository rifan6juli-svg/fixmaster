import { getAuth } from "@/server/auth/auth";

// Not toNextJsHandler(getAuth()): that builds the auth instance at import time,
// and `next build` has neither its database nor its secret.
export function GET(request: Request) {
  return getAuth().handler(request);
}

export function POST(request: Request) {
  return getAuth().handler(request);
}
