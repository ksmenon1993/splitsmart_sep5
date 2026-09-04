import { splitEqually } from './money'
import type { Expense, ExpenseSplit, Group, Member } from './supabase'

/**
 * A self-contained sample group. Nothing here touches Supabase - the demo
 * is purely in memory, so it opens instantly and leaves no rows behind.
 * Ids are obviously fake so demo data can never be mistaken for real rows.
 */

const GROUP_ID = 'demo-group'
const at = (minutes: number) =>
  new Date(Date.UTC(2026, 6, 4, 12, minutes)).toISOString()

export const demoGroup: Group = {
  id: GROUP_ID,
  name: 'Goa weekend',
  created_at: at(0),
}

export const demoMembers: Member[] = [
  { id: 'demo-ana', group_id: GROUP_ID, name: 'Ana', created_at: at(1) },
  { id: 'demo-ben', group_id: GROUP_ID, name: 'Ben', created_at: at(2) },
  { id: 'demo-priya', group_id: GROUP_ID, name: 'Priya', created_at: at(3) },
  { id: 'demo-tom', group_id: GROUP_ID, name: 'Tom', created_at: at(4) },
]

type Seed = { id: string; paidBy: string; amount: number; what: string }

const seeds: Seed[] = [
  { id: 'demo-e1', paidBy: 'demo-ana', amount: 1800000, what: 'Beach house' },
  { id: 'demo-e2', paidBy: 'demo-ben', amount: 284750, what: 'Groceries' },
  { id: 'demo-e3', paidBy: 'demo-priya', amount: 640000, what: 'Seafood dinner' },
  { id: 'demo-e4', paidBy: 'demo-tom', amount: 125000, what: 'Cabs and tolls' },
]

export const demoExpenses: Expense[] = seeds.map((seed, index) => ({
  id: seed.id,
  group_id: GROUP_ID,
  paid_by: seed.paidBy,
  amount_cents: seed.amount,
  description: seed.what,
  created_at: at(10 + index),
}))

// Every sample expense is split evenly across all four people. Groceries
// is Rs 2,847.50, which doesn't divide by 4 - so this also shows the
// leftover paise landing on someone rather than vanishing.
export const demoSplits: ExpenseSplit[] = seeds.flatMap((seed) => {
  const shares = splitEqually(seed.amount, demoMembers.length)
  return demoMembers.map((member, index) => ({
    expense_id: seed.id,
    member_id: member.id,
    share_cents: shares[index],
  }))
})
