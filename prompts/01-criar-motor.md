# 01 — Criar o motor de um estilo

Use este pedido **uma vez por estilo**. O resultado é uma pasta (`meus/<nome>/`) com o motor e uma
primeira história. Depois disso, filme novo no mesmo estilo é só trocar a história (pedido 02).

## Como usar

1. Abra uma conversa **nova** no Claude Code, dentro da pasta do kit.
2. Copie o bloco abaixo e preencha o que está entre colchetes.
3. Em ESTILO, escreva o seu ou cole um bloco de [`estilos/`](estilos/README.md).

## O pedido

```text
Crie um motor de filme em código, dentro deste kit, na pasta meus/[NOME-DO-ESTILO]/.

ESTILO
[Descreva o visual: o material (papel recortado, guache, giz, 3D de poucos polígonos...),
as cores, a luz, o tipo de traço, o tipo de movimento. Ou cole um bloco de prompts/estilos/.]

IDEIA
[Quem aparece, onde, e o que acontece. Uma ou duas frases.]

VARIÁVEIS
- Duração: [8] segundos
- Proporção: [16:9, 1920x1080]   (ou 9:16, 1080x1920)
- Ação principal: [o que a personagem faz e em que segundo, se você souber]
- Título na tela: [texto, ou "sem texto"]

COMO CONSTRUIR
1. Leia README.md e METODOS.md do kit e escolha UM dos 4 jeitos de animar
   (camadas-planas, fundo-pintado, cena-3d ou marionete). Diga qual escolheu e por quê.
   Use o exemplo desse jeito em exemplos/ como modelo de organização, não de desenho.
2. Tudo em código. Nenhum modelo de imagem, nenhum modelo de vídeo, nenhuma imagem baixada,
   nenhum pedido à internet. Bibliotecas só as que já estão em vendor/.
3. Separe em dois arquivos:
   - motor.js: sabe DESENHAR o estilo. Não tem nada da história escrito dentro dele.
   - historia.json: tudo o que muda de um episódio para outro (título, cores, lugar, hora,
     roupa, ação, semente dos sorteios, notas da música).
4. A página expõe window.FILME pelo comum/filme.js: desenhar(t) e som().
   desenhar(t) é uma conta pura: o mesmo t dá sempre o mesmo quadro. Nada de relógio do
   computador, nada de Math.random (use o sorteio com semente do kit), nada de guardar
   posição de um quadro para o outro. Partícula, vento, câmera: tudo sai de t.
5. Desenhe tudo num canvas só. Depois de desenhar, passe UM acabamento do material por cima
   do quadro inteiro (grão do papel, textura da tinta, borda irregular): é ele que tira o ar
   de "desenho de computador".
6. Anime como esse material é animado à mão. Se for papel, massinha ou desenho quadro a
   quadro, troque a pose de 2 em 2 ou de 3 em 3 quadros (a câmera pode continuar lisa).
   Sempre um movimento secundário: cabelo, roupa, folha, fumaça.
7. Som feito em código (comum/som.js), nas MESMAS marcas de tempo da imagem: um som pequeno
   para cada ação visível e uma música calma por baixo.
8. Sem texto na tela, a não ser o título que eu pedi.

CONFERIR ANTES DE RENDERIZAR TUDO (no máximo 3 rodadas)
a. Renderize 3 quadros soltos, do começo, do meio e do fim:
   node ferramentas/render.mjs meus/[NOME-DO-ESTILO] --quadros 1,4,7
b. OLHE os 3 quadros. Escreva, com franqueza, o que está feio, torto, cortado, escondido
   ou diferente do ESTILO pedido.
c. Corrija e repita. Pare na 3ª rodada, mesmo que ainda haja defeito pequeno, e me diga qual é.

ENTREGAR
- Render completo: node ferramentas/render.mjs meus/[NOME-DO-ESTILO]
- Diga o caminho do MP4, o tempo de render e o que ficou no historia.json para eu trocar.
```

## Sem o kit (no chat do Claude, com execução de código ligada)

O mesmo pedido funciona. Troque o item 1 e os comandos por:

```text
Você não tem o kit. Escreva você mesmo a página, o script que tira os quadros com um
navegador sem tela e o comando do FFmpeg. Mantenha as mesmas regras: desenhar(t) puro,
história separada do motor, 3 quadros de prova antes do render, som feito em código.
No fim, entregue o MP4 e o arquivo do motor para eu guardar.
```

## Por que cada regra existe

| Regra | Se faltar |
|---|---|
| motor separado da história | cada filme novo vira um motor novo, e você paga tudo de novo |
| `desenhar(t)` puro | o vídeo muda a cada render, e não dá para dividir o trabalho entre navegadores |
| 3 quadros de prova | você só descobre o defeito depois de esperar o render inteiro |
| teto de 3 rodadas | o Claude fica polindo sem parar, e a conversa fica cara |
| acabamento do material | o filme fica com cara de vetor liso |
