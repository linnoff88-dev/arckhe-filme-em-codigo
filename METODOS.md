# Os 4 jeitos de animar em código

Todo filme deste kit sai do mesmo caminho (página → quadros → som → MP4). O que muda é **como a
página desenha cada quadro**. Sêo quatro jeitos. Escolher o jeito certo antes de pedir o motor é
metade do trabalho.

## Como escolher

| Você quer... | Use |
|---|---|
| visual de papel, gravura, giz, vetor; pouca coisa mexendo; rápido de fazer | **camadas-planas** |
| uma personagem com rosto, que volta em vários filmes, num cenário bonito e parado | **fundo-pintado** |
| a câmera passeando, luz e sombra de verdade, sensaçêo de lugar | **cena-3d** |
| dar vida a um desenho que já existe, sem refazer | **marionete** |

Na dúvida, comece por **camadas-planas**: é o mais simples de o Claude acertar.

---

## 1. camadas-planas

**O que é.** Formas planas (como papel cortado) empilhadas em camadas. Quando a câmera anda, as
camadas do fundo andam pouco e as da frente andam muito. Esse efeito se chama *parallax*, e é ele
que dá profundidade.

**No exemplo** ([exemplos/camadas-planas](exemplos/camadas-planas)): seis camadas de morros e
árvores, uma raposa de papel com as pernas presas por juntas, lua dentro de anéis de papel,
vaga-lumes. Cada camada joga sombra na de trás.

**O que mexe.** A câmera (de lado), o boneco (pernas, rabo, cabeça), pontos de luz, nuvens.

**Truques que fazem diferença**
- A perna gira conforme a **distância andada**, nêo conforme o tempo: assim o pé nêo escorrega.
- O boneco muda de pose 12 vezes por segundo (`posesPorSegundo` na história), como em
  stop-motion; a câmera continua lisa.
- Grêo de papel por cima de tudo, pintado uma vez (papel nêo treme).

**Bom para:** recorte de papel, xilogravura, risografia, giz, vetor plano, colagem.
**Fraco para:** personagem que vira o rosto, perspectiva que muda, cena com muita atuaçêo.

**O que troca na história:** título, paleta, astro (lua ou sol), tipo de árvore, vaga-lumes,
semente, notas da música.

---

## 2. fundo-pintado

**O que é.** O jeito do desenho animado clássico: o cenário é um quadro só, pintado uma vez, e
só a personagem (e uns detalhes) se mexe na frente dele.

**No exemplo** ([exemplos/fundo-pintado](exemplos/fundo-pintado)): três arquivos.
`fundo.js` pinta o cenário com milhares de pinceladas de semente fixa (céu, nuvens, capim ou
mar). `personagem.js` desenha a Lia com formas: rosto, olhos, cabelo em mechas, roupa.
`motor.js` junta os dois e anima.

**O que mexe.** Cabelo, saia e fitas no vento; o braço (acena ou segura o chapéu); a piscada; o
sorriso; capim da frente; pétalas; a onda na areia; a câmera chegando perto devagar.

**Truques que fazem diferença**
- O fundo é pintado **uma vez** e guardado. Só ele levaria tempo; por quadro, o custo é da
  personagem.
- A personagem é desenhada numa folha separada, recebe a **cor da luz da hora** (dia ou
  entardecer) e só entêo é colada no fundo. É isso que a faz parecer estar naquele lugar.
- Uma **rajada de vento** com começo e fim (em segundos) comanda cabelo, roupa, capim e o som.

**Bom para:** personagem com rosto que se repete em vários filmes; estilo anime simples;
cenário rico.
**Fraco para:** personagem andando pelo cenário, virando de costas, interagindo com objetos.
Cada pose nova precisa ser ensinada ao motor.

**O que troca na história:** lugar (`colina` ou `praia`), hora (`dia` ou `entardecer`), açêo
(`acenar` ou `segurar-chapeu`), roupa, cores, chapéu, título, música. É o exemplo que prova o
"um motor por estilo": veja `historia.json` e `historia-2.json`.

---

## 3. cena-3d

**O que é.** Em vez de desenhar cada quadro, o código **monta um mundo** (chêo, árvores, casa,
luzes) e põe uma câmera dentro. Luz, sombra e perspectiva sêo calculadas pela biblioteca
three.js, que vem dentro do kit (`vendor/three`).

**No exemplo** ([exemplos/cena-3d](exemplos/cena-3d)): floresta de pinheiros de poucos
polígonos, cabana com janelas acesas, fogueira, boneco de neve, lampiões, neve caindo, lua,
montanhas e aurora. A câmera anda por um caminho curvo, com balanço de passo, e para em frente
à cabana.

**O que mexe.** A câmera (o filme É o passeio), o fogo que treme, a fumaça, a neve, a aurora.

**Truques que fazem diferença**
- 280 árvores viram poucas ordens de desenho por **instância** (o mesmo pinheiro repetido).
- O caminho da câmera é uma curva que passa por pontos escritos na história. As árvores nascem
  longe dessa curva, para nenhuma tapar a vista.
- O som do passo na neve sai da **mesma conta** do balanço da câmera.
- Sem placa de vídeo: o navegador calcula o 3D pela CPU. No exemplo, foi o mais lento por quadro
  e o que mais usou núcleos (veja a tabela do README).

**Bom para:** passeio de câmera, maquete, miniatura, lugares.
**Fraco para:** personagem que atua (precisaria de esqueleto e animaçêo de corpo), materiais
realistas, efeitos pesados de câmera.

**O que troca na história:** cores, número de árvores, quantidade de neve, aurora, boneco, o
caminho da câmera, título, música.

---

## 4. marionete

**O que é.** Uma ilustraçêo **pronta** recebe vida sem ser redesenhada. O motor separa as peças
marcadas e entorta cada uma com uma malha de triângulos: presa na raiz, solta na ponta. Tudo o
que nêo mexe fica exatamente como o desenho original.

**No exemplo** ([exemplos/marionete](exemplos/marionete)): `ilustracao.svg` é um desenho do
próprio kit (uma moça pendurando roupa no varal, debaixo de uma árvore). Os grupos com
`data-mexe` viram peças: ramos, lençol, camisa, meias, toalha, cabelo, braços, rabo do gato,
capim, nuvens, fumaça.

**O que mexe.** Só as peças listadas em `historia.json`, cada uma com um jeito:
`vento` (inclina e ondula), `dobra` (gira a partir da raiz) ou `desliza` (anda de lado).

**Truques que fazem diferença**
- A **placa**: o desenho sem as peças soltas. É ela que aparece atrás quando uma peça sai do
  lugar. Se o seu desenho nêo tem o que está atrás do cabelo, vai aparecer um buraco.
- Cada peça tem um **atraso** diferente: o vento "passa" pelo varal, em vez de tudo balançar
  junto.
- Os triângulos sêo desenhados um tiquinho maiores, para nêo aparecer risco na emenda.

**Bom para:** ilustraçêo sua (ou de alguém que trabalha com você), capa que se mexe, retrato.
**Fraco para:** movimento grande (virar a cabeça, andar): a imagem estica e denuncia o truque.

**O que troca na história:** quais peças mexem, força, velocidade, atraso, direçêo do vento, a
rajada, e a própria ilustraçêo (`"ilustracao": "outra.svg"`, com os mesmos nomes de peça).

---

## O que vale para os quatro

| Regra | Por quê |
|---|---|
| `desenhar(t)` é conta pura | mesmo código = mesmo vídeo; e o render pode repartir os quadros entre vários navegadores |
| sorteio com semente | o capim, as estrelas e a neve caem sempre no mesmo lugar |
| história fora do motor | filme novo custa um arquivo pequeno, nêo um motor novo |
| um canvas só | o render lê o canvas direto, sem depender da tela |
| som das mesmas marcas de tempo | passo, rajada e título soam no instante em que aparecem |
| 3 quadros de prova antes do render | defeito aparece em segundos, nêo depois do filme inteiro |

## Misturar jeitos

Pode. Os mais comuns:
- **fundo-pintado + camadas-planas**: o fundo pintado em duas ou três camadas, para a câmera
  deslizar.
- **cena-3d + camadas-planas**: desenhos planos em pé dentro de uma maquete 3D (estilo diorama).
- **marionete + fundo-pintado**: personagem ilustrada à mêo sobre cenário pintado em código.

Peça um jeito principal e diga o que vem do outro. Motor que mistura tudo fica difícil de
reaproveitar.
