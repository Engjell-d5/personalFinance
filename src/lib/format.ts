import { CURRENCY, LOCALE } from "./constants";

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
});

const compactFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  return compactFormatter.format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(LOCALE, {
    day: "2-digit",
    month: "short",
  });
}
