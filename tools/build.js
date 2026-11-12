#!/usr/bin/env node
/* Monta o jogo a partir dos módulos de src/js.
 *
 *   node tools/build.js           gera dist/game.js (é o arquivo que o index.html carrega)
 *   node tools/build.js --check   só confere se dist/game.js está atualizado (não escreve nada)
 *   node tools/build.js --single  gera também dist/rocket-car-game.html (tudo em 1 arquivo, útil para testes)
 *
 * Os módulos são apenas pedaços do MESMO programa: são colados na ordem de src/js/manifest.json
 * dentro de uma única função. Por isso a ordem importa e as variáveis são compartilhadas entre eles.
 */
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const ler = (p) => fs.readFileSync(path.join(raiz, p), 'utf8');
const { ordem } = JSON.parse(ler('src/js/manifest.json'));

function montarJogo() {
  const corpo = ordem.map((arq) => {
    const caminho = 'src/js/' + arq;
    if (!fs.existsSync(path.join(raiz, caminho))) throw new Error('Módulo listado no manifest.json não existe: ' + caminho);
    return ler(caminho);
  }).join('');
  return '/* ARQUIVO GERADO por tools/build.js. Não edite aqui: edite os módulos em src/js e rode "npm run build". */\n'
    + "(function(){\n'use strict';\n" + corpo + '})();\n';
}

const jogo = montarJogo();
const destino = path.join(raiz, 'dist', 'game.js');

if (process.argv.includes('--check')) {
  const atual = fs.existsSync(destino) ? fs.readFileSync(destino, 'utf8') : '';
  if (atual !== jogo) { console.error('dist/game.js está desatualizado. Rode: npm run build'); process.exit(1); }
  console.log('dist/game.js está atualizado (' + ordem.length + ' módulos).');
  process.exit(0);
}

fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, jogo);
console.log('dist/game.js gerado a partir de ' + ordem.length + ' módulos (' + Math.round(jogo.length / 1024) + ' KB).');

if (process.argv.includes('--single')) {
  let html = ler('index.html');
  html = html.replace(/<link rel="stylesheet" href="(src\/styles\/[^"]+)">/g, (_, f) => '<style>\n' + ler(f) + '</style>');
  html = html.replace('<script src="dist/game.js"></script>', () => '<script>\n' + jogo.replace(/<\/script/gi, '<\\/script') + '</script>');
  html = html.replace(/<script src="(src\/js\/pwa\/[^"]+)"><\/script>/, () => '');
  fs.writeFileSync(path.join(raiz, 'dist', 'rocket-car-game.html'), html);
  console.log('dist/rocket-car-game.html gerado (arquivo único).');
}
