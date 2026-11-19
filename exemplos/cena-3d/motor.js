// MOTOR "cena-3d" — uma cena em três dimensões, com a câmera andando dentro dela.
// Jeito de animar: em vez de desenhar cada quadro, o código MONTA um mundo (chão, árvores,
// cabana, luzes) e passeia com uma câmera. Luz, sombra e profundidade saem "de graça".
// Usa a biblioteca three.js, que fica dentro do kit (vendor/three). Roda sem placa de vídeo.
// O que muda de um episódio para outro está em historia.json. Este arquivo não muda.
import * as THREE from '../../vendor/three/three.module.js';

const { limita, mistura, trecho, suave, sorteio, ruido } = Filme;

Filme.criar({
  largura: 1920, altura: 1080, fps: 30, duracao: 10,
  montar({ historia: H, tela, largura, altura, duracao }) {
    const C = H.cores, acaso = sorteio(H.semente);
    const T = { titulo: [6.6, 7.6], some: [duracao - 0.7, duracao], chega: 8.6 };

    const render = new THREE.WebGLRenderer({ canvas: tela, antialias: true, preserveDrawingBuffer: true });
    render.setPixelRatio(1); render.setSize(largura, altura, false);
    render.shadowMap.enabled = true; render.shadowMap.type = THREE.PCFSoftShadowMap;
    render.toneMapping = THREE.ACESFilmicToneMapping; render.toneMappingExposure = 1.0;
    render.autoClear = false;

    const cena = new THREE.Scene();
    cena.fog = new THREE.FogExp2(C.neblina, 0.021);
    const camera = new THREE.PerspectiveCamera(52, largura / altura, 0.1, 600);

    // ---------- chão: uma malha de triângulos com morrinhos ----------
    const alturaChao = (x, z) => {
      const longe = suave(trecho(Math.hypot(x, z), 7, 17)); // perto da cabana o chão é plano
      return longe * (1.3 * Math.sin(x * 0.07 + 1.3) * Math.cos(z * 0.06 + 0.4) + 0.6 * Math.sin(x * 0.19 + z * 0.13) + 0.22 * Math.sin(x * 0.5) * Math.sin(z * 0.45));
    };
    {
      const g = new THREE.PlaneGeometry(260, 260, 130, 130); g.rotateX(-Math.PI / 2);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) p.setY(i, alturaChao(p.getX(i), p.getZ(i)));
      g.computeVertexNormals();
      const chao = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: C.neve, flatShading: true }));
      chao.receiveShadow = true; cena.add(chao);
    }

    // ---------- caminho da câmera (curva que passa pelos pontos da história) ----------
    const curva = new THREE.CatmullRomCurve3(H.caminho.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'catmullrom', 0.5);
    const comprimento = curva.getLength();
    const u = (t) => 1 - Math.pow(1 - trecho(t, 0, T.chega), 1.6); // anda firme e vai freando até parar
    const PASSO = 0.85; // metros por passo: o balanço da câmera e o som do passo saem daqui
    const distancia = (t) => u(t) * comprimento;
    const amostras = Array.from({ length: 80 }, (_, i) => curva.getPointAt(i / 79));

    // ---------- árvores (pinheiros com neve), todas de uma vez com "instâncias" ----------
    const fosco = (cor) => new THREE.MeshLambertMaterial({ color: cor, flatShading: true });
    const N = H.arvores;
    const pecas = [
      { geo: new THREE.CylinderGeometry(0.16, 0.24, 2.2, 6), mat: fosco(C.tronco), y: 1.1, s: 1 },
      { geo: new THREE.ConeGeometry(1.5, 2.2, 7), mat: fosco(C.arvore), y: 2.8, s: 1 },
      { geo: new THREE.ConeGeometry(1.15, 2.0, 7), mat: fosco(C.arvore), y: 4.0, s: 1 },
      { geo: new THREE.ConeGeometry(0.8, 1.8, 7), mat: fosco(C.arvore), y: 5.1, s: 1 },
      { geo: new THREE.ConeGeometry(1.2, 0.9, 7), mat: fosco('#f4f8ff'), y: 3.55, s: 1 }, // neve em cima de cada andar
      { geo: new THREE.ConeGeometry(0.9, 0.85, 7), mat: fosco('#f4f8ff'), y: 4.65, s: 1 },
      { geo: new THREE.ConeGeometry(0.6, 0.8, 7), mat: fosco('#f4f8ff'), y: 5.65, s: 1 },
    ].map((p) => { const m = new THREE.InstancedMesh(p.geo, p.mat, N); m.castShadow = true; m.receiveShadow = true; cena.add(m); return { ...p, malha: m }; });
    {
      const o = new THREE.Object3D(), corArv = new THREE.Color();
      let postas = 0, tentativas = 0;
      while (postas < N && tentativas < 20000) {
        tentativas++;
        let x, z;
        if (acaso() < 0.62) { // a maioria nasce dos dois lados do caminho: vira um corredor de floresta
          const a = amostras[Math.floor(acaso() * amostras.length)], lado = acaso() < 0.5 ? -1 : 1, afasta = 3.6 + Math.pow(acaso(), 1.4) * 16;
          x = a.x + lado * afasta; z = a.z + (acaso() - 0.5) * 6;
        } else { const raio = 12 + acaso() * 85, ang = acaso() * 6.2832; x = Math.cos(ang) * raio; z = Math.sin(ang) * raio; }
        if (Math.hypot(x, z) < 9.5) continue;                                   // clareira da cabana
        if (amostras.some((a) => Math.hypot(a.x - x, a.z - z) < 3.5)) continue; // deixa o caminho livre
        if (z < 17 && z > 0 && Math.abs(x - 3) < 7.5) continue;                   // não tapa a chegada
        const esc = 0.8 + acaso() * 0.9, gira = acaso() * 6.28, tom = 0.8 + acaso() * 0.4, y0 = alturaChao(x, z) - 0.1;
        for (const p of pecas) {
          o.position.set(x, y0 + p.y * esc, z); o.rotation.set(0, gira, 0); o.scale.set(esc, esc, esc); o.updateMatrix();
          p.malha.setMatrixAt(postas, o.matrix);
          if (p.malha.material.color.getHexString() !== 'f4f8ff') { corArv.setScalar(tom); p.malha.setColorAt(postas, corArv); } // a cor da instância multiplica a do material: aqui só clareia ou escurece
        }
        postas++;
      }
      for (const p of pecas) { p.malha.count = postas; p.malha.instanceMatrix.needsUpdate = true; if (p.malha.instanceColor) p.malha.instanceColor.needsUpdate = true; }
    }

    // ---------- cabana ----------
    const cabana = new THREE.Group(); cena.add(cabana);
    const caixa = (w, h, d, cor, x, y, z, pai = cabana) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), fosco(cor)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; pai.add(m); return m; };
    caixa(6, 3, 4.6, C.cabana, 0, 1.5, 0);
    for (let i = 0; i < 5; i++) caixa(6.06, 0.08, 4.66, '#4d3222', 0, 0.5 + i * 0.6, 0); // frisos das toras
    { // telhado de duas águas, coberto de neve
      const forma = new THREE.Shape(); forma.moveTo(-3.7, 0); forma.lineTo(0, 2.3); forma.lineTo(3.7, 0); forma.closePath();
      const g = new THREE.ExtrudeGeometry(forma, { depth: 5.6, bevelEnabled: false }); g.translate(0, 3, -2.8);
      const telhado = new THREE.Mesh(g, fosco('#eef4ff')); telhado.castShadow = true; telhado.receiveShadow = true; cabana.add(telhado);
      const forma2 = new THREE.Shape(); forma2.moveTo(-3.2, 0); forma2.lineTo(0, 2.0); forma2.lineTo(3.2, 0); forma2.closePath();
      const g2 = new THREE.ExtrudeGeometry(forma2, { depth: 4.7, bevelEnabled: false }); g2.translate(0, 2.98, -2.35);
      cabana.add(new THREE.Mesh(g2, fosco('#5a3a28')));
    }
    caixa(0.8, 1.9, 0.8, '#7a6a62', 1.9, 4.4, -0.6); caixa(0.95, 0.22, 0.95, '#f4f8ff', 1.9, 5.45, -0.6); // chaminé
    caixa(1.1, 2.0, 0.12, '#3a2418', -0.2, 1.0, 2.34); caixa(0.1, 0.1, 0.1, '#e8c060', 0.2, 1.0, 2.44);   // porta e maçaneta
    caixa(2.2, 0.16, 1.2, '#5a3a28', -0.2, 0.08, 2.9);                                                    // degrau
    const luzJanela = new THREE.MeshBasicMaterial({ color: C.janela });
    for (const x of [-2.0, 1.7]) { // janelas acesas
      const j = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), luzJanela); j.position.set(x, 1.7, 2.32); cabana.add(j);
      caixa(1.3, 0.1, 0.1, '#3a2418', x, 1.7, 2.34); caixa(0.1, 1.3, 0.1, '#3a2418', x, 1.7, 2.34);
      caixa(1.34, 0.1, 0.14, '#3a2418', x, 2.3, 2.34); caixa(1.44, 0.12, 0.24, '#f4f8ff', x, 1.1, 2.38);
    }
    { const j = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), luzJanela); j.position.set(3.02, 1.7, 0.2); j.rotation.y = Math.PI / 2; cabana.add(j); }

    // ---------- fogueira, boneco de neve, lenha ----------
    const FOGO = new THREE.Vector3(5.6, 0, 5.0);
    const chamas = [];
    for (let i = 0; i < 5; i++) {
      const tora = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.3, 6), fosco('#3b2619'));
      tora.position.set(FOGO.x, 0.14, FOGO.z); tora.rotation.set(Math.PI / 2 - 0.25, 0, i * 1.256); tora.rotation.order = 'YXZ'; tora.rotation.y = i * 1.256; cena.add(tora);
    }
    for (let i = 0; i < 4; i++) {
      const ch = new THREE.Mesh(new THREE.ConeGeometry(0.4 - i * 0.05, 1.4 - i * 0.16, 5), new THREE.MeshBasicMaterial({ color: i < 2 ? C.fogo : '#ffe08a', transparent: true, opacity: 0.92 }));
      ch.position.set(FOGO.x + (i % 2 ? 0.14 : -0.12), 0.55, FOGO.z + (i > 1 ? 0.13 : -0.1)); cena.add(ch); chamas.push(ch);
    }
    for (let i = 0; i < 9; i++) { const p = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2 + acaso() * 0.08, 0), fosco('#8a8f9c')); p.position.set(FOGO.x + Math.cos(i * 0.7) * 0.85, 0.1, FOGO.z + Math.sin(i * 0.7) * 0.85); cena.add(p); }
    if (H.boneco) {
      const b = new THREE.Group(); b.position.set(-3.4, 0, 5.2); b.rotation.y = 0.5; cena.add(b);
      const bola = (r, y, cor = '#f6f9ff') => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), fosco(cor)); m.position.y = y; m.castShadow = true; b.add(m); return m; };
      bola(0.75, 0.6); bola(0.52, 1.55); bola(0.36, 2.25);
      const nariz = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.4, 6), fosco('#ff8a2a')); nariz.position.set(0, 2.25, 0.5); nariz.rotation.x = Math.PI / 2; b.add(nariz);
      for (const x of [-0.13, 0.13]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), fosco('#111111')); o.position.set(x, 2.36, 0.31); b.add(o); }
      const cachecol = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.09, 6, 12), fosco('#d8423a')); cachecol.position.y = 1.98; cachecol.rotation.x = Math.PI / 2; b.add(cachecol);
      for (const s of [-1, 1]) { const br = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 5), fosco('#3b2619')); br.position.set(s * 0.8, 1.75, 0); br.rotation.z = s * -1.0; b.add(br); }
    }
    for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.4, 6), fosco('#5a3a28')); l.rotation.x = Math.PI / 2; l.position.set(-3.3 + (i % 3) * 0.34 + (i > 2 ? 0.17 : 0), 0.18 + (i > 2 ? 0.3 : 0), -0.2 + 2.9); l.position.x -= 0.6; l.position.z = 1.6; l.rotation.z = 0; l.rotation.y = Math.PI / 2; l.castShadow = true; cena.add(l); }

    // ---------- céu: cúpula em degradê, estrelas, lua, montanhas, aurora ----------
    {
      const g = new THREE.SphereGeometry(400, 24, 16), cores = [], alto = new THREE.Color(C.ceuAlto), baixo = new THREE.Color(C.ceuBaixo), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const k2 = suave(limita(p.getY(i) / 230, 0, 1)); const c2 = baixo.clone().lerp(alto, k2); cores.push(c2.r, c2.g, c2.b); }
      g.setAttribute('color', new THREE.Float32BufferAttribute(cores, 3));
      cena.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, toneMapped: false })));
      const pe = [];
      for (let i = 0; i < 900; i++) { const a = acaso() * 6.2832, e = 0.08 + acaso() * 1.4, r = 380; pe.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r); }
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(pe, 3));
      cena.add(new THREE.Points(ge, new THREE.PointsMaterial({ color: '#ffffff', size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85 })));
    }
    const LUA = new THREE.Vector3(-70, 84, -200);
    const bolinha = (cor) => { // textura redonda e macia, para halos de luz
      const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, cor); g.addColorStop(0.25, cor + 'aa'); g.addColorStop(1, cor + '00'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx;
    };
    const halo = (cor, tam, pos, opac = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bolinha(cor), blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true, opacity: opac })); s.scale.set(tam, tam, 1); s.position.copy(pos); cena.add(s); return s; };
    { const lua = new THREE.Mesh(new THREE.SphereGeometry(11, 20, 14), new THREE.MeshBasicMaterial({ color: C.lua, fog: false })); lua.position.copy(LUA); cena.add(lua); halo('#bcd0ff', 120, LUA, 0.5); }
    for (let i = 0; i < 46; i++) { // montanhas em volta
      const a = i / 46 * 6.2832 + acaso() * 0.1, r = 150 + acaso() * 50, h = 22 + acaso() * 40;
      const m = new THREE.Mesh(new THREE.ConeGeometry(26 + acaso() * 22, h, 5), new THREE.MeshLambertMaterial({ color: '#22355f', flatShading: true, fog: false }));
      m.position.set(Math.cos(a) * r, h / 2 - 4, Math.sin(a) * r); m.rotation.y = acaso() * 3; cena.add(m);
      const n = new THREE.Mesh(new THREE.ConeGeometry((26) * 0.36, h * 0.34, 5), new THREE.MeshLambertMaterial({ color: '#c9d6f2', flatShading: true, fog: false }));
      n.position.set(m.position.x, h - 4 - h * 0.17 + 0.3, m.position.z); n.rotation.y = m.rotation.y; n.scale.setScalar(m.geometry.parameters.radius / 26); n.scale.y = 1; cena.add(n);
    }
    const faixas = [];
    if (H.aurora) {
      const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const x = cv.getContext('2d');
      const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.35, C.aurora[1] + '66'); g.addColorStop(0.75, C.aurora[0] + 'cc'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(0, 0, 256, 128);
      const r2 = sorteio(H.semente + 3); x.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(0,0,0,${0.15 + r2() * 0.5})`; x.fillRect(r2() * 256, 0, 1 + r2() * 5, 128); } // riscos verticais
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = THREE.RepeatWrapping;
      for (let i = 0; i < 3; i++) {
        const geo = new THREE.PlaneGeometry(300, 46 - i * 6, 80, 1);
        const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tx, transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false, fog: false, opacity: 0.5 }));
        m.position.set(30 - i * 30, 78 + i * 16, -230 + i * 12); cena.add(m); faixas.push({ m, base: Float32Array.from(geo.attributes.position.array), i });
      }
    }

    // ---------- neve caindo: cada floco tem um lugar de partida; a posição sai de t ----------
    const FLOCOS = Array.from({ length: H.neve }, () => ({ x: acaso() * 60 - 30, y: acaso() * 22, z: acaso() * 60 - 30, v: 1.2 + acaso() * 1.6, f: acaso() * 6.28, a: 0.3 + acaso() * 0.6 }));
    const geoNeve = new THREE.BufferGeometry(); geoNeve.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(FLOCOS.length * 3), 3));
    const neve = new THREE.Points(geoNeve, new THREE.PointsMaterial({ color: '#ffffff', size: 0.16, map: bolinha('#ffffff'), transparent: true, opacity: 0.9, depthWrite: false })); neve.frustumCulled = false; cena.add(neve);

    // ---------- luzes ----------
    cena.add(new THREE.HemisphereLight('#7f9fe8', '#3c4c7c', 1.15));
    const enche = new THREE.DirectionalLight('#6f8fe0', 0.55); enche.position.set(25, 30, 90); cena.add(enche); // luz fraca vinda de trás da câmera: sem ela as árvores viram vulto preto
    const luar = new THREE.DirectionalLight('#a9c4ff', 1.5); luar.position.copy(LUA).normalize().multiplyScalar(90); luar.target.position.set(0, 0, 12); cena.add(luar, luar.target);
    luar.castShadow = true; luar.shadow.mapSize.set(2048, 2048); luar.shadow.bias = -0.0006; luar.shadow.normalBias = 0.06;
    Object.assign(luar.shadow.camera, { left: -45, right: 45, top: 50, bottom: -40, near: 1, far: 220 }); luar.shadow.camera.updateProjectionMatrix();
    const luzCasa = new THREE.PointLight(C.janela, 30, 26, 1.8); luzCasa.position.set(-0.2, 1.8, 3.6); cena.add(luzCasa);
    const luzFogo = new THREE.PointLight(C.fogo, 45, 30, 1.7); luzFogo.position.set(FOGO.x, 1.0, FOGO.z); cena.add(luzFogo);
    const haloFogo = halo('#ffb060', 7, new THREE.Vector3(FOGO.x, 1.0, FOGO.z), 0.9);
    halo('#ffcf7a', 5.5, new THREE.Vector3(-2.0, 1.7, 2.5), 0.45); halo('#ffcf7a', 5.5, new THREE.Vector3(1.7, 1.7, 2.5), 0.45);
    for (const [uu, lado] of [[0.22, 1], [0.5, -1], [0.74, 1]]) { // lampiões na beira do caminho: marcam a profundidade
      const a = curva.getPointAt(uu), b = curva.getTangentAt(uu), x = a.x + lado * 2.4 * b.z, z = a.z - lado * 2.4 * b.x, y = alturaChao(x, z);
      const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.9, 6), fosco('#2a2018')); poste.position.set(x, y + 0.95, z); poste.castShadow = true; cena.add(poste);
      const vidro = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.32, 0.26), new THREE.MeshBasicMaterial({ color: '#ffd68a' })); vidro.position.set(x, y + 2.0, z); cena.add(vidro);
      const chapeu = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.2, 4), fosco('#2a2018')); chapeu.position.set(x, y + 2.26, z); chapeu.rotation.y = 0.785; cena.add(chapeu);
      halo('#ffc870', 3.2, new THREE.Vector3(x, y + 2.0, z), 0.7);
      const l = new THREE.PointLight('#ffc070', 7, 10, 1.8); l.position.set(x, y + 2.0, z); cena.add(l);
    }
    const tremula = (t) => 0.82 + 0.12 * Math.sin(t * 11) + 0.08 * Math.sin(t * 23.7 + 1) + 0.06 * ruido(t * 9, 3); // fogo tremendo, sem sorteio
    // fumaça da chaminé: bolinhas que sobem e crescem
    const fumaca = Array.from({ length: 9 }, (_, i) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 1), new THREE.MeshBasicMaterial({ color: '#8f9dbd', transparent: true, fog: false })); cena.add(m); return m; });

    // ---------- título e escurecer: uma "folha" 2D na frente da câmera ----------
    const frente = new THREE.Scene(), camFrente = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const cvT = document.createElement('canvas'); cvT.width = 1920; cvT.height = 1080;
    {
      const x = cvT.getContext('2d');
      const g = x.createLinearGradient(0, 720, 0, 1080); g.addColorStop(0, 'rgba(2,6,18,0)'); g.addColorStop(1, 'rgba(2,6,18,0.6)'); x.fillStyle = g; x.fillRect(0, 720, 1920, 360);
      x.shadowColor = 'rgba(0,0,0,0.6)'; x.shadowBlur = 18; x.shadowOffsetY = 4; x.textBaseline = 'alphabetic';
      x.font = '700 104px Georgia, "DejaVu Serif", serif'; x.fillStyle = '#f4f8ff'; x.fillText(H.titulo, 110, 950);
      x.shadowBlur = 8; x.font = '500 34px Georgia, "DejaVu Serif", serif'; x.fillStyle = 'rgba(230,238,255,0.92)'; x.fillText(H.assinatura || '', 114, 1006);
    }
    const txT = new THREE.CanvasTexture(cvT); txT.colorSpace = THREE.SRGBColorSpace;
    const folhaTitulo = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: txT, transparent: true, depthTest: false, toneMapped: false, opacity: 0 }));
    const folhaPreta = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ color: '#02040c', transparent: true, depthTest: false, toneMapped: false, opacity: 0 }));
    folhaTitulo.renderOrder = 1; folhaPreta.renderOrder = 2; frente.add(folhaTitulo, folhaPreta);

    const alvoCasa = new THREE.Vector3(0.6, 2.0, 1), pos = new THREE.Vector3(), olha = new THREE.Vector3(), adiante = new THREE.Vector3();

    // ---------- desenhar(t): põe cada coisa no lugar do instante t e tira o retrato ----------
    function desenhar(t) {
      // câmera: anda pela curva, balança a cada passo, e vai virando o olhar para a cabana
      const uu = u(t), d = distancia(t);
      curva.getPointAt(uu, pos); curva.getPointAt(Math.min(1, uu + 0.12), adiante);
      const balanco = 0.05 * Math.abs(Math.sin(Math.PI * d / PASSO)) * (1 - suave(trecho(t, T.chega - 1.2, T.chega)));
      pos.y = alturaChao(pos.x, pos.z) + 1.65 + balanco + 0.5 * suave(trecho(t, 5, duracao));
      adiante.y = pos.y - 0.1;
      olha.copy(adiante).lerp(alvoCasa, suave(trecho(uu, 0.15, 0.85)));
      camera.position.copy(pos); camera.lookAt(olha);
      camera.rotation.z += 0.012 * Math.sin(Math.PI * d / PASSO) * (1 - suave(trecho(t, T.chega - 1.2, T.chega)));

      const tr = tremula(t);
      luzFogo.intensity = 45 * tr; luzCasa.intensity = 30 * (0.94 + 0.06 * Math.sin(t * 3.1));
      haloFogo.scale.setScalar(7 * (0.85 + 0.3 * tr));
      chamas.forEach((ch, i) => { const s = 0.75 + 0.45 * Math.abs(Math.sin(t * (7 + i * 2.3) + i * 1.7)); ch.scale.set(1, s, 1); ch.position.y = 0.2 + 0.7 * s; ch.rotation.y = t * (2 + i); });
      fumaca.forEach((m, i) => {
        const vida = ((t * 0.22 + i / fumaca.length) % 1 + 1) % 1;
        m.position.set(1.9 + vida * 1.6 + 0.2 * Math.sin(vida * 9 + i), 5.6 + vida * 4.2, -0.6 + 0.2 * Math.cos(vida * 7 + i));
        m.scale.setScalar(0.6 + vida * 2.2); m.material.opacity = 0.34 * Math.sin(Math.PI * vida);
      });
      const pn = geoNeve.attributes.position;
      for (let i = 0; i < FLOCOS.length; i++) { // a neve acompanha a câmera, numa caixa de 60 m
        const f = FLOCOS[i];
        const y = 22 - (((f.y + t * f.v) % 22) + 22) % 22;
        const x = pos.x + ((((f.x + f.a * Math.sin(t * 0.9 + f.f) - pos.x) % 60) + 90) % 60) - 30;
        const z = pos.z + ((((f.z + 0.5 * f.a * Math.cos(t * 0.7 + f.f) - pos.z) % 60) + 90) % 60) - 30;
        pn.setXYZ(i, x, y, z);
      }
      pn.needsUpdate = true;
      for (const fx of faixas) { // a aurora ondula
        const p = fx.m.geometry.attributes.position;
        for (let i = 0; i < p.count; i++) { const x = fx.base[i * 3]; p.setZ(i, 14 * Math.sin(x * 0.03 + t * 0.35 + fx.i * 2) + 6 * Math.sin(x * 0.08 - t * 0.5)); p.setY(i, fx.base[i * 3 + 1] + 4 * Math.sin(x * 0.02 + t * 0.25 + fx.i)); }
        p.needsUpdate = true; fx.m.material.opacity = 0.42 + 0.16 * Math.sin(t * 0.6 + fx.i * 2.1);
      }
      folhaTitulo.material.opacity = suave(trecho(t, T.titulo[0], T.titulo[1]));
      folhaPreta.material.opacity = Math.max(1 - trecho(t, 0, 0.7), trecho(t, T.some[0], T.some[1]));

      render.clear(); render.render(cena, camera); render.render(frente, camFrente);
    }

    // ---------- som: vento frio, passos na neve (no balanço da câmera), fogo e caixinha de música ----------
    function som() {
      const s = Som.criar(duracao, H.semente), M = H.musica, r = sorteio(H.semente + 9);
      s.vento(0, duracao, { vol: 0.07, corte: 900, onda: 0.2, profundidade: 0.7 });
      s.vento(0, duracao, { vol: 0.04, corte: 2400, onda: 0.33 });
      let ant = Math.floor(distancia(0) / PASSO);
      for (let t = 0; t < T.chega - 0.6; t += 0.005) { // um passo a cada vez que o balanço da câmera toca o chão
        const n = Math.floor(distancia(t) / PASSO);
        if (n !== ant) { s.toque(t, { vol: 0.07, corte: 900, dur: 0.16, pan: n % 2 ? 0.25 : -0.25 }); s.toque(t + 0.05, { vol: 0.04, corte: 2600, dur: 0.1 }); ant = n; }
      }
      for (let t = 2; t < duracao - 0.3; t += 0.08 + r() * 0.35) { // estalos do fogo: mais fortes quanto mais perto
        const perto = suave(trecho(t, 3, T.chega));
        s.toque(t, { vol: 0.015 + 0.06 * perto * r(), corte: 3500 + r() * 3000, dur: 0.03 + r() * 0.04, pan: 0.4 });
      }
      const p = M.passo;
      M.notas.forEach((n, i) => { const t = 1.0 + i * p; if (t < duracao - 1.3) s.sino(n, t, 2.2, { vol: 0.085, pan: i % 2 ? 0.35 : -0.35, brilho: 1.6 }); });
      M.baixo.forEach((n, i) => { s.nota(n, 1.0 + i * p * 4, p * 4 - 0.05, { forma: 'tri', vol: 0.12, ataque: 0.3, solta: 0.8 }); s.nota(Som.freq(n) * 3, 1.0 + i * p * 4, p * 4, { vol: 0.03, ataque: 0.8, solta: 1, vibrato: 0.003 }); });
      ['A5', 'E6', 'C6'].forEach((n, i) => s.sino(n, T.titulo[0] + 0.1 + i * 0.1, 2.8, { vol: 0.07, pan: i - 1, brilho: 2.8 }));
      s.sala(0.6);
      return s.fim({ entra: 0.7, sai: 0.9 });
    }

    return { desenhar, som };
  },
});
