import type { Expense, ExpenseSplit, Member } from './supabase'

export type MemberBalance = {
  memberId: string
  name: string
  totalPaidCents: number
  totalShareCents: number
  balanceCents: number
}

/**
 * The same arithmetic as the `balances` view in Postgres: what a person
 * paid out, minus the shares they owe. Positive means the group owes them.
 */
export function computeBalances(
  members: Member[],
  expenses: Expense[],
  splits: ExpenseSplit[],
): MemberBalance[] {
  const paid = new Map<string, number>()
  for (const expense of expenses) {
    paid.set(expense.paid_by, (paid.get(expense.paid_by) ?? 0) + expense.amount_cents)
  }

  const owed = new Map<string, number>()
  for (const split of splits) {
    owed.set(split.member_id, (owed.get(split.member_id) ?? 0) + split.share_cents)
  }

  return members.map((member) => {
    const totalPaidCents = paid.get(member.id) ?? 0
    const totalShareCents = owed.get(member.id) ?? 0
    return {
      memberId: member.id,
      name: member.name,
      totalPaidCents,
      totalShareCents,
      balanceCents: totalPaidCents - totalShareCents,
    }
  })
}

export type Settlement = {
  fromName: string
  toName: string
  amountCents: number
}

/**
 * Turns net balances into the shortest list of payments that clears them:
 * repeatedly send the biggest debt to the biggest credit.
 */
export function settleUp(balances: MemberBalance[]): Settlement[] {
  const debtors = balances
    .filter((b) => b.balanceCents < 0)
    .map((b) => ({ name: b.name, remaining: -b.balanceCents }))
    .sort((a, b) => b.remaining - a.remaining)

  const creditors = balances
    .filter((b) => b.balanceCents > 0)
    .map((b) => ({ name: b.name, remaining: b.balanceCents }))
    .sort((a, b) => b.remaining - a.remaining)

  const payments: Settlement[] = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const amountCents = Math.min(debtors[i].remaining, creditors[j].remaining)
    payments.push({
      fromName: debtors[i].name,
      toName: creditors[j].name,
      amountCents,
    })
    debtors[i].remaining -= amountCents
    creditors[j].remaining -= amountCents
    if (debtors[i].remaining === 0) i += 1
    if (creditors[j].remaining === 0) j += 1
  }
  return payments
}
