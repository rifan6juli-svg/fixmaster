interface LogFields {
  tenantId?: string;
  userId?: string;
  error?: unknown;
}

// Name and code only: Drizzle puts query parameters in error messages, and
// those can hold personal data (docs/BSD.md section 8).
function describeError(error: unknown) {
  if (!(error instanceof Error)) {
    return { name: typeof error };
  }
  const { code } = (error.cause ?? error) as { code?: unknown };
  return { name: error.name, code };
}

export const logger = {
  error(message: string, { error, ...fields }: LogFields = {}) {
    const entry = {
      level: "error",
      message,
      ...fields,
      ...(error === undefined ? {} : { error: describeError(error) }),
    };
    process.stdout.write(`${JSON.stringify(entry)}\n`);
  },
};
