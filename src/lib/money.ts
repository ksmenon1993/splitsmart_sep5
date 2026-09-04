// en-IN gives rupee grouping (1,23,456.00) as well as the symbol.
// Change these two values to move the whole app to another currency.
const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
})

export function formatCents(cents: number): string {
  return currency.format(cents / 100)
}

/** Absolute value, for "owes X" / "gets back X" phrasing. */
export function formatAbsCents(cents: number): string {
  return currency.format(Math.abs(cents) / 100)
}

/**
 * Splits an amount evenly, handing the leftover pennies to the first few
 * members so the shares always add back up to the total.
 */
export function splitEqually(amountCents: number, count: number): number[] {
  const base = Math.floor(amountCents / count)
  const remainder = amountCents - base * count
  return Array.from({ length: count }, (_, i) =>
    i < remainder ? base + 1 : base,
  )
}

/**
 * Parses a typed amount like "12", "12.5" or "12.34" into whole cents.
 * Works on the digits directly rather than via parseFloat, so values such
 * as 19.99 can't drift to 1998 through binary floating point.
 * Returns null when the text isn't a usable amount.
 */
export function parseAmountToCents(input: string): number | null {
  const text = input
    .trim()
    .replace(/^(?:\u20b9|Rs\.?|\$)\s*/i, '')
    .replace(/,/g, '')
  const match = /^(\d*)(?:\.(\d{0,2}))?$/.exec(text)
  if (!match) return null

  const whole = match[1] ?? ''
  const frac = match[2] ?? ''
  if (whole === '' && frac === '') return null

  const cents =
    Number(whole || '0') * 100 + Number(frac.padEnd(2, '0') || '0')
  return cents > 0 ? cents : null
}
