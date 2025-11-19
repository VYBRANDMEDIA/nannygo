/**
 * Stripe Products Configuration
 * 
 * NannyGo subscription model:
 * - Parents: Free (no subscription needed)
 * - Nannies: €9.95/month with 2-month free trial
 * - Nannies must have active subscription to be visible to parents
 */

/**
 * Nanny Subscription Product
 * Price: €9.95/month
 * Trial: 2 months free
 */
export const NANNY_SUBSCRIPTION = {
  name: 'NannyGo Nanny Abonnement',
  description: 'Maandelijks abonnement voor nannies om zichtbaar te zijn voor ouders',
  priceAmount: 995, // €9.95 in cents
  currency: 'eur',
  interval: 'month' as const,
  trialPeriodDays: 60, // 2 months = 60 days
};

/**
 * Format amount in cents to display currency
 */
export function formatAmount(amountInCents: number): string {
  return `€${(amountInCents / 100).toFixed(2)}`;
}
