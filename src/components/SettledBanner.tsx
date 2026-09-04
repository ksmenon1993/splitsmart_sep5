import { useEffect } from 'react'
import { burstConfetti, hasCelebrated, markCelebrated } from '../lib/celebrate'
import { formatCents } from '../lib/money'

export default function SettledBanner({
  groupId,
  totalCents,
}: {
  groupId: string
  totalCents: number
}) {
  useEffect(() => {
    if (hasCelebrated(groupId)) return
    markCelebrated(groupId)
    return burstConfetti()
  }, [groupId])

  return (
    <div
      role="status"
      className="settled-pop rounded-2xl border-2 border-emerald-500/70 bg-emerald-50 px-5 py-7 text-center dark:border-emerald-500/40 dark:bg-emerald-500/10"
    >
      <svg
        viewBox="0 0 24 24"
        className="mx-auto size-12 text-emerald-600 dark:text-emerald-400"
        role="presentation"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="m7.5 12.4 3 3 6-6.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">
        All settled!
      </p>
      <p className="mx-auto mt-2 max-w-xs text-pretty text-stone-600 dark:text-stone-400">
        {formatCents(totalCents)} sorted out and nobody owes a rupee. Nicely
        done — that's the hard part over.
      </p>
    </div>
  )
}
