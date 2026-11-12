# Arquitetura do Rocket Car Game

Este documento explica como o jogo está organizado e como as partes se conversam. Para começar a mexer, leia primeiro "Como o código é montado" e "O ciclo do jogo".

## Como o código é montado

O jogo é **um único programa JavaScript** dentro de uma função (`(function(){ 'use strict'; ... })();`). Todas as variáveis e funções ficam nesse escopo compartilhado: o módulo `systems/audio.js` pode chamar `hurt()` do módulo `events/impacto-...js` sem importar nada.

Para facilitar a leitura, o programa foi dividido em módulos (arquivos em `src/js`). Eles **não são módulos ES independentes**: são pedaços colados em sequência por `tools/build.js`, na ordem de `src/js/manifest.json`, e o resultado é `dist/game.js`.

Consequências práticas:

- **A ordem importa.** Uma variável `var` ou `function` só pode ser usada por código que rode depois da linha que a declara (funções declaradas com `function` são içadas dentro do mesmo programa, então podem ser chamadas de qualquer módulo depois que tudo carregou, mas código que roda *durante o carregamento* depende da ordem).
- **Não há `import`/`export`.** Para usar algo de outro módulo, basta usar o nome.
- **Nomes são globais ao programa.** Antes de criar uma função ou variável nova, procure se o nome já existe (`grep -rn "function hurt" src/js`).
- Depois de mexer em qualquer módulo: `npm run build`.

## O ciclo do jogo

```
requestAnimationFrame(frame)                 gameplay/laco-principal.js
  └─ update(dt)                              menu/fundo-do-menu-e-atualizacao.js
       ├─ estados: menu → count (3,2,1) → play → over        (variável state)
       ├─ física do carro, ar comprimido, turbo, pulo
       ├─ trânsito, power-ups, cenário, biomas e clima
       ├─ updateEvents(dt, playing)          events/super-heroi-e-agendador.js
       └─ HUD, partículas, áudio
  └─ renderer.render(scene, camera)
```

Estados (`state`): `menu` (o carro anda sozinho ao fundo), `count` (contagem), `play` (corrida), `over` (fim). A garagem é um modo à parte (`studio`).

## Módulos

### `core/` — base visual
| Arquivo | Conteúdo |
|---|---|
| `configuracao-inicial.js` | Atalhos (`$`, `clamp`, `rand`), constantes e a configuração do ranking (`RANK`) |
| `renderer-e-cena.js` | Renderizador, câmera, luzes, sombras, redimensionamento |
| `geometria-auxiliar.js` | Junção de peças em uma geometria só (`part`, `mergeParts`), texturas suaves |
| `ceu-chao-estrada.js` | Céu, estrelas, nuvens, raios, chão e estrada |
| `modelos-auxiliares.js` | `lamb`, `addBox`, `addWheel`: peças para montar veículos |
| `reflexos-ambiente.js` | Mapa de reflexos, materiais do carro, `makeSedan`, `makeRoadster` (o carro do jogador) |
| `estado-do-jogador.js` | Estado do carro (`c`), dificuldade (`dif()`, `diffT()`) e pontuação |

### `gameplay/` — regras da corrida
| Arquivo | Conteúdo |
|---|---|
| `mundo-trafego-powerups.js` | Altura do terreno, rampas, trânsito (carros, ônibus, caminhões), power-ups |
| `fluxo-do-jogo.js` | `resetRun`, `startGame`, `endGame`, batidas e pousos |
| `laco-principal.js` | O `frame()`: chama `update` e renderiza |

### `world/` — mundo e cenários
`biomas.js` define os 10 biomas (deserto, floresta, cidade, mar partido, cyberpunk, ruínas, cerejeiras, caverna, Copacabana, espaço) com cores, névoa, luz e clima. O jogador atravessa zonas de ~1100 m; a transição entre elas é gradual. `pecas-compartilhadas.js` tem os "pools" que reaproveitam objetos de cenário (árvores, prédios) conforme o carro avança. Cada cenário fica em `world/cenarios/`.

### `systems/` — serviços gerais
Partículas (`emit`), entrada (teclado e botões de toque), áudio (sons gerados por código, sem arquivos), HUD (`toast`, recorde), avisos e contagem, orientação do celular, cópia offline.

### `garage/` — personalização
| Arquivo | Conteúdo |
|---|---|
| `salvamento-e-melhorias.js` | Dados salvos no aparelho (`save`), melhorias (`UPG`), raridades |
| `adesivos-e-acessorios.js` | Adesivos laterais e acessórios desenhados por código |
| `dev-e-roleta.js` | Painel `/dev`, roleta de itens, troca de telas (`showSheet`) |
| `estudio-3d.js` | A garagem 3D: câmeras por categoria, animações de spray e solda, melhorias |

O progresso é salvo em `localStorage` na chave `roadster-rocket-save` (dinheiro, melhorias, itens, visual, apelido) e o recorde em `roadster-rocket-best`.

### `online/` — Supabase (opcional)
`ranking-global.js` envia o recorde e lista o top 50. `conta-e-nuvem.js` faz login (email/senha e Google) e sincroniza o progresso. Detalhes em [BANCO_DE_DADOS.md](BANCO_DE_DADOS.md).

### `events/` — eventos aleatórios
Veja [EVENTOS.md](EVENTOS.md). Cada evento fica no seu arquivo.

### `menu/`
`fundo-do-menu-e-atualizacao.js` tem o piloto automático do menu e a função `update(dt)` principal.

## Estilos (`src/styles/`)
`layout.css` (cena, HUD e telas), `tema-velho-oeste.css` (visual de todos os menus) e `hud.css` (painéis da corrida). A ordem dos `<link>` no `index.html` deve ser mantida.

## PWA e uso offline
`sw.js`: o `index.html`, o jogo e os estilos usam "rede primeiro" (atualizam sozinhos; o cache só entra offline). Three.js e fontes usam "cache primeiro". **As chamadas ao Supabase nunca passam pelo cache**, para todos verem o mesmo ranking. Ao adicionar arquivos que precisam funcionar offline, inclua-os em `CORE` no `sw.js` e aumente `CACHE`.

## Android
`android/` é um app WebView que abre a versão do GitHub Pages. O workflow copia `index.html`, `dist/`, `assets/` e `src/styles/` para uma cópia embutida usada quando não há internet na primeira abertura.
