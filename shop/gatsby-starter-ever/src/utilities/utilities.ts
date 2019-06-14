/**
 * Formats a Vendure price (an integer) into a localised dollar-cents format.
 * @param currency
 * @param value
 */
export function formatPrice(currency: string, value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  }).format(value / 100);
}
