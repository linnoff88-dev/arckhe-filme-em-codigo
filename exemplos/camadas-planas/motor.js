// MOTOR "camadas-planas" — recorte de papel.
// Jeito de animar: formas planas (como papel cortado) em camadas. As camadas do fundo andam
// devagar e as da frente andam rápido quando a câmera se move (isso é o "parallax").
// O que muda de um episódio para outro está em historia.json. Este arquivo não muda.
(function () {
  'use strict';
  const { limita, mistura, trecho, suave, saiDevagar, sorteio, ruido, cor } = Filme;
  const L = 1920, A = 1080; // tamanho "de desenho"; a tela real pode ser menor, a escala cuida

  Filme.criar({
    largura: L, altura: A, fps: 30, duracao: 10,
    montar({ historia: H, tela, largura, duracao }) {
      const c = tela.getContext('2d');
      const k = largura / L;
      const P = H.paleta;
      const acaso = sorteio(H.semente || 1);

      // ---------- linha do tempo (em segundos) ----------
      const T = {
        andaDe: 0.2, andaAte: 5.6,       // o bicho entra andando e para
        olha: [5.5, 6.8],                // levanta a cabeça para o astro
        titulo: [6.5, 7.6],              // o título aparece
        some: [duracao - 0.7, duracao],  // escurece no final
      };
      const CHAO = 4; // em qual camada o bicho anda

      // ---------- camadas (do fundo para a frente) ----------
      // fator = quanto a camada anda quando a câmera anda (fundo pouco, frente muito)
      const CAMADAS = [
        { base: 560, amp: 90, f1: 0.0016, f2: 0.0041, fator: 0.10, arvores: 0, alturaArv: 0 },
        { base: 660, amp: 70, f1: 0.0021, f2: 0.0052, fator: 0.22, arvores: 26, alturaArv: 120 },
        { base: 760, amp: 55, f1: 0.0026, f2: 0.0063, fator: 0.40, arvores: 20, alturaArv: 190 },
        { base: 850, amp: 40, f1: 0.0019, f2: 0.0071, fator: 0.62, arvores: 9, alturaArv: 300 },
        { base: 930, amp: 22, f1: 0.0023, f2: 0.0057, fator: 0.80, arvores: 0, alturaArv: 0 },
        { base: 1040, amp: 30, f1: 0.0031, f2: 0.0083, fator: 1.25, arvores: 0, alturaArv: 620, fixas: [-140, 690, 2290, 2520] },
      ];
      CAMADAS.forEach((cam, i) => {
        cam.p1 = acaso() * 6.28; cam.p2 = acaso() * 6.28;
        cam.cor = P.camadas[Math.min(i, P.camadas.length - 1)];
        if (i === CAMADAS.length - 1) cam.cor = Filme.hex(P.camadas[P.camadas.length - 1], '#000000', 0.25);
        cam.lista = [];
        for (let n = 0; n < cam.arvores; n++) {
          cam.lista.push({ x: -400 + acaso() * 3600, h: cam.alturaArv * (0.65 + 0.6 * acaso()), fase: acaso() * 6.28, larg: 0.8 + 0.4 * acaso() });
        }
        // árvores da frente: lugar escolhido à mão para emoldurar a cena sem tapar o bicho
        for (const x of cam.fixas || []) cam.lista.push({ x, h: cam.alturaArv * (0.8 + 0.4 * acaso()), fase: acaso() * 6.28, larg: 0.95 });
        cam.lista.sort((a, b) => a.x - b.x);
      });
      const alturaDoChao = (i, xMundo) => {
        const m = CAMADAS[i];
        return m.base + m.amp * (0.6 * Math.sin(xMundo * m.f1 + m.p1) + 0.4 * Math.sin(xMundo * m.f2 + m.p2));
      };

      const ESTRELAS = Array.from({ length: 90 }, () => ({ x: acaso() * L, y: acaso() * 560, r: 1.2 + acaso() * 2.4, fase: acaso() * 6.28, v: 0.6 + acaso() * 1.6 }));
      // nuvens: lugar e velocidade escolhidos para nenhuma passar na frente do astro
      const NUVENS = [[-60, 96, 1.0, 16], [600, 480, 1.4, 11], [930, 110, 0.7, 20], [1720, 560, 1.0, 9], [-420, 430, 0.9, 14]]
        .map(([x, y, s, v]) => ({ x, y, s, v, tom: acaso() }));
      const LUMES = Array.from({ length: H.vagalumes || 0 }, () => ({
        x: acaso() * 2300 - 100, y: 520 + acaso() * 440, fx: 0.2 + acaso() * 0.5, fy: 0.25 + acaso() * 0.6, ax: 30 + acaso() * 70, ay: 18 + acaso() * 40,
        fase: acaso() * 6.28, pisca: 0.5 + acaso() * 1.4, nasce: 2.2 + acaso() * 4.5, r: 2.5 + acaso() * 3, fator: 0.5 + acaso() * 0.7,
      }));

      // grão do papel: pintado uma vez só (papel não treme)
      const papel = document.createElement('canvas'); papel.width = tela.width; papel.height = tela.height;
      (function () {
        const pc = papel.getContext('2d'), img = pc.createImageData(papel.width, papel.height), d = img.data, r = sorteio(99);
        for (let i = 0; i < d.length; i += 4) { const v = 128 + (r() - 0.5) * 70; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
        pc.putImageData(img, 0, 0);
      })();

      // ---------- movimento da câmera e do bicho (tudo sai de t) ----------
      const camera = (t) => 430 * suave(trecho(t, 0, 7.5)) + 12 * (t / duracao);
      const xInicio = -230, xFim = 930 + 430 * CAMADAS[CHAO].fator;
      const progresso = (t) => { const u = trecho(t, T.andaDe, T.andaAte); return u < 0.75 ? u * 1.14 : 0.855 + 0.145 * saiDevagar((u - 0.75) / 0.25); };
      const xBicho = (t) => mistura(xInicio, xFim, progresso(t));
      const PASSO = 78; // tamanho do passo em pixels: a perna gira conforme a distância andada (o pé não escorrega)
      const fasePerna = (t) => (xBicho(t) - xInicio) / PASSO * Math.PI;

      function sombra(desfoque, dy, alfa) { c.shadowColor = `rgba(4,8,20,${alfa})`; c.shadowBlur = desfoque * k; c.shadowOffsetY = dy * k; c.shadowOffsetX = 0; }
      function semSombra() { c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetY = 0; }

      // ---------- peças ----------
      function ceu(t) {
        const g = c.createLinearGradient(0, 0, 0, A);
        g.addColorStop(0, P.ceu[0]); g.addColorStop(1, P.ceu[1]);
        c.fillStyle = g; c.fillRect(0, 0, L, A);
        // estrelas: furinhos no papel
        for (const e of ESTRELAS) {
          const br = 0.45 + 0.55 * Math.sin(t * e.v + e.fase);
          c.globalAlpha = (H.astro === 'sol' ? 0 : 0.25 + 0.6 * br);
          c.fillStyle = P.claro; c.beginPath(); c.arc(e.x - camera(t) * 0.02, e.y, e.r, 0, 6.2832); c.fill();
        }
        c.globalAlpha = 1;
      }

      function astro(t) {
        const x = 1430 - camera(t) * 0.05, y = mistura(430, 285, suave(trecho(t, 0, duracao)));
        // anéis de papel em volta do astro: cada anel um tom mais claro
        for (let i = 4; i >= 1; i--) {
          sombra(26, 8, 0.22);
          c.fillStyle = cor(P.ceu[1], P.astro, 0.06 + 0.07 * (5 - i));
          c.beginPath(); c.arc(x, y, 118 + i * 82 + 6 * Math.sin(t * 0.5 + i), 0, 6.2832); c.fill();
        }
        sombra(30, 10, 0.3);
        c.fillStyle = P.astro; c.beginPath(); c.arc(x, y, 118, 0, 6.2832); c.fill();
        semSombra();
        if (H.astro !== 'sol') { // crateras
          c.fillStyle = cor(P.astro, P.ceu[1], 0.16);
          for (const [dx, dy, r] of [[-38, -30, 24], [30, 22, 34], [44, -44, 14], [-30, 46, 16]]) { c.beginPath(); c.arc(x + dx, y + dy, r, 0, 6.2832); c.fill(); }
        }
        return { x, y };
      }

      function nuvens(t) {
        for (const n of NUVENS) {
          const x = n.x + t * n.v - camera(t) * 0.07;
          sombra(18, 8, 0.2);
          c.fillStyle = cor(P.ceu[1], P.claro, 0.18 + 0.2 * n.tom);
          c.beginPath();
          const s = n.s;
          c.moveTo(x, n.y); c.arc(x + 60 * s, n.y, 42 * s, Math.PI, 0); c.arc(x + 140 * s, n.y - 16 * s, 62 * s, Math.PI * 1.1, 0);
          c.arc(x + 235 * s, n.y, 46 * s, Math.PI * 1.2, 0); c.lineTo(x + 281 * s, n.y + 22 * s); c.lineTo(x + 18 * s, n.y + 22 * s); c.closePath(); c.fill();
        }
        semSombra();
      }

      function arvore(x, y, h, larg, balanco, tipo) {
        c.save(); c.translate(x, y); c.rotate(balanco);
        c.beginPath();
        if (tipo === 'redonda') {
          c.rect(-h * 0.035, -h * 0.55, h * 0.07, h * 0.6);
          c.moveTo(0, -h * 0.45); c.arc(0, -h * 0.68, h * 0.3 * larg, 0, 6.2832);
          c.moveTo(-h * 0.2, -h * 0.5); c.arc(-h * 0.2 * larg, -h * 0.5, h * 0.2 * larg, 0, 6.2832);
          c.moveTo(h * 0.2, -h * 0.5); c.arc(h * 0.22 * larg, -h * 0.52, h * 0.19 * larg, 0, 6.2832);
        } else { // pinheiro: tronco + triângulos empilhados
          c.rect(-h * 0.03, -h * 0.2, h * 0.06, h * 0.25);
          for (let i = 0; i < 4; i++) {
            const y0 = -h * (0.12 + i * 0.2), w = h * 0.24 * larg * (1 - i * 0.2), alto = h * 0.34;
            c.moveTo(-w, y0); c.lineTo(0, y0 - alto); c.lineTo(w, y0); c.closePath();
          }
        }
        c.fill(); c.restore();
      }

      function camada(i, t) {
        const m = CAMADAS[i], des = camera(t) * m.fator;
        sombra(34, -6, 0.42); // a sombra cai para cima: é a camada da frente fazendo sombra na de trás
        const g = c.createLinearGradient(0, m.base - m.amp - m.alturaArv, 0, A);
        g.addColorStop(0, cor(m.cor, P.claro, 0.10)); g.addColorStop(1, cor(m.cor, '#000000', 0.12));
        c.fillStyle = g;
        c.beginPath(); c.moveTo(-60, A + 60);
        for (let x = -60; x <= L + 60; x += 24) c.lineTo(x, alturaDoChao(i, x + des));
        c.lineTo(L + 60, A + 60); c.closePath(); c.fill();
        // árvores da camada, na mesma cor (silhueta de papel)
        for (const a of m.lista) {
          const x = a.x - des; if (x < -300 || x > L + 300) continue;
          arvore(x, alturaDoChao(i, a.x) + 12, a.h, a.larg, 0.012 * Math.sin(t * 0.9 + a.fase), H.arvores);
        }
        semSombra();
      }

      function capim(t) { // tufos na camada da frente
        const m = CAMADAS[5], des = camera(t) * m.fator;
        c.fillStyle = m.cor;
        for (let n = 0; n < 60; n++) {
          const xm = -300 + n * 62 + 30 * Math.sin(n * 12.9898), x = xm - des; if (x < -80 || x > L + 80) continue;
          const y = alturaDoChao(5, xm) + 8, h = 60 + 50 * Math.abs(Math.sin(n * 7.13)), b = 0.10 * Math.sin(t * 1.4 + n);
          for (const [dx, inc] of [[-14, -0.35], [0, 0], [14, 0.35]]) {
            c.beginPath(); c.moveTo(x + dx - 7, y); c.quadraticCurveTo(x + dx + h * (inc + b) * 0.5, y - h * 0.6, x + dx + h * (inc + b), y - h); c.quadraticCurveTo(x + dx + h * (inc + b) * 0.4, y - h * 0.5, x + dx + 7, y); c.closePath(); c.fill();
          }
        }
      }

      function vagalumes(t) {
        c.globalCompositeOperation = 'lighter';
        for (const v of LUMES) {
          const nasceu = trecho(t, v.nasce, v.nasce + 1.2); if (nasceu <= 0) continue;
          const x = v.x - camera(t) * v.fator + v.ax * Math.sin(t * v.fx + v.fase), y = v.y + v.ay * Math.sin(t * v.fy + v.fase * 1.7);
          const br = nasceu * (0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * v.pisca * 2 + v.fase), 2));
          const g = c.createRadialGradient(x, y, 0, x, y, v.r * 7);
          g.addColorStop(0, cor(P.luz, P.luz, 0, 0.9 * br)); g.addColorStop(0.25, cor(P.luz, P.luz, 0, 0.35 * br)); g.addColorStop(1, cor(P.luz, P.luz, 0, 0));
          c.fillStyle = g; c.beginPath(); c.arc(x, y, v.r * 7, 0, 6.2832); c.fill();
        }
        c.globalCompositeOperation = 'source-over';
      }

      // ---------- o bicho (raposa de papel) ----------
      function perna(xq, yq, ang, tras, escura) {
        c.save(); c.translate(xq, yq); c.rotate(ang);
        c.fillStyle = escura ? cor(P.bicho, P.bichoEscuro, 0.35) : P.bicho;
        c.beginPath(); c.moveTo(-13, -6); c.lineTo(13, -6); c.lineTo(7, 46); c.lineTo(-7, 46); c.closePath(); c.fill();
        c.fillStyle = P.bichoEscuro; // "meia" escura
        c.beginPath(); c.moveTo(-8, 34); c.lineTo(8, 34); c.lineTo(6, 62); c.lineTo(tras ? 12 : 14, 68); c.lineTo(-6, 68); c.closePath(); c.fill();
        c.restore();
      }
      function raposa(tLiso) {
        // "em dois": o boneco de papel só muda de pose 12 vezes por segundo, como em stop-motion (a câmera continua lisa)
        const t = H.posesPorSegundo ? Math.floor(tLiso * H.posesPorSegundo + 1e-6) / H.posesPorSegundo : tLiso;
        const xm = xBicho(t), des = camera(tLiso) * CAMADAS[CHAO].fator;
        const x = xm - des, y = alturaDoChao(CHAO, xm) + 10;
        const andando = 1 - suave(trecho(t, T.andaAte - 0.5, T.andaAte));
        const f = fasePerna(t);
        const olha = suave(trecho(t, T.olha[0], T.olha[1]));
        const incl = Math.atan((alturaDoChao(CHAO, xm + 60) - alturaDoChao(CHAO, xm - 60)) / 120);
        c.save(); c.translate(x, y - 6 * Math.abs(Math.sin(f)) * andando); c.rotate(incl * 0.6); c.scale(1.5, 1.5);
        sombra(10, 5, 0.35);
        const giro = (fase) => 0.5 * Math.sin(f + fase) * andando;
        // pernas de trás (do outro lado do corpo)
        perna(-62, -66, giro(Math.PI), true, true); perna(56, -66, giro(0), false, true);
        // rabo: balança sempre; mais quando parou
        c.save(); c.translate(-82, -88); c.rotate(-0.18 + 0.10 * Math.sin(t * 2.2) + 0.12 * olha * Math.sin(t * 3.1));
        c.fillStyle = P.bicho; c.beginPath(); c.moveTo(6, -14); c.quadraticCurveTo(-70, -62, -150, -20); c.quadraticCurveTo(-176, 4, -150, 22); c.quadraticCurveTo(-70, 40, 4, 16); c.closePath(); c.fill();
        semSombra();
        c.fillStyle = P.claro; c.beginPath(); c.moveTo(-112, -36); c.quadraticCurveTo(-140, -30, -150, -20); c.quadraticCurveTo(-176, 4, -150, 22); c.quadraticCurveTo(-130, 30, -108, 30); c.quadraticCurveTo(-124, 0, -112, -36); c.closePath(); c.fill();
        c.restore();
        // corpo
        sombra(10, 5, 0.3);
        c.fillStyle = P.bicho; c.beginPath(); c.moveTo(-96, -96); c.quadraticCurveTo(-20, -128, 66, -108); c.quadraticCurveTo(104, -92, 92, -62); c.quadraticCurveTo(40, -36, -40, -44); c.quadraticCurveTo(-112, -52, -96, -96); c.closePath(); c.fill();
        semSombra();
        c.fillStyle = P.claro; c.beginPath(); c.moveTo(92, -62); c.quadraticCurveTo(40, -36, -30, -44); c.quadraticCurveTo(30, -58, 70, -84); c.closePath(); c.fill(); // barriga clara
        // pernas da frente (deste lado)
        sombra(8, 4, 0.3);
        perna(-70, -62, giro(0.3), true, false); perna(64, -62, giro(Math.PI + 0.3), false, false);
        // cabeça: gira para cima quando olha o astro
        c.save(); c.translate(72, -100); c.rotate(-0.42 * olha + 0.04 * Math.sin(f * 2) * andando);
        sombra(10, 5, 0.3);
        c.fillStyle = P.bicho; c.beginPath(); c.moveTo(-14, -8); c.quadraticCurveTo(-6, -58, 34, -62); c.lineTo(62, -50); c.lineTo(118, -18); c.quadraticCurveTo(122, -8, 112, -6); c.lineTo(40, 12); c.quadraticCurveTo(0, 22, -14, -8); c.closePath(); c.fill();
        // orelhas (uma treme de vez em quando)
        const treme = 0.25 * Math.max(0, Math.sin(t * 1.3)) * Math.sin(t * 22) * (Math.sin(t * 1.3) > 0.93 ? 1 : 0);
        c.fillStyle = cor(P.bicho, P.bichoEscuro, 0.3); c.beginPath(); c.moveTo(24, -56); c.lineTo(20, -108); c.lineTo(50, -62); c.closePath(); c.fill();
        c.save(); c.translate(6, -50); c.rotate(treme); c.fillStyle = P.bicho; c.beginPath(); c.moveTo(-10, 2); c.lineTo(-12, -62); c.lineTo(26, -8); c.closePath(); c.fill();
        c.fillStyle = P.bichoEscuro; c.beginPath(); c.moveTo(-9, -30); c.lineTo(-12, -62); c.lineTo(6, -36); c.closePath(); c.fill(); c.restore();
        semSombra();
        // bochecha clara, focinho, olho
        c.fillStyle = P.claro; c.beginPath(); c.moveTo(40, 12); c.lineTo(112, -6); c.quadraticCurveTo(80, -20, 52, -18); c.quadraticCurveTo(22, -12, 6, 10); c.quadraticCurveTo(22, 16, 40, 12); c.closePath(); c.fill();
        c.fillStyle = P.bichoEscuro; c.beginPath(); c.arc(114, -12, 8, 0, 6.2832); c.fill();
        const pisca = (t % 3.1) > 2.95 ? 0.15 : 1;
        c.beginPath(); c.ellipse(58, -34, 6, 7 * pisca, 0, 0, 6.2832); c.fill();
        c.restore();
        c.restore();
      }

      function titulo(t) {
        const a = suave(trecho(t, T.titulo[0], T.titulo[1])); if (a <= 0) return;
        c.globalAlpha = a; c.textBaseline = 'alphabetic';
        const dy = (1 - a) * 26;
        c.font = '700 104px Georgia, "DejaVu Serif", "Times New Roman", serif';
        sombra(22, 8, 0.5); c.fillStyle = P.letra; c.fillText(H.titulo, 130, 250 + dy);
        semSombra();
        c.fillStyle = P.luz; c.fillRect(134, 286 + dy, 150 * a, 6);
        c.font = '500 34px Georgia, "DejaVu Serif", serif'; c.fillStyle = cor(P.letra, P.ceu[1], 0.25);
        c.fillText(H.assinatura || '', 134, 344 + dy);
        c.globalAlpha = 1;
      }

      function acabamento(t) {
        // grão de papel por cima de tudo
        c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'overlay'; c.globalAlpha = 0.22; c.drawImage(papel, 0, 0); c.restore();
        // cantos mais escuros
        const g = c.createRadialGradient(L / 2, A / 2, A * 0.45, L / 2, A / 2, A * 1.05);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(2,6,18,0.55)'); c.fillStyle = g; c.fillRect(0, 0, L, A);
      }
      function escurece(t) { // abre do escuro e fecha no escuro
        const escuro = Math.max(1 - trecho(t, 0, 0.6), trecho(t, T.some[0], T.some[1]));
        if (escuro > 0) { c.fillStyle = `rgba(4,7,16,${escuro})`; c.fillRect(0, 0, L, A); }
      }

      // ---------- desenhar(t): monta o quadro do instante t. Não guarda nada de um quadro para o outro. ----------
      function desenhar(t) {
        c.setTransform(k, 0, 0, k, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; semSombra();
        ceu(t); astro(t); nuvens(t);
        camada(0, t); camada(1, t); camada(2, t); camada(3, t);
        camada(4, t); raposa(t); vagalumes(t);
        camada(5, t); capim(t);
        acabamento(t); titulo(t); escurece(t);
      }

      // ---------- som: sai das MESMAS marcas de tempo da imagem ----------
      function som() {
        const s = Som.criar(duracao, H.semente || 1), M = H.musica;
        s.vento(0, duracao, { vol: 0.05, corte: 500, onda: 0.18 });
        // grilos
        for (let t = 0.6; t < duracao - 0.5; t += 0.83) s.pio(t, { freq: 4300, vol: 0.016, pan: -0.6, repete: 3 });
        for (let t = 1.1; t < duracao - 0.5; t += 1.37) s.pio(t, { freq: 3900, vol: 0.012, pan: 0.7, repete: 2 });
        // passos: um toque a cada meia volta da perna (o mesmo cálculo que move a perna)
        let ant = fasePerna(T.andaDe);
        for (let t = T.andaDe; t < T.andaAte - 0.3; t += 0.005) {
          const f = fasePerna(t);
          if (Math.floor(f / Math.PI) !== Math.floor(ant / Math.PI)) s.toque(t, { vol: 0.05, corte: 1400, dur: 0.07, pan: limita((xBicho(t) - camera(t) * 0.8) / L * 2 - 1, -0.8, 0.8) });
          ant = f;
        }
        // caixinha de música + baixo
        const p = M.passo;
        M.notas.forEach((n, i) => { const t = 1.0 + i * p; if (t < duracao - 1.4) s.sino(n, t, 1.8, { vol: 0.11, pan: (i % 2 ? 0.3 : -0.3) }); });
        M.baixo.forEach((n, i) => s.nota(n, 1.0 + i * p * 4, p * 4 - 0.1, { forma: 'tri', vol: 0.13, ataque: 0.2, solta: 0.6 }));
        M.baixo.forEach((n, i) => s.nota(Som.freq(n) * 3, 1.0 + i * p * 4, p * 4 - 0.1, { forma: 'seno', vol: 0.035, ataque: 0.6, solta: 0.8, vibrato: 0.004 }));
        // o título chega com um acorde de sinos
        ['D5', 'A5', 'F5'].forEach((n, i) => s.sino(n, T.titulo[0] + 0.15 + i * 0.09, 2.6, { vol: 0.10, pan: i - 1, brilho: 3 }));
        s.sala(0.5);
        return s.fim({ entra: 0.6, sai: 0.9 });
      }

      return { desenhar, som };
    },
  });
})();
