-- ---------- Tables ----------
create table public.groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(btrim(name)) > 0),
  created_at timestamptz not null default now()
);

create table public.members (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups (id) on delete cascade,
  name       text not null check (length(btrim(name)) > 0),
  created_at timestamptz not null default now(),
  unique (group_id, name)
);

create table public.expenses (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references public.groups (id) on delete cascade,
  paid_by      uuid not null references public.members (id) on delete restrict,
  amount_cents integer not null check (amount_cents > 0),
  description  text not null check (length(btrim(description)) > 0),
  created_at   timestamptz not null default now()
);

create table public.expense_splits (
  expense_id  uuid not null references public.expenses (id) on delete cascade,
  member_id   uuid not null references public.members (id) on delete restrict,
  share_cents integer not null check (share_cents >= 0),
  primary key (expense_id, member_id)
);

-- ---------- Indexes on the foreign keys we filter by ----------
create index members_group_id_idx      on public.members (group_id);
create index expenses_group_id_idx     on public.expenses (group_id);
create index expenses_paid_by_idx      on public.expenses (paid_by);
create index expense_splits_member_idx on public.expense_splits (member_id);

-- ---------- RLS: on, with deliberately permissive demo policies ----------
-- NOTE: every policy below evaluates `true`. RLS is enabled, but this is a
-- demo posture, not access control: anyone with the publishable key can read
-- and insert any group. Tighten before putting real data in.
alter table public.groups         enable row level security;
alter table public.members        enable row level security;
alter table public.expenses       enable row level security;
alter table public.expense_splits enable row level security;

create policy "demo_read_groups"   on public.groups   for select to anon, authenticated using (true);
create policy "demo_insert_groups" on public.groups   for insert to anon, authenticated with check (true);

create policy "demo_read_members"   on public.members for select to anon, authenticated using (true);
create policy "demo_insert_members" on public.members for insert to anon, authenticated with check (true);

create policy "demo_read_expenses"   on public.expenses for select to anon, authenticated using (true);
create policy "demo_insert_expenses" on public.expenses for insert to anon, authenticated with check (true);

create policy "demo_read_splits"   on public.expense_splits for select to anon, authenticated using (true);
create policy "demo_insert_splits" on public.expense_splits for insert to anon, authenticated with check (true);

-- ---------- The balances view ----------
-- security_invoker keeps the base tables' RLS in force; without it the view
-- would run with its owner's privileges and quietly bypass those policies.
create view public.balances
with (security_invoker = true)
as
select
  m.id       as member_id,
  m.group_id,
  m.name,
  coalesce(paid.total, 0) as total_paid_cents,
  coalesce(owed.total, 0) as total_share_cents,
  coalesce(paid.total, 0) - coalesce(owed.total, 0) as balance_cents
from public.members m
left join (
  select paid_by as member_id, sum(amount_cents)::bigint as total
  from public.expenses
  group by paid_by
) paid on paid.member_id = m.id
left join (
  select member_id, sum(share_cents)::bigint as total
  from public.expense_splits
  group by member_id
) owed on owed.member_id = m.id;

grant select on public.balances to anon, authenticated;
