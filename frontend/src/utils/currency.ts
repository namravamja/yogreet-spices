"use client";

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  in: "INR",
  india: "INR",
  us: "USD",
  usa: "USD",
  "united states": "USD",
  gb: "GBP",
  uk: "GBP",
  "united kingdom": "GBP",
  ca: "CAD",
  canada: "CAD",
  au: "AUD",
  australia: "AUD",
  eu: "EUR",
  fr: "EUR",
  de: "EUR",
  it: "EUR",
  es: "EUR",
  nl: "EUR",
};

export function mapCountryToCurrency(country?: string): string {
  if (!country) return "INR";
  const key = country.trim().toLowerCase();
  return COUNTRY_TO_CURRENCY[key] || "INR";
}

export function defaultCurrency(): string {
  try {
    const lang = typeof navigator !== "undefined" ? navigator.language : "en-IN";
    if (lang.toLowerCase().includes("en-in") || lang.toLowerCase().endsWith("-in")) return "INR";
    if (lang.toLowerCase().includes("en-us") || lang.toLowerCase().endsWith("-us")) return "USD";
    if (lang.toLowerCase().includes("en-gb") || lang.toLowerCase().endsWith("-gb")) return "GBP";
  } catch {}
  return "INR";
}

export function formatCurrency(amount: number, currency?: string, locale?: string): string {
  const curr = currency || defaultCurrency();
  const loc =
    locale ||
    (curr === "INR" ? "en-IN" : curr === "GBP" ? "en-GB" : curr === "EUR" ? "de-DE" : "en-US");
  try {
    return new Intl.NumberFormat(loc, { style: "currency", currency: curr }).format(amount);
  } catch {
    const symbol = curr === "INR" ? "₹" : curr === "GBP" ? "£" : curr === "EUR" ? "€" : "₹";
    return `${symbol}${amount.toFixed(2)}`;
  }
}
