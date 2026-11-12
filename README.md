# Rocket Car Game

Jogo 3D de direção em que você pilota um carro-foguete por cenários diferentes, desvia do trânsito, coleta power-ups e enfrenta eventos aleatórios. Roda no navegador, instala como app (PWA) e tem versão Android.

**▶ Jogar agora: https://educhicomatos-ai.github.io/roadster-car-game/**

## Visão geral

| | |
|---|---|
| Tecnologia | HTML + CSS + JavaScript puro, gráficos 3D com [Three.js r128](https://threejs.org/) |
| Sem framework | Não há React, bundler nem dependências para rodar o jogo |
| Plataformas | Navegador (desktop e celular), PWA instalável, app Android (WebView) |
| Online (opcional) | Ranking global e conta com progresso na nuvem, via [Supabase](https://supabase.com/) |

## Estrutura de pastas

```
roadster-car-game/
├── index.html                 Página do jogo: telas (HTML), links para CSS e JS
├── sw.js                      Service worker (PWA e uso offline)
├── manifest.webmanifest       Dados do app instalável
├── privacidade.html           Política de privacidade
├── package.json               Atalhos: npm run build / check / start
│
├── src/                       CÓDIGO-FONTE (é aqui que se trabalha)
│   ├── styles/                CSS: layout, tema "Velho Oeste" e HUD
│   └── js/                    JavaScript dividido por tema (ver docs/ARQUITETURA.md)
│       ├── manifest.json      Ordem de montagem dos módulos
│       ├── core/              Renderizador, cena, céu, chão, modelos e reflexos
│       ├── gameplay/          Mundo, trânsito, power-ups, fluxo da corrida e laço principal
│       ├── world/             Biomas, clima e os 10 cenários
│       ├── systems/           Partículas, entrada, áudio, HUD, avisos e celular
│       ├── garage/            Salvamento, melhorias, roleta, adesivos e estúdio 3D da garagem
│       ├── online/            Ranking global e conta (Supabase)
│       ├── events/            Eventos aleatórios (monstros, drones, dinossauros...)
│       ├── menu/              Fundo animado do menu e atualização por quadro
│       └── pwa/               Registro do service worker
│
├── dist/game.js               O jogo montado a partir de src/js (arquivo que o navegador carrega)
├── assets/icons/              Ícones do app
├── database/                  SQL do Supabase (ranking e conta)
├── docs/                      Documentação para desenvolvedores
├── tools/                     Scripts de build e servidor local
├── android/                   Projeto do app Android
└── .github/workflows/         Geração automática do APK
```

## Como rodar

**Só jogar ou testar:** abra o `index.html` no navegador. Para testar como o site publicado (inclusive o service worker), use o servidor local:

```bash
node tools/servir.js        # abre em http://localhost:8080
```

**Desenvolver:** edite os arquivos em `src/` e gere o jogo:

```bash
npm run build               # monta dist/game.js a partir de src/js
npm run check               # confere se dist/game.js está atualizado
```

> O navegador carrega `dist/game.js`, **não** os módulos de `src/js`. Por isso, depois de editar um módulo, rode `npm run build` e envie `dist/game.js` junto no commit. Os módulos são pedaços do mesmo programa colados em ordem (veja [docs/ARQUITETURA.md](docs/ARQUITETURA.md)).

## Documentação

- [Arquitetura do jogo](docs/ARQUITETURA.md): como o jogo funciona por dentro, módulo por módulo
- [Eventos aleatórios](docs/EVENTOS.md): como funcionam e como criar um novo
- [Banco de dados e contas](docs/BANCO_DE_DADOS.md): ranking global, conta e configuração do Supabase
- [Como contribuir](docs/COMO_CONTRIBUIR.md): fluxo de trabalho, build e publicação

## Publicação

- **Site e PWA:** GitHub Pages, a partir da raiz da branch `main`.
- **APK Android:** gerado por `.github/workflows/build-apk.yml` a cada envio para `main` e publicado em **Releases → Rocket Car Game (APK mais recente)**. O app abre a versão publicada no Pages e guarda uma cópia embutida para a primeira abertura sem internet.

## Privacidade

[Política de privacidade](https://educhicomatos-ai.github.io/roadster-car-game/privacidade.html)
