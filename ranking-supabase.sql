-- Rocket Car Game: ranking global (Supabase)
-- Cole tudo isto em Supabase > SQL Editor > New query e clique em Run.

create table if not exists public.leaderboard (
  player_id  text primary key check (char_length(player_id) between 16 and 64),
  name       text not null check (char_length(name) between 3 and 12),
  score      integer not null check (score between 0 and 5000000),
  dist       integer not null default 0 check (dist between 0 and 1000000),
  updated_at timestamptz not null default now()
);
create index if not exists leaderboard_score_idx on public.leaderboard (score desc);

alter table public.leaderboard enable row level security;
revoke all on public.leaderboard from anon, authenticated;
-- o jogo só pode LER nome, pontos e distância (nunca o id do jogador)
grant select (name, score, dist) on public.leaderboard to anon, authenticated;
drop policy if exists leitura_publica on public.leaderboard;
create policy leitura_publica on public.leaderboard for select to anon, authenticated using (true);

-- escrita só por esta função: guarda sempre a MELHOR pontuação de cada jogador
create or replace function public.submit_score(p_id text, p_name text, p_score int, p_dist int)
returns json language plpgsql security definer set search_path = public as $$
declare v_best int; v_rank int; v_total int;
begin
  if p_id is null or char_length(p_id) < 16 or char_length(p_id) > 64 then raise exception 'id invalido'; end if;
  p_name := btrim(coalesce(p_name, ''));
  if char_length(p_name) < 3 or char_length(p_name) > 12 then raise exception 'nome invalido'; end if;
  if p_score is null or p_score < 0 or p_score > 5000000 then raise exception 'pontuacao invalida'; end if;
  insert into public.leaderboard (player_id, name, score, dist)
  values (p_id, p_name, p_score, greatest(0, least(coalesce(p_dist, 0), 1000000)))
  on conflict (player_id) do update set
    name = excluded.name,
    dist = case when excluded.score > leaderboard.score then excluded.dist else leaderboard.dist end,
    score = greatest(leaderboard.score, excluded.score),
    updated_at = now();
  select score into v_best from public.leaderboard where player_id = p_id;
  select count(*) + 1 into v_rank from public.leaderboard where score > v_best;
  select count(*) into v_total from public.leaderboard;
  return json_build_object('rank', v_rank, 'total', v_total, 'best', v_best);
end $$;
revoke all on function public.submit_score(text, text, int, int) from public;
grant execute on function public.submit_score(text, text, int, int) to anon, authenticated;
