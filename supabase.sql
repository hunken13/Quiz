-- Kör i Supabase: SQL Editor → New query → Run. Kan köras flera gånger.
-- Rätta svar och admin-e-post läggs in separat (se tools/build-private-sql.js).

create table if not exists public.answers (
  id bigint generated always as identity primary key,
  session text not null,
  player_id text not null,
  player_name text not null check (char_length(player_name) between 1 and 40),
  question_id text not null,
  answer text not null check (char_length(answer) <= 40),
  correct boolean not null default false,
  points numeric not null default 0 check (points between 0 and 1),
  created_at timestamptz not null default now(),
  unique (session, player_id, question_id)
);
alter table public.answers alter column correct set default false;
alter table public.answers alter column points set default 0;

-- Facit: bara läsbart för admin.
create table if not exists public.question_keys (
  id text primary key,
  type text not null check (type in ('mc', 'tf', 'estimate')),
  correct text not null,
  tolerance numeric,
  explanation text
);

-- E-postadresser som får se admin-sidan.
create table if not exists public.admins (email text primary key);

alter table public.answers enable row level security;
alter table public.question_keys enable row level security;
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- Rättar varje svar i databasen; det som klienten skickar för correct/points ignoreras.
create or replace function public.score_answer() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  k public.question_keys;
  diff numeric;
begin
  new.correct := false;
  new.points := 0;
  new.created_at := now();
  select * into k from public.question_keys where id = new.question_id;
  if not found or new.answer = '' then
    return new;
  end if;
  if k.type in ('mc', 'tf') then
    new.correct := new.answer = k.correct;
    new.points := case when new.correct then 1 else 0 end;
  elsif new.answer ~ '^-?[0-9]+(\.[0-9]+)?$' then
    diff := abs(new.answer::numeric - k.correct::numeric) / abs(k.correct::numeric);
    if diff <= k.tolerance then
      new.correct := true;
      new.points := 1;
    elsif diff <= k.tolerance * 2 then
      new.points := 0.5;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists score_answer on public.answers;
create trigger score_answer before insert on public.answers
  for each row execute function public.score_answer();

-- Topplista för deltagarna: bara namn och poäng, inga enskilda svar.
drop function if exists public.leaderboard(text, text);
create function public.leaderboard(p_session text, p_player text default null)
returns table (player_name text, points numeric, answered bigint, is_me boolean)
language sql stable security definer set search_path = public as $$
  select max(player_name), sum(points), count(*), bool_or(player_id = p_player)
  from public.answers
  where session = p_session
  group by player_id
  order by sum(points) desc, max(created_at) asc;
$$;

-- Behörigheter
drop policy if exists "anon insert" on public.answers;
drop policy if exists "anon read" on public.answers;
drop policy if exists "admin read" on public.answers;
drop policy if exists "admin read" on public.question_keys;

create policy "anon insert" on public.answers for insert to anon with check (true);
create policy "admin read" on public.answers for select to authenticated using (public.is_admin());
create policy "admin read" on public.question_keys for select to authenticated using (public.is_admin());

revoke all on public.answers, public.question_keys, public.admins from anon, authenticated;
grant insert on public.answers to anon;
grant select on public.answers, public.question_keys to authenticated;
revoke execute on function public.score_answer() from public, anon, authenticated;
grant execute on function public.leaderboard(text, text) to anon, authenticated;
