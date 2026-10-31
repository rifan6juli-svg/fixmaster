// docs/DBD.md section 3: every paginated list shows 25 rows.
export const PAGE_SIZE = 25;

/** Reads ?page= from the URL, where any value can appear. */
export function parsePage(value: string | string[] | undefined) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
