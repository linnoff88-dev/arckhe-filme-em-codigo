# filme-em-codigo â€” um motor por estilo

<div align="center">
  <img src="capa/logo.svg" alt="Arckhé AI" height="48" />
  <p><strong>Arckhé AI</strong></p>
</div>


**ðŸ‡§ðŸ‡· [PortuguÃªs](README.md) Â· ðŸ‡ºðŸ‡¸ [English](README.en.md) Â· ðŸ‡ªðŸ‡¸ [EspaÃ±ol](README.es.md)**

[![Filme em cÃ³digo: outra cena, mesmo rosto](guia/assets/banner.jpg)](https://linnoff88-dev.github.io/

**Troque a roupa e o lugar da sua personagem sem a IA mudar o rosto dela.** O mÃ©todo se chama
**um motor por estilo**: vocÃª aprova a personagem uma vez e reaproveita em quantos filmes quiser.

## ðŸ“– Guia

Para entender o que o kit faz e como ele muda o seu dia (sem parte tÃ©cnica):
**https://linnoff88-dev.github.io/

## O que Ã©

Cansou de pedir sÃ³ uma roupa nova e receber outra personagem? Neste kit grÃ¡tis, o Claude escreve
um **desenhista** em cÃ³digo, que sabe desenhar um estilo, e uma **ficha** curta da cena: quem
aparece, onde, que hora e o que faz. Para um filme novo, vocÃª troca a ficha e o desenhista fica,
por isso o rosto nÃ£o muda. Serve para quem quer fazer filme animado sem saber programar. Precisa
do Claude Code (ou do Codex) e de um computador comum, sem placa de vÃ­deo.

<sub>Os motores de exemplo deste kit foram escritos pelo Claude Fable 5.2.</sub>

VocÃª pede um vÃ­deo para a IA e a personagem muda de rosto a cada tomada, o filme acaba em poucos
segundos e cada tentativa nova gasta crÃ©dito. Aqui o caminho Ã© outro: o Claude **escreve um
programa que desenha o filme**, quadro por quadro. Sem modelo de vÃ­deo e sem placa de vÃ­deo.

O mÃ©todo tem nome: **um motor por estilo**. VocÃª cria o motor de um estilo uma vez. Depois,
filme novo Ã© sÃ³ trocar a histÃ³ria. E o mesmo cÃ³digo dÃ¡ sempre o mesmo vÃ­deo.

| | |
|---|---|
| ![camadas-planas](exemplos/camadas-planas/quadro.jpg) **camadas-planas** Â· recorte de papel | ![fundo-pintado](exemplos/fundo-pintado/quadro.jpg) **fundo-pintado** Â· fundo pintado + personagem de formas |
| ![cena-3d](exemplos/cena-3d/quadro.jpg) **cena-3d** Â· mundo 3D com a cÃ¢mera dentro | ![marionete](exemplos/marionete/quadro.jpg) **marionete** Â· uma ilustraÃ§Ã£o mexida por Ã¡reas |

Os quatro quadros acima saÃ­ram dos motores deste repositÃ³rio, nesta ordem: cÃ³digo â†’ quadros â†’
som â†’ MP4.

## Como funciona

1. **O motor** Ã© uma pÃ¡gina (HTML + JavaScript) que sabe desenhar um estilo. Ela tem uma funÃ§Ã£o,
   `desenhar(t)`, que desenha o quadro do segundo `t`.
2. **A histÃ³ria** Ã© um arquivo pequeno, `historia.json`: tÃ­tulo, cores, lugar, hora, roupa, aÃ§Ã£o.
3. **O render** abre a pÃ¡gina num navegador sem tela, pede cada quadro (`t = 0`, `t = 1/30`,
   `t = 2/30`...) e guarda cada um como imagem.
4. **O som** tambÃ©m Ã© conta: o motor calcula cada amostra, nas mesmas marcas de tempo da imagem.
5. **O FFmpeg** junta os quadros e o som num MP4.

Como o tempo nÃ£o vem do relÃ³gio e os sorteios tÃªm semente, **renderizar duas vezes dÃ¡ os mesmos
quadros** (o teste do kit compara o hash).

## Um motor por estilo: a prova

Mesmo motor, mesmos arquivos de cÃ³digo. SÃ³ o `historia.json` mudou.

| `historia.json` | `historia-2.json` |
|---|---|
| ![Lia na colina](exemplos/fundo-pintado/quadro.jpg) | ![Lia na praia](exemplos/fundo-pintado/quadro-historia-2.jpg) |
| colina, de dia, uniforme, acena | praia, entardecer, vestido e chapÃ©u, segura o chapÃ©u |
| ![raposa e lua](exemplos/camadas-planas/quadro.jpg) | ![raposa e sol](exemplos/camadas-planas/quadro-historia-2.jpg) |
| noite, lua, pinheiros, vaga-lumes | manhÃ£, sol, Ã¡rvores redondas |

A Lia tem o mesmo rosto nas duas porque Ã© o mesmo cÃ³digo que a desenha. No `fundo-pintado`, o
motor tem cerca de 46 KB de cÃ³digo; cada histÃ³ria tem menos de 1 KB.

## Como comeÃ§ar (sem ser tÃ©cnico)

Abra o Claude Code, ou o Codex, numa pasta do seu computador e cole (troque a parte entre colchetes):

```text
Leia o kit "filme-em-codigo" em https://github.com/linnoff88-dev/filme-em-codigo (o README explica tudo, inclusive a instalaÃ§Ã£o).
Quero um filme animado com esta personagem: [descreva quem Ã©, onde estÃ¡, que hora Ã© e o que faz].
Antes de fazer qualquer coisa, me responda em portuguÃªs simples:
1. Qual dos 4 jeitos de animar combina com a minha ideia, e por quÃª?
2. O que o meu computador precisa ter para fazer o filme?
3. O que o mÃ©todo nÃ£o vai conseguir fazer na minha ideia?
NÃ£o instale nem crie nada ainda. Mostre o plano e espere eu dizer sim.
```

---

## InstalaÃ§Ã£o tÃ©cnica

### O que vocÃª precisa

| O quÃª | Para quÃª | Como conferir |
|---|---|---|
| Node 22 ou mais novo | rodar o render | `node --version` |
| Chrome ou Chromium | tirar os quadros (sem abrir janela) | o render acha sozinho; ou `CHROME_PATH=/caminho` |
| FFmpeg | juntar quadros e som em MP4 | `ffmpeg -version` |
| Claude Code | escrever motores e histÃ³rias novas | sÃ³ para criar; para rodar os exemplos, nÃ£o precisa |

NÃ£o tem `npm install`. A three.js (para o exemplo 3D) jÃ¡ estÃ¡ em `vendor/three`.

### ComeÃ§ar

```bash
git clone https://github.com/linnoff88-dev/filme-em-codigo.git
cd filme-em-codigo

# renderizar um exemplo (sai em saida/fundo-pintado/fundo-pintado.mp4)
node ferramentas/render.mjs exemplos/fundo-pintado

# o mesmo motor com outra histÃ³ria
node ferramentas/render.mjs exemplos/fundo-pintado --historia historia-2.json

# sÃ³ 3 quadros soltos, para olhar antes de renderizar tudo
node ferramentas/render.mjs exemplos/cena-3d --quadros 1,5,9

# assistir no navegador, com som, sem renderizar
node ferramentas/ver.mjs exemplos/marionete
```

## O processo, do inÃ­cio ao fim

Quem faz: ðŸ§  vocÃª com o Claude Â· âš™ï¸ script Â· ðŸ¤– `claude -p` (o Claude sem conversa, numa linha de comando).

| # | Passo | Comando / aÃ§Ã£o | Quem |
|---|---|---|---|
| 1 | Escolher o jeito de animar | ler [METODOS.md](METODOS.md): camadas-planas, fundo-pintado, cena-3d ou marionete | ðŸ§  |
| 2 | Escolher o estilo | pegar um bloco em [prompts/estilos/](prompts/estilos/README.md) ou descrever o seu | ðŸ§  |
| 3 | Criar o motor (uma vez por estilo) | pedido [prompts/01-criar-motor.md](prompts/01-criar-motor.md), em conversa nova | ðŸ§  |
| 4 | Conferir 3 quadros soltos | `node ferramentas/render.mjs meus/<estilo> --quadros 1,4,7` e olhar; atÃ© 3 rodadas | ðŸ§  + âš™ï¸ |
| 5 | Assistir no navegador (opcional) | `node ferramentas/ver.mjs meus/<estilo>` | âš™ï¸ |
| 6 | Renderizar o filme | `node ferramentas/render.mjs meus/<estilo>` â†’ `saida/<estilo>/<estilo>.mp4` | âš™ï¸ |
| 7 | Ajustar com palavras | "mais devagar", "luz mais quente", na mesma conversa; repetir 4 e 6 | ðŸ§  |
| 8 | Filme novo no mesmo motor | pedido [prompts/02-nova-historia-mesmo-motor.md](prompts/02-nova-historia-mesmo-motor.md): sÃ³ um `historia-N.json` | ðŸ§  ou ðŸ¤– |
| 9 | Renderizar a nova histÃ³ria | `node ferramentas/render.mjs meus/<estilo> --historia historia-N.json` | âš™ï¸ |
| 10 | Conferir que nada quebrou | `bash tests/rodar.sh` | âš™ï¸ |
| 11 | (Opcional) dar textura num gerador de vÃ­deo | [prompts/06-hibrido-modelo-de-video.md](prompts/06-hibrido-modelo-de-video.md); fora do kit, pago | ðŸ§  |

Passo 8 sem conversa:

```bash
# --allowedTools deixa o Claude ler, criar arquivo e rodar sÃ³ o render (testado em 19/11/2026)
claude -p "Use o motor de exemplos/camadas-planas. NÃ£o altere o motor. Crie exemplos/camadas-planas/historia-3.json: a raposa numa floresta de outono, de dia. Renderize com node ferramentas/render.mjs exemplos/camadas-planas --historia historia-3.json e diga o caminho do MP4." \
  --allowedTools "Read" "Write" "Glob" "Grep" "Bash(node ferramentas/render.mjs:*)"
```

## Os 4 jeitos de animar

| Jeito | O que Ã© | Exemplo | Quando usar |
|---|---|---|---|
| **camadas-planas** | formas planas em camadas; o fundo anda menos que a frente | [exemplos/camadas-planas](exemplos/camadas-planas) | recorte de papel, xilogravura, giz, vetor |
| **fundo-pintado** | cenÃ¡rio pintado uma vez + personagem de formas animada por cima | [exemplos/fundo-pintado](exemplos/fundo-pintado) | personagem com rosto, estilo anime simples |
| **cena-3d** | um mundo 3D com luz e sombra, e a cÃ¢mera andando dentro | [exemplos/cena-3d](exemplos/cena-3d) | passeio de cÃ¢mera, profundidade, maquete |
| **marionete** | uma ilustraÃ§Ã£o pronta, entortada por pequenas Ã¡reas | [exemplos/marionete](exemplos/marionete) | vocÃª jÃ¡ tem o desenho e quer sÃ³ dar vida |

Detalhes, forÃ§as e fraquezas de cada um: [METODOS.md](METODOS.md).

## Medido nesta mÃ¡quina

Render dos exemplos em 19/11/2026: 10 segundos de filme, 1920Ã—1080, 30 quadros por segundo
(300 quadros), **sÃ³ CPU, sem placa de vÃ­deo**, 4 navegadores em paralelo, teto de 8 GB de memÃ³ria.
Cada linha vem do `medida.json` do exemplo.

| Exemplo | Render completo | Por quadro | NÃºcleos usados (mÃ©dia) | MemÃ³ria (pico) | MP4 |
|---|---|---|---|---|---|
| camadas-planas | 30,8 s | 87 ms | 3,4 de 20 | 2,6 GB | 5,5 MB |
| fundo-pintado | 25,5 s | 62 ms | 3,6 de 20 | 2,5 GB | 9,1 MB |
| cena-3d | 45,3 s | 104 ms | 10,7 de 20 | 2,3 GB | 7,3 MB |
| marionete | 37,0 s | 98 ms | 3,2 de 20 | 3,1 GB | 5,4 MB |

MÃ¡quina: CPU Arm Cortex-X925 de 20 nÃºcleos, Linux, Chrome 158 (WebGL calculado pela CPU,
SwiftShader), FFmpeg 6.1.1. Em outra mÃ¡quina os tempos mudam. O que custa de verdade Ã© a conversa
com o Claude, nÃ£o o render: [CUSTO.md](CUSTO.md).

Para medir na sua: `bash ferramentas/medir-tudo.sh`.

## O que tem aqui

| Pasta / arquivo | O que Ã© |
|---|---|
| `exemplos/<jeito>/` | um motor de cada jeito: `index.html`, `motor.js`, `historia.json`, `medida.json`, `quadro.jpg` |
| `comum/filme.js` | a parte igual de todo motor: lÃª a histÃ³ria, cria a tela, combina com o render, player de prÃ©-visualizaÃ§Ã£o |
| `comum/som.js` | som feito em cÃ³digo: nota, sino, corda, vento, batida, eco de sala |
| `ferramentas/render.mjs` | pÃ¡gina â†’ quadros PNG â†’ som WAV â†’ MP4. Sem dependÃªncia de npm |
| `ferramentas/ver.mjs` | assistir o motor no navegador |
| `ferramentas/medir-tudo.sh` | renderiza todos os exemplos e grava as medidas |
| `prompts/` | os 6 pedidos prontos e a [biblioteca de estilos](prompts/estilos/README.md) (31 estilos) |
| `tests/` | render curto, mesmo cÃ³digo = mesmos quadros, MP4 com vÃ­deo e som |
| `vendor/three/` | three.js 0.187.0 (licenÃ§a MIT), para o exemplo 3D rodar sem internet |

## O contrato do motor

Todo motor expÃµe isto na pÃ¡gina (quem cria Ã© o `comum/filme.js`):

```js
window.FILME = {
  largura, altura, fps, duracao,
  tela,          // o canvas onde tudo Ã© desenhado
  pronto,        // promessa: resolve quando histÃ³ria e imagens carregaram
  desenhar(t),   // desenha o quadro do segundo t â€” conta pura, sem relÃ³gio e sem memÃ³ria
  som(),         // devolve { taxa, esq, dir }: as amostras do som, calculadas em cÃ³digo
};
```

TrÃªs regras fazem o mÃ©todo funcionar:

- **`desenhar(t)` nÃ£o lembra do quadro anterior.** Vento, partÃ­cula, cÃ¢mera: tudo sai de `t`.
- **Sorteio sÃ³ com semente** (`Filme.sorteio(semente)`). Nada de `Math.random`.
- **Nada da histÃ³ria dentro do motor.** O que muda entre episÃ³dios mora no `historia.json`.

## Pedidos prontos

| Arquivo | Para quÃª |
|---|---|
| [01-criar-motor.md](prompts/01-criar-motor.md) | criar o motor de um estilo, com conferÃªncia de 3 quadros |
| [02-nova-historia-mesmo-motor.md](prompts/02-nova-historia-mesmo-motor.md) | filme novo sem mexer no motor |
| [03-com-sua-referencia.md](prompts/03-com-sua-referencia.md) | partir de uma imagem sua |
| [04-grade-storyboard.md](prompts/04-grade-storyboard.md) | grade 2Ã—2 de quadros-chave â†’ animaÃ§Ã£o que passa de um ao outro |
| [05-gastar-menos.md](prompts/05-gastar-menos.md) | as alavancas de custo, em pedidos |
| [06-hibrido-modelo-de-video.md](prompts/06-hibrido-modelo-de-video.md) | usar o MP4 como referÃªncia num gerador de vÃ­deo (sÃ³ documentado) |
| [estilos/](prompts/estilos/README.md) | 31 estilos "mesmo estilo, sua ideia", pelos 4 jeitos |

## Testes

```bash
bash tests/rodar.sh
```

Para cada exemplo: renderiza 1 segundo, confere que o MP4 tem vÃ­deo e som, renderiza de novo em
outro lanÃ§amento (com 1, 2 e 3 navegadores) e compara o hash dos quadros, confere que os quadros
mudam com o tempo, e que a segunda histÃ³ria dÃ¡ outro filme no mesmo motor. Rodam sem internet.

"Mesmo cÃ³digo = mesmo vÃ­deo" foi conferido **na mesma mÃ¡quina e no mesmo navegador**. Entre
mÃ¡quinas diferentes, as fontes de letra e a versÃ£o do navegador podem mudar alguns pixels.

## O que este mÃ©todo nÃ£o faz

Fotorrealismo, rosto humano realista, luta, danÃ§a, fala com boca sincronizada. Veja
[LIMITES.md](LIMITES.md), com as saÃ­das: o caminho hÃ­brido e o Blender.

## Kits irmÃ£os

- **video-codigo**: vÃ­deo em HTML/Canvas com voz local presa Ã  palavra â€” https://linnoff88-dev.github.io/
- **sincronia-em-codigo**: relÃ³gio Ãºnico para imagem, contador e som; sÃ©ries por planilha â€” https://linnoff88-dev.github.io/
- **estilo-em-skill**: o estilo de um vÃ­deo vira uma skill reutilizÃ¡vel â€” https://linnoff88-dev.github.io/

RepositÃ³rios de cÃ³digo aberto que servem a este mÃ©todo, conferidos um a um: [REFERENCIAS.md](REFERENCIAS.md).

## LicenÃ§a

MIT. Veja [LICENSE](LICENSE). A three.js em `vendor/three` tem licenÃ§a MIT prÃ³pria (`vendor/three/LICENSE`).
ConteÃºdo aberto e gratuito do ARCKHÉ AI.

---

<div align="center">
  <img src="capa/logo.svg" alt="Arckhé AI" height="32" />
  <p><strong>Arckhé AI</strong></p>
</div>