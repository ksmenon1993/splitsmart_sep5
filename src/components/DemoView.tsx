import { computeBalances, settleUp } from '../lib/balances'
import {
  demoExpenses,
  demoGroup,
  demoMembers,
  demoSplits,
} from '../lib/demo'
import AvatarStack from './AvatarStack'
import BalanceList from './BalanceList'
import ExpenseList from './ExpenseList'
import MemberList from './MemberList'

// Derived from the sample rows with the same arithmetic the database uses,
// rather than written out by hand.
const balances = computeBalances(demoMembers, demoExpenses, demoSplits)
const settlements = settleUp(balances)

export default function DemoView({ onExit }: { onExit: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-300/70 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
        <svg
          viewBox="0 0 20 20"
          className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400"
          role="presentation"
          aria-hidden="true"
        >
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M10 6.5v4.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="10" cy="13.7" r="1" fill="currentColor" />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            This is sample data
          </p>
          <p className="mt-0.5 text-sm text-amber-800/90 dark:text-amber-200/80">
            Nothing here is saved. Clear it whenever you're ready to start your
            own group.
          </p>
          <button
            type="button"
            onClick={onExit}
            className="mt-2.5 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            Clear demo and start my own
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {demoGroup.name}
        </h1>
        <div className="mt-3">
          <AvatarStack members={demoMembers} />
        </div>
      </div>

      <BalanceList balances={balances} settlements={settlements} />

      <ExpenseList expenses={demoExpenses} members={demoMembers} />

      <section>
        <h2 className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Who's in
        </h2>
        <div className="mt-2.5">
          <MemberList members={demoMembers} />
        </div>
      </section>

      <button
        type="button"
        onClick={onExit}
        className="w-full rounded-xl bg-mint-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-mint-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-600 active:scale-[0.99]"
      >
        Start my own group
      </button>
    </div>
  )
}
