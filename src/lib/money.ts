// Money is integer Rupiah everywhere (docs/TRD.md section 4).
const groupFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

/** 150000 -> "150.000" */
export function formatAmount(amount: number) {
  return groupFormatter.format(amount);
}

/** 150000 -> "Rp 150.000" */
export function formatRupiah(amount: number) {
  return `Rp ${formatAmount(amount)}`;
}

/** Keeps digits only: "Rp 1.250.000" -> 1250000; no digits -> null. */
export function parseRupiahInput(text: string): number | null {
  const digits = text.replace(/\D/g, "").slice(0, 15);
  return digits === "" ? null : Number(digits);
}
