// 62 + an 8-12 digit national number. Not limited to mobile prefixes because a
// shop's WhatsApp Business number can be a landline.
const INDONESIAN_PHONE = /^62[2-9]\d{7,11}$/;

/** Normalizes an Indonesian WhatsApp number to 62xxxxxxxxx, or null if invalid. */
export function normalizePhoneWa(input: string) {
  const digits = input
    .trim()
    .replace(/^\+/, "")
    .replace(/[\s().-]/g, "");
  const phone = digits.replace(/^0/, "62").replace(/^8/, "628");
  return INDONESIAN_PHONE.test(phone) ? phone : null;
}
