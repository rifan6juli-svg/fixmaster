/** A failure the user can act on; codes are listed in docs/BSD.md section 6. */
export class AppError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}
