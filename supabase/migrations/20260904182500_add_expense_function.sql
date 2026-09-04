-- Writes an expense and its equal-split rows in one transaction, so a
-- half-written expense can never skew balances. PostgREST cannot put two
-- inserts in one transaction, and there is no delete policy to clean up an
-- orphaned expense, so this has to happen server-side.
--
-- security invoker keeps RLS in force: it grants no privilege the caller
-- does not already have.
create or replace function public.add_expense(
  p_group_id uuid,
  p_paid_by uuid,
  p_amount_cents integer,
  p_description text
)
returns public.expenses
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_expense public.expenses;
  v_members integer;
begin
  select count(*) into v_members
  from public.members
  where group_id = p_group_id;

  if v_members = 0 then
    raise exception 'Add someone to the group before adding an expense.'
      using errcode = '23514';
  end if;

  if not exists (
    select 1 from public.members
    where id = p_paid_by and group_id = p_group_id
  ) then
    raise exception 'The payer must be a member of this group.'
      using errcode = '23514';
  end if;

  insert into public.expenses (group_id, paid_by, amount_cents, description)
  values (
    p_group_id,
    p_paid_by,
    p_amount_cents,
    -- Description is optional in the UI; fall back rather than trip the
    -- check constraint.
    coalesce(nullif(btrim(p_description), ''), 'Expense')
  )
  returning * into v_expense;

  -- Even split; the leftover paise go to the earliest members, so the
  -- shares always add back up to amount_cents exactly.
  insert into public.expense_splits (expense_id, member_id, share_cents)
  select v_expense.id,
         m.id,
         p_amount_cents / v_members
           + case
               when row_number() over (order by m.created_at, m.id)
                    <= p_amount_cents % v_members
               then 1 else 0
             end
  from public.members m
  where m.group_id = p_group_id;

  return v_expense;
end;
$$;

grant execute on function public.add_expense(uuid, uuid, integer, text)
  to anon, authenticated;
