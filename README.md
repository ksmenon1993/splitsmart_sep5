# SplitSmart

A group expense splitter. People in a group log who paid for what, and the app
works out who owes whom — with the fewest payments that clear everyone.

Mobile-first React + TypeScript + Vite, Tailwind v4, Supabase for data.

## What it does

- **Create a group**, add members by name
- **Share a link** — `?group=<id>` — so anyone can open the same group
- **Log an expense** in about two taps: type an amount, hit Add. Splits equally
  across everyone by default; payer and description are tucked behind options
- **Balances** lead the screen — each person's net, and a settle-up list giving
  the shortest set of payments that clears all debts
- **Nudge the group** with a warm, non-pushy reminder via the OS share sheet
- **A celebration** when everything reaches zero
- **`?demo=1`** opens a fully worked sample group instantly, saving nothing

## Running it

You need your own Supabase project.

```bash
npm install
cp .env.example .env     # then fill in your project URL and publishable key
npm run dev
```

Apply the SQL in `supabase/migrations/` to your project, in filename order.

| Script | |
|---|---|
| `npm run dev` | dev server with HMR |
| `npm run build` | typecheck + production build |
| `npm run lint` | oxlint |

## How the money works

Amounts are stored as **integer paise**, never floats — `0.1 + 0.2 !== 0.3`
shows up as one-paisa drift in balances otherwise. Typed amounts are parsed
digit-by-digit rather than through `parseFloat`, so `19.99` can't land on 1998.

Splitting stores one `expense_splits` row per person rather than deriving
shares on read. Two reasons: membership changes (someone added in March
shouldn't owe for January), and remainders — ₹10.00 across three people is
334/333/333, and stored shares sum to the total exactly where a derived
`amount / n` never quite does.

Expenses and their splits are written by `add_expense()` in a single
transaction. PostgREST can't put two inserts in one transaction, and a
half-written expense would credit a payer while nobody owes anything.

## Security posture

RLS is **enabled** on every table, but every policy evaluates `true` — reads
and inserts are open to anyone holding the publishable key. That's a demo
posture, not access control, and it's the first thing to change before real
data goes in. There are no update or delete policies, so rows can be created
and read but not altered through the API.

The `balances` view is declared `security_invoker = true`; without it a
Postgres view runs with its creator's privileges and silently bypasses RLS on
the tables underneath.

No auth: members are names typed into a group, and "which one is you" is
remembered per group in `localStorage`, never sent to the server.
