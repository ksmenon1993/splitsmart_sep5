import type { MemberBalance } from './balances'
import { supabase, type Expense, type Group, type Member } from './supabase'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isGroupId(value: string): boolean {
  return UUID_RE.test(value)
}

export async function createGroup(name: string): Promise<Group> {
  const { data, error } = await supabase
    .from('groups')
    .insert({ name })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Returns null when no group with this id exists. */
export async function fetchGroup(id: string): Promise<Group | null> {
  if (!isGroupId(id)) return null
  const { data, error } = await supabase
    .from('groups')
    .select()
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function fetchMembers(groupId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select()
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function addMember(
  groupId: string,
  name: string,
): Promise<Member> {
  const { data, error } = await supabase
    .from('members')
    .insert({ group_id: groupId, name })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchExpenses(groupId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select()
    .eq('group_id', groupId)
    // id breaks ties so two expenses saved in the same millisecond keep a
    // stable order between renders.
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
  if (error) throw error
  return data
}

/**
 * Writes the expense and one split row per member in a single transaction
 * (see the add_expense function), so balances can never see a half-written
 * expense. The equal split is computed server-side.
 */
export async function addExpense(
  groupId: string,
  paidBy: string,
  amountCents: number,
  description: string,
): Promise<Expense> {
  const { data, error } = await supabase.rpc('add_expense', {
    p_group_id: groupId,
    p_paid_by: paidBy,
    p_amount_cents: amountCents,
    p_description: description,
  })
  if (error) throw error
  return data
}

/**
 * Reads net balances straight from the `balances` view, so the numbers on
 * screen are the database's arithmetic rather than a second implementation.
 * The view's columns are nullable (it left-joins), so rows missing an
 * identity are dropped rather than coerced.
 */
export async function fetchBalances(
  groupId: string,
): Promise<MemberBalance[]> {
  const { data, error } = await supabase
    .from('balances')
    .select()
    .eq('group_id', groupId)
  if (error) throw error
  return data.flatMap((row) =>
    row.member_id && row.name
      ? [
          {
            memberId: row.member_id,
            name: row.name,
            totalPaidCents: row.total_paid_cents ?? 0,
            totalShareCents: row.total_share_cents ?? 0,
            balanceCents: row.balance_cents ?? 0,
          },
        ]
      : [],
  )
}

/** Turns a Postgres/PostgREST error into something worth showing a person. */
export function errorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as { code?: string; message?: string }
    // unique_violation on members (group_id, name)
    if (e.code === '23505') return 'Someone with that name is already here.'
    if (e.message) return e.message
  }
  return 'Something went wrong. Please try again.'
}
