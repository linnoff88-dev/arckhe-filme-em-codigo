# Estilos de marionete

Jeito de animar: **uma ilustraçêo pronta, mexida por pequenas áreas**. Nada é redesenhado: o
motor entorta só o cabelo, o braço, o pano, as folhas, e o resto fica exatamente como foi feito.
Modelo no kit: [`exemplos/marionete`](../../exemplos/marionete).

Você precisa de uma ilustraçêo **sua** (desenhada por você, ou que você tem o direito de usar).

---

## 1. Ilustraçêo em peças marcadas

**Bom para:** cena inteira com várias coisas ao vento. **É o estilo do exemplo do kit.**

A ilustraçêo é um SVG em que cada parte que mexe é um grupo com `data-mexe`. O motor separa a
"placa" (tudo o que fica parado) e as peças, e entorta cada peça com uma malha.

```text
Tenho uma ilustraçêo em SVG (anexa). Faça um filme animado de 5 a 10 segundos, 16:9, em que
[SUA IDEIA AQUI: o que mexe e por quê, ex.: "bate um vento da esquerda e depois acalma"].
Use o motor de exemplos/marionete sem redesenhar nada.
1. Liste os grupos do SVG e diga quais devem mexer. Marque esses grupos com data-mexe.
2. Para cada peça, escreva no historia.json: onde ela está presa (raiz), para onde aponta a
   parte solta (ponta), a força, a velocidade e o jeito:
   "vento" (inclina e ondula: pano, cabelo, ramo, capim, fumaça),
   "dobra" (gira a partir da raiz: braço, rabo, galho) ou
   "desliza" (anda de lado: nuvem, barco).
3. Nada mexe na raiz; a ponta mexe mais. Peças vizinhas nêo mexem juntas: dê a cada uma um
   atraso diferente, para o vento "passar" por elas.
4. Por cima do desenho, só coisas leves: manchas de luz, sementes no ar, grêo de papel.
5. Mostre 3 quadros e confira as emendas: nenhuma peça pode deixar buraco na placa nem
   mostrar risco entre os triângulos da malha.
```

## 2. Retrato vivo

**Bom para:** uma personagem de perto, olhando para a câmera, quase parada.

```text
Anexei uma ilustraçêo minha de uma personagem. Faça um filme de 5 a 10 segundos, 16:9, em
que [SUA IDEIA AQUI: ex.: "ela olha para o lado, pisca e volta, com o cabelo no vento"].
Dê vida à imagem como marionete, SEM redesenhar: um único acabamento de tela cheia lê a
figura original, com filtro suave, através de pequenos campos de deslocamento de borda
macia, de modo que tudo o que nêo se mexe fica exatamente como foi desenhado.
- Cabelo solto: separe do fundo como uma camada, sobre uma placa em que o lugar do cabelo
  foi pintado; balance com uma brisa que viaja pelos fios: nada na raiz, o máximo na ponta.
- Brincos e pingentes: pêndulos pequenos, presos no gancho, sobre remendos pintados.
- Piscar: deslize a linha dos cílios para baixo sobre uma pálpebra pintada, seguindo as
  curvas da pálpebra tiradas da própria imagem.
- Olhar: deslize a íris e a pupila ao longo dessas mesmas curvas.
- Sobrancelha e sorriso: entortas pequenas e locais.
- Luz: manchas de sombra de folhas se movendo devagar e um sol que deriva sobre a parede.
Antes do render, mostre o primeiro quadro ao lado da minha imagem: têm que ser iguais.
```

## 3. Paisagem que respira

**Bom para:** capa de vídeo que se mexe, fundo de leitura, cena de descanso.

```text
Anexei uma ilustraçêo minha de uma paisagem. Faça um laço de 8 a 10 segundos, 16:9, que
começa e termina no mesmo quadro (para repetir sem emenda), em que [SUA IDEIA AQUI: ex.:
"a água corre, a fumaça sobe e as árvores balançam de leve"]. Marionete, sem redesenhar.
- Água: deslize a textura da própria imagem dentro da área da água, numa direçêo só, com
  uma ondulaçêo pequena; a margem fica parada.
- Fumaça, neblina e nuvens: deslizam e se esticam devagar.
- Árvores, capim e bandeiras: presos na base, soltos na ponta, com atrasos diferentes.
- Luzes (janela, lampiêo, estrela): pulsam de leve.
- Câmera: aproximaçêo mínima, de 2 a 4 por cento, e volta.
Todo movimento usa um número inteiro de voltas dentro da duraçêo, para o último quadro
bater com o primeiro. Confira comparando o quadro 0 com o último.
```
