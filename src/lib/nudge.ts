import type { MemberBalance, Settlement } from './balances'
import { formatCents } from './money'

/** What's still outstanding: the sum of everything owed to people. */
export function totalOwedCents(balances: MemberBalance[]): number {
  return balances.reduce(
    (sum, b) => (b.balanceCents > 0 ? sum + b.balanceCents : sum),
    0,
  )
}

/**
 * A reminder someone would actually be happy to receive: what's left, the
 * shortest way to clear it, and an explicit "no rush". No one is singled
 * out as late, and nothing is phrased as a demand.
 */
export function composeNudge({
  groupName,
  owedCents,
  settlements,
  url,
}: {
  groupName: string
  owedCents: number
  settlements: Settlement[]
  url: string
}): string {
  const lines = [
    `Hey! We're still squaring up ${groupName} — ${formatCents(owedCents)} left to sort out.`,
  ]

  if (settlements.length > 0) {
    lines.push('', 'Quickest way to finish it off:')
    for (const s of settlements) {
      lines.push(`• ${s.fromName} pays ${s.toName} ${formatCents(s.amountCents)}`)
    }
  }

  lines.push('', `No rush at all — the full breakdown is here: ${url}`)
  return lines.join('\n')
}
