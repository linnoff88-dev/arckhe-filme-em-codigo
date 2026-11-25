// comum/filme.js — a parte igual em todo motor.
// Cria a tela, lê a história, e combina com o render.mjs: window.FILME.desenhar(t).
// Aberto no navegador normal (sem ?render=1), vira um player para você assistir antes de renderizar.
(function () {
  'use strict';
  const P = new URLSearchParams(location.search);
  const MODO_RENDER = P.get('render') === '1';

  // ---------- contas úteis para animar ----------
  const U = {
    limita: (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)),
    mistura: (a, b, k) => a + (b - a) * k,
    // 0 antes de a, 1 depois de b, reta no meio
    trecho: (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a))),
    // curvas de aceleraçêo (entram com valor de 0 a 1)
    suave: (k) => k * k * (3 - 2 * k),
    saiDevagar: (k) => 1 - Math.pow(1 - k, 3),
    entraDevagar: (k) => k * k * k,
    vaiVolta: (k) => Math.sin(Math.PI * k),
    // sorteio com semente: a mesma semente dá sempre os mesmos números
    sorteio(semente) {
      let a = (semente >>> 0) || 1;
      return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },
    // ruído macio em 1 dimensêo (para vento, tremor de câmera): devolve de -1 a 1
    ruido(x, semente = 1) {
      const i = Math.floor(x), f = x - i;
      const h = (n) => { let v = Math.imul(n ^ (semente * 374761393), 668265263); v = (v ^ (v >>> 13)) * 1274126177; return (((v ^ (v >>> 16)) >>> 0) / 2147483648) - 1; };
      const k = f * f * (3 - 2 * f);
      return h(i) + (h(i + 1) - h(i)) * k;
    },
    // cores: '#rrggbb' -> [r,g,b]
    rgb(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; },
    // mistura duas cores '#rrggbb' e devolve outra '#rrggbb' (serve para guardar e misturar de novo)
    hex(a, b, k = 0) {
      const A = U.rgb(a), B = U.rgb(b || a);
      return '#' + [0, 1, 2].map(i => Math.round(A[i] + (B[i] - A[i]) * k).toString(16).padStart(2, '0')).join('');
    },
    // mistura duas cores '#rrggbb' (k de 0 a 1) e devolve 'rgb(...)' ou 'rgba(...)'
    cor(a, b, k = 0, alfa = 1) {
      const A = U.rgb(a), B = U.rgb(b || a);
      const c = [0, 1, 2].map(i => Math.round(A[i] + (B[i] - A[i]) * k));
      return alfa >= 1 ? `rgb(${c[0]},${c[1]},${c[2]})` : `rgba(${c[0]},${c[1]},${c[2]},${alfa})`;
    },
  };

  // ---------- criar o filme ----------
  // def = { largura, altura, fps, duracao, montar({historia, tela, largura, altura}) -> { desenhar(t), som() } }
  function criar(def) {
    const tela = document.createElement('canvas');
    document.body.style.cssText = 'margin:0;background:#0b0b0f;overflow:hidden';
    tela.style.display = 'block';
    document.body.appendChild(tela);
    const FILME = { tela, fps: def.fps || 30, duracao: def.duracao || 10, largura: def.largura || 1920, altura: def.altura || 1080 };
    window.FILME = FILME;
    FILME.pronto = (async () => {
      const arq = P.get('historia') || 'historia.json';
      const resp = await fetch(arq, { cache: 'no-store' });
      if (!resp.ok) throw new Error('nêo consegui ler ' + arq);
      const historia = await resp.json();
      if (historia.duracao) FILME.duracao = historia.duracao;
      if (historia.fps) FILME.fps = historia.fps;
      const l = Number(P.get('l')) || FILME.largura, a = Number(P.get('a')) || FILME.altura;
      tela.width = l; tela.height = a;
      const m = await def.montar({ historia, tela, largura: l, altura: a, duracao: FILME.duracao, fps: FILME.fps });
      FILME.historia = historia;
      FILME.desenhar = m.desenhar;
      if (m.som) { let guardado = null; FILME.som = () => (guardado || (guardado = m.som())); }
      FILME.desenhar(0);
      if (!MODO_RENDER) player(FILME);
      return true;
    })();
    FILME.pronto.catch((e) => { console.error(String(e && e.stack || e)); });
    return FILME;
  }

  // ---------- player para assistir no navegador (só aqui existe relógio de verdade) ----------
  function player(F) {
    const tela = F.tela;
    tela.style.cssText = 'display:block;max-width:100vw;max-height:calc(100vh - 46px);margin:0 auto';
    const barra = document.createElement('div');
    barra.style.cssText = 'height:46px;display:flex;gap:12px;align-items:center;padding:0 14px;font:14px system-ui,sans-serif;color:#ddd;background:#16161c';
    barra.innerHTML = '<button id="tocar" style="font:inherit;padding:6px 14px;cursor:pointer">▶ tocar</button>' +
      '<input id="pos" type="range" min="0" max="1000" value="0" style="flex:1"><span id="rel">0,0 s</span>';
    document.body.appendChild(barra);
    const bt = barra.querySelector('#tocar'), pos = barra.querySelector('#pos'), rel = barra.querySelector('#rel');
    let tocando = false, t = 0, base = 0, ctx = null, fonte = null;
    const mostra = () => { F.desenhar(t); pos.value = String(Math.round(1000 * t / F.duracao)); rel.textContent = t.toFixed(1).replace('.', ',') + ' s'; };
    function paraSom() { if (fonte) { try { fonte.stop(); } catch (e) { /* já parou */ } fonte = null; } }
    function tocaSom() {
      if (!F.som) return;
      const s = F.som(); ctx = ctx || new AudioContext();
      const buf = ctx.createBuffer(2, s.esq.length, s.taxa || 44100);
      buf.copyToChannel(s.esq, 0); buf.copyToChannel(s.dir, 1);
      fonte = ctx.createBufferSource(); fonte.buffer = buf; fonte.connect(ctx.destination); fonte.start(0, t);
    }
    function passo(agora) {
      if (!tocando) return;
      t = (agora - base) / 1000;
      if (t >= F.duracao) { t = 0; tocando = false; bt.textContent = '▶ tocar'; paraSom(); mostra(); return; }
      mostra(); requestAnimationFrame(passo);
    }
    bt.onclick = () => {
      tocando = !tocando; bt.textContent = tocando ? '⏸ pausar' : '▶ tocar';
      if (tocando) { base = performance.now() - t * 1000; tocaSom(); requestAnimationFrame(passo); } else paraSom();
    };
    pos.oninput = () => { tocando = false; bt.textContent = '▶ tocar'; paraSom(); t = F.duracao * Number(pos.value) / 1000; mostra(); };
  }

  window.Filme = Object.assign({ criar, MODO_RENDER }, U);
})();
