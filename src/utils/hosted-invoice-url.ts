/**
 * Trusted Stripe hosted-invoice URL checks (client + server safe).
 * Never invents URLs — only validates persisted values.
 */

const TRUSTED_HOSTS = new Set([
  "invoice.stripe.com",
  "pay.stripe.com",
]);

export function isTrustedHostedInvoiceUrl(
  value: string | null | undefined,
): boolean {
  if (value == null) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return false;
    if (url.username || url.password) return false;
    return TRUSTED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}
