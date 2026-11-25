// MOTOR "fundo-pintado" — fundo pintado parado + personagem de formas animada por cima.
// É o jeito do desenho animado clássico: o cenário é um quadro só, e só a personagem
// (e uns detalhes: capim, pétalas, brilho do mar) se mexe na frente dele.
// O que muda de um episódio para outro está em historia.json. Este arquivo nêo muda.
(function () {
  'use strict';
  const { limita, mistura, trecho, suave, sorteio, ruido, cor } = Filme;
  const L = 1920, A = 1080;

  Filme.criar({
    largura: L, altura: A, fps: 30, duracao: 10,
    montar({ historia: H, tela, largura, altura, duracao }) {
      const c = tela.getContext('2d'), k = largura / L;
      const F = pintarFundo({ local: H.local, hora: H.hora, semente: H.semente, largura, altura }); // pintado uma vez só
      const pal = F.pal, P = H.personagem, acaso = sorteio(H.semente + 1000);
      const camada = document.createElement('canvas'); camada.width = tela.width; camada.height = tela.height; // a personagem é desenhada aqui e depois colada
      const pc = camada.getContext('2d');

      // ---------- linha do tempo (em segundos) ----------
      const T = {
        rajada: [2.8, 4.2, 6.8, 8.8],   // o vento aumenta de 2,8 a 4,2 e diminui de 6,8 a 8,8
        braco: [3.5, 4.4],              // o braço sobe (acena ou segura o chapéu)
        piscadas: [1.3, 2.9, 7.6, 9.1],
        olhosFelizes: [5.4, 6.3],       // fecha os olhos sorrindo
        titulo: [6.4, 7.4],
      };
      const vento = (t) => limita(0.28 + 0.72 * suave(trecho(t, T.rajada[0], T.rajada[1])) * (1 - 0.7 * suave(trecho(t, T.rajada[2], T.rajada[3]))) + 0.07 * ruido(t * 1.7, 5), 0, 1);
      const olho = (t) => {
        let o = 1;
        for (const p of T.piscadas) o = Math.min(o, Math.abs(t - p) < 0.09 ? 0 : 1);
        if (t > T.olhosFelizes[0] && t < T.olhosFelizes[1]) o = 0;
        return o;
      };
      const PX = 1300, PY = () => F.chaoY(PX) + 12, ESC = 1.08; // onde a personagem pisa e o tamanho dela

      const PETALAS = Array.from({ length: H.local === 'praia' ? 9 : 70 }, () => ({
        x: acaso() * 2600, y: 200 + acaso() * 800, v: 190 + acaso() * 260, ay: 20 + acaso() * 50, fy: 0.8 + acaso() * 1.6, fase: acaso() * 6.28, tam: (H.local === 'praia' ? 2 : 4) + acaso() * (H.local === 'praia' ? 2.5 : 6), gira: 2 + acaso() * 5, tom: acaso(),
      }));
      const AVES = Array.from({ length: 5 }, (_, i) => ({ x: 300 + acaso() * 1500, y: 150 + acaso() * 260, v: 26 + acaso() * 30, tam: 7 + acaso() * 8, fase: acaso() * 6.28 }));
      const LAMINAS = Array.from({ length: 150 }, (_, i) => ({ x: -60 + i * 13.6 + acaso() * 10, h: 70 + acaso() * 120, fase: acaso() * 6.28, tom: acaso(), larg: 7 + acaso() * 8 }));

      function camera(ctx, t) { // aproxima devagar do rosto: z = zoom
        const z = 1 + 0.07 * suave(trecho(t, 0, duracao)), fx = 1150, fy = 520;
        ctx.setTransform(k * z, 0, 0, k * z, k * (fx - fx * z - 14 * suave(trecho(t, 0, duracao))), k * (fy - fy * z));
      }

      function detalhesDoFundo(t) {
        if (H.local === 'praia') {
          for (const b of F.brilhos) { // o reflexo do sol pisca
            const a = Math.max(0, Math.sin(t * b.v + b.fase)); if (a < 0.05) continue;
            c.strokeStyle = `rgba(255,255,240,${0.75 * a})`; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(b.x - b.w / 2, b.y); c.lineTo(b.x + b.w / 2, b.y); c.stroke();
          }
          // a onda sobe e desce na areia
          const sobe = 22 * Math.sin(t * 0.85) + 8 * Math.sin(t * 1.9);
          c.beginPath(); c.moveTo(-120, F.marY(-120) - 30);
          for (let x = -120; x <= L + 120; x += 20) c.lineTo(x, F.marY(x) + 12 + sobe + 5 * Math.sin(x * 0.021 + t * 1.4));
          for (let x = L + 120; x >= -120; x -= 20) c.lineTo(x, F.marY(x) - 30);
          c.closePath(); c.fillStyle = cor(pal.mar[1], pal.mar[0], 0.5, 0.42); c.fill();
          // espuma: uma faixa branca de grossura irregular na ponta da onda, e dois rastros mais fracos atrás
          const borda = (x) => F.marY(x) + 12 + sobe + 5 * Math.sin(x * 0.021 + t * 1.4);
          const gross = (x) => 5 + 5 * Math.sin(x * 0.013 + t * 0.7) + 4 * Math.sin(x * 0.047 - t);
          c.fillStyle = 'rgba(255,255,255,0.86)'; c.beginPath(); c.moveTo(-120, borda(-120));
          for (let x = -120; x <= L + 120; x += 16) c.lineTo(x, borda(x) + 2);
          for (let x = L + 120; x >= -120; x -= 16) c.lineTo(x, borda(x) - Math.max(1.5, gross(x)));
          c.closePath(); c.fill();
          c.lineWidth = 2.5;
          for (const [rec, alfa] of [[20, 0.38], [44, 0.2]]) {
            c.strokeStyle = `rgba(255,255,255,${alfa})`; c.beginPath();
            for (let x = -120; x <= L + 120; x += 16) { const y = borda(x) - rec - 6 * Math.sin(x * 0.03 + t * 0.9 + rec); if (x === -120) c.moveTo(x, y); else c.lineTo(x, y); }
            c.stroke();
          }
        }
        c.strokeStyle = H.hora === 'dia' ? 'rgba(40,50,80,0.7)' : 'rgba(60,30,60,0.75)'; c.lineWidth = 2.4; c.lineCap = 'round'; // aves ao longe
        for (const a of AVES) {
          const x = ((a.x - t * a.v) % 2200 + 2200) % 2200 - 140, y = a.y + 10 * Math.sin(t * 0.7 + a.fase), asa = a.tam * (0.25 + 0.75 * Math.sin(t * 6 + a.fase));
          c.beginPath(); c.moveTo(x - a.tam, y - asa); c.quadraticCurveTo(x - a.tam * 0.4, y - asa * 0.2, x, y); c.quadraticCurveTo(x + a.tam * 0.4, y - asa * 0.2, x + a.tam, y - asa); c.stroke();
        }
      }

      function personagem(t) {
        const V = vento(t);
        // sombra no chêo
        c.fillStyle = H.hora === 'dia' ? 'rgba(20,60,40,0.30)' : 'rgba(50,20,60,0.32)';
        c.beginPath(); c.ellipse(PX + (pal.sol ? 70 : 34), PY() + 2, 140, 18, 0, 0, 6.2832); c.fill();
        // desenha numa folha separada, pinta a luz da hora só em cima dela, e cola
        pc.setTransform(1, 0, 0, 1, 0, 0); pc.clearRect(0, 0, camada.width, camada.height); pc.globalCompositeOperation = 'source-over';
        camera(pc, t); pc.translate(PX, PY()); pc.rotate(0.012 * Math.sin(t * 0.8) - 0.015 * V); pc.scale(ESC, ESC * (1 + 0.004 * Math.sin(t * 2.1)));
        desenharPersonagem(pc, P, { t, vento: V, braco: trecho(t, T.braco[0], T.braco[1]), acao: H.acao, olho: olho(t), sorriso: suave(trecho(t, T.braco[0], T.braco[1] + 0.4)) });
        pc.setTransform(1, 0, 0, 1, 0, 0); pc.globalCompositeOperation = 'source-atop';
        pc.fillStyle = cor(pal.ambiente[0], pal.ambiente[0], 0, pal.ambiente[1]); pc.fillRect(0, 0, camada.width, camada.height);
        const gl = pc.createLinearGradient(camada.width * 0.5, 0, camada.width * 0.8, 0); // luz vem da esquerda, sombra fica à direita
        gl.addColorStop(0, cor(pal.luz, pal.luz, 0, pal.sol ? 0.22 : 0.08)); gl.addColorStop(1, pal.sol ? 'rgba(70,30,100,0.22)' : 'rgba(40,60,120,0.07)');
        pc.fillStyle = gl; pc.fillRect(0, 0, camada.width, camada.height);
        c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(camada, 0, 0); c.restore();
      }

      function frente(t) {
        const V = vento(t);
        if (H.local !== 'praia') { // capim perto da câmera, balançando
          for (const b of LAMINAS) {
            const dobra = -(30 + 70 * V) - (10 + 26 * V) * Math.sin(t * 3.2 + b.fase + b.x * 0.004);
            c.fillStyle = cor(pal.capim[2], b.tom < 0.5 ? pal.capim[1] : '#123a2a', 0.45);
            c.beginPath(); c.moveTo(b.x - b.larg, A + 40); c.quadraticCurveTo(b.x - b.larg * 0.3, A - b.h * 0.5, b.x + dobra, A + 20 - b.h); c.quadraticCurveTo(b.x + b.larg * 0.8, A - b.h * 0.4, b.x + b.larg, A + 40); c.closePath(); c.fill();
          }
          c.strokeStyle = cor(pal.capim[1], pal.capim[2], 0.5); c.lineWidth = 3; c.lineCap = 'round'; // tufos no pé da personagem
          for (let i = 0; i < 22; i++) { const x = PX - 90 + i * 8.5, h = 16 + 12 * Math.abs(Math.sin(i * 2.3)); c.beginPath(); c.moveTo(x, PY() + 8); c.quadraticCurveTo(x - 4, PY() - h * 0.5, x - 8 - 8 * V - 4 * Math.sin(t * 4 + i), PY() + 6 - h); c.stroke(); }
        }
        for (const p of PETALAS) { // pétalas (ou areia fina) levadas pelo vento, da direita para a esquerda
          const x = L + 200 - ((p.x + t * p.v * (0.5 + 0.9 * V)) % 2600), y = p.y + p.ay * Math.sin(t * p.fy + p.fase) - 30 * V;
          c.save(); c.translate(x, y); c.rotate(t * p.gira + p.fase); c.globalAlpha = 0.35 + 0.6 * V;
          c.fillStyle = H.local === 'praia' ? cor(pal.areia[0], '#ffffff', 0.6) : (p.tom < 0.6 ? '#ffffff' : pal.flor[2]);
          c.beginPath(); c.ellipse(0, 0, p.tam, p.tam * 0.45, 0, 0, 6.2832); c.fill(); c.restore();
        }
        c.globalAlpha = 1;
      }

      function titulo(t) {
        const a = suave(trecho(t, T.titulo[0], T.titulo[1])); if (a <= 0) return;
        c.setTransform(k, 0, 0, k, 0, 0); c.globalAlpha = a; c.textBaseline = 'alphabetic';
        const x = 110 - (1 - a) * 30;
        const gs = c.createLinearGradient(0, 760, 0, A); gs.addColorStop(0, 'rgba(10,20,40,0)'); gs.addColorStop(1, 'rgba(10,20,40,0.5)'); // escurece embaixo para a letra aparecer
        c.fillStyle = gs; c.fillRect(0, 760, L, A - 760);
        c.shadowColor = 'rgba(10,20,50,0.6)'; c.shadowBlur = 20 * k; c.shadowOffsetY = 4 * k;
        c.font = '700 108px "Trebuchet MS", "DejaVu Sans", Verdana, sans-serif'; c.fillStyle = '#ffffff'; c.fillText(H.titulo, x, 950);
        c.font = '500 34px "Trebuchet MS", "DejaVu Sans", Verdana, sans-serif'; c.fillStyle = 'rgba(255,255,255,0.95)'; c.fillText(H.assinatura || '', x + 5, 1006);
        c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetY = 0; c.globalAlpha = 1;
      }

      // ---------- desenhar(t): monta o quadro do instante t ----------
      function desenhar(t) {
        c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
        camera(c, t);
        c.drawImage(F.tela, 0, 0, F.tela.width, F.tela.height, -F.margemX, -F.margemY, L + 2 * F.margemX, A + 2 * F.margemY);
        detalhesDoFundo(t); personagem(t); frente(t);
        c.setTransform(k, 0, 0, k, 0, 0);
        if (pal.sol) { // clarêo do sol por cima de tudo
          const g = c.createRadialGradient(pal.sol.x, pal.sol.y, 0, pal.sol.x, pal.sol.y, 900); g.addColorStop(0, 'rgba(255,220,150,0.30)'); g.addColorStop(1, 'rgba(255,200,120,0)');
          c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(0, 0, L, A); c.globalCompositeOperation = 'source-over';
        }
        const gv = c.createRadialGradient(L / 2, A / 2, A * 0.55, L / 2, A / 2, A * 1.1); gv.addColorStop(0, 'rgba(0,0,0,0)'); gv.addColorStop(1, 'rgba(10,15,50,0.30)');
        c.fillStyle = gv; c.fillRect(0, 0, L, A);
        titulo(t);
        const claro = Math.max(1 - trecho(t, 0, 0.7), trecho(t, duracao - 0.7, duracao)); // abre e fecha no claro
        if (claro > 0) { c.fillStyle = cor(pal.luz, '#ffffff', 0.5, claro); c.fillRect(0, 0, L, A); }
      }

      // ---------- som: vento, lugar (pássaros ou mar) e música, nas mesmas marcas de tempo ----------
      function som() {
        const s = Som.criar(duracao, H.semente), M = H.musica, r = sorteio(H.semente + 5);
        if (H.local === 'praia') {
          s.vento(0, duracao, { vol: 0.13, corte: 420, onda: 0.14, profundidade: 0.9 }); // mar
          for (const t of [1.7, 5.9, 8.3]) s.pio(t, { freq: 1500, sobe: -0.28, dur: 0.22, intervalo: 0.3, repete: 2, vol: 0.02, pan: -0.5 }); // gaivota
        } else {
          for (let t = 0.5; t < duracao - 1; t += 0.7 + r() * 1.5) s.pio(t, { freq: 2600 + r() * 1200, sobe: 0.3, dur: 0.07, intervalo: 0.11, repete: 2 + Math.floor(r() * 3), vol: 0.022, pan: r() * 1.6 - 0.8 }); // passarinhos
        }
        s.vento(0, duracao, { vol: 0.035, corte: 700, onda: 0.3 });
        s.vento(T.rajada[0] - 0.4, T.rajada[3] - T.rajada[0] + 0.6, { vol: 0.10, corte: 1100, onda: 0.5, entra: 1.4, sai: 2.2 }); // a rajada
        const p = M.passo;
        M.notas.forEach((n, i) => { const t = 0.8 + i * p; if (t < duracao - 1.2) s.corda(n, t, 1.6, { vol: 0.2, pan: i % 2 ? 0.25 : -0.25, maciez: 0.7 }); });
        M.acordes.forEach((ac, i) => ac.forEach((n, j) => s.nota(n, 0.8 + i * p * 4, p * 4 - 0.05, { forma: j === 0 ? 'tri' : 'seno', vol: j === 0 ? 0.09 : 0.05, ataque: 0.35, solta: 0.7, pan: (j - 1) * 0.4 })));
        const fim = M.acordes[0]; // o título chega com sinos no acorde de casa
        fim.forEach((n, i) => s.sino(Som.freq(n) * 4, T.titulo[0] + 0.1 + i * 0.1, 2.8, { vol: 0.07, pan: i - 1, brilho: 2.6 }));
        s.sala(0.45);
        return s.fim({ entra: 0.5, sai: 0.9 });
      }

      return { desenhar, som };
    },
  });
})();
