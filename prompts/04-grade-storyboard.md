# 04 — Grade de quadros-chave (storyboard 2×2)

Quando você quer decidir **antes** como a cena começa, passa e termina. Você entrega quatro
quadros numa folha só, e o Claude faz a animação que passa de um quadro para o outro, em ordem.

A grade pode ser desenhada por você (papel, tablet) ou gerada num gerador de imagem que você já
usa. O kit não gera imagem: ele só anima.

## Passo 1 — fazer a grade

Se for usar um gerador de imagem, um pedido assim resolve (escreva do seu jeito):

```text
Uma folha com quatro quadros, em grade de dois por dois, da mesma personagem, contando uma
história curta. Quadro 1: ela de perto, o rosto. Quadro 2: plano médio, ela [AÇÃO].
Quadro 3: de perto, as mãos dela em [OBJETO]. Quadro 4: [O MOMENTO FINAL].
Mesmo estilo, mesma roupa e mesmas cores nos quatro quadros.
```

## Passo 2 — pedir a animação

Conversa nova. **Anexe a grade.**

```text
Anexei uma grade 2x2 com quatro quadros-chave, na ordem: cima-esquerda, cima-direita,
baixo-esquerda, baixo-direita. Faça um filme de [10] segundos, [16:9], todo em código, que
passa de um quadro-chave ao seguinte, nessa ordem.

1. Descreva cada um dos quatro quadros: enquadramento, pose, expressão, cores (em #rrggbb)
   e o que mudou do anterior. Diga também o estilo que os quatro têm em comum.
2. Escolha um dos 4 jeitos de animar do kit (METODOS.md) e diga qual.
3. Crie o motor em meus/[NOME]/ (motor.js + historia.json), no contrato do kit. No
   historia.json, ponha uma lista "chaves" com o segundo de cada quadro-chave:
   [0,5 · 3 · 5,5 · 8].
4. Em cada um desses segundos, o quadro do filme tem que bater com o quadro da grade.
   Entre eles, a personagem e a câmera se movem de forma contínua: nada de "fundir" uma
   imagem na outra. Troca de enquadramento (de perto → plano médio) pode ser um movimento
   de câmera ou um corte seco; escolha e diga.
5. A personagem é a mesma do começo ao fim: desenhe-a UMA vez, em código, e reuse.
6. Segure cada quadro-chave por pelo menos meio segundo, para dar tempo de ver.
7. PROVA: renderize os 4 quadros dos segundos-chave, ponha lado a lado com a grade, diga
   o que não bate e corrija. No máximo 3 rodadas.
   node ferramentas/render.mjs meus/[NOME] --quadros 0.5,3,5.5,8
8. Depois renderize o filme completo, com som feito em código: um som pequeno em cada
   mudança de quadro-chave.
```

## Dicas

- Quatro quadros bastam para 8 a 12 segundos. Para mais tempo, faça duas grades e dois filmes.
- Se os quatro quadros da grade não têm a mesma personagem (o gerador de imagem variou o rosto),
  diga qual quadro manda: "o rosto certo é o do quadro 1".
- Quer só testar o caminho? Peça em 640×360: `--largura 640 --altura 360`.
