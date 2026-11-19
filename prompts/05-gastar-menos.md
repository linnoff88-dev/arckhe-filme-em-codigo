# 05 — Gastar menos

O render, neste método, roda no seu computador e não cobra nada. O que custa é a **conversa**
com o Claude: quanto ele lê, quanto escreve e quantas vezes olha quadros. Estas são as alavancas.
Os números medidos estão em [CUSTO.md](../CUSTO.md); aqui ficam os pedidos prontos.

## 1. Reaproveite o motor (a maior economia)

Criar um motor é a parte cara. Trocar a história é um arquivo pequeno.

```text
Use o motor de [meus/meu-estilo]. Não altere o motor. Crie historia-4.json para: [IDEIA].
Mostre 3 quadros e renderize.
```

## 2. Uma conversa nova por filme

O Claude relê a conversa inteira a cada resposta. Conversa comprida = cada pedido mais caro.

```text
(em conversa nova) Leia só exemplos/[motor]/historia.json e os 40 primeiros comentários do
motor.js. Não leia o resto do kit. Tarefa: [O QUE VOCÊ QUER].
```

## 3. Mudança pequena, pedido pequeno

```text
No motor [X], mude só a função [vento]: a rajada começa 1 segundo antes. Não releia nem
reescreva o resto do arquivo. Renderize 1 quadro no segundo 3 para conferir.
```

## 4. Rascunho pequeno antes do filme grande

Quadro pequeno é mais rápido de renderizar e mais barato de o Claude olhar.

```text
Trabalhe em rascunho: --largura 640 --altura 360, e só quadros soltos (--quadros 1,4,7).
Só renderize em 1920x1080 quando eu disser "pode fechar".
```

## 5. Teto de rodadas de conferência

```text
No máximo 2 rodadas de "renderiza, olha, corrige". Na segunda, pare e me liste o que
ainda está imperfeito. Eu decido se vale mais uma.
```

## 6. Modelo mais simples para estilo simples

Formas planas, recorte de papel, giz: um modelo menor costuma dar conta, principalmente para
**trocar a história** de um motor pronto. Guarde o modelo mais forte para criar motor novo de
estilo difícil (personagem com rosto, 3D, marionete). No Claude Code, troque com `/model`.

## 7. Diga o que NÃO fazer

```text
Não crie guia, não escreva README, não rode os testes inteiros, não faça versão vertical.
Só o motor, a história e o MP4.
```

## 8. Filme curto primeiro

Comece com 5 a 10 segundos. Um filme de 30 segundos dá mais certo como 3 histórias de 10 segundos
no mesmo motor, juntadas depois com o FFmpeg, do que como um pedido só.

```bash
printf "file '%s'\n" parte1.mp4 parte2.mp4 parte3.mp4 > lista.txt
ffmpeg -f concat -safe 0 -i lista.txt -c copy filme.mp4
```

## 9. Sem conversa: `claude -p`

Para trocar história de motor pronto, dá para rodar sem abrir sessão:

```bash
# --allowedTools deixa o Claude ler, criar arquivo e rodar só o render (testado em 19/11/2026)
claude -p "Use o motor de exemplos/camadas-planas. Não altere o motor. Crie exemplos/camadas-planas/historia-3.json: a raposa numa floresta de outono, de dia. Renderize com node ferramentas/render.mjs exemplos/camadas-planas --historia historia-3.json e diga o caminho do MP4." \
  --allowedTools "Read" "Write" "Glob" "Grep" "Bash(node ferramentas/render.mjs:*)"
```
