-- Rocket Car Game: ranking global (v2). Pode rodar de novo sem problema.
create table if not exists public.leaderboard(
  player_id text primary key, name text not null,
  score int not null default 0, dist int not null default 0,
  updated_at timestamptz not null default now());
alter table public.leaderboard enable row level security;
drop policy if exists leitura_publica on public.leaderboard;
create policy leitura_publica on public.leaderboard for select to anon, authenticated using (true);
revoke all on public.leaderboard from anon, authenticated;
grant select (name, score, dist, updated_at) on public.leaderboard to anon, authenticated;

drop function if exists public.submit_score(text,text,int,int);
drop function if exists public.submit_score(text,text,int,int,text);
create or replace function public.submit_score(p_id text, p_name text, p_score int, p_dist int, p_old_id text default null)
returns json language plpgsql security definer set search_path=public as $$
declare v_best int; v_rank int; v_total int; v_old int;
begin
  if p_id is null or length(p_id) < 8 or length(p_id) > 64 then raise exception 'id invalido'; end if;
  if p_name is null or length(trim(p_name)) < 3 or length(p_name) > 16 then raise exception 'apelido invalido'; end if;
  if p_score < 0 or p_score > 100000000 or p_dist < 0 then raise exception 'pontuacao invalida'; end if;
  if p_old_id is not null and p_old_id <> p_id then
    select score into v_old from public.leaderboard where player_id = p_old_id;
    if v_old is not null then
      p_score := greatest(p_score, v_old);
      delete from public.leaderboard where player_id = p_old_id;
    end if;
  end if;
  insert into public.leaderboard(player_id,name,score,dist,updated_at) values (p_id,trim(p_name),p_score,p_dist,now())
  on conflict (player_id) do update set
    name = excluded.name,
    score = greatest(public.leaderboard.score, excluded.score),
    dist = case when excluded.score > public.leaderboard.score then excluded.dist else public.leaderboard.dist end,
    updated_at = case when excluded.score > public.leaderboard.score then now() else public.leaderboard.updated_at end;
  select score into v_best from public.leaderboard where player_id = p_id;
  select count(*)+1 into v_rank from public.leaderboard where score > v_best;
  select count(*) into v_total from public.leaderboard;
  return json_build_object('rank',v_rank,'total',v_total,'best',v_best);
end $$;
grant execute on function public.submit_score(text,text,int,int,text) to anon, authenticated;

create or replace function public.get_rank(p_id text)
returns json language plpgsql security definer stable set search_path=public as $$
declare v_best int; v_name text; v_rank int; v_total int;
begin
  select score, name into v_best, v_name from public.leaderboard where player_id = p_id;
  if v_best is null then return null; end if;
  select count(*)+1 into v_rank from public.leaderboard where score > v_best;
  select count(*) into v_total from public.leaderboard;
  return json_build_object('rank',v_rank,'total',v_total,'best',v_best,'name',v_name);
end $$;
grant execute on function public.get_rank(text) to anon, authenticated;
