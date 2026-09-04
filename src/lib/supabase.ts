import { createClient } from '@supabase/supabase-js'
import type { Database, Tables } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase config. Copy .env.example to .env and set ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.',
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

/** Row shapes, so app code doesn't reach into the generated types directly. */
export type Group = Tables<'groups'>
export type Member = Tables<'members'>
export type Expense = Tables<'expenses'>
export type ExpenseSplit = Tables<'expense_splits'>
export type Balance = Tables<'balances'>
