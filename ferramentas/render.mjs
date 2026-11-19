#!/usr/bin/env node
// render.mjs — transforma um motor (pasta com index.html) em MP4.
// Sem dependência de npm: fala direto com o Chrome/Chromium pelo protocolo DevTools.
// Precisa de: Node 22+, Chrome ou Chromium instalado, ffmpeg.
//
// Uso:
//   node ferramentas/render.mjs exemplos/fundo-pintado
//   node ferramentas/render.mjs exemplos/fundo-pintado --historia historia-2.json
//   node ferramentas/render.mjs exemplos/cena-3d --quadros 1,5,9        (só 3 quadros soltos, sem vídeo)
//   node ferramentas/render.mjs exemplos/marionete --largura 640 --altura 360 --fim 1
//
// O motor expõe na página:  window.FILME = { largura, altura, fps, duracao, tela, pronto, desenhar(t), som() }
// O tempo NÃO vem do relógio: este script chama desenhar(t) para cada quadro, com t = quadro / fps.

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const AJUDA = `render.mjs — motor (HTML + JS) vira MP4, quadro a quadro, sem placa de vídeo.

  node ferramentas/render.mjs <pasta do motor> [opções]

  --historia ARQ      arquivo de história dentro da pasta (padrão: historia.json)
  --saida DIR         onde gravar (padrão: saida/<motor>[-<historia>])
  --largura N         largura em pixels (padrão: a do motor)
  --altura N          altura em pixels (padrão: a do motor)
  --fps N             quadros por segundo (padrão: o do motor)
  --inicio S          segundo inicial (padrão: 0)
  --fim S             segundo final (padrão: a duração do motor)
  --quadros LISTA     só quadros soltos, ex.: 1,4.5,8 (grava PNG, não faz vídeo)
  --trabalhadores N   navegadores em paralelo (padrão: 4)
  --capa S            grava também quadro.jpg (do segundo S) na pasta do motor
  --medida ARQ        copia o medida.json para esse arquivo
  --sem-som           vídeo mudo
  --apagar-quadros    apaga os PNG depois de montar o MP4
  --ajuda             mostra este texto

Navegador: usa a variável CHROME_PATH, ou procura Chrome/Chromium instalado.`;

// ---------- opções ----------
function lerOpcoes(args) {
  const o = { _: [] };
  const semValor = new Set(['sem-som', 'apagar-quadros', 'ajuda', 'help']);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith('--')) { o._.push(a); continue; }
    const k = a.slice(2);
    if (semValor.has(k)) { o[k] = true; continue; }
    if (i + 1 >= args.length) throw new Error(`Faltou o valor de ${a}`);
    o[k] = args[++i];
  }
  return o;
}

// ---------- achar o navegador ----------
export function acharNavegador() {
  const candidatos = [];
  if (process.env.CHROME_PATH) candidatos.push(process.env.CHROME_PATH);
  // Chromium que o Playwright já baixou (se existir), do mais novo para o mais velho
  const cache = process.env.PLAYWRIGHT_BROWSERS_PATH ||
    (process.platform === 'darwin' ? path.join(os.homedir(), 'Library/Caches/ms-playwright')
      : process.platform === 'win32' ? path.join(os.homedir(), 'AppData/Local/ms-playwright')
        : path.join(os.homedir(), '.cache/ms-playwright'));
  try {
    const pastas = fs.readdirSync(cache).filter(n => /^chromium-\d+$/.test(n))
      .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
    for (const p of pastas) {
      for (const sub of ['chrome-linux64/chrome', 'chrome-linux-arm64/chrome', 'chrome-linux/chrome',
        'chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium',
        'chrome-win/chrome.exe', 'chrome-win64/chrome.exe']) {
        candidatos.push(path.join(cache, p, sub));
      }
    }
  } catch { /* sem cache do Playwright */ }
  candidatos.push(
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  );
  for (const c of candidatos) { try { if (fs.existsSync(c)) return c; } catch { /* segue */ } }
  throw new Error('Não achei Chrome nem Chromium. Instale um deles ou aponte com CHROME_PATH=/caminho/do/chrome');
}

// ---------- servidor local (só 127.0.0.1) ----------
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.css': 'text/css; charset=utf-8', '.wav': 'audio/wav', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};
export function subirServidor(raiz = RAIZ, porta = 0) {
  return new Promise((resolve, reject) => {
    const srv = http.createServer((req, res) => {
      try {
        const caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname);
        let arq = path.join(raiz, path.normalize(caminho));
        if (!arq.startsWith(raiz)) { res.writeHead(403); res.end(); return; }
        if (fs.existsSync(arq) && fs.statSync(arq).isDirectory()) arq = path.join(arq, 'index.html');
        if (!fs.existsSync(arq)) { res.writeHead(404); res.end('não achei ' + caminho); return; }
        res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arq).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        fs.createReadStream(arq).pipe(res);
      } catch (e) { res.writeHead(500); res.end(String(e)); }
    });
    srv.on('error', reject);
    srv.listen(porta, '127.0.0.1', () => resolve({ srv, porta: srv.address().port }));
  });
}

// ---------- navegador sem tela, pelo protocolo DevTools ----------
function flagsNavegador(pastaPerfil, l, a, semSandbox) {
  const f = [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${pastaPerfil}`,
    // sem placa de vídeo: tudo desenhado pela CPU (WebGL por software)
    '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
    '--force-color-profile=srgb', '--force-device-scale-factor=1', `--window-size=${l},${a}`,
    '--hide-scrollbars', '--mute-audio', '--no-first-run', '--no-default-browser-check',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows',
    '--disable-extensions', '--disable-component-update', '--disable-sync', '--disable-features=Translate,MediaRouter',
    'about:blank',
  ];
  if (semSandbox) f.unshift('--no-sandbox');
  return f;
}

async function abrirNavegador(binario, l, a) {
  // navegador em snap só enxerga pastas dentro de ~/snap
  const base = binario.includes('/snap/') ? path.join(os.homedir(), 'snap/chromium/common') : os.tmpdir();
  for (const semSandbox of [false, true]) {
    const perfil = await fsp.mkdtemp(path.join(base, 'filme-em-codigo-'));
    const proc = spawn(binario, flagsNavegador(perfil, l, a, semSandbox), { stdio: ['ignore', 'ignore', 'pipe'] });
    let erro = '';
    const ws = await new Promise((resolve) => {
      const limite = setTimeout(() => resolve(null), 30000);
      proc.stderr.on('data', (d) => {
        erro += d.toString();
        const m = erro.match(/DevTools listening on (ws:\/\/\S+)/);
        if (m) { clearTimeout(limite); resolve(m[1]); }
      });
      proc.on('exit', () => { clearTimeout(limite); resolve(null); });
    });
    if (ws) return { proc, ws, perfil, semSandbox };
    try { proc.kill('SIGKILL'); } catch { /* já saiu */ }
    await fsp.rm(perfil, { recursive: true, force: true });
    if (semSandbox) throw new Error('O navegador não abriu.\n' + erro.split('\n').slice(-6).join('\n'));
  }
}

class Conexao {
  constructor(url) {
    this.id = 0; this.espera = new Map(); this.ouvintes = [];
    this.ws = new WebSocket(url);
    this.aberta = new Promise((ok, falha) => { this.ws.onopen = ok; this.ws.onerror = (e) => falha(new Error('WebSocket: ' + (e.message || 'erro'))); });
    this.ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && this.espera.has(m.id)) {
        const { ok, falha } = this.espera.get(m.id); this.espera.delete(m.id);
        if (m.error) falha(new Error(m.error.message)); else ok(m.result);
      } else if (m.method) for (const f of this.ouvintes) f(m);
    };
  }
  manda(method, params = {}, sessionId) {
    const id = ++this.id;
    return new Promise((ok, falha) => {
      this.espera.set(id, { ok, falha });
      this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
  ouve(f) { this.ouvintes.push(f); }
  fecha() { try { this.ws.close(); } catch { /* tanto faz */ } }
}

// Abre um navegador, carrega a página do motor e devolve funções para avaliar código nela.
export async function abrirPagina(binario, url, l, a) {
  const nav = await abrirNavegador(binario, l, a);
  const c = new Conexao(nav.ws); await c.aberta;
  const { targetId } = await c.manda('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await c.manda('Target.attachToTarget', { targetId, flatten: true });
  const problemas = [];
  c.ouve((m) => {
    if (m.sessionId !== sessionId) return;
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      problemas.push('erro na página: ' + (d.exception?.description || d.text));
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      problemas.push('console.error: ' + m.params.args.map(x => x.value ?? x.description ?? '').join(' '));
    }
    if (m.method === 'Network.requestWillBeSent') {
      const u = m.params.request.url;
      if (!/^(http:\/\/127\.0\.0\.1[:/]|data:|blob:|about:)/.test(u)) problemas.push('pedido para fora do computador (proibido): ' + u);
    }
  });
  const s = (metodo, params) => c.manda(metodo, params, sessionId);
  await s('Page.enable'); await s('Runtime.enable'); await s('Network.enable');
  await s('Emulation.setDeviceMetricsOverride', { width: l, height: a, deviceScaleFactor: 1, mobile: false });
  const carregou = new Promise((ok) => c.ouve((m) => { if (m.sessionId === sessionId && m.method === 'Page.loadEventFired') ok(); }));
  await s('Page.navigate', { url });
  await carregou;
  async function avalia(expressao) {
    const r = await s('Runtime.evaluate', { expression: expressao, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error('erro na página: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    if (problemas.length) throw new Error(problemas.join('\n'));
    return r.result.value;
  }
  async function fecha() {
    c.fecha();
    try { nav.proc.kill('SIGKILL'); } catch { /* já saiu */ }
    await new Promise(r => setTimeout(r, 150));
    await fsp.rm(nav.perfil, { recursive: true, force: true }).catch(() => { });
  }
  try {
    const versao = await c.manda('Browser.getVersion');
    await avalia(`(async () => {
      if (!window.FILME) throw new Error('a página não criou window.FILME');
      await window.FILME.pronto;
      return true;
    })()`);
    return { avalia, fecha, versao: versao.product, semSandbox: nav.semSandbox, problemas };
  } catch (e) { await fecha(); throw e; }
}

// ---------- medição pelo cgroup (só quando roda dentro de `systemd-run --scope`) ----------
function lerCgroup() {
  try {
    const linha = fs.readFileSync('/proc/self/cgroup', 'utf8').trim().split('\n').pop();
    const rel = linha.split('::')[1];
    if (!rel || !/run-[^/]*\.scope$/.test(rel)) return null;
    const base = path.join('/sys/fs/cgroup', rel);
    const uso = Number(fs.readFileSync(path.join(base, 'cpu.stat'), 'utf8').match(/usage_usec (\d+)/)[1]);
    let pico = null, teto = null;
    try { pico = Number(fs.readFileSync(path.join(base, 'memory.peak'), 'utf8')); } catch { /* sem contador */ }
    try { const t = fs.readFileSync(path.join(base, 'memory.max'), 'utf8').trim(); teto = t === 'max' ? null : Number(t); } catch { /* sem teto */ }
    return { uso, pico, teto };
  } catch { return null; }
}

function nomeDaCpu() {
  const m = os.cpus()[0]?.model;
  if (m && m !== 'unknown') return m;
  try { const l = spawnSync('lscpu', { encoding: 'utf8' }).stdout.split('\n').find((x) => /^Model name:/.test(x)); if (l) return l.split(':')[1].trim(); } catch { /* sem lscpu */ }
  return os.arch();
}

function roda(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw new Error(`Não consegui rodar ${cmd}: ${r.error.message}`);
  if (r.status !== 0) throw new Error(`${cmd} falhou:\n${(r.stderr || '').split('\n').slice(-12).join('\n')}`);
  return r.stdout;
}

function wavDeBase64Pcm(b64, taxa, canais) {
  const pcm = Buffer.from(b64, 'base64');
  const cab = Buffer.alloc(44);
  cab.write('RIFF', 0); cab.writeUInt32LE(36 + pcm.length, 4); cab.write('WAVE', 8); cab.write('fmt ', 12);
  cab.writeUInt32LE(16, 16); cab.writeUInt16LE(1, 20); cab.writeUInt16LE(canais, 22); cab.writeUInt32LE(taxa, 24);
  cab.writeUInt32LE(taxa * canais * 2, 28); cab.writeUInt16LE(canais * 2, 32); cab.writeUInt16LE(16, 34);
  cab.write('data', 36); cab.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([cab, pcm]);
}

// ---------- o render ----------
export async function renderizar(opc) {
  const t0 = Date.now();
  const cg0 = lerCgroup();
  const pasta = path.resolve(opc.pasta);
  if (!fs.existsSync(path.join(pasta, 'index.html'))) throw new Error(`Não achei index.html em ${pasta}`);
  if (!pasta.startsWith(RAIZ + path.sep)) throw new Error('A pasta do motor precisa ficar dentro do kit (ex.: exemplos/ ou meus/).');
  const nome = path.basename(pasta);
  const historia = opc.historia || 'historia.json';
  if (!fs.existsSync(path.join(pasta, historia))) throw new Error(`Não achei ${historia} em ${pasta}`);
  const sufixo = historia === 'historia.json' ? '' : '-' + path.basename(historia, '.json');
  const saida = path.resolve(opc.saida || path.join(RAIZ, 'saida', nome + sufixo));
  const pastaQuadros = path.join(saida, 'quadros');
  await fsp.rm(pastaQuadros, { recursive: true, force: true });
  await fsp.mkdir(pastaQuadros, { recursive: true });

  const binario = acharNavegador();
  const { srv, porta } = await subirServidor();
  const q = new URLSearchParams({ render: '1', historia });
  if (opc.largura) q.set('l', String(opc.largura));
  if (opc.altura) q.set('a', String(opc.altura));
  const url = `http://127.0.0.1:${porta}/${path.relative(RAIZ, pasta).split(path.sep).join('/')}/index.html?${q}`;

  const paginas = [];
  const fechaTudo = async () => { await Promise.all(paginas.map(p => p.fecha())); srv.close(); };
  try {
    // 1) primeira página: descobre tamanho, fps e duração que o motor declara
    const lJanela = Number(opc.largura) || 1920, aJanela = Number(opc.altura) || 1080;
    paginas.push(await abrirPagina(binario, url, lJanela, aJanela));
    const info = await paginas[0].avalia(`(() => {
      const F = window.FILME; let gl = null;
      try {
        const c = document.createElement('canvas'); const g = c.getContext('webgl2') || c.getContext('webgl');
        if (g) { const e = g.getExtension('WEBGL_debug_renderer_info'); gl = e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER); }
      } catch (e) { gl = null; }
      return { largura: F.tela.width, altura: F.tela.height, fps: F.fps, duracao: F.duracao, temSom: typeof F.som === 'function', gl, titulo: document.title };
    })()`);
    const fps = Number(opc.fps) || info.fps;
    const inicio = Number(opc.inicio) || 0;
    const fim = Math.min(opc.fim !== undefined ? Number(opc.fim) : info.duracao, info.duracao);

    // 2) lista de quadros: [{n, t}]
    let lista;
    const soltos = opc.quadros !== undefined;
    if (soltos) {
      lista = String(opc.quadros).split(',').map(Number).map((t, i) => ({ n: i + 1, t, nome: `quadro-${t.toFixed(2).replace('.', '_')}s.png` }));
    } else {
      const a = Math.round(inicio * fps), b = Math.round(fim * fps);
      lista = []; for (let i = a; i < b; i++) lista.push({ n: i - a + 1, t: i / fps, nome: String(i - a + 1).padStart(6, '0') + '.png' });
    }
    if (!lista.length) throw new Error('Nenhum quadro para desenhar: confira --inicio e --fim.');

    // 3) abre os outros navegadores e reparte os quadros
    const nTrab = Math.max(1, Math.min(Number(opc.trabalhadores) || 4, lista.length));
    while (paginas.length < nTrab) paginas.push(await abrirPagina(binario, url, lJanela, aJanela));
    const tAberto = Date.now();
    const hashes = new Array(lista.length);
    let feitos = 0;
    const mostra = () => { if (process.stderr.isTTY) process.stderr.write(`\r  quadros: ${feitos}/${lista.length}`); };
    await Promise.all(paginas.map(async (pg, k) => {
      for (let i = k; i < lista.length; i += nTrab) {
        const { t, nome: arq } = lista[i];
        // desenha e lê o canvas na mesma tarefa: nunca pega quadro velho
        const dados = await pg.avalia(`(async () => { await window.FILME.desenhar(${t}); return window.FILME.tela.toDataURL('image/png'); })()`);
        const png = Buffer.from(dados.slice(dados.indexOf(',') + 1), 'base64');
        await fsp.writeFile(path.join(pastaQuadros, arq), png);
        hashes[i] = crypto.createHash('sha256').update(png).digest('hex');
        feitos++; mostra();
      }
    }));
    if (process.stderr.isTTY) process.stderr.write('\n');
    const tQuadros = Date.now();
    const hashQuadros = crypto.createHash('sha256').update(hashes.join('\n')).digest('hex');
    await fsp.writeFile(path.join(saida, 'quadros.sha256'), lista.map((q2, i) => `${hashes[i]}  ${q2.nome}`).join('\n') + '\n');

    const medida = {
      exemplo: nome, historia, data: new Date().toISOString().slice(0, 10),
      resolucao: `${info.largura}x${info.altura}`, fps, quadros: lista.length,
      hash_quadros: hashQuadros,
    };

    if (soltos) {
      await fechaTudo();
      return { saida, pastaQuadros, medida, soltos: lista.map(x => path.join(pastaQuadros, x.nome)) };
    }

    // 4) som: o motor calcula as amostras em código; aqui só vira arquivo WAV
    let arqSom = null, hashSom = null;
    if (info.temSom && !opc['sem-som']) {
      const s = await paginas[0].avalia(`(() => {
        const s = window.FILME.som(); const taxa = s.taxa || 44100;
        const a = Math.floor(${inicio} * taxa), b = Math.min(s.esq.length, Math.floor(${fim} * taxa));
        const n = Math.max(0, b - a); const pcm = new Int16Array(n * 2);
        for (let i = 0; i < n; i++) {
          const e = Math.max(-1, Math.min(1, s.esq[a + i])), d = Math.max(-1, Math.min(1, s.dir[a + i]));
          pcm[2 * i] = Math.round(e * 32767); pcm[2 * i + 1] = Math.round(d * 32767);
        }
        const bytes = new Uint8Array(pcm.buffer); let txt = '';
        for (let i = 0; i < bytes.length; i += 32768) txt += String.fromCharCode.apply(null, bytes.subarray(i, i + 32768));
        return { taxa, b64: btoa(txt) };
      })()`);
      const wav = wavDeBase64Pcm(s.b64, s.taxa, 2);
      arqSom = path.join(saida, 'som.wav');
      await fsp.writeFile(arqSom, wav);
      hashSom = crypto.createHash('sha256').update(wav).digest('hex');
    }
    const tSom = Date.now();
    await fechaTudo();

    // 5) ffmpeg junta os quadros e o som
    const mp4 = path.join(saida, `${nome}${sufixo}.mp4`);
    const args = ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(pastaQuadros, '%06d.png')];
    if (arqSom) args.push('-i', arqSom);
    args.push('-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv');
    if (arqSom) args.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
    args.push('-movflags', '+faststart', '-map_metadata', '-1', '-fflags', '+bitexact', mp4);
    roda('ffmpeg', args);
    const tFfmpeg = Date.now();

    if (opc.capa !== undefined) {
      const i = Math.max(0, Math.min(lista.length - 1, Math.round((Number(opc.capa) - inicio) * fps)));
      roda('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(pastaQuadros, lista[i].nome), '-vf', 'scale=1280:-2', '-q:v', '5', path.join(pasta, `quadro${sufixo}.jpg`)]);
    }
    if (opc['apagar-quadros']) await fsp.rm(pastaQuadros, { recursive: true, force: true });

    const total = (Date.now() - t0) / 1000;
    const cg1 = lerCgroup();
    const bytes = fs.statSync(mp4).size;
    Object.assign(medida, {
      duracao_s: +(lista.length / fps).toFixed(3),
      tempo_render_s: +total.toFixed(2),
      tempos_s: {
        abrir_navegador: +((tAberto - t0) / 1000).toFixed(2), quadros: +((tQuadros - tAberto) / 1000).toFixed(2),
        som: +((tSom - tQuadros) / 1000).toFixed(2), ffmpeg: +((tFfmpeg - tSom) / 1000).toFixed(2),
      },
      ms_por_quadro: +(((tQuadros - tAberto) / lista.length)).toFixed(1),
      segundos_de_render_por_segundo_de_video: +(total / (lista.length / fps)).toFixed(2),
      mp4_bytes: bytes, mp4_mb: +(bytes / 1048576).toFixed(2),
      som: arqSom ? 'feito em código (WAV 44,1 kHz estéreo → AAC)' : 'sem som',
      hash_som: hashSom,
      navegadores_em_paralelo: nTrab,
      nucleos_da_maquina: os.cpus().length,
      nucleos_usados_em_media: cg0 && cg1 ? +(((cg1.uso - cg0.uso) / 1e6) / total).toFixed(2) : null,
      memoria_pico_mb: cg1 && cg1.pico ? Math.round(cg1.pico / 1048576) : null,
      teto_de_memoria_mb: cg1 && cg1.teto ? Math.round(cg1.teto / 1048576) : null,
      gpu: 'sem GPU (navegador aberto com --disable-gpu; WebGL calculado pela CPU)',
      webgl_renderizador: info.gl,
      cpu: nomeDaCpu(), arquitetura: os.arch(), sistema: os.platform(),
      navegador: paginas[0].versao, node: process.version,
      ffmpeg: roda('ffmpeg', ['-version']).split('\n')[0].replace(/ Copyright.*/, ''),
    });
    await fsp.writeFile(path.join(saida, 'medida.json'), JSON.stringify(medida, null, 2) + '\n');
    if (opc.medida) await fsp.writeFile(path.resolve(opc.medida), JSON.stringify(medida, null, 2) + '\n');
    return { saida, pastaQuadros, mp4, medida };
  } catch (e) { await fechaTudo().catch(() => { }); throw e; }
}

// ---------- linha de comando ----------
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const o = lerOpcoes(process.argv.slice(2));
    if (o.ajuda || o.help || !o._.length) { console.log(AJUDA); process.exit(o._.length ? 0 : (o.ajuda || o.help ? 0 : 2)); }
    if (typeof WebSocket === 'undefined') throw new Error('Este script precisa do Node 22 ou mais novo (você tem ' + process.version + ').');
    const r = await renderizar({ ...o, pasta: o._[0] });
    if (r.soltos) { console.log('Quadros soltos:'); for (const s of r.soltos) console.log('  ' + s); }
    else {
      const m = r.medida;
      console.log(`Pronto: ${r.mp4}`);
      console.log(`  ${m.quadros} quadros · ${m.resolucao} · ${m.fps} fps · ${m.tempo_render_s} s de render · ${m.mp4_mb} MB · ${m.navegadores_em_paralelo} navegadores · sem GPU`);
    }
  } catch (e) { console.error('Falhou: ' + e.message); process.exit(1); }
}
