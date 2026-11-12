#!/usr/bin/env node
/* Servidor local simples para testar o jogo: node tools/servir.js [porta]  ->  http://localhost:8080 */
const http = require('http'), fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..'), porta = Number(process.argv[2]) || 8080;
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.sql': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]); if (rel.endsWith('/')) rel += 'index.html';
  const arq = path.join(raiz, rel);
  if (!arq.startsWith(raiz) || !fs.existsSync(arq) || fs.statSync(arq).isDirectory()) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'Content-Type': tipos[path.extname(arq)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(arq).pipe(res);
}).listen(porta, () => console.log('Rocket Car Game em http://localhost:' + porta));
