/**
 * Every price an agent sees is their contract net rate, never our selling price.
 * Formatting and labelling it lives here so the two portal pages can't drift apart
 * and accidentally present a net rate as a public one.
 */

export const NET_RATE_NOTE =
  "Prices shown are your contract net rate, per person. They are not our public selling price.";

export function formatNetRate(amount, currency = "THB") {
  if (amount === null || amount === undefined) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
