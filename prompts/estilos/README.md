# Biblioteca de estilos

Cada estilo aqui é um bloco **"mesmo estilo, sua ideia"**: você copia, troca `[SUA IDEIA AQUI]`
e manda. O bloco já traz a receita técnica do estilo (como o Claude deve construir aquele visual
em código), separada da história.

Os estilos estêo arrumados pelos **4 jeitos de animar** do kit ([METODOS.md](../../METODOS.md)):

| Arquivo | Jeito | Estilos |
|---|---|---|
| [camadas-planas.md](camadas-planas.md) | formas planas em camadas | 12 |
| [fundo-pintado.md](fundo-pintado.md) | fundo pintado + personagem de formas | 6 |
| [cena-3d.md](cena-3d.md) | cena 3D com a câmera dentro | 10 |
| [marionete.md](marionete.md) | uma ilustraçêo mexida por áreas | 3 |

No kit, só quatro destes estilos têm motor pronto e medido (os de `exemplos/`): recorte de papel
em caixa de sombra, anime 2D de fundo pintado, 3D de poucos polígonos e marionete de ilustraçêo.
Os outros sêo **receitas para você pedir o motor**: ainda nêo foram renderizados por este kit.

## Como usar

**No Claude Code, com o kit:** cole o bloco do estilo dentro da seçêo ESTILO do pedido
[01-criar-motor.md](../01-criar-motor.md). As regras (motor separado da história, 3 quadros de
prova, som em código) já estêo lá.

**No chat do Claude, sem o kit:** cole o bloco do estilo e, logo abaixo, o bloco de regras:

```text
REGRAS
- Tudo em código. Nenhum modelo de imagem ou de vídeo, nenhuma imagem baixada.
- Cada quadro é uma conta pura do número do quadro: o mesmo número dá o mesmo desenho.
- Guarde em arquivos separados o que DESENHA o estilo e o que CONTA a história, para eu
  pedir outra história no mesmo estilo depois.
- Antes do render completo, renderize 3 quadros (começo, meio, fim), olhe, diga com
  franqueza o que está errado e corrija. No máximo 3 rodadas.
- Sem texto na tela.
- Música calma sintetizada em código e um som pequeno em cada açêo que aparece.
- Entregue um MP4 em 1920x1080, 30 quadros por segundo, e os arquivos do motor.
```

**Para trocar só a ideia de um pedido que você já tem:**

```text
Pegue o pedido abaixo e troque para esta ideia: [SUA IDEIA].
```

## Como escrever a sua ideia

Uma ou duas frases, com **quem**, **onde** e **o que acontece**. Um acontecimento só.

> Estamos num lago entre montanhas. Uma personagem pequena, de lenço vermelho na cabeça, vai
> num barco que atravessa a cena devagar.

## Dicas que valem para todos

- Comece com 5 a 10 segundos.
- Estilo detalhado demora mais para o Claude escrever e conferir. Estilo plano é rápido.
- Um acontecimento claro e uma imagem final que "fecha" valem mais que muita coisa acontecendo.
- Personagens, marcas e lugares: invente os seus. Nada de personagem ou logotipo de terceiro.
