# Banco de dados e contas (Supabase)

O jogo funciona sem internet e sem conta. O Supabase é usado só para duas coisas opcionais: **ranking global** e **conta com progresso na nuvem**.

## Configuração no jogo
A URL do projeto e a chave **pública** (`sb_publishable_...`) ficam em `src/js/core/configuracao-inicial.js`, no objeto `RANK`. A chave pública pode ficar no código. **Nunca coloque a chave secreta (`sb_secret_...`) em nenhum arquivo.**

## Scripts SQL (`database/`)
Rode no **SQL Editor** do Supabase, nesta ordem (podem ser executados mais de uma vez):

1. `ranking-supabase.sql` — tabela `leaderboard`, leitura pública só de apelido, pontuação e distância, e as funções `submit_score` e `get_rank`.
2. `conta-supabase.sql` — tabela `profiles` (progresso por usuário) com acesso restrito ao próprio usuário.

## Ranking
- Cada jogador tem um id (aleatório no aparelho ou o id da conta, se logado).
- `submit_score(p_id, p_name, p_score, p_dist, p_old_id)` guarda a **melhor** pontuação e retorna posição, total e melhor. Se `p_old_id` vier, junta a entrada antiga do aparelho com a da conta.
- `get_rank(p_id)` retorna a posição do jogador.
- A lista pública é lida de `leaderboard` ordenada por pontuação e, em empate, por quem chegou primeiro. Empatados dividem a mesma posição.
- Apelidos passam por um filtro de palavrões. Jogadores com o modo `/dev` ativo não entram no ranking.
- O `sw.js` não guarda respostas do Supabase em cache, então todos veem os mesmos dados.

## Conta e nuvem
- Login por email e senha, e Google (opcional).
- O progresso (dinheiro, melhorias, itens, visual, recorde e apelido) é enviado automaticamente alguns segundos após cada mudança, ao fechar o app e com nova tentativa se a internet cair. Mudanças feitas em outro aparelho são buscadas a cada 45 s no menu.
- No primeiro login, se o aparelho e a nuvem já têm progresso diferente, o jogo pergunta qual manter.

## Painel do Supabase
- **Authentication → Providers → Email:** ativado. Para entrar logo após criar a conta, desative "Confirm email".
- **Authentication → URL Configuration:** Site URL `https://educhicomatos-ai.github.io/roadster-car-game/`; Redirect URLs com a mesma URL e `rocketcar://auth` (usado pelo app Android).
- **Google (opcional):** ative o provedor com Client ID e Secret do Google Cloud (tipo "Aplicativo da Web"), e no Google Cloud adicione `https://<seu-projeto>.supabase.co/auth/v1/callback` em "URIs de redirecionamento autorizados".
