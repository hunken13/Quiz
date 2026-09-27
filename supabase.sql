-- Kör i Supabase: SQL Editor → New query → Run
create table if not exists public.answers (
  id bigint generated always as identity primary key,
  session text not null,
  player_id text not null,
  player_name text not null check (char_length(player_name) between 1 and 40),
  question_id text not null,
  answer text not null check (char_length(answer) <= 40),
  correct boolean not null,
  points numeric not null check (points between 0 and 1),
  created_at timestamptz not null default now(),
  unique (session, player_id, question_id)
);

alter table public.answers enable row level security;

drop policy if exists "anon insert" on public.answers;
drop policy if exists "anon read" on public.answers;
create policy "anon insert" on public.answers for insert to anon with check (true);
create policy "anon read" on public.answers for select to anon using (true);

grant select, insert on public.answers to anon;
