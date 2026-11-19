#!/usr/bin/env node
// Testes do kit. Rodam sem internet: node tests/testes.mjs   (ou: bash tests/rodar.sh)
// 1) cada exemplo renderiza 1 segundo e o MP4 tem vídeo e som
// 2) mesmo código = mesmos quadros: dois renders separados (1 navegador e 3 navegadores) dão o mesmo hash
// 3) o motor obedece ao tempo (o primeiro e o último quadro do trecho são diferentes)
// 4) "um motor por estilo": trocar só a história muda o filme, sem tocar no motor
// 5) nenhum exemplo depende de rede
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { renderizar } from '../ferramentas/render.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXEMPLOS = ['camadas-planas', 'fundo-pintado', 'cena-3d', 'marionete'];
const SEGUNDA_HISTORIA = ['camadas-planas', 'fundo-pintado'];
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'filme-em-codigo-teste-'));
const base = { largura: 640, altura: 360 };
let passou = 0, falhou = 0;
const ok = (cond, nome, detalhe = '') => { if (cond) { passou++; console.log('  ok    ' + nome); } else { falhou++; console.log('  FALHA ' + nome + (detalhe ? ' — ' + detalhe : '')); } };
const sonda = (arq) => JSON.parse(spawnSync('ffprobe', ['-v', 'error', '-count_frames', '-show_entries', 'stream=codec_type,codec_name,width,height,nb_read_frames', '-of', 'json', arq], { encoding: 'utf8' }).stdout).streams;
const linhas = (pasta) => fs.readFileSync(path.join(pasta, 'quadros.sha256'), 'utf8').trim().split('\n').map((l) => l.split('  ')[0]);

try {
  console.log('5) sem rede');
  const fontes = [];
  const varre = (d) => { for (const n of fs.readdirSync(d)) { const p = path.join(d, n); if (fs.statSync(p).isDirectory()) varre(p); else if (/\.(html|js|mjs|json|svg)$/.test(n)) fontes.push(p); } };
  varre(path.join(RAIZ, 'exemplos')); varre(path.join(RAIZ, 'comum'));
  const externos = fontes.filter((f) => /https?:\/\/(?!www\.w3\.org\/)/.test(fs.readFileSync(f, 'utf8')));
  ok(externos.length === 0, 'nenhum endereço de internet em exemplos/ e comum/', externos.join(', '));
  ok(fs.existsSync(path.join(RAIZ, 'vendor/three/three.module.js')) && fs.existsSync(path.join(RAIZ, 'vendor/three/LICENSE')), 'three.js está dentro do kit (vendor/three) com a licença');

  for (const ex of EXEMPLOS) {
    console.log(`\n${ex}`);
    const pasta = path.join(RAIZ, 'exemplos', ex);
    for (const h of fs.readdirSync(pasta).filter((n) => /^historia.*\.json$/.test(n))) { let bom = true; try { JSON.parse(fs.readFileSync(path.join(pasta, h), 'utf8')); } catch { bom = false; } ok(bom, `${h} é um JSON válido`); }

    // 1) render curto com som
    const a = await renderizar({ ...base, pasta, saida: path.join(TMP, ex + '-a'), inicio: 4, fim: 5, trabalhadores: 2 });
    const fluxos = sonda(a.mp4), v = fluxos.find((f) => f.codec_type === 'video'), s = fluxos.find((f) => f.codec_type === 'audio');
    ok(v && v.codec_name === 'h264' && v.width === 640 && v.height === 360, 'MP4 tem vídeo h264 640x360');
    ok(v && Number(v.nb_read_frames) === 30, 'MP4 tem 30 quadros (1 segundo)', v && v.nb_read_frames);
    ok(!!s && s.codec_name === 'aac', 'MP4 tem som (aac)');
    ok(a.medida.webgl_renderizador && /SwiftShader|llvmpipe|Software/i.test(a.medida.webgl_renderizador), 'sem placa de vídeo: WebGL calculado pela CPU', a.medida.webgl_renderizador);

    // 2) determinismo: outro lançamento, outra divisão dos quadros entre navegadores
    const b = await renderizar({ ...base, pasta, saida: path.join(TMP, ex + '-b'), inicio: 4, fim: 5, trabalhadores: 3 });
    const c1 = await renderizar({ ...base, pasta, saida: path.join(TMP, ex + '-c'), inicio: 4, fim: 5, trabalhadores: 1 });
    ok(a.medida.hash_quadros === b.medida.hash_quadros && b.medida.hash_quadros === c1.medida.hash_quadros, 'mesmo código = mesmos quadros (3 renders: 2, 3 e 1 navegador)', `${a.medida.hash_quadros.slice(0, 12)} ${b.medida.hash_quadros.slice(0, 12)} ${c1.medida.hash_quadros.slice(0, 12)}`);
    ok(a.medida.hash_som === b.medida.hash_som, 'mesmo código = mesmo som');

    // 3) o tempo manda
    const hs = linhas(a.saida);
    ok(hs[0] !== hs[hs.length - 1] && new Set(hs).size > 10, 'os quadros mudam com o tempo', `${new Set(hs).size} quadros diferentes em 30`);

    // 4) segunda história no mesmo motor
    if (SEGUNDA_HISTORIA.includes(ex)) {
      const d = await renderizar({ ...base, pasta, historia: 'historia-2.json', saida: path.join(TMP, ex + '-d'), inicio: 4, fim: 5, trabalhadores: 2 });
      ok(d.medida.hash_quadros !== a.medida.hash_quadros && fs.existsSync(d.mp4), 'historia-2.json: mesmo motor, outro filme');
    }
  }
} catch (e) { falhou++; console.log('  FALHA erro inesperado — ' + (e.stack || e.message)); }
finally { fs.rmSync(TMP, { recursive: true, force: true }); }

console.log(`\n${passou} passaram, ${falhou} falharam`);
process.exit(falhou ? 1 : 0);
