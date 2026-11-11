# Rocket Car Game

Jogo 3D de direção (projeto de fã).

**▶ Jogar agora: https://educhicomatos-ai.github.io/roadster-car-game/**

- **Jogar / instalar como app (PWA):** abra o link acima no celular ou no computador e use "Instalar" / "Adicionar à tela inicial".
- **Ranking global:** usa um projeto Supabase; o SQL de criação está em `ranking-supabase.sql`.
- **Política de privacidade:** https://educhicomatos-ai.github.io/roadster-car-game/privacidade.html
- **APK Android:** gerado automaticamente por `.github/workflows/build-apk.yml` a cada envio para a branch `main`. Baixe em **Releases → Rocket Car Game (APK mais recente)**.
- Para atualizar o jogo, substitua `index.html`.

## Conta (email e senha) e progresso na nuvem
Dá para jogar com a mesma conta no navegador, no PWA e no app Android. Dinheiro, melhorias, visuais, recorde e apelido seguem a conta.
1. No Supabase, rode `ranking-supabase.sql` e depois `conta-supabase.sql` (SQL Editor).
2. Authentication → Providers → **Email**: deixe ativado. Para o jogador entrar logo após criar a conta, desative **Confirm email** (se deixar ativado, o jogador precisa abrir o email de confirmação antes de entrar).
3. Authentication → URL Configuration: em **Site URL** coloque `https://educhicomatos-ai.github.io/roadster-car-game/` e em **Redirect URLs** adicione esse mesmo endereço e `rocketcar://auth`. Isso é necessário para o link de "Esqueci a senha".
4. (Opcional) Login com Google: Authentication → Providers → **Google**, com Client ID e Client Secret do Google Cloud Console (tipo "Aplicativo da Web"). No Google Cloud, adicione em "URIs de redirecionamento autorizados": `https://<seu-projeto>.supabase.co/auth/v1/callback`.
