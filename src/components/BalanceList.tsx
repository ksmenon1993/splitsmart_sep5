import type { MemberBalance, Settlement } from '../lib/balances'
import { formatAbsCents } from '../lib/money'
import Avatar from './Avatar'

function BalanceRow({ balance }: { balance: MemberBalance }) {
  const { balanceCents } = balance
  const settled = balanceCents === 0
  const owed = balanceCents > 0

  return (
    <li className="flex items-center gap-3 px-4 py-4">
      <Avatar name={balance.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{balance.name}</p>
        <p className="truncate text-xs text-stone-500">
          {settled ? 'square' : owed ? 'gets back' : 'owes'}
        </p>
      </div>
      <span
        className={`shrink-0 text-2xl font-bold tabular-nums tracking-tight ${
          settled
            ? 'text-stone-400'
            : owed
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
        }`}
      >
        {settled ? '—' : formatAbsCents(balanceCents)}
      </span>
    </li>
  )
}

export default function BalanceList({
  balances,
  settlements,
}: {
  balances: MemberBalance[]
  settlements: Settlement[]
}) {
  // Biggest creditor first, biggest debtor last, so the extremes are the
  // first and last things read.
  const ordered = [...balances].sort(
    (a, b) => b.balanceCents - a.balanceCents || a.name.localeCompare(b.name),
  )

  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Balances
        </h2>
        <ul className="mt-2.5 divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900">
          {ordered.map((balance) => (
            <BalanceRow key={balance.memberId} balance={balance} />
          ))}
        </ul>
      </section>

      {settlements.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Settle up
          </h2>
          <>
            <p className="mt-0.5 text-xs text-stone-500">
              {settlements.length}{' '}
              {settlements.length === 1 ? 'payment clears' : 'payments clear'}{' '}
              everything.
            </p>
            <ul className="mt-2.5 space-y-2">
              {settlements.map((s) => (
                <li
                  key={`${s.fromName}-${s.toName}`}
                  className="flex items-center gap-3 rounded-2xl border-2 border-mint-500/70 bg-mint-50 px-4 py-3.5 dark:border-mint-700/50 dark:bg-mint-700/10"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base">
                      <span className="font-semibold">{s.fromName}</span>
                      <span className="text-stone-500"> pays </span>
                      <span className="font-semibold">{s.toName}</span>
                    </p>
                  </div>
                  <span className="shrink-0 text-2xl font-bold tabular-nums tracking-tight text-mint-700 dark:text-mint-300">
                    {formatAbsCents(s.amountCents)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        </section>
      )}
    </div>
  )
}
