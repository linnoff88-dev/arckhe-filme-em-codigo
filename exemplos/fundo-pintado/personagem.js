// personagem.js — a personagem inteira é feita de formas (círculos, curvas, polígonos).
// Por ser código, ela sai IGUAL em todo quadro e em toda história: o rosto nunca muda.
// A roupa, o chapéu e as cores vêm de historia.json. A pose vem do motor (vento, braço, piscada).
(function () {
  'use strict';
  const { cor, mistura } = Filme;
  const TRACO = 'rgba(70,35,45,0.6)';
  const PERNA = 0.84;  // pernas um pouco mais curtas que o natural
  const CABECA = 1.24; // cabeça maior que o natural: jeito de desenho animado

  // pose = { t, vento (0 a 1), braco (0 a 1: quanto o braço já subiu), acao, olho (1 aberto, 0 fechado), sorriso (0 a 1) }
  window.desenharPersonagem = function (c, P, pose) {
    const { t, vento: V, braco, acao, olho, sorriso } = pose;
    const pele = P.pele, peleSombra = cor(P.pele, '#c96a55', 0.3);
    const cab = P.cabelo, cabLuz = cor(P.cabelo, '#ffd9b0', 0.3), cabSombra = cor(P.cabelo, '#000000', 0.3);
    const roupa = P.corRoupa, roupaSombra = cor(P.corRoupa, '#1a1a40', 0.22), detalhe = P.corDetalhe;
    const branco = '#fbfaf6', brancoSombra = '#d5dcec';
    const vestido = P.roupa === 'vestido';
    c.lineJoin = 'round'; c.lineCap = 'round';
    const pinta = (preench, traco = true, esp = 2.6) => { c.fillStyle = preench; c.fill(); if (traco) { c.strokeStyle = TRACO; c.lineWidth = esp; c.stroke(); } };
    const onda = (vel, fase) => Math.sin(t * vel + fase);

    // ---------- pernas, meias e sapatos ----------
    c.save(); c.scale(1, PERNA);
    for (const lado of [-1, 1]) {
      const x = lado * 27, p = lado * 5; // p = o pé fica um pouco para fora
      c.beginPath(); c.moveTo(x - 27, -312); c.lineTo(x + 27, -312); c.quadraticCurveTo(x + 27, -230, x + 19 + p * 0.5, -168); c.quadraticCurveTo(x + 23 + p, -110, x + 13 + p, -34);
      c.lineTo(x - 13 + p, -34); c.quadraticCurveTo(x - 23 + p, -110, x - 19 + p * 0.5, -168); c.quadraticCurveTo(x - 27, -230, x - 27, -312); c.closePath(); pinta(pele);
      c.beginPath(); c.moveTo(x - lado * 2, -305); c.quadraticCurveTo(x - lado * 20, -200, x - lado * 12 + p, -40); c.lineTo(x - lado * 21 + p, -110); c.lineTo(x - lado * 26, -300); c.closePath(); c.fillStyle = cor(peleSombra, pele, 0.3, 0.55); c.fill(); // sombra na perna
      if (!vestido) { c.beginPath(); c.moveTo(x - 18 + p, -108); c.lineTo(x + 18 + p, -108); c.lineTo(x + 13 + p, -30); c.lineTo(x - 13 + p, -30); c.closePath(); pinta(branco); }
      c.translate(p, 0);
      c.beginPath(); // sapato
      if (vestido) { c.moveTo(x - 15, -24); c.quadraticCurveTo(x - 19, 2, x + lado * 4, 2); c.lineTo(x + lado * 27, 2); c.quadraticCurveTo(x + lado * 30, -13, x + 14, -24); c.closePath(); pinta(cor(detalhe, '#ffffff', 0.15)); }
      else { c.moveTo(x - 15, -34); c.quadraticCurveTo(x - 20, 2, x, 2); c.lineTo(x + lado * 28, 2); c.quadraticCurveTo(x + lado * 33, -16, x + 15, -34); c.closePath(); pinta('#4a3432'); }
      c.translate(-p, 0);
    }
    c.restore();
    c.save(); c.translate(0, 312 * (1 - PERNA) * 0.9); // o corpo desce para encaixar nas pernas mais curtas

    // ---------- cabelo de trás: mechas que o vento leva para a esquerda ----------
    for (let i = 0; i < 7; i++) {
      const rx = (-54 + i * 18) * CABECA, ry = -530 - 76 * CABECA;
      const forca = V * (0.75 + 0.07 * i);
      const px = rx * 1.1 - forca * (130 + 16 * i) + (5 + 16 * V) * onda(3.4, -i * 0.7), py = -360 - (i % 3) * 18 - forca * 80 + 8 * V * onda(4.1, i);
      const mx = (rx + px) / 2 - forca * 16 + (4 + 12 * V) * onda(3.4, -i * 0.7 - 1.0), my = (ry + py) / 2 + 26 - forca * 10;
      const meia = 28;
      c.beginPath(); c.moveTo(rx - meia, ry); c.quadraticCurveTo(mx - meia * 0.8, my, px, py); c.quadraticCurveTo(mx + meia * 0.8, my, rx + meia, ry); c.closePath();
      pinta(i % 2 ? cab : cabSombra, true, 2);
    }

    // braço: dois ossos (ombro→cotovelo→mêo). Os ângulos sêo em graus, 90 = para baixo.
    function bracoDe(ox, oy, a1, a2, lado) {
      const r1 = a1 * Math.PI / 180, r2 = a2 * Math.PI / 180;
      const ex = ox + 86 * Math.cos(r1), ey = oy + 86 * Math.sin(r1), hx = ex + 80 * Math.cos(r2), hy = ey + 80 * Math.sin(r2);
      const osso = (x1, y1, x2, y2, esp, tinta) => { c.strokeStyle = TRACO; c.lineWidth = esp + 4.4; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.strokeStyle = tinta; c.lineWidth = esp; c.stroke(); };
      osso(ex, ey, hx, hy, 23, pele); osso(ox, oy, ex, ey, 27, pele);
      c.beginPath(); c.ellipse(hx + 9 * Math.cos(r2), hy + 9 * Math.sin(r2), 16, 21, r2 + Math.PI / 2, 0, 6.2832); pinta(pele);
      c.beginPath(); c.ellipse(hx + 2 * Math.cos(r2) - lado * 15 * Math.sin(r2), hy + 2 * Math.sin(r2) + lado * 15 * Math.cos(r2), 6, 11, r2 + Math.PI / 2 - lado * 0.5, 0, 6.2832); pinta(pele, true, 2); // polegar
      if (!vestido) { // manga curta
        const mxm = ox + 46 * Math.cos(r1), mym = oy + 46 * Math.sin(r1);
        osso(ox, oy, mxm, mym, 35, branco);
        c.strokeStyle = roupa; c.lineWidth = 5; c.beginPath(); c.moveTo(mxm - 17 * Math.sin(r1), mym + 17 * Math.cos(r1)); c.lineTo(mxm + 17 * Math.sin(r1), mym - 17 * Math.cos(r1)); c.stroke();
      }
      return { hx, hy };
    }
    // braço da esquerda da tela: solto, balança um pouco
    bracoDe(-58, -490, 99 + 2 * onda(1.3, 0) + 5 * V, 93 + 4 * onda(1.3, -0.8) + 8 * V, -1);

    // ---------- roupa ----------
    const empurra = 26 * V, bate = (i) => (5 + 12 * V) * onda(6.5, i * 1.1);
    if (vestido) {
      c.beginPath(); c.moveTo(-58, -505); c.quadraticCurveTo(0, -516, 58, -505); c.lineTo(52, -440); c.lineTo(-52, -440); c.closePath(); pinta(pele); // ombros
      c.beginPath(); c.moveTo(-38, -508); c.lineTo(-26, -508); c.lineTo(-22, -470); c.lineTo(22, -470); c.lineTo(26, -508); c.lineTo(38, -508); c.lineTo(48, -455);
      c.lineTo(42, -398);
      const N = 8; const bx = (i) => 126 - i * (252 / N) - empurra * (0.5 + 0.5 * i / N), by = (i) => -206 + bate(i) - 10 * V * (i / N);
      c.lineTo(bx(0), by(0)); for (let i = 1; i <= N; i++) c.quadraticCurveTo((bx(i - 1) + bx(i)) / 2, Math.max(by(i - 1), by(i)) + 12, bx(i), by(i));
      c.lineTo(-42, -398); c.lineTo(-48, -455); c.closePath(); pinta(roupa);
      c.save(); c.clip(); c.strokeStyle = cor(roupa, '#6a6a90', 0.3, 0.7); c.lineWidth = 2.4;
      for (let i = 1; i < N; i++) { c.beginPath(); c.moveTo(-34 + i * 8.5, -392); c.quadraticCurveTo(bx(N - i) * 0.6, -300, bx(N - i), by(N - i)); c.stroke(); } // dobras
      c.fillStyle = cor(roupa, '#5a5a8a', 0.4, 0.28); c.beginPath(); c.moveTo(10, -470); c.lineTo(60, -470); c.lineTo(150, -190); c.lineTo(60, -190); c.closePath(); c.fill(); // lado na sombra
      c.restore();
      c.beginPath(); c.moveTo(-44, -408); c.lineTo(44, -408); c.lineTo(42, -390); c.lineTo(-42, -390); c.closePath(); pinta(detalhe); // faixa na cintura
      for (const k2 of [0, 1]) { c.beginPath(); c.moveTo(-40, -400); c.quadraticCurveTo(-70 - 40 * V, -392 + 14 * k2 + 8 * onda(7, k2), -84 - 76 * V + 8 * onda(7, k2 + 1), -372 + 34 * k2 + 12 * V * onda(8, k2)); c.quadraticCurveTo(-64 - 30 * V, -384 + 18 * k2, -40, -392); c.closePath(); pinta(detalhe, true, 2); } // pontas da faixa ao vento
    } else {
      // saia
      const N = 8; const bx = (i) => 96 - i * (192 / N) - empurra * (0.4 + 0.6 * i / N), by = (i) => -236 + bate(i) * 0.8;
      c.beginPath(); c.moveTo(42, -392); c.lineTo(bx(0), by(0)); for (let i = 1; i <= N; i++) c.quadraticCurveTo((bx(i - 1) + bx(i)) / 2, Math.max(by(i - 1), by(i)) + 10, bx(i), by(i));
      c.lineTo(-42, -392); c.closePath(); pinta(roupa);
      c.save(); c.clip(); c.strokeStyle = roupaSombra; c.lineWidth = 3;
      for (let i = 1; i < N; i++) { c.beginPath(); c.moveTo(-36 + i * 9, -390); c.lineTo(bx(N - i), by(N - i) + 10); c.stroke(); } // pregas
      c.fillStyle = cor(roupaSombra, '#000000', 0.2, 0.35); c.beginPath(); c.moveTo(8, -392); c.lineTo(50, -392); c.lineTo(120, -220); c.lineTo(40, -220); c.closePath(); c.fill();
      c.restore();
      // blusa
      c.beginPath(); c.moveTo(-58, -505); c.quadraticCurveTo(0, -516, 58, -505); c.quadraticCurveTo(66, -470, 50, -440); c.lineTo(44, -384); c.lineTo(-44, -384); c.lineTo(-50, -440); c.quadraticCurveTo(-66, -470, -58, -505); c.closePath(); pinta(branco);
      c.save(); c.clip(); c.fillStyle = brancoSombra; c.beginPath(); c.moveTo(14, -520); c.lineTo(70, -520); c.lineTo(70, -380); c.lineTo(26, -380); c.quadraticCurveTo(34, -440, 14, -520); c.closePath(); c.fill(); c.restore();
      // gola de marinheiro e laço
      c.beginPath(); c.moveTo(-50, -508); c.lineTo(-10, -512); c.lineTo(0, -452); c.lineTo(-34, -466); c.closePath(); pinta(roupa);
      c.beginPath(); c.moveTo(50, -508); c.lineTo(10, -512); c.lineTo(0, -452); c.lineTo(34, -466); c.closePath(); pinta(roupa);
      c.strokeStyle = branco; c.lineWidth = 2.2; c.beginPath(); c.moveTo(-43, -500); c.lineTo(-30, -471); c.lineTo(-4, -462); c.moveTo(43, -500); c.lineTo(30, -471); c.lineTo(4, -462); c.stroke();
      for (const k2 of [0, 1]) { c.beginPath(); c.moveTo(0, -450); c.quadraticCurveTo(-12 - 22 * V, -430 + 12 * k2, -16 - 44 * V + 6 * onda(8, k2), -404 + 22 * k2 + 8 * V * onda(9, k2)); c.lineTo(-4 - 30 * V + 6 * onda(8, k2), -398 + 22 * k2); c.quadraticCurveTo(2 - 10 * V, -426, 6, -448); c.closePath(); pinta(detalhe, true, 2); } // pontas do laço
      c.beginPath(); c.moveTo(0, -452); c.lineTo(-22, -466); c.lineTo(-20, -440); c.closePath(); pinta(detalhe, true, 2);
      c.beginPath(); c.moveTo(0, -452); c.lineTo(22, -466); c.lineTo(20, -440); c.closePath(); pinta(detalhe, true, 2);
      c.beginPath(); c.arc(0, -452, 6, 0, 6.2832); pinta(cor(detalhe, '#000000', 0.15), true, 2);
    }

    // ---------- pescoço e cabeça ----------
    c.beginPath(); c.moveTo(-14, -540); c.lineTo(14, -540); c.lineTo(16, -502); c.quadraticCurveTo(0, -494, -16, -502); c.closePath(); pinta(pele);
    c.fillStyle = peleSombra; c.beginPath(); c.moveTo(-14, -536); c.lineTo(14, -536); c.lineTo(15, -520); c.quadraticCurveTo(0, -512, -15, -524); c.closePath(); c.fill();
    const inclina = 0.02 * onda(0.9, 0) - 0.03 * V;
    c.save(); c.translate(0, -530); c.rotate(inclina); c.scale(CABECA, CABECA); c.translate(0, 530);
    const rosto = () => { c.beginPath(); c.moveTo(-60, -598); c.bezierCurveTo(-60, -672, 60, -672, 60, -598); c.bezierCurveTo(60, -560, 26, -525, 0, -522); c.bezierCurveTo(-26, -525, -60, -560, -60, -598); c.closePath(); };
    rosto(); pinta(pele);
    c.save(); rosto(); c.clip();
    c.fillStyle = cor(peleSombra, pele, 0.2, 0.75); c.fillRect(-70, -680, 140, P.chapeu ? 76 : 58); // sombra da franja (ou do chapéu) na testa
    c.fillStyle = 'rgba(255,130,130,0.42)'; // bochechas
    c.beginPath(); c.ellipse(-37, -560, 14, 8, 0, 0, 6.2832); c.fill(); c.beginPath(); c.ellipse(37, -560, 14, 8, 0, 0, 6.2832); c.fill();
    c.restore();

    // olhos (grandes, com brilho). "olho" fecha na piscada.
    for (const lado of [-1, 1]) {
      const cx = lado * 27, cy = -583;
      if (olho < 0.25) {
        c.strokeStyle = cabSombra; c.lineWidth = 4; c.beginPath(); c.moveTo(cx - 13, cy + 1); c.quadraticCurveTo(cx, cy + 9, cx + 13, cy + 1); c.stroke();
        continue;
      }
      const ay = 16 * olho;
      c.save(); c.beginPath(); c.ellipse(cx, cy, 12.5, ay, 0, 0, 6.2832); c.fillStyle = '#ffffff'; c.fill(); c.clip();
      const gi = c.createLinearGradient(0, cy - 14, 0, cy + 14); gi.addColorStop(0, cor(P.olhos, '#000000', 0.55)); gi.addColorStop(1, cor(P.olhos, '#ffffff', 0.25));
      c.fillStyle = gi; c.beginPath(); c.ellipse(cx - 2, cy + 1, 10, 14, 0, 0, 6.2832); c.fill();
      c.fillStyle = cor(P.olhos, '#000000', 0.75); c.beginPath(); c.ellipse(cx - 2, cy + 1, 4.6, 7.5, 0, 0, 6.2832); c.fill();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(cx - 6, cy - 6, 4, 0, 6.2832); c.fill(); c.beginPath(); c.arc(cx + 3, cy + 7, 2, 0, 6.2832); c.fill();
      c.fillStyle = 'rgba(60,30,40,0.25)'; c.fillRect(cx - 14, cy - 18, 28, 6); // sombra do cílio
      c.restore();
      c.strokeStyle = cabSombra; c.lineWidth = 4.6; c.beginPath(); c.moveTo(cx - 14, cy - ay * 0.5); c.quadraticCurveTo(cx, cy - ay * 1.25, cx + 14, cy - ay * 0.5); c.stroke(); // cílio de cima
      c.lineWidth = 2.6; c.beginPath(); c.moveTo(cx + lado * 13, cy - ay * 0.55); c.lineTo(cx + lado * 18, cy - ay * 0.85); c.stroke();
      c.lineWidth = 2.2; c.strokeStyle = cor(cab, '#000000', 0.1); c.beginPath(); c.moveTo(cx - 12, -611 - 2 * sorriso); c.quadraticCurveTo(cx, -616 - 2 * sorriso, cx + 12, -611 - 2 * sorriso); c.stroke(); // sobrancelha
    }
    c.strokeStyle = 'rgba(190,100,90,0.8)'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(1, -565); c.lineTo(3, -560); c.stroke(); // nariz
    if (sorriso > 0.55) { c.beginPath(); c.moveTo(-10, -549); c.quadraticCurveTo(0, -546, 10, -549); c.quadraticCurveTo(0, -549 + 16 * sorriso, -10, -549); c.closePath(); pinta('#b6504c', true, 2); }
    else { c.strokeStyle = 'rgba(150,60,60,0.95)'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(-9, -549); c.quadraticCurveTo(0, -543 + 4 * sorriso, 9, -549); c.stroke(); }

    // ---------- cabelo da frente: casquete, franja e mechas do lado ----------
    c.beginPath(); c.moveTo(-66, -588); c.bezierCurveTo(-76, -694, 76, -694, 66, -588); c.lineTo(58, -618); c.quadraticCurveTo(0, -640, -58, -618); c.closePath(); pinta(cab);
    const FRANJA = [[-58, -34, -50, -594], [-40, -14, -30, -604], [-18, 10, -6, -598], [6, 32, 22, -606], [28, 52, 46, -596], [46, 64, 60, -590]];
    FRANJA.forEach(([a, b, px, py], i) => {
      const dx = -5 * V + 2.5 * onda(4.2, i), topo = -636 + Math.abs((a + b) / 2) * 0.16;
      c.beginPath(); c.moveTo(a, topo); c.quadraticCurveTo((a + px) / 2 - 4, (topo + py) / 2, px + dx, py); c.quadraticCurveTo((b + px) / 2 + 5, (topo + py) / 2, b, topo); c.closePath(); pinta(cab, true, 2);
    });
    for (const lado of [-1, 1]) { // mechas na frente das orelhas
      const dx = -14 * V + (3 + 6 * V) * onda(3.6, lado);
      c.beginPath(); c.moveTo(lado * 52, -632); c.quadraticCurveTo(lado * 76 + dx * 0.4, -590, lado * 64 + dx, -512 - 8 * V); c.quadraticCurveTo(lado * 56 + dx * 0.3, -570, lado * 44, -612); c.closePath(); pinta(cab, true, 2);
    }
    c.strokeStyle = cabLuz; c.lineWidth = 6; c.globalAlpha = 0.75; c.beginPath(); c.moveTo(-46, -648); c.quadraticCurveTo(-8, -664, 34, -652); c.stroke(); c.globalAlpha = 1; // brilho do cabelo

    // ---------- chapéu de palha ----------
    if (P.chapeu) {
      const palha = '#f1d894', palhaSombra = '#d2ac5e';
      c.save(); c.translate(0, -640); c.rotate(-0.06 - 0.05 * V * onda(5, 0) - 0.03 * V);
      c.beginPath(); c.ellipse(0, -2, 122, 27, 0, 0, 6.2832); pinta(palha);
      c.beginPath(); c.ellipse(0, 4, 104, 18, 0, 0, Math.PI); c.fillStyle = cor(palhaSombra, '#805030', 0.2, 0.55); c.fill(); // de baixo da aba
      c.beginPath(); c.moveTo(-60, -6); c.bezierCurveTo(-62, -82, 62, -82, 60, -6); c.quadraticCurveTo(0, 10, -60, -6); c.closePath(); pinta(palha);
      c.save(); c.clip(); c.fillStyle = cor(palhaSombra, palha, 0.2, 0.8); c.fillRect(18, -90, 60, 100);
      c.strokeStyle = cor(palhaSombra, palha, 0.3, 0.7); c.lineWidth = 1.6; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(0, -8 - i * 11, 62 - i * 5, 8, 0, 0, Math.PI); c.stroke(); } c.restore();
      c.beginPath(); c.moveTo(-60, -10); c.quadraticCurveTo(0, 6, 60, -10); c.lineTo(59, -26); c.quadraticCurveTo(0, -10, -59, -26); c.closePath(); pinta(detalhe, true, 2);
      for (const k2 of [0, 1]) { c.beginPath(); c.moveTo(-58, -18); c.quadraticCurveTo(-100 - 40 * V, -20 + 10 * k2 + 8 * onda(7, k2), -120 - 80 * V + 8 * onda(7.5, k2), -6 + 26 * k2 + 14 * V * onda(8, k2 + 2)); c.quadraticCurveTo(-90 - 30 * V, -4 + 14 * k2, -58, -10); c.closePath(); pinta(detalhe, true, 2); } // fita ao vento
      c.restore();
    }
    c.restore(); // fim da cabeça

    // ---------- braço da direita da tela: é ele que faz a açêo ----------
    const sobe = braco * braco * (3 - 2 * braco);
    let a1 = 82 - 2 * onda(1.3, 1) - 4 * V, a2 = 88 - 4 * onda(1.3, 0.3) - 6 * V;
    if (acao === 'acenar') { a1 = mistura(a1, -30, sobe); a2 = mistura(a2, -80 + 22 * Math.sin(t * 7.5) * sobe, sobe); }
    else if (acao === 'segurar-chapeu') { a1 = mistura(a1, -76, sobe); a2 = mistura(a2, -103 + 3 * onda(5, 0), sobe); }
    bracoDe(58, -490, a1, a2, 1);
    c.restore();
  };
})();
