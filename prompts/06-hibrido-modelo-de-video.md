# 06 — Caminho híbrido: o filme em código como guia de um gerador de vídeo

O filme em código acerta o que os geradores de vídeo de IA erram: **composição, câmera, tempo e
personagem igual do começo ao fim**. Os geradores acertam o que o código não dá: **textura rica,
luz complexa, movimento cheio**. No híbrido, você usa o seu MP4 como **vídeo de referência** num
gerador de vídeo de IA (ex.: Seedance, Kling, Veo) e pede que ele refaça a mesma tomada com mais
detalhe.

> **Este kit só documenta esse caminho. Ele não chama nenhum serviço.** Gerador de vídeo é pago
> por crédito ou assinatura: confira o preço da geração antes de mandar, e só use conta sua.

## Quando vale

- O filme em código já está aprovado (tempo, câmera e ação certos) e só falta "acabamento".
- O estilo é desenho, pintura, massinha, brinquedo. **Não** peça fotorrealismo: aí o gerador
  troca a sua personagem por outra.

## Quando não vale

- Você precisa que o vídeo saia igual toda vez (o gerador sorteia; o código não).
- O filme tem texto na tela (geradores estragam letras). Renderize sem título e ponha o título
  depois, com o FFmpeg ou no editor.
- Mais de 10 a 15 segundos por tomada: a maioria dos geradores não aceita.

## Passo a passo

1. Renderize o filme em código **sem título** (no `historia.json`, deixe `"titulo": ""`).
2. No gerador, escolha o modo que aceita **vídeo de referência** (às vezes chamado
   "video to video" ou "restyle").
3. Duração igual à do seu filme. Resolução: a que você vai publicar.
4. Cole um dos pedidos abaixo. Se o gerador responder melhor em inglês, peça ao Claude:
   "traduza este pedido para inglês, sem mudar o sentido".
5. Compare com o original, lado a lado. Se a personagem mudou de rosto ou a câmera mudou,
   descarte e gere de novo com o pedido curto.

## Pedido curto (comece por ele)

```text
Refaça esta tomada usando o meu vídeo como referência. Movimento mais suave e contínuo,
grão de filme visível, sombra pintada e luz de contorno no rosto, profundidade e textura
no lugar das cores chapadas. Mantenha a mesma personagem, a mesma pose, o mesmo tempo e o
mesmo enquadramento. Estilo: [guache / acetato / recorte de papel]. Não deixe fotorrealista.
```


## Pedido longo (quando o curto mudou coisa demais)

```text
Use o vídeo anexado como planta fixa desta tomada.

MANTER IGUAL
- Composição: cada elemento fica onde está no quadro.
- Câmera: mesma posição, mesmo movimento, mesma velocidade.
- Ação e tempo: os mesmos acontecimentos, na mesma ordem, nos mesmos instantes.
- Estilo: o mesmo material, a mesma paleta, o mesmo desenho da personagem. Isto é
  [ESTILO]. Não troque de estilo e não deixe fotorrealista.

MELHORAR
- Detalhe: mais textura de material em cada objeto e mais camadas no fundo.
- Movimento: mais quadros intermediários, com peso e continuidade.
- Movimento secundário: cabelo, roupa, folhas, água e poeira reagem à ação e ao ar.
- Atmosfera: [raios de luz, poeira no ar, fumaça, reflexos, desfoque de fundo].
- Luz: sombras macias e luz rebatida que acompanham o movimento.

O QUE ACONTECE, EM ORDEM
[Descreva a tomada em duas ou três frases.]

Sem texto, sem logotipo, sem personagem novo, sem ângulo novo.
```

## O que esperar

Este caminho **não foi testado por este kit** (nenhum serviço foi chamado para escrevê-lo). O que
segue é o que se deve conferir, não uma promessa:

- O gerador tende a segurar tempo e câmera e a trocar materiais e luz. Compare sempre com o original.
- Detalhes pequenos podem ser reinventados (uma parede vira madeira, um objeto muda de cor).
  Se isso importa, descreva o detalhe na parte "MANTER IGUAL".
- O resultado deixa de ser "mesmo código = mesmo vídeo". Guarde o MP4 gerado: você não consegue
  refazer igual.

## 3D realista sem gerador de vídeo

Se o que falta é realismo de material e luz numa cena 3D, a outra saída é o **Blender**: o Claude
escreve o script Python da cena e o Blender renderiza no seu computador (aí sim uma placa de
vídeo ajuda muito). Veja [LIMITES.md](../LIMITES.md) e [REFERENCIAS.md](../REFERENCIAS.md).
