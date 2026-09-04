import { useEffect, useRef, useState } from 'react'
import { addExpense, errorMessage } from '../lib/api'
import { formatCents, parseAmountToCents, splitEqually } from '../lib/money'
import type { Expense, Member } from '../lib/supabase'

export default function AddExpenseForm({
  groupId,
  members,
  meId,
  onMeChange,
  onAdded,
}: {
  groupId: string
  members: Member[]
  meId: string | null
  onMeChange: (memberId: string) => void
  onAdded: (expense: Expense) => void
}) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [payerOverride, setPayerOverride] = useState<string | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const amountRef = useRef<HTMLInputElement>(null)

  // Whoever this device belongs to, owned by GroupView so the member list
  // and expense list agree with this form. Falls back to the first member,
  // who is usually the person who made the group.
  const me = members.find((m) => m.id === meId) ?? members[0]
  const payer = payerOverride ?? me?.id ?? ''
  const payerName = members.find((m) => m.id === payer)?.name ?? ''

  const amountCents = parseAmountToCents(amount)
  const canSubmit = amountCents !== null && Boolean(payer)

  // Ready to type without dragging the page away from the balances above.
  useEffect(() => {
    amountRef.current?.focus({ preventScroll: true })
  }, [])

  const shares =
    amountCents === null ? null : splitEqually(amountCents, members.length)
  const uneven = shares !== null && shares[0] !== shares[shares.length - 1]

  function chooseMe(memberId: string) {
    onMeChange(memberId)
    setPayerOverride(null)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit || saving || amountCents === null) return
    setSaving(true)
    setError(null)
    try {
      onAdded(await addExpense(groupId, payer, amountCents, description.trim()))
      setAmount('')
      setDescription('')
      setPayerOverride(null)
      setShowOptions(false)
      amountRef.current?.focus({ preventScroll: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (members.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-5 text-center text-sm text-stone-500 dark:border-stone-700">
        Add at least one person before adding an expense.
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-2xl text-stone-400">
            ₹
          </span>
          <input
            ref={amountRef}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0"
            aria-label="Amount"
            className="w-full rounded-xl border border-stone-300 bg-white py-3.5 pl-10 pr-4 text-2xl font-semibold tabular-nums tracking-tight placeholder:font-normal placeholder:text-stone-300 focus:border-mint-500 focus:outline-2 focus:outline-offset-0 focus:outline-mint-500/40 dark:border-stone-700 dark:bg-stone-950 dark:placeholder:text-stone-700"
          />
        </div>
        <button
          type="submit"
          disabled={!canSubmit || saving}
          className="shrink-0 rounded-xl bg-mint-600 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-mint-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
        >
          {saving ? '…' : 'Add'}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowOptions((open) => !open)}
        aria-expanded={showOptions}
        className="mt-2.5 flex w-full items-center gap-1 rounded-lg px-1 py-1 text-left text-xs text-stone-500 transition hover:text-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-600 dark:hover:text-stone-300"
      >
        <span className="min-w-0 truncate">
          {payer === me?.id ? `${payerName} (you)` : payerName} paid · split
          equally {members.length} ways
          {shares ? ` · ${formatCents(shares[shares.length - 1])} each` : ''}
        </span>
        <svg
          viewBox="0 0 16 16"
          className={`ml-auto size-3.5 shrink-0 transition-transform ${
            showOptions ? 'rotate-180' : ''
          }`}
          role="presentation"
          aria-hidden="true"
        >
          <path
            d="m4 6 4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {showOptions && (
        <div className="mt-3 space-y-3 border-t border-stone-200 pt-3 dark:border-stone-800">
          <div>
            <label
              htmlFor="expense-description"
              className="block text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              What was it for? <span className="text-stone-400">(optional)</span>
            </label>
            <input
              id="expense-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expense"
              maxLength={120}
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm placeholder:text-stone-400 focus:border-mint-500 focus:outline-2 focus:outline-offset-0 focus:outline-mint-500/40 dark:border-stone-700 dark:bg-stone-950 dark:placeholder:text-stone-600"
            />
          </div>

          <div className="flex gap-3">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="expense-payer"
                className="block text-xs font-medium text-stone-600 dark:text-stone-400"
              >
                Who paid?
              </label>
              <select
                id="expense-payer"
                value={payer}
                onChange={(e) => setPayerOverride(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-mint-500 focus:outline-2 focus:outline-offset-0 focus:outline-mint-500/40 dark:border-stone-700 dark:bg-stone-950"
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0 flex-1">
              <label
                htmlFor="expense-me"
                className="block text-xs font-medium text-stone-600 dark:text-stone-400"
              >
                I'm
              </label>
              <select
                id="expense-me"
                value={me?.id ?? ''}
                onChange={(e) => chooseMe(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-mint-500 focus:outline-2 focus:outline-offset-0 focus:outline-mint-500/40 dark:border-stone-700 dark:bg-stone-950"
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {uneven && shares && (
            <p className="text-xs text-stone-500">
              {formatCents(shares[0])} for the first{' '}
              {shares.filter((s) => s === shares[0]).length}, so the paise add
              back up exactly.
            </p>
          )}
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300"
        >
          {error}
        </p>
      )}
    </form>
  )
}
