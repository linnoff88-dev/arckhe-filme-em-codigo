// MOTOR "marionete" — uma ilustraçêo pronta, mexida por pequenas áreas.
// Jeito de animar: NADA é redesenhado. O motor lê uma ilustraçêo (ilustracao.svg), separa
// as peças marcadas (data-mexe) e entorta cada uma com uma malha de triângulos: presa na raiz,
// solta na ponta. O resto do desenho fica exatamente como o artista fez.
// Quais peças mexem, e como, está em historia.json. Este arquivo nêo muda.
(function () {
  'use strict';
  const { limita, mistura, trecho, suave, sorteio, ruido } = Filme;
  const L = 1920, A = 1080, CELULA = 30; // tamanho de cada quadradinho da malha, em pixels de desenho

  // desenha um triângulo da imagem "img" (cantos u,v) no lugar novo (cantos x,y)
  function triangulo(c, img, x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2) {
    const den = u0 * (v2 - v1) - u1 * v2 + u2 * v1 + (u1 - u2) * v0; if (!den) return;
    const a = -(v0 * (x2 - x1) - v1 * x2 + v2 * x1 + (v1 - v2) * x0) / den, b = (v1 * y2 + v0 * (y1 - y2) - v2 * y1 + (v2 - v1) * y0) / den;
    const cc = (u0 * (x2 - x1) - u1 * x2 + u2 * x1 + (u1 - u2) * x0) / den, d = -(u1 * y2 + u0 * (y1 - y2) - u2 * y1 + (u2 - u1) * y0) / den;
    const e = (u0 * (v2 * x1 - v1 * x2) + v0 * (u1 * x2 - u2 * x1) + (u2 * v1 - u1 * v2) * x0) / den, f = (u0 * (v2 * y1 - v1 * y2) + v0 * (u1 * y2 - u2 * y1) + (u2 * v1 - u1 * v2) * y0) / den;
    // aumenta o recorte um tiquinho para nêo aparecer a emenda entre triângulos
    const mx = (x0 + x1 + x2) / 3, my = (y0 + y1 + y2) / 3, g = 1.06;
    c.save(); c.beginPath(); c.moveTo(mx + (x0 - mx) * g, my + (y0 - my) * g); c.lineTo(mx + (x1 - mx) * g, my + (y1 - my) * g); c.lineTo(mx + (x2 - mx) * g, my + (y2 - my) * g); c.closePath(); c.clip();
    c.transform(a, b, cc, d, e, f); c.drawImage(img, 0, 0); c.restore();
  }

  Filme.criar({
    largura: L, altura: A, fps: 30, duracao: 10,
    async montar({ historia: H, tela, largura, altura, duracao }) {
      const c = tela.getContext('2d'), k = largura / L, acaso = sorteio(H.semente);
      const T = { titulo: [6.5, 7.5] };

      // ---------- 1) ler a ilustraçêo e separar: a "placa" (tudo que fica parado) e cada peça ----------
      const texto = await (await fetch(H.ilustracao, { cache: 'no-store' })).text();
      async function retrato(preparar) { // transforma o SVG (com umas partes escondidas) em imagem
        const doc = new DOMParser().parseFromString(texto, 'image/svg+xml'), raiz = doc.documentElement;
        raiz.setAttribute('width', tela.width); raiz.setAttribute('height', tela.height);
        preparar(raiz, doc);
        const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(doc)], { type: 'image/svg+xml' }));
        const img = new Image(); img.src = url; await img.decode();
        const cv = document.createElement('canvas'); cv.width = tela.width; cv.height = tela.height; cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url); return cv;
      }
      const placa = await retrato((raiz) => raiz.querySelectorAll('[data-mexe]').forEach((g) => g.setAttribute('visibility', 'hidden')));
      const pecas = [];
      for (const def of H.pecas) {
        const inteira = await retrato((raiz) => { raiz.setAttribute('visibility', 'hidden'); const g = raiz.querySelector('#' + CSS.escape(def.id)); if (!g) throw new Error('a ilustraçêo nêo tem a peça ' + def.id); g.setAttribute('visibility', 'visible'); });
        // acha o retângulo onde a peça está (olhando onde há tinta)
        const d = inteira.getContext('2d').getImageData(0, 0, inteira.width, inteira.height).data;
        let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
        for (let y = 0; y < inteira.height; y += 2) for (let x = 0; x < inteira.width; x += 2) if (d[(y * inteira.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        if (x1 < 0) continue;
        x0 = Math.max(0, x0 - 3); y0 = Math.max(0, y0 - 3); x1 = Math.min(inteira.width, x1 + 4); y1 = Math.min(inteira.height, y1 + 4);
        const img = document.createElement('canvas'); img.width = x1 - x0; img.height = y1 - y0; img.getContext('2d').drawImage(inteira, -x0, -y0);
        const p = { ...def, img, x0, y0, w: img.width, h: img.height, fase: acaso() * 6.28 };
        p.nx = Math.max(1, Math.ceil(p.w / (CELULA * k))); p.ny = Math.max(1, Math.ceil(p.h / (CELULA * k)));
        if (def.raiz) { // eixo da peça: da raiz (presa) até a ponta (solta), em pixels da tela
          p.rx = def.raiz[0] * k; p.ry = def.raiz[1] * k;
          const ex = def.ponta[0] * k - p.rx, ey = def.ponta[1] * k - p.ry; p.comp = Math.hypot(ex, ey); p.ex = ex / p.comp; p.ey = ey / p.comp;
          p.px = p.ey; p.py = -p.ex; if (p.px < 0) { p.px = -p.px; p.py = -p.py; } // o lado para onde o vento empurra (sempre para a direita quando vento = 1)
        }
        pecas.push(p);
      }

      // ---------- 2) o vento: uma rajada que cresce e passa (mesma conta para imagem e som) ----------
      const R = H.rajada;
      const vento = (t) => limita(0.35 + 0.65 * suave(trecho(t, R[0], R[1])) * (1 - 0.7 * suave(trecho(t, R[2], R[3]))) + 0.08 * ruido(t * 1.5, 4), 0, 1);

      // para onde vai um ponto (x,y) da peça no instante t
      function mover(p, x, y, t, V, sai) {
        if (p.jeito === 'desliza') { sai[0] = x + p.dx * k * (t / duracao) * H.vento; sai[1] = y; return; }
        const s = limita(((x - p.rx) * p.ex + (y - p.ry) * p.ey) / p.comp, 0, 1.3); // 0 na raiz, 1 na ponta
        const lado = (x - p.rx) * -p.ey + (y - p.ry) * p.ex;                          // distância para o lado do eixo
        const peso = Math.pow(s, p.potencia || 1.6);
        const onda = Math.sin(t * p.velocidade * (0.8 + 0.5 * V) - s * (p.atraso || 0.3) * 6.2832 + p.fase + lado * (p.ondaLado || 0) / k);
        if (p.jeito === 'dobra') { // gira em volta da raiz, cada vez mais até a ponta
          const ang = p.forca * peso * onda, co = Math.cos(ang), se = Math.sin(ang), dx = x - p.rx, dy = y - p.ry;
          sai[0] = p.rx + dx * co - dy * se; sai[1] = p.ry + dx * se + dy * co; return;
        }
        // 'vento': empurra para o lado do vento (inclina) e balança em volta disso; nada na raiz, tudo na ponta
        const desvio = p.forca * p.comp * peso * (V * (p.inclina || 0.6) + (0.25 + 0.75 * V) * onda * 0.6) * H.vento;
        sai[0] = x + desvio * p.px - Math.abs(desvio) * 0.22 * p.ex; // vai para o lado...
        sai[1] = y + desvio * p.py - Math.abs(desvio) * 0.22 * p.ey; // ...e recolhe um pouco na direçêo da raiz (o pano encurta quando voa)
      }

      const ponto = [0, 0];
      function desenharPeca(p, t, V) {
        const nx = p.nx, ny = p.ny, P = new Float32Array((nx + 1) * (ny + 1) * 2);
        for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { mover(p, p.x0 + p.w * i / nx, p.y0 + p.h * j / ny, t, V, ponto); const n = (j * (nx + 1) + i) * 2; P[n] = ponto[0]; P[n + 1] = ponto[1]; }
        for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
          const a = (j * (nx + 1) + i) * 2, b = a + 2, d2 = a + (nx + 1) * 2, e = d2 + 2;
          const u0 = p.w * i / nx, u1 = p.w * (i + 1) / nx, v0 = p.h * j / ny, v1 = p.h * (j + 1) / ny;
          triangulo(c, p.img, P[a], P[a + 1], P[b], P[b + 1], P[d2], P[d2 + 1], u0, v0, u1, v0, u0, v1);
          triangulo(c, p.img, P[b], P[b + 1], P[e], P[e + 1], P[d2], P[d2 + 1], u1, v0, u1, v1, u0, v1);
        }
      }

      // ---------- 3) o que o motor põe por cima da ilustraçêo: luz, bichinhos, grêo ----------
      const MANCHAS = Array.from({ length: 9 }, () => ({ x: 60 + acaso() * 760, y: 800 + acaso() * 200, r: 60 + acaso() * 110, f: 0.5 + acaso() * 0.9, fase: acaso() * 6.28 })); // luz passando entre as folhas
      const SEMENTES = Array.from({ length: 34 }, () => ({ x: acaso() * 2400, y: 250 + acaso() * 700, v: 60 + acaso() * 150, ay: 14 + acaso() * 40, fy: 0.6 + acaso() * 1.4, fase: acaso() * 6.28, tam: 2 + acaso() * 3 }));
      const BORBOLETAS = [{ x: 980, y: 800, cor: '#ffd96a' }, { x: 420, y: 860, cor: '#ffffff' }, { x: 1640, y: 820, cor: '#ff9db5' }].map((b) => ({ ...b, fase: acaso() * 6.28 }));
      const grao = document.createElement('canvas'); grao.width = tela.width; grao.height = tela.height;
      { const g = grao.getContext('2d'), im = g.createImageData(grao.width, grao.height), d = im.data, r = sorteio(77); for (let i = 0; i < d.length; i += 4) { const v = 128 + (r() - 0.5) * 60; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } g.putImageData(im, 0, 0); }

      function camera(t) { // chega perto bem devagar
        const z = 1 + 0.06 * suave(trecho(t, 0, duracao)), fx = 1100 * k, fy = 640 * k;
        c.setTransform(z, 0, 0, z, fx - fx * z, fy - fy * z);
      }

      // ---------- desenhar(t) ----------
      function desenhar(t) {
        const V = vento(t);
        c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
        camera(t);
        c.drawImage(placa, 0, 0);                         // o desenho parado
        for (const p of pecas) desenharPeca(p, t, V);     // as peças, cada uma entortada
        c.scale(k, k);
        c.globalCompositeOperation = 'soft-light';
        for (const m of MANCHAS) { // manchas de sol no chêo, debaixo da árvore
          const x = m.x + 26 * Math.sin(t * m.f + m.fase) * (0.5 + V), y = m.y + 6 * Math.cos(t * m.f * 1.3 + m.fase), a = 0.5 + 0.3 * Math.sin(t * m.f * 1.7 + m.fase);
          const g = c.createRadialGradient(x, y, 0, x, y, m.r); g.addColorStop(0, `rgba(255,250,190,${a})`); g.addColorStop(1, 'rgba(255,250,190,0)');
          c.save(); c.translate(0, y * 0.6); c.scale(1, 0.4); c.fillStyle = g; c.fillRect(x - m.r, y - m.r, m.r * 2, m.r * 2); c.restore();
        }
        c.globalCompositeOperation = 'source-over';
        for (const s of SEMENTES) { // sementinhas no vento
          const x = ((s.x + t * s.v * (0.4 + V) * H.vento) % 2400 + 2400) % 2400 - 200, y = s.y + s.ay * Math.sin(t * s.fy + s.fase);
          c.globalAlpha = 0.5 + 0.4 * V; c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, s.tam, 0, 6.2832); c.fill();
        }
        c.globalAlpha = 1;
        for (const b of BORBOLETAS) { // borboletas: duas asas que abrem e fecham
          const x = b.x + 70 * Math.sin(t * 0.7 + b.fase) + 20 * Math.sin(t * 2.3 + b.fase), y = b.y + 40 * Math.sin(t * 1.1 + b.fase * 2) - 20 * V, asa = Math.abs(Math.sin(t * 14 + b.fase));
          c.fillStyle = b.cor; for (const lado of [-1, 1]) { c.beginPath(); c.ellipse(x + lado * 7 * asa, y, 8 * asa + 1, 10, lado * 0.4, 0, 6.2832); c.fill(); }
          c.fillStyle = '#4a3a30'; c.fillRect(x - 1.5, y - 8, 3, 16);
        }
        // acabamento: grêo de papel, cantos escuros, título
        c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'overlay'; c.globalAlpha = 0.16; c.drawImage(grao, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
        c.setTransform(k, 0, 0, k, 0, 0);
        const gv = c.createRadialGradient(L / 2, A / 2, A * 0.55, L / 2, A / 2, A * 1.1); gv.addColorStop(0, 'rgba(0,0,0,0)'); gv.addColorStop(1, 'rgba(20,40,30,0.32)'); c.fillStyle = gv; c.fillRect(0, 0, L, A);
        const a = suave(trecho(t, T.titulo[0], T.titulo[1]));
        if (a > 0) {
          c.globalAlpha = a;
          const gs = c.createLinearGradient(0, 740, 0, A); gs.addColorStop(0, 'rgba(8,36,26,0)'); gs.addColorStop(1, 'rgba(8,36,26,0.62)'); c.fillStyle = gs; c.fillRect(0, 740, L, A - 740); // escurece embaixo para a letra aparecer
          c.shadowColor = 'rgba(6,30,22,0.6)'; c.shadowBlur = 18 * k; c.shadowOffsetY = 4 * k;
          c.font = '700 104px Georgia, "DejaVu Serif", serif'; c.fillStyle = '#ffffff'; c.fillText(H.titulo, 110 - (1 - a) * 30, 950);
          c.font = '500 34px Georgia, "DejaVu Serif", serif'; c.fillText(H.assinatura || '', 114 - (1 - a) * 30, 1006);
          c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetY = 0; c.globalAlpha = 1;
        }
        const claro = Math.max(1 - trecho(t, 0, 0.7), trecho(t, duracao - 0.7, duracao));
        if (claro > 0) { c.fillStyle = `rgba(255,250,235,${claro})`; c.fillRect(0, 0, L, A); }
      }

      // ---------- som: vento na mesma rajada, panos batendo, passarinhos e música ----------
      function som() {
        const s = Som.criar(duracao, H.semente), M = H.musica, r = sorteio(H.semente + 2);
        s.vento(0, duracao, { vol: 0.04, corte: 650, onda: 0.3 });
        s.vento(R[0] - 0.4, R[3] - R[0] + 0.6, { vol: 0.10, corte: 1000, onda: 0.5, entra: 1.4, sai: 2.0 });
        for (let t = 0.4; t < duracao - 0.6; t += 0.12 + r() * 0.3) { const V = vento(t); if (r() < V) s.toque(t, { vol: 0.012 + 0.04 * V * r(), corte: 700 + r() * 900, dur: 0.09, pan: r() * 1.2 - 0.6 }); } // pano batendo: mais vento, mais batida
        for (let t = 0.7; t < duracao - 1; t += 0.9 + r() * 1.6) s.pio(t, { freq: 2500 + r() * 1300, sobe: 0.25, dur: 0.07, intervalo: 0.11, repete: 2 + Math.floor(r() * 3), vol: 0.02, pan: r() * 1.6 - 0.8 });
        const p = M.passo;
        M.notas.forEach((n, i) => { const t = 0.8 + i * p; if (t < duracao - 1.2) s.corda(n, t, 1.6, { vol: 0.2, pan: i % 2 ? 0.25 : -0.25, maciez: 0.6 }); });
        M.acordes.forEach((ac, i) => ac.forEach((n, j) => s.nota(n, 0.8 + i * p * 4, p * 4 - 0.05, { forma: j === 0 ? 'tri' : 'seno', vol: j === 0 ? 0.09 : 0.05, ataque: 0.35, solta: 0.7, pan: (j - 1) * 0.4 })));
        M.acordes[0].forEach((n, i) => s.sino(Som.freq(n) * 4, T.titulo[0] + 0.1 + i * 0.1, 2.8, { vol: 0.07, pan: i - 1, brilho: 2.6 }));
        s.sala(0.45);
        return s.fim({ entra: 0.5, sai: 0.9 });
      }

      return { desenhar, som };
    },
  });
})();
