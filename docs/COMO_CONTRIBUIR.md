# Como contribuir

## Fluxo de trabalho

1. Edite os arquivos em `src/` (JavaScript em `src/js`, estilos em `src/styles`, telas em `index.html`).
2. Gere o jogo: `npm run build`.
3. Teste no navegador: `npm start` e abra `http://localhost:8080`.
4. Faça o commit incluindo `dist/game.js`.

`npm run check` falha se `dist/game.js` não corresponder aos módulos de `src/js`. Use antes de commitar.

## Onde mexer

| Quero mudar... | Arquivo |
|---|---|
| Cores, névoa, luz de um bioma | `src/js/world/biomas.js` |
| Visual de um cenário | `src/js/world/cenarios/` |
| Tipos e velocidades do trânsito | `src/js/gameplay/mundo-trafego-powerups.js` |
| Dificuldade | `dif()` e `diffT()` em `src/js/core/estado-do-jogador.js` |
| Melhorias e preços | `UPG` em `src/js/garage/salvamento-e-melhorias.js` |
| Itens da roleta (cores, adesivos) | `LOOK` e `RAR` no mesmo arquivo |
| Um evento | `src/js/events/` (veja [EVENTOS.md](EVENTOS.md)) |
| Sons | `src/js/systems/audio.js` (sintetizados por código) |
| Visual dos menus | `src/styles/tema-velho-oeste.css` |
| Telas e botões (HTML) | `index.html` |
| Ranking e conta | `src/js/online/` e `database/` |

## Convenções
- JavaScript em estilo ES5 (`var`, `function`), como o resto do código, para rodar em qualquer WebView.
- Um assunto por arquivo; comentários em português explicando o "porquê".
- Não crie variáveis globais com nomes já usados: busque antes (`grep -rn "nome" src/js`).
- Novos arquivos precisam entrar em `src/js/manifest.json` na posição certa.

## Teste rápido antes de publicar
- O jogo abre sem erros no console do navegador.
- Iniciar corrida, jogar alguns segundos, bater, terminar e voltar ao menu.
- Abrir a garagem (pintura, adesivos, melhorias) e a roleta.
- Forçar eventos pelo painel `/dev` e conferir que somem ao reiniciar.
- Ranking e conta: abrir as telas (precisa de internet e do Supabase configurado).
- Recarregar com a internet desligada (o PWA deve abrir).

## Publicação
GitHub Pages serve a raiz da branch `main`. O APK é gerado pelo workflow a cada push em `main`.
