// docs/BSD.md section 6. Types only, so Client Components can import them.
export interface ActionError {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export type ActionResult<T> =
  { ok: true; data: T } | { ok: false; error: ActionError };
