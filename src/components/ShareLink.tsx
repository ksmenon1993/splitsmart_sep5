import { useEffect, useRef, useState } from 'react'

/**
 * The share URL is just the app URL carrying ?group=<id>, so opening it
 * anywhere loads the same group straight from Supabase.
 */
export default function ShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // clipboard needs a secure context, which http://<lan-ip> is not.
      // Select the text so it can be copied by hand instead.
      inputRef.current?.select()
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <h2 className="text-sm font-medium text-stone-700 dark:text-stone-300">
        Shareable link
      </h2>
      <p className="mt-0.5 text-xs text-stone-500">
        Anyone with this link opens the same group.
      </p>
      <div className="mt-2.5 flex gap-2">
        <input
          ref={inputRef}
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          aria-label="Shareable group link"
          className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 font-mono text-xs text-stone-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-400"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium transition hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-600 dark:border-stone-700 dark:hover:bg-stone-800"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </section>
  )
}
