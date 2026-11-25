// comum/som.js — som feito em código: cada amostra é uma conta. Sem arquivo de áudio, sem microfone.
// O motor monta a trilha com as mesmas marcas de tempo da imagem (por isso som e imagem nêo desencontram).
(function () {
  'use strict';
  const TAXA = 44100;
  const NOTAS = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };

  // 'A4' -> 440 ; 'C#3' -> 138,59...
  function freq(nome) {
    if (typeof nome === 'number') return nome;
    const m = /^([A-G][#b]?)(-?\d)$/.exec(nome);
    if (!m) throw new Error('nota desconhecida: ' + nome);
    const semis = NOTAS[m[1]] + (Number(m[2]) + 1) * 12; // número MIDI
    return 440 * Math.pow(2, (semis - 69) / 12);
  }

  function sorteio(semente) {
    let a = (semente >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function criar(duracao, semente = 7) {
    const n = Math.ceil(duracao * TAXA);
    const E = new Float32Array(n), D = new Float32Array(n);
    const acaso = sorteio(semente);
    const pan = (p) => [Math.cos((p + 1) * Math.PI / 4), Math.sin((p + 1) * Math.PI / 4)];

    const m = {
      taxa: TAXA, duracao,

      // nota sustentada (pad, flauta, baixo). forma: 'seno' | 'tri' | 'serra' | 'quad'
      nota(nota, t0, dur, o = {}) {
        const f = freq(nota), vol = o.vol ?? 0.2, [pe, pd] = pan(o.pan ?? 0);
        const ataque = o.ataque ?? 0.05, solta = o.solta ?? 0.3, forma = o.forma || 'seno';
        const vib = o.vibrato ?? 0, vibF = o.vibratoHz ?? 5;
        const i0 = Math.floor(t0 * TAXA), total = Math.floor((dur + solta) * TAXA);
        let fase = 0;
        for (let i = 0; i < total && i0 + i < n; i++) {
          if (i0 + i < 0) continue;
          const t = i / TAXA;
          const env = t < ataque ? t / ataque : (t < dur ? 1 : Math.exp(-5 * (t - dur) / solta));
          fase += 2 * Math.PI * f * (1 + vib * Math.sin(2 * Math.PI * vibF * t)) / TAXA;
          let s;
          if (forma === 'seno') s = Math.sin(fase);
          else if (forma === 'tri') s = (2 / Math.PI) * Math.asin(Math.sin(fase));
          else if (forma === 'quad') s = 0.6 * Math.tanh(4 * Math.sin(fase));
          else s = 0.5 * (Math.sin(fase) + Math.sin(2 * fase) / 2 + Math.sin(3 * fase) / 3 + Math.sin(4 * fase) / 4 + Math.sin(5 * fase) / 5);
          s *= env * vol;
          E[i0 + i] += s * pe; D[i0 + i] += s * pd;
        }
      },

      // sino / caixinha de música (dois senos, um mexendo no outro)
      sino(nota, t0, dur, o = {}) {
        const f = freq(nota), vol = o.vol ?? 0.2, [pe, pd] = pan(o.pan ?? 0), brilho = o.brilho ?? 2.2;
        const i0 = Math.floor(t0 * TAXA), total = Math.floor(dur * TAXA);
        for (let i = 0; i < total && i0 + i < n; i++) {
          if (i0 + i < 0) continue;
          const t = i / TAXA, env = Math.min(1, t / 0.004) * Math.exp(-4.5 * t / dur);
          const s = Math.sin(2 * Math.PI * f * t + brilho * Math.exp(-6 * t / dur) * Math.sin(2 * Math.PI * f * 3.01 * t)) * env * vol;
          E[i0 + i] += s * pe; D[i0 + i] += s * pd;
        }
      },

      // corda dedilhada (violêo, harpa) — método de Karplus-Strong
      corda(nota, t0, dur, o = {}) {
        const f = freq(nota), vol = o.vol ?? 0.25, [pe, pd] = pan(o.pan ?? 0), maciez = o.maciez ?? 0.5;
        const tam = Math.max(2, Math.round(TAXA / f)), linha = new Float32Array(tam);
        let ant = 0;
        for (let i = 0; i < tam; i++) { const r = acaso() * 2 - 1; ant = ant + (r - ant) * (1 - maciez * 0.8); linha[i] = ant; }
        const i0 = Math.floor(t0 * TAXA), total = Math.floor(dur * TAXA);
        let p = 0;
        for (let i = 0; i < total && i0 + i < n; i++) {
          const prox = (p + 1) % tam;
          const s = linha[p];
          linha[p] = 0.996 * 0.5 * (linha[p] + linha[prox]);
          p = prox;
          if (i0 + i < 0) continue;
          const fim = Math.min(1, (total - i) / (0.05 * TAXA));
          E[i0 + i] += s * vol * pe * fim; D[i0 + i] += s * vol * pd * fim;
        }
      },

      // vento / mar: ruído filtrado que sobe e desce devagar
      vento(t0, dur, o = {}) {
        const vol = o.vol ?? 0.1, corte = o.corte ?? 600, onda = o.onda ?? 0.25, profund = o.profundidade ?? 0.6;
        const i0 = Math.floor(t0 * TAXA), total = Math.floor(dur * TAXA);
        let fe = 0, fd = 0, fe2 = 0, fd2 = 0;
        const fase = acaso() * 6.28;
        for (let i = 0; i < total && i0 + i < n; i++) {
          const t = i / TAXA;
          const sobe = 1 - profund + profund * (0.5 + 0.5 * Math.sin(2 * Math.PI * onda * t + fase)) * (0.7 + 0.3 * Math.sin(2 * Math.PI * onda * 0.37 * t + 1.3));
          const a = 1 - Math.exp(-2 * Math.PI * (corte * (0.6 + 0.6 * sobe)) / TAXA);
          fe += a * ((acaso() * 2 - 1) - fe); fd += a * ((acaso() * 2 - 1) - fd);
          fe2 += a * (fe - fe2); fd2 += a * (fd - fd2);
          if (i0 + i < 0) continue;
          const borda = Math.min(1, t / (o.entra ?? 1.0), (dur - t) / (o.sai ?? 1.0));
          E[i0 + i] += fe2 * vol * sobe * borda * 4; D[i0 + i] += fd2 * vol * sobe * borda * 4;
        }
      },

      // grilo / passarinho: assobio curto repetido
      pio(t0, o = {}) {
        const f = o.freq ?? 4200, vol = o.vol ?? 0.05, [pe, pd] = pan(o.pan ?? 0), rep = o.repete ?? 3, gap = o.intervalo ?? 0.07, sobe = o.sobe ?? 0;
        for (let r = 0; r < rep; r++) {
          const i0 = Math.floor((t0 + r * gap) * TAXA), total = Math.floor((o.dur ?? 0.04) * TAXA);
          for (let i = 0; i < total && i0 + i < n; i++) {
            if (i0 + i < 0) continue;
            const k = i / total, s = Math.sin(2 * Math.PI * f * (1 + sobe * k) * i / TAXA) * Math.sin(Math.PI * k) * vol;
            E[i0 + i] += s * pe; D[i0 + i] += s * pd;
          }
        }
      },

      // batida grave e macia (bumbo, passo, coraçêo)
      batida(t0, o = {}) {
        const vol = o.vol ?? 0.4, f0 = o.freq ?? 110, dur = o.dur ?? 0.25, [pe, pd] = pan(o.pan ?? 0);
        const i0 = Math.floor(t0 * TAXA), total = Math.floor(dur * TAXA);
        let fase = 0;
        for (let i = 0; i < total && i0 + i < n; i++) {
          const t = i / TAXA; fase += 2 * Math.PI * (f0 * (0.45 + 0.55 * Math.exp(-28 * t))) / TAXA;
          if (i0 + i < 0) continue;
          const s = Math.sin(fase) * Math.exp(-7 * t / dur) * Math.min(1, t / 0.003) * vol;
          E[i0 + i] += s * pe; D[i0 + i] += s * pd;
        }
      },

      // toque seco e curto (passo em folha, estalo, chocalho)
      toque(t0, o = {}) {
        const vol = o.vol ?? 0.1, dur = o.dur ?? 0.06, corte = o.corte ?? 3000, [pe, pd] = pan(o.pan ?? 0);
        const i0 = Math.floor(t0 * TAXA), total = Math.floor(dur * TAXA);
        const a = 1 - Math.exp(-2 * Math.PI * corte / TAXA); let f1 = 0, ant = 0;
        for (let i = 0; i < total && i0 + i < n; i++) {
          const r = acaso() * 2 - 1; f1 += a * (r - f1); const alto = f1 - ant * 0.6; ant = f1;
          if (i0 + i < 0) continue;
          const s = alto * Math.exp(-6 * i / total) * vol * 3;
          E[i0 + i] += s * pe; D[i0 + i] += s * pd;
        }
      },

      // eco de sala: dá espaço ao som (sem isso tudo soa "seco")
      sala(quanto = 0.25) {
        const linhas = [0.0297, 0.0371, 0.0411, 0.0437], volta = 0.80;
        for (const [buf, desvio] of [[E, 0], [D, 0.0013]]) {
          const soma = new Float32Array(n);
          for (const atraso of linhas) {
            const d = Math.round((atraso + desvio) * TAXA), linha = new Float32Array(d); let p = 0, filtro = 0;
            for (let i = 0; i < n; i++) {
              const y = linha[p]; filtro = y * 0.6 + filtro * 0.4;
              linha[p] = buf[i] + filtro * volta; p = (p + 1) % d; soma[i] += y;
            }
          }
          for (const atraso of [0.005, 0.0017]) {
            const d = Math.round(atraso * TAXA), linha = new Float32Array(d); let p = 0;
            for (let i = 0; i < n; i++) { const y = linha[p]; const x = soma[i]; linha[p] = x + y * 0.5; soma[i] = y - x * 0.5; p = (p + 1) % d; }
          }
          for (let i = 0; i < n; i++) buf[i] += soma[i] * quanto * 0.25;
        }
      },

      // fecha a trilha: entrada e saída suaves e volume final seguro
      fim(o = {}) {
        const entra = (o.entra ?? 0.4) * TAXA, sai = (o.sai ?? 1.2) * TAXA, alvo = o.pico ?? 0.85;
        let pico = 1e-9;
        for (let i = 0; i < n; i++) {
          const g = Math.min(1, i / entra, (n - 1 - i) / sai);
          E[i] *= g; D[i] *= g;
          pico = Math.max(pico, Math.abs(E[i]), Math.abs(D[i]));
        }
        const ganho = alvo / pico;
        for (let i = 0; i < n; i++) { E[i] *= ganho; D[i] *= ganho; }
        return { taxa: TAXA, esq: E, dir: D };
      },
    };
    return m;
  }

  window.Som = { criar, freq, TAXA };
})();
