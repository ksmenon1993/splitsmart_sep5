import { useState } from 'react'
import { createGroup, errorMessage } from '../lib/api'
import type { Group } from '../lib/supabase'

export default function CreateGroup({
  onCreated,
  onTryDemo,
}: {
  onCreated: (group: Group) => void
  onTryDemo: () => void
}) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmed = name.trim()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!trimmed || saving) return
    setSaving(true)
    setError(null)
    try {
      onCreated(await createGroup(trimmed))
    } catch (err) {
      setError(errorMessage(err))
      setSaving(false)
    }
  }

  return (
    <div className="text-center">
      <svg
        viewBox="0 0 200 140"
        className="mx-auto h-28 w-auto"
        role="presentation"
        aria-hidden="true"
      >
        <path
          d="M62 24h56a6 6 0 0 1 6 6v78l-9-5-9 5-9-5-9 5-9-5-9 5-9-5-9 5V30a6 6 0 0 1 6-6Z"
          className="fill-white stroke-stone-300 dark:fill-stone-900 dark:stroke-stone-700"
          strokeWidth="2"
        />
        <g
          className="stroke-stone-300 dark:stroke-stone-700"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M70 44h40M70 56h40M70 68h24" />
        </g>
        <g
          className="stroke-mint-500"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M124 62h22a8 8 0 0 1 8 8v18" />
          <path d="m148 82 6 7 6-7" />
          <path d="M62 62H40a8 8 0 0 0-8 8v18" />
          <path d="m26 82 6 7 6-7" />
        </g>
        <circle
          cx="32"
          cy="104"
          r="11"
          className="fill-mint-100 stroke-mint-500 dark:fill-mint-700/30"
          strokeWidth="2.5"
        />
        <circle
          cx="154"
          cy="104"
          r="11"
          className="fill-mint-100 stroke-mint-500 dark:fill-mint-700/30"
          strokeWidth="2.5"
        />
      </svg>

      <h1 className="mt-6 text-xl font-semibold tracking-tight text-balance">
        Start a group
      </h1>
      <p className="mx-auto mt-2 max-w-xs text-pretty text-stone-600 dark:text-stone-400">
        Name it something everyone will recognise — a trip, a flat, a dinner.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 text-left">
        <label
          htmlFor="group-name"
          className="block text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          Group name
        </label>
        <input
          id="group-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Lisbon trip"
          autoFocus
          maxLength={80}
          className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 placeholder:text-stone-400 focus:border-mint-500 focus:outline-2 focus:outline-offset-0 focus:outline-mint-500/40 dark:border-stone-700 dark:bg-stone-900 dark:placeholder:text-stone-600"
        />
        <button
          type="submit"
          disabled={!trimmed || saving}
          className="mt-4 w-full rounded-xl bg-mint-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-mint-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
        >
          {saving ? 'Creating…' : 'Create group'}
        </button>
        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300"
          >
            {error}
          </p>
        )}
      </form>

      <div className="mt-7 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
        <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
          or
        </span>
        <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
      </div>

      <button
        type="button"
        onClick={onTryDemo}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-mint-500 bg-mint-50 px-5 py-3 font-semibold text-mint-700 transition hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-600 active:scale-[0.99] dark:bg-mint-700/15 dark:text-mint-300 dark:hover:bg-mint-700/25"
      >
        <svg
          viewBox="0 0 20 20"
          className="size-5 shrink-0"
          role="presentation"
          aria-hidden="true"
        >
          <path
            d="M10 2.5 11.6 7l4.9.2-3.8 3 1.3 4.7L10 12.4 6 14.9l1.3-4.7-3.8-3L8.4 7z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        See how it works
      </button>
      <p className="mt-2 text-center text-xs text-stone-500">
        Opens a sample group with expenses already split — nothing is saved.
      </p>
    </div>
  )
}
