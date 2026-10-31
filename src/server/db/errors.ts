/** True when a Drizzle query failed on the named unique index or constraint. */
export function violatesConstraint(error: unknown, constraint: string) {
  const { cause } = error as { cause?: { constraint_name?: string } };
  return cause?.constraint_name === constraint;
}
