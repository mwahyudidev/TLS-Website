// Money is stored in cents (integer). Default currency: SGD.
const DEFAULT_CURRENCY = "SGD";
const DEFAULT_LOCALE = "en-SG";

export function formatMoney(
  cents: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatDate(
  input: number | Date | string,
  opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  const d =
    typeof input === "number"
      ? new Date(input * 1000)
      : input instanceof Date
        ? input
        : new Date(input);
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, opts).format(d);
}

export function formatDateTime(input: number | Date | string): string {
  return formatDate(input, { dateStyle: "medium", timeStyle: "short" });
}

export function relativeTime(input: number | Date | string): string {
  const d =
    typeof input === "number"
      ? new Date(input * 1000)
      : input instanceof Date
        ? input
        : new Date(input);
  const diffSec = Math.round((d.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, { numeric: "auto" });
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 2592000) return rtf.format(Math.round(diffSec / 86400), "day");
  if (abs < 31536000) return rtf.format(Math.round(diffSec / 2592000), "month");
  return rtf.format(Math.round(diffSec / 31536000), "year");
}
