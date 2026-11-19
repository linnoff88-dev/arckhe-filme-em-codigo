#!/usr/bin/env node
// ver.mjs — abre um motor no seu navegador, para assistir (com som) antes de renderizar.
// Uso:  node ferramentas/ver.mjs exemplos/fundo-pintado [historia-2.json]
// Depois abra o endereço que aparecer. Ctrl+C para fechar.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { subirServidor } from './render.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pasta = path.resolve(process.argv[2] || '');
const historia = process.argv[3] || 'historia.json';
if (!process.argv[2] || !fs.existsSync(path.join(pasta, 'index.html'))) {
  console.error('Uso: node ferramentas/ver.mjs <pasta do motor> [arquivo de história]');
  process.exit(2);
}
if (!pasta.startsWith(RAIZ + path.sep)) { console.error('A pasta do motor precisa ficar dentro do kit.'); process.exit(2); }
let aberto;
try { aberto = await subirServidor(RAIZ, 8123); } catch { aberto = await subirServidor(RAIZ, 0); }
const rel = path.relative(RAIZ, pasta).split(path.sep).join('/');
console.log(`Abra no navegador:  http://127.0.0.1:${aberto.porta}/${rel}/index.html?historia=${historia}`);
console.log('Aperte "tocar" para ver com som. Ctrl+C aqui para fechar.');
