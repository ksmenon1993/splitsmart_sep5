import { useEffect, useRef, useState } from 'react'
import type { Settlement } from '../lib/balances'
import { formatCents } from '../lib/money'
import { composeNudge } from '../lib/nudge'

type Result = 'idle' | 'shared' | 'copied' | 'manual'

export default function NudgeCard({
  groupName,
  owedCents,
  settlements,
  shareUrl,
}: {
  groupName: string
  owedCents: number
  settlements: Settlement[]
  shareUrl: string
}) {
  const [result, setResult] = useState<Result>('idle')
  const textRef = useRef<HTMLTextAreaElement>(null)

  const message = composeNudge({
    groupName,
    owedCents,
    settlements,
    url: shareUrl,
  })

  useEffect(() => {
    if (result !== 'copied' && result !== 'shared') return
    const timer = setTimeout(() => setResult('idle'), 2400)
    return () => clearTimeout(timer)
  }, [result])

  async function handleNudge() {
    // The share sheet is the only real "send" available: no accounts, so no
    // addresses to send to. It hands the message to whatever the group
    // already uses.
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: message })
        setResult('shared')
        return
      } catch (err) {
        // Dismissing the sheet is a choice, not a failure.
        if (err instanceof Error && err.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(message)
      setResult('copied')
    } catch {
      // Clipboard needs a secure context, which http://<lan-ip> isn't.
      setResult('manual')
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-start gap-3">
        <svg
          viewBox="0 0 24 24"
          className="mt-0.5 size-6 shrink-0 text-mint-600 dark:text-mint-400"
          role="presentation"
          aria-hidden="true"
        >
          <path
            d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9.8L6 19.4c-.7.6-1.7.1-1.7-.8V6.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M9 10.2h6M9 13h3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>

        <div className="min-w-0 flex-1">
          <p className="font-semibold tabular-nums">
            {formatCents(owedCents)} still to sort out
          </p>
          <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-400">
            Want to nudge the group? It shares a friendly summary and the
            link — no pressure, no names called out.
          </p>

          <button
            type="button"
            onClick={handleNudge}
            className="mt-3 rounded-xl border-2 border-mint-500 bg-mint-50 px-4 py-2 text-sm font-semibold text-mint-700 transition hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-600 active:scale-[0.99] dark:bg-mint-700/15 dark:text-mint-300 dark:hover:bg-mint-700/25"
          >
            {result === 'shared'
              ? 'Sent 🎉'
              : result === 'copied'
                ? 'Copied — paste it anywhere'
                : 'Nudge the group'}
          </button>

          {result === 'manual' && (
            <div className="mt-3">
              <label
                htmlFor="nudge-message"
                className="block text-xs text-stone-500"
              >
                Copy this and send it however you like:
              </label>
              <textarea
                id="nudge-message"
                ref={textRef}
                readOnly
                rows={5}
                value={message}
                onFocus={(e) => e.target.select()}
                className="mt-1 w-full resize-none rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-400"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
