# 02 — Nova história no mesmo motor

É aqui que o método paga: o motor já existe, entêo o filme novo é um arquivo de texto.
A personagem sai com o mesmo rosto, porque é o mesmo código que desenha.

## Como usar

1. Conversa **nova** no Claude Code, dentro da pasta do kit (nêo continue a conversa em que o motor nasceu).
2. Copie, preencha e envie.

## O pedido

```text
Use o motor que já existe em [exemplos/fundo-pintado] para um filme novo.

NOVA HISTÓRIA
[O que muda: lugar, hora do dia, roupa, açêo, título. Ex.: "a mesma Lia, agora na praia,
no fim da tarde, de vestido claro e chapéu de palha, segurando o chapéu contra o vento".]

REGRAS
1. NêO altere motor.js nem os outros arquivos de código. Leia só o historia.json e o começo
   do motor, para saber quais campos existem.
2. Crie [historia-3.json] ao lado do historia.json, mudando só os valores.
3. Se a história pedir algo que o motor ainda nêo sabe desenhar (um lugar novo, um objeto
   novo), PARE e me diga em uma lista curta o que faltaria acrescentar ao motor. Nêo mude
   o motor sem eu responder.
4. Renderize 3 quadros soltos e olhe:
   node ferramentas/render.mjs [exemplos/fundo-pintado] --historia [historia-3.json] --quadros 1,5,8
   Confira: a personagem tem o mesmo rosto da história anterior? Algo ficou cortado ou
   escondido pelo título?
5. Corrija só no historia-3.json e renderize o filme:
   node ferramentas/render.mjs [exemplos/fundo-pintado] --historia [historia-3.json]
```

## Versêo curta (quando o motor já conhece tudo o que você quer)

```text
Pegue o motor de [exemplos/camadas-planas] e troque para esta ideia: [SUA IDEIA].
Mude só o arquivo de história. Mostre 3 quadros antes do render completo.
```

## Ajuste por palavras

Na mesma conversa, peça a mudança com palavras simples. O Claude mexe em um número e o resto
do filme continua igual:

- "mais devagar" · "a rajada de vento começa um segundo antes"
- "luz mais quente" · "céu mais escuro"
- "ela acena por mais tempo" · "tira os pássaros"

## O que o exemplo do kit prova

`exemplos/fundo-pintado/historia.json` e `historia-2.json` usam os mesmos `motor.js`, `fundo.js` e
`personagem.js`. Muda o lugar (colina → praia), a hora (dia → entardecer), a roupa (uniforme →
vestido e chapéu) e a açêo (acenar → segurar o chapéu). O teste `tests/testes.mjs` confere que os
dois filmes saem diferentes sem tocar no motor.
