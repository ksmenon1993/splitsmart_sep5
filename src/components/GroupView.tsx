import { useEffect, useState } from 'react'
import { addMember, errorMessage } from '../lib/api'
import { settleUp, type MemberBalance } from '../lib/balances'
import { clearCelebrated } from '../lib/celebrate'
import { readMe, writeMe } from '../lib/me'
import { totalOwedCents } from '../lib/nudge'
import type { Expense, Group, Member } from '../lib/supabase'
import AddExpenseForm from './AddExpenseForm'
import AvatarStack from './AvatarStack'
import BalanceList from './BalanceList'
import NudgeCard from './NudgeCard'
import SettledBanner from './SettledBanner'
import ExpenseList from './ExpenseList'
import MemberList from './MemberList'
import ShareLink from './ShareLink'

export default function GroupView({
  group,
  members,
  expenses,
  balances,
  shareUrl,
  onMemberAdded,
  onExpenseAdded,
}: {
  group: Group
  members: Member[]
  expenses: Expense[]
  balances: MemberBalance[]
  shareUrl: string
  onMemberAdded: (member: Member) => void
  onExpenseAdded: (expense: Expense) => void
}) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmed = name.trim()

  // One source of truth for "you" across the form, member list and feed.
  const [meId, setMeId] = useState<string | null>(() => readMe(group.id))
  const me = members.find((m) => m.id === meId) ?? members[0]

  function chooseMe(memberId: string) {
    setMeId(memberId)
    writeMe(group.id, memberId)
  }

  const settlements = settleUp(balances)
  const spentCents = expenses.reduce((sum, e) => sum + e.amount_cents, 0)
  // Only a group that has actually spent something can be "settled" - a new
  // group with members and no expenses is at zero for a duller reason.
  const allSettled =
    expenses.length > 0 && balances.length > 0 && settlements.length === 0

  // Falling back out of balance re-arms the celebration for next time.
  useEffect(() => {
    if (!allSettled) clearCelebrated(group.id)
  }, [allSettled, group.id])

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault()
    if (!trimmed || saving) return
    setSaving(true)
    setError(null)
    try {
      onMemberAdded(await addMember(group.id, trimmed))
      setName('')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {group.name}
        </h1>
        <div className="mt-3">
          <AvatarStack members={members} />
        </div>
      </div>

      {expenses.length > 0 ? (
        <>
          {allSettled && (
            <SettledBanner groupId={group.id} totalCents={spentCents} />
          )}
          <BalanceList balances={balances} settlements={settlements} />
          {!allSettled && (
            <NudgeCard
              groupName={group.name}
              owedCents={totalOwedCents(balances)}
              settlements={settlements}
              shareUrl={shareUrl}
            />
          )}
        </>
      ) : (
        <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-500 dark:border-stone-700">
          Add an expense and the balances show up here.
        </p>
      )}

      <section>
        <h2 className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Add an expense
        </h2>
        <div className="mt-2.5">
          <AddExpenseForm
            groupId={group.id}
            members={members}
            meId={me?.id ?? null}
            onMeChange={chooseMe}
            onAdded={onExpenseAdded}
          />
        </div>
      </section>

      {expenses.length > 0 && (
        <ExpenseList
          expenses={expenses}
          members={members}
          meId={me?.id ?? null}
        />
      )}

      <section>
        <h2 className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Who's in
        </h2>

        {members.length > 0 && (
          <div className="mt-2.5">
            <MemberList members={members} meId={me?.id ?? null} />
          </div>
        )}

        <form onSubmit={handleAdd} className="mt-3 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add a name"
            aria-label="Member name"
            maxLength={80}
            className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 placeholder:text-stone-400 focus:border-mint-500 focus:outline-2 focus:outline-offset-0 focus:outline-mint-500/40 dark:border-stone-700 dark:bg-stone-900 dark:placeholder:text-stone-600"
          />
          <button
            type="submit"
            disabled={!trimmed || saving}
            className="shrink-0 rounded-xl bg-mint-600 px-5 font-medium text-white shadow-sm transition hover:bg-mint-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
          >
            {saving ? '…' : 'Add'}
          </button>
        </form>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300"
          >
            {error}
          </p>
        )}
      </section>

      <ShareLink url={shareUrl} />
    </div>
  )
}
