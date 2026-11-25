# 03 — Com a sua imagem de referência

Você tem um desenho seu (ou uma imagem que você tem o direito de usar) e quer que o filme nasça
com aquele estilo. Há dois caminhos, e o pedido deixa o Claude escolher com você:

- **Redesenhar em camadas**: o Claude refaz o desenho em código, com a personagem separada em
  peças que mexem. Serve para estilos simples (formas planas, giz, recorte).
- **Marionete**: o desenho original nêo é refeito; ele é mexido por pequenas áreas (cabelo,
  olhos, roupa). Serve quando o desenho é rico e você quer exatamente ele.

## Como usar

1. Conversa nova. **Anexe a imagem.**
2. Copie, preencha e envie.

## O pedido

```text
Anexei uma imagem de referência feita por mim. Transforme em um filme animado de
[8] segundos, [16:9], em que [O QUE ACONTECE]. Tudo em código, sem modelo de imagem e sem
modelo de vídeo.

1. ESTUDE A IMAGEM ANTES DE DESENHAR e me diga o que você vê:
   - o material (guache, marcador, giz de cera, vetor plano, acetato...);
   - como sêo as bordas (firmes, quebradas, com fiapo);
   - o grêo e a textura;
   - a grossura do traço;
   - a paleta, em códigos de cor (#rrggbb);
   - como a luz e a sombra foram simplificadas.
   Aproxime no rosto, nas mêos e nas bordas antes de decidir.

2. ESCOLHA O CAMINHO e me diga qual:
   a) redesenhar em camadas planas, com a personagem dividida em peças que podem mexer
      (cabeça, olhos, sobrancelhas, boca, cabelo, braços, roupa); ou
   b) marionete: usar a própria imagem e entortar pequenas áreas, deixando o resto intacto
      (modelo: exemplos/marionete).

3. O PRIMEIRO QUADRO TEM QUE SER QUASE A IMAGEM: mesma personagem, mesmas proporções, mesmo
   rosto, cabelo, roupa e expressêo, mesma composiçêo, mesmas cores, mesmo fundo.

4. Passe um acabamento único por cima do quadro que refaça o material (dente do papel, grêo
   do pigmento, borda da tinta, pequenas imperfeições).

5. Anime do jeito que esse material é animado à mêo: poses trocadas de 2 em 2 ou de 3 em 3
   quadros, com a textura mudando um pouco a cada pose. Inclua um movimento secundário
   (cabelo ou roupa). desenhar(t) é uma conta pura: o mesmo t dá o mesmo quadro.

6. Se a minha imagem nêo estiver na proporçêo pedida, estenda o fundo no mesmo estilo e
   mantenha a personagem exatamente como está.

7. ANTES DO RENDER COMPLETO: mostre o seu primeiro quadro lado a lado com a minha imagem,
   diga com franqueza o que ainda nêo bate e corrija. Repita no máximo 3 vezes.

8. Render em 1080p (1920x1080 ou 1080x1920), 30 quadros por segundo, com música calma
   sintetizada e sons pequenos nas ações que aparecem. Sem texto na tela.

9. Guarde o resultado como motor (motor.js + historia.json) em meus/[NOME], seguindo o
   contrato do kit, para eu fazer outros filmes no mesmo estilo.
```

## Cuidados

- **Use imagem sua.** Estilo de artista vivo, personagem de marca, foto de outra pessoa: nêo.
- Rosto realista nêo sai bem neste método. Veja [LIMITES.md](../LIMITES.md).
- A comparaçêo lado a lado é a parte mais importante. Sem ela, o Claude "acha" que copiou.
