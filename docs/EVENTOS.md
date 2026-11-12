# Eventos aleatórios

Durante a corrida, eventos surgem de tempos em tempos para mudar o ritmo do jogo. Há dois tipos:

- **Eventos pequenos:** meteoros, foguetes no céu, drone entregador.
- **Eventos grandes (chefes):** têm barra de vida no topo e duração fixa.

## Eventos grandes existentes

| Nome | `kind` | Arquivo | Função inicial |
|---|---|---|---|
| Meteoros | `meteors` | `dinossauros-meteoros-e-chefe-drone.js` | `startMeteors` |
| Drone chefe | `boss` | `dinossauros-meteoros-e-chefe-drone.js` | `startBoss` |
| Dinossauros | `dino` | `dinossauros-meteoros-e-chefe-drone.js` | `startDino` |
| Macaco | `monkey` | `macaco.js` | `startMonkey` |
| Jato bombardeiro | `jet` | `jato-bombardeiro.js` | `startJet` |
| Doutor Tentáculo | `octo` | `doutor-tentaculo.js` | `startOcto` |
| Caminhão-bomba | `bomber` | `sobreposicao-e-caminhao-bomba.js` | `startBomber` |
| Super-herói | `hero` | `super-heroi-e-agendador.js` | `startHero` |
| Monstro de gosma | `slime` | `monstro-de-gosma.js` | `startSlime` |
| Carro flamejante | `fire` | `carro-flamejante.js` | `startFire` |

Efeitos compartilhados (fumaça, brasas, luz dinâmica, sprites) ficam em `efeitos-visuais-novos-eventos.js`. Dano, escudo e objetos que caem ficam em `impacto-quedas-foguetes-e-drone.js`.

## Como um evento funciona

Todo evento grande segue o mesmo molde:

1. **Sorteio** — `startRandomEvent()` (em `super-heroi-e-agendador.js`) monta a lista `majors` com os eventos liberados (cada um tem uma condição de tempo decorrido, intervalo desde a última vez e pontuação mínima) e sorteia um.
2. **Início** — a função `startXxx()` chama `evJoin('kind')`, registra `ev.lastXxx = elapsed`, cria o modelo 3D, guarda o estado numa variável própria (ex.: `slimeV`) e mostra o aviso com `eventIntro(titulo, subtitulo)`.
3. **Atualização** — `updateEvents(dt, playing)` chama `updateXxx(dt, playing)` a cada quadro. Ali ficam o movimento, os ataques e a verificação de colisão com o jogador.
4. **Dano** — `hurt('Rótulo', segundosPerdidos, lentidao)` aplica a penalidade e retorna `true` se acertou (retorna `false` se o escudo absorveu). Quem foi atingido normalmente faz `bossHits++`.
5. **Fim** — quando `t >= dur`, remove o modelo, zera a variável de estado e chama `finishMajor(playing, 'texto perfeito', 'texto normal')`, que dá bônus se o jogador não foi atingido.
6. **Reinício da corrida** — `resetEvents()` remove tudo do evento (modelos, projéteis, poças etc.). Todo evento novo precisa limpar seu estado ali.

## Eventos simultâneos
Com pontuação alta, dois eventos podem ocorrer juntos (`ev.kind` é o principal e `ev.sec` o segundo). Os degraus ficam em `MIX_TIERS`, em `sobreposicao-e-caminhao-bomba.js`.

## Criando um evento novo (passo a passo)

1. Crie `src/js/events/meu-evento.js` com: modelo (`makeMeuEvento`), `startMeuEvento`, `updateMeuEvento(dt, playing)` e o estado em uma `var`.
2. Registre o arquivo no `src/js/manifest.json`, **antes** de `events/super-heroi-e-agendador.js` (que usa suas funções).
3. Em `super-heroi-e-agendador.js`:
   - adicione a condição em `majors.push('meuevento')` dentro de `startRandomEvent` e o par `meuevento: startMeuEvento` no mapa de funções iniciais que existe ali;
   - chame `updateMeuEvento(dt, playing)` dentro de `updateEvents`;
   - adicione o nome na barra de vida (`name=...; frac=...`);
   - limpe o estado em `resetEvents`.
4. Em `sobreposicao-e-caminhao-bomba.js`: inclua o `kind` em `eligibleKinds`, em um degrau de `MIX_TIERS` e no mapa `kind → start` de `tryMix`.
5. Em `garage/dev-e-roleta.js`: adicione o par `['meuevento','Nome do evento']` na lista do painel `/dev`.
6. Se o evento tem `ev.lastMeuEvento`, inclua o campo no objeto `ev` (em `eventos-aleatorios-base.js`) e no reinício dentro de `resetEvents`.
7. `npm run build`, abra o jogo, use `/dev` para forçar o evento e confira se tudo some ao reiniciar a corrida.

## Dicas
- **Luzes:** o jogo tem uma luz dinâmica de eventos já criada (`evLight`). Não crie luzes novas durante a corrida: adicionar uma luz recompila todos os materiais e trava o jogo por um instante.
- **Fogo e fumaça:** use `smokePuff`, `ember` e `mkFlame` (efeitos prontos).
- **Desempenho:** reaproveite objetos (pools) em vez de criar e destruir a cada quadro.
