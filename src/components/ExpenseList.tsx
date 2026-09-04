import { formatCents } from '../lib/money'
import type { Expense, Member } from '../lib/supabase'
import { relativeTime } from '../lib/time'
import Avatar from './Avatar'

export default function ExpenseList({
  expenses,
  members,
  meId,
}: {
  expenses: Expense[]
  members: Member[]
  meId?: string | null
}) {
  const nameOf = new Map(members.map((m) => [m.id, m.name]))
  const indexOf = new Map(members.map((m, i) => [m.id, i]))
  const total = expenses.reduce((sum, e) => sum + e.amount_cents, 0)

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Expenses
        </h2>
        <span className="text-sm tabular-nums text-stone-500">
          {formatCents(total)} total
        </span>
      </div>

      <ul className="mt-2.5 divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900">
        {expenses.map((expense) => {
          const payer = nameOf.get(expense.paid_by) ?? 'Someone'
          const isMe = expense.paid_by === meId
          const when = relativeTime(expense.created_at)
          return (
            <li key={expense.id} className="flex items-center gap-3 px-4 py-3.5">
              <Avatar
                name={payer}
                index={indexOf.get(expense.paid_by)}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{expense.description}</p>
                <p className="truncate text-xs text-stone-500">
                  <span className="font-medium text-stone-600 dark:text-stone-400">
                    {isMe ? 'You' : payer}
                  </span>{' '}
                  paid{when && ` · ${when}`}
                </p>
              </div>
              <span className="shrink-0 tabular-nums font-semibold">
                {formatCents(expense.amount_cents)}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
