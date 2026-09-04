import { useCallback, useEffect, useState } from 'react'
import CreateGroup from './components/CreateGroup'
import DemoView from './components/DemoView'
import GroupView from './components/GroupView'
import {
  errorMessage,
  fetchBalances,
  fetchExpenses,
  fetchGroup,
  fetchMembers,
} from './lib/api'
import type { MemberBalance } from './lib/balances'
import type { Expense, Group, Member } from './lib/supabase'

const GROUP_PARAM = 'group'
const DEMO_PARAM = 'demo'

function readGroupId(): string | null {
  return new URLSearchParams(window.location.search).get(GROUP_PARAM)
}

function readIsDemo(): boolean {
  return new URLSearchParams(window.location.search).has(DEMO_PARAM)
}

/** Replaces the query string wholesale, so the two modes never overlap. */
function setSearch(search: string) {
  const url = new URL(window.location.href)
  url.search = search
  window.history.pushState({}, '', url)
}

function groupUrl(groupId: string): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set(GROUP_PARAM, groupId)
  return url.toString()
}

type State =
  | { status: 'new' }
  | { status: 'demo' }
  | { status: 'loading' }
  | {
      status: 'ready'
      group: Group
      members: Member[]
      expenses: Expense[]
      balances: MemberBalance[]
    }
  | { status: 'missing' }
  | { status: 'failed'; message: string }

function Logo() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="size-8 shrink-0"
      role="presentation"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" className="fill-mint-500" />
      <path
        d="M16 6.5v19"
        className="stroke-white/70"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeDasharray="2.5 3"
      />
      <path
        d="M11.5 12.25h-2.9a1.85 1.85 0 0 0 0 3.7h1.9a1.85 1.85 0 0 1 0 3.7H7.5M20.5 12.25h4M20.5 19.75h4"
        fill="none"
        className="stroke-white"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  )
}

function App() {
  // Start in `loading` when the URL already names a group, so a refresh
  // doesn't flash the create form before the fetch resolves.
  const [state, setState] = useState<State>(() => {
    if (readGroupId()) return { status: 'loading' }
    return readIsDemo() ? { status: 'demo' } : { status: 'new' }
  })

  const load = useCallback(async (groupId: string) => {
    setState({ status: 'loading' })
    try {
      const group = await fetchGroup(groupId)
      if (!group) {
        setState({ status: 'missing' })
        return
      }
      const [members, expenses, balances] = await Promise.all([
        fetchMembers(group.id),
        fetchExpenses(group.id),
        fetchBalances(group.id),
      ])
      setState({ status: 'ready', group, members, expenses, balances })
    } catch (err) {
      setState({ status: 'failed', message: errorMessage(err) })
    }
  }, [])

  // Runs on first paint, and again when back/forward changes which group
  // the URL points at.
  useEffect(() => {
    function sync() {
      const id = readGroupId()
      if (id) void load(id)
      else if (readIsDemo()) setState({ status: 'demo' })
      else setState({ status: 'new' })
    }
    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [load])

  function handleCreated(group: Group) {
    window.history.pushState({}, '', groupUrl(group.id))
    setState({
      status: 'ready',
      group,
      members: [],
      expenses: [],
      balances: [],
    })
  }

  // The demo is entirely in memory; the URL flag just makes it survive a
  // refresh and keeps the back button honest.
  function openDemo() {
    setSearch(`?${DEMO_PARAM}=1`)
    setState({ status: 'demo' })
  }

  function exitDemo() {
    setSearch('')
    setState({ status: 'new' })
  }

  const refreshBalances = useCallback(async (groupId: string) => {
    try {
      const balances = await fetchBalances(groupId)
      setState((prev) =>
        prev.status === 'ready' && prev.group.id === groupId
          ? { ...prev, balances }
          : prev,
      )
    } catch {
      // A stale balance panel is better than losing the screen; the next
      // change or a refresh will reconcile it.
    }
  }, [])

  function handleMemberAdded(member: Member) {
    setState((prev) =>
      prev.status === 'ready'
        ? { ...prev, members: [...prev.members, member] }
        : prev,
    )
    void refreshBalances(member.group_id)
  }

  // Newest first, matching the order the server returns them in.
  function handleExpenseAdded(expense: Expense) {
    setState((prev) =>
      prev.status === 'ready'
        ? { ...prev, expenses: [expense, ...prev.expenses] }
        : prev,
    )
    void refreshBalances(expense.group_id)
  }

  function startOver() {
    setSearch('')
    setState({ status: 'new' })
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-stone-50/85 backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-950/85">
        <div className="mx-auto flex w-full max-w-md items-center gap-2.5 px-5 py-3.5">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">
            SplitSmart
          </span>
        </div>
      </header>

      <main
        className={`mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-8 ${
          state.status === 'ready' || state.status === 'demo'
            ? ''
            : 'justify-center'
        }`}
      >
        {state.status === 'loading' && (
          <p className="text-center text-stone-500">Loading group…</p>
        )}

        {state.status === 'new' && (
          <CreateGroup onCreated={handleCreated} onTryDemo={openDemo} />
        )}

        {state.status === 'demo' && <DemoView onExit={exitDemo} />}

        {state.status === 'ready' && (
          <GroupView
            group={state.group}
            members={state.members}
            expenses={state.expenses}
            balances={state.balances}
            shareUrl={groupUrl(state.group.id)}
            onMemberAdded={handleMemberAdded}
            onExpenseAdded={handleExpenseAdded}
          />
        )}

        {state.status === 'missing' && (
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">
              Group not found
            </h1>
            <p className="mx-auto mt-2 max-w-xs text-pretty text-stone-600 dark:text-stone-400">
              That link doesn't point at a group any more.
            </p>
            <button
              type="button"
              onClick={startOver}
              className="mt-6 w-full rounded-xl bg-mint-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-mint-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-600"
            >
              Start a new group
            </button>
          </div>
        )}

        {state.status === 'failed' && (
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">
              Couldn't reach the server
            </h1>
            <p
              role="alert"
              className="mx-auto mt-2 max-w-xs text-pretty text-stone-600 dark:text-stone-400"
            >
              {state.message}
            </p>
            <button
              type="button"
              onClick={() => {
                const id = readGroupId()
                if (id) void load(id)
                else setState({ status: 'new' })
              }}
              className="mt-6 w-full rounded-xl bg-mint-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-mint-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-600"
            >
              Try again
            </button>
          </div>
        )}
      </main>

      <footer className="mx-auto w-full max-w-md px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-xs text-stone-500">
        Split fairly. Settle up faster.
      </footer>
    </div>
  )
}

export default App
