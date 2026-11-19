# Estilos de cena 3D

Jeito de animar: **o código monta um mundo em três dimensões e passeia com a câmera dentro dele**.
Luz, sombra e profundidade são calculadas, não desenhadas. No kit, a biblioteca é a three.js (em
`vendor/three`), e o render sai pela CPU. Modelo: [`exemplos/cena-3d`](../../exemplos/cena-3d).

> Quanto mais efeito de câmera (brilho, desfoque, reflexo), mais lento o render sem placa de vídeo.
> Peça primeiro 3 quadros em 640×360.

---

## 1. Mundo de poucos polígonos

**Bom para:** paisagem, casa, floresta, passeio de câmera. **É o estilo do exemplo do kit.**

```text
Faça um filme animado de 5 a 10 segundos, 16:9, sobre [SUA IDEIA AQUI].
Estilo: mundo 3D de poucos polígonos, com faces chapadas (sem alisar), em three.js. Chão em
malha de triângulos com morrinhos; árvores, pedras e casas feitas de cones, caixas e
cilindros de poucos lados, repetidos por instância. Paleta curta: uma cor fria para o
ambiente e uma quente para o que tem luz própria (janela, fogo, lampião).
Luz: uma luz de céu fraca, uma luz direcional (sol ou lua) que projeta sombras compridas, e
uma ou duas luzes pontuais quentes que tremem de leve. Neblina na cor do horizonte para dar
distância. Halos macios em volta das luzes. Céu em degradê, com estrelas ou nuvens simples.
Partículas que caem ou flutuam (neve, folhas, poeira), com a posição calculada pelo tempo.
Câmera: um único passeio contínuo por uma curva, na altura dos olhos, com leve balanço de
passo, que termina revelando o lugar principal. O som dos passos sai do mesmo balanço.
```

## 2. Voo de ficção científica (um shader só)

**Bom para:** nave, planeta, cânion, abertura épica.

```text
Faça um filme animado de 5 a 10 segundos, 16:9, sobre [SUA IDEIA AQUI].
Estilo: voo de ficção científica desenhado por um único shader de campo de distância (SDF):
o terreno, os arcos de pedra, a nave com o motor aceso e o planeta com anéis são todos
fórmulas, percorridas raio a raio, calculadas em meia resolução. Depois, um acabamento de
cinema: separar o que é muito claro, riscos horizontais de luz, brilho em volta das luzes,
raios de luz na tela, desfoque de profundidade com borrão radial de movimento, leve
separação de cores nas bordas, grão e faixas pretas de cinema (2,39:1). Um movimento de
câmera contínuo, que inclina nas curvas e termina numa revelação. Sombras verde-azuladas,
luz laranja. Trilha sintetizada e som de motor.
```

## 3. Megacidade de néon na chuva

**Bom para:** noite urbana, futuro, clima de detetive.

```text
Faça um filme animado de 5 a 10 segundos, 16:9, sobre [SUA IDEIA AQUI].
Estilo: megacidade de néon, à noite, na chuva, em three.js. Torres repetidas por instância,
com janelas que parecem ter salas acesas por dentro; letreiros luminosos com símbolos
inventados (nenhuma palavra de verdade); rua molhada com reflexo; chuva caindo e vapor.
Acabamento de câmera: brilho forte nas luzes, riscos horizontais, borrão de movimento, leve
separação de cores, gotas na lente, grão, e cor puxada para verde-azulado e magenta. Um
movimento de câmera desenhado: começa num detalhe pequeno, no nível da rua, e abre até
mostrar a cidade inteira. Som: sintetizadores longos, chuva, e um grave que cresce na
revelação.
```

## 4. Diorama de pixel art

**Bom para:** vilarejo, aventura, nostalgia de videogame.

```text
Faça um filme animado de 5 a 10 segundos, 16:9, sobre [SUA IDEIA AQUI].
Estilo: diorama de pixel art em cenário 3D. Desenhe em código cada boneco e cada bloco do
cenário, numa paleta fixa de 32 cores, com pixels grandes e pontilhado colocado à mão, e
anime as personagens em ciclos curtos de poucos desenhos. Ponha esses desenhos planos em pé
dentro de uma maquete 3D e ilumine e filme como miniatura: luzes pontuais quentes com
sombra, raios de luz de fim de tarde, água que reflete com o pixel alinhado, lente de
miniatura com desfoque forte de profundidade, e brilho nas luzes. Um carrinho lento de
câmera acompanhando o herói, terminando numa vista aberta. Melodia de chiptune com eco suave
e sons pequenos.
```

## 5. Tijolinhos de brinquedo em stop-motion

**Bom para:** construção, foguete, cidade, humor.

```text
Faça um filme animado de 5 a 10 segundos, 16:9, sobre [SUA IDEIA AQUI].
Estilo: filme de stop-motion com tijolinhos de montar, em three.js. Crie um sistema de peças
genérico e sem marca: um pequeno catálogo (blocos 1x1, 1x2, 2x2, 2x4, placas com um terço da
altura, rampas, redondos 1x1, algumas peças translúcidas), com pinos, bordas levemente
chanfradas e frestas mínimas, tudo numa grade fixa e desenhado por instância. Nenhum
logotipo, nenhum conjunto que exista de verdade; os bonecos são um desenho original (cabeça
de cubo arredondado com dois pontos de olho, corpo em bloco afunilado, mãos de pino).
Material: plástico brilhante, com reflexo de uma luz de estúdio, riscos finíssimos, marcas de
dedo, poeira e pequenas diferenças de tom entre peças.
Filme como stop-motion de mesa: 12 poses por segundo, peças que pulam e encaixam, um tremor
mínimo de uma pose para outra, lente macro com fundo desfocado, mesa de madeira embaixo.
Sons de clique de plástico.
```

## 6. Massinha em maquete

**Bom para:** curiosidade, personagem engraçado, bicho.

```text
Faça um filme animado de 10 a 20 segundos, 16:9, sobre [SUA IDEIA AQUI].
Estilo: stop-motion de massinha numa maquete de mesa, em three.js. Modele tudo como massa
macia e um pouco torta: formas simples com a superfície deslocada por ruído, marcas de dedo,
emendas visíveis onde duas cores se juntam, cantos arredondados. Cores saturadas e foscas,
com um brilho suave. Cenário de papelão e feltro. Luz de estúdio quente, sombra macia e
fundo desfocado, como lente macro.
Anime a 12 poses por segundo: a cada pose, a superfície da massa muda um pouquinho (como se
alguém tivesse tocado), as personagens se esticam e se amassam nos movimentos, e os olhos
são bolinhas que mudam de lugar. Pelo menos três tomadas, com passagem desenhada entre elas.
Sons de massa e música de brinquedo.
```

## 7. Diorama de cubinhos (voxel)

**Bom para:** mapa, comida, objeto explicado, miniatura.

```text
Faça um filme animado de 10 a 20 segundos, 16:9, sobre [SUA IDEIA AQUI].
Estilo: diorama de voxels. Cada objeto é feito de cubinhos grandes (desenhados por
instância), em ilhas quadradas que flutuam, vistas de cima e de lado (câmera isométrica).
Paleta limpa e viva, um tom mais escuro nas faces de lado e um mais claro nas de cima. Luz
suave com sombra curta e oclusão nos cantos. As coisas se montam cubo a cubo, de baixo para
cima, com um pulinho no encaixe; ao trocar de cena, os cubos se desfazem e voam para formar
a próxima. Fundo liso em degradê. Pequenos detalhes vivos: água que sobe e desce um cubo,
fumaça em cubinhos, luzes que piscam. Giro lento da câmera em volta da ilha. Sons de bloco e
melodia simples.
```

## 8. Anime desenhado em 3D

**Bom para:** paisagem grande com personagem, cachoeira, cidade, viagem.

```text
Faça um filme animado de 10 a 20 segundos, 16:9, sobre [SUA IDEIA AQUI].
Estilo: cena 3D em three.js que se lê como anime 2D desenhado à mão. Sombreamento de
acetato, com exatamente dois tons duros por superfície; a fronteira da sombra levemente
trêmula, como pincelada; sombras frias, azul-violeta; e contornos de tinta azul-marinho
(nas personagens e objetos, pelo truque do casco invertido; no cenário, por um passe de
borda de profundidade). Pinte céu e fundos em shader, com degradês e ruído: degradê em
faixas, nuvens de dois tons, serras em camadas enevoadas. Acrescente névoa de distância e
raios de luz na tela, vindos do sol. Personagens originais, de formas simples, que atuam de
verdade (olham, param, reagem). Câmera com movimentos de cinema: grua, travelling,
aproximação lenta. Grão leve por cima.
```

## 9. Explicativo 3D luminoso

**Bom para:** espaço, ciência, número surpreendente.

```text
Faça um filme animado de 10 a 20 segundos, 16:9, sobre [SUA IDEIA AQUI].
Estilo: explicativo 3D escuro e luminoso. Espaço quase preto; os objetos são desenhados por
linhas que brilham, numa cor de destaque só (amarelo-vivo), com luz de contorno azul; o
volume aparece em malha de arame e em poucas faces translúcidas. Trajetórias, órbitas e
medidas são linhas que se desenham na hora. Brilho forte em volta das linhas, partículas
finas ao fundo. Cada tomada mostra uma ideia; a passagem entre elas é um movimento de câmera
contínuo, que atravessa ou contorna o objeto. Se houver número, ele aparece grande, no
instante em que a imagem prova o número. Grave longo e sons cristalinos.
```

## 10. Filme de produto em estúdio

**Bom para:** apresentar um objeto, lançamento, peça de portfólio.

```text
Faça um filme animado de 10 a 20 segundos, 16:9, sobre [SUA IDEIA AQUI].
Estilo: filme de produto em estúdio escuro, em 3D. O objeto principal é feito de alumínio
usinado, vidro fosco e um único elemento de luz, e flutua num vazio azul-escuro, com
reflexos de luzes de estúdio e materiais de comportamento físico (inclusive metal escovado).
Ponha uma luz de verdade, que projeta sombra, dentro do elemento luminoso, para a luz
derramar e correr pelas superfícies. Câmeras lentas, em órbita e em grua, com pouco foco de
profundidade e troca de foco de um detalhe para outro. Cortes no tempo da música. Uma tomada
"explodida", com as peças se separando e voltando. Nenhuma marca real, nenhum texto. Som
limpo, com um toque em cada encaixe.
```
