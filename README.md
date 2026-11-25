# filme-em-codigo ê¢â¬â um motor por estilo

<div align="center">
  <img src="capa/logo.svg" alt="Arckhé AI" height="48" />
  <p><strong>Arckhé AI</strong></p>
</div>


**ê°Å¸â¡Â§ê°Å¸â¡Â· [PortuguêÂªs](README.md) êÂ· ê°Å¸â¡Âºê°Å¸â¡Â¸ [English](README.en.md) êÂ· ê°Å¸â¡Âªê°Å¸â¡Â¸ [EspaêÂ±ol](README.es.md)**

[![Filme em cêÂ³digo: outra cena, mesmo rosto](guia/assets/banner.jpg)](https://linnoff88-dev.github.io/

**Troque a roupa e o lugar da sua personagem sem a IA mudar o rosto dela.** O mêÂ©todo se chama
**um motor por estilo**: vocêÂª aprova a personagem uma vez e reaproveita em quantos filmes quiser.

## ê°Å¸ââ Guia

Para entender o que o kit faz e como ele muda o seu dia (sem parte têÂ©cnica):
**https://linnoff88-dev.github.io/

## O que êÂ©

Cansou de pedir sêÂ³ uma roupa nova e receber outra personagem? Neste kit grêÂ¡tis, o Claude escreve
um **desenhista** em cêÂ³digo, que sabe desenhar um estilo, e uma **ficha** curta da cena: quem
aparece, onde, que hora e o que faz. Para um filme novo, vocêÂª troca a ficha e o desenhista fica,
por isso o rosto nêÂ£o muda. Serve para quem quer fazer filme animado sem saber programar. Precisa
do Claude Code (ou do Codex) e de um computador comum, sem placa de vêÂ­deo.

<sub>Os motores de exemplo deste kit foram escritos pelo Claude Fable 5.2.</sub>

VocêÂª pede um vêÂ­deo para a IA e a personagem muda de rosto a cada tomada, o filme acaba em poucos
segundos e cada tentativa nova gasta crêÂ©dito. Aqui o caminho êÂ© outro: o Claude **escreve um
programa que desenha o filme**, quadro por quadro. Sem modelo de vêÂ­deo e sem placa de vêÂ­deo.

O mêÂ©todo tem nome: **um motor por estilo**. VocêÂª cria o motor de um estilo uma vez. Depois,
filme novo êÂ© sêÂ³ trocar a histêÂ³ria. E o mesmo cêÂ³digo dêÂ¡ sempre o mesmo vêÂ­deo.

| | |
|---|---|
| ![camadas-planas](exemplos/camadas-planas/quadro.jpg) **camadas-planas** êÂ· recorte de papel | ![fundo-pintado](exemplos/fundo-pintado/quadro.jpg) **fundo-pintado** êÂ· fundo pintado + personagem de formas |
| ![cena-3d](exemplos/cena-3d/quadro.jpg) **cena-3d** êÂ· mundo 3D com a cêÂ¢mera dentro | ![marionete](exemplos/marionete/quadro.jpg) **marionete** êÂ· uma ilustraêÂ§êÂ£o mexida por êÂ¡reas |

Os quatro quadros acima saêÂ­ram dos motores deste repositêÂ³rio, nesta ordem: cêÂ³digo ê¢â â quadros ê¢â â
som ê¢â â MP4.

## Como funciona

1. **O motor** êÂ© uma pêÂ¡gina (HTML + JavaScript) que sabe desenhar um estilo. Ela tem uma funêÂ§êÂ£o,
   `desenhar(t)`, que desenha o quadro do segundo `t`.
2. **A histêÂ³ria** êÂ© um arquivo pequeno, `historia.json`: têÂ­tulo, cores, lugar, hora, roupa, aêÂ§êÂ£o.
3. **O render** abre a pêÂ¡gina num navegador sem tela, pede cada quadro (`t = 0`, `t = 1/30`,
   `t = 2/30`...) e guarda cada um como imagem.
4. **O som** tambêÂ©m êÂ© conta: o motor calcula cada amostra, nas mesmas marcas de tempo da imagem.
5. **O FFmpeg** junta os quadros e o som num MP4.

Como o tempo nêÂ£o vem do relêÂ³gio e os sorteios têÂªm semente, **renderizar duas vezes dêÂ¡ os mesmos
quadros** (o teste do kit compara o hash).

## Um motor por estilo: a prova

Mesmo motor, mesmos arquivos de cêÂ³digo. SêÂ³ o `historia.json` mudou.

| `historia.json` | `historia-2.json` |
|---|---|
| ![Lia na colina](exemplos/fundo-pintado/quadro.jpg) | ![Lia na praia](exemplos/fundo-pintado/quadro-historia-2.jpg) |
| colina, de dia, uniforme, acena | praia, entardecer, vestido e chapêÂ©u, segura o chapêÂ©u |
| ![raposa e lua](exemplos/camadas-planas/quadro.jpg) | ![raposa e sol](exemplos/camadas-planas/quadro-historia-2.jpg) |
| noite, lua, pinheiros, vaga-lumes | manhêÂ£, sol, êÂ¡rvores redondas |

A Lia tem o mesmo rosto nas duas porque êÂ© o mesmo cêÂ³digo que a desenha. No `fundo-pintado`, o
motor tem cerca de 46 KB de cêÂ³digo; cada histêÂ³ria tem menos de 1 KB.

## Como comeêÂ§ar (sem ser têÂ©cnico)

Abra o Claude Code, ou o Codex, numa pasta do seu computador e cole (troque a parte entre colchetes):

```text
Leia o kit "filme-em-codigo" em https://github.com/linnoff88-dev/filme-em-codigo (o README explica tudo, inclusive a instalaêÂ§êÂ£o).
Quero um filme animado com esta personagem: [descreva quem êÂ©, onde estêÂ¡, que hora êÂ© e o que faz].
Antes de fazer qualquer coisa, me responda em portuguêÂªs simples:
1. Qual dos 4 jeitos de animar combina com a minha ideia, e por quêÂª?
2. O que o meu computador precisa ter para fazer o filme?
3. O que o mêÂ©todo nêÂ£o vai conseguir fazer na minha ideia?
NêÂ£o instale nem crie nada ainda. Mostre o plano e espere eu dizer sim.
```

---

## InstalaêÂ§êÂ£o têÂ©cnica

### O que vocêÂª precisa

| O quêÂª | Para quêÂª | Como conferir |
|---|---|---|
| Node 22 ou mais novo | rodar o render | `node --version` |
| Chrome ou Chromium | tirar os quadros (sem abrir janela) | o render acha sozinho; ou `CHROME_PATH=/caminho` |
| FFmpeg | juntar quadros e som em MP4 | `ffmpeg -version` |
| Claude Code | escrever motores e histêÂ³rias novas | sêÂ³ para criar; para rodar os exemplos, nêÂ£o precisa |

NêÂ£o tem `npm install`. A three.js (para o exemplo 3D) jêÂ¡ estêÂ¡ em `vendor/three`.

### ComeêÂ§ar

```bash
git clone https://github.com/linnoff88-dev/filme-em-codigo.git
cd filme-em-codigo

# renderizar um exemplo (sai em saida/fundo-pintado/fundo-pintado.mp4)
node ferramentas/render.mjs exemplos/fundo-pintado

# o mesmo motor com outra histêÂ³ria
node ferramentas/render.mjs exemplos/fundo-pintado --historia historia-2.json

# sêÂ³ 3 quadros soltos, para olhar antes de renderizar tudo
node ferramentas/render.mjs exemplos/cena-3d --quadros 1,5,9

# assistir no navegador, com som, sem renderizar
node ferramentas/ver.mjs exemplos/marionete
```

## O processo, do inêÂ­cio ao fim

Quem faz: ê°Å¸Â§Â  vocêÂª com o Claude êÂ· ê¢Å¡â¢ê¯Â¸Â script êÂ· ê°Å¸Â¤â `claude -p` (o Claude sem conversa, numa linha de comando).

| # | Passo | Comando / aêÂ§êÂ£o | Quem |
|---|---|---|---|
| 1 | Escolher o jeito de animar | ler [METODOS.md](METODOS.md): camadas-planas, fundo-pintado, cena-3d ou marionete | ê°Å¸Â§Â  |
| 2 | Escolher o estilo | pegar um bloco em [prompts/estilos/](prompts/estilos/README.md) ou descrever o seu | ê°Å¸Â§Â  |
| 3 | Criar o motor (uma vez por estilo) | pedido [prompts/01-criar-motor.md](prompts/01-criar-motor.md), em conversa nova | ê°Å¸Â§Â  |
| 4 | Conferir 3 quadros soltos | `node ferramentas/render.mjs meus/<estilo> --quadros 1,4,7` e olhar; atêÂ© 3 rodadas | ê°Å¸Â§Â  + ê¢Å¡â¢ê¯Â¸Â |
| 5 | Assistir no navegador (opcional) | `node ferramentas/ver.mjs meus/<estilo>` | ê¢Å¡â¢ê¯Â¸Â |
| 6 | Renderizar o filme | `node ferramentas/render.mjs meus/<estilo>` ê¢â â `saida/<estilo>/<estilo>.mp4` | ê¢Å¡â¢ê¯Â¸Â |
| 7 | Ajustar com palavras | "mais devagar", "luz mais quente", na mesma conversa; repetir 4 e 6 | ê°Å¸Â§Â  |
| 8 | Filme novo no mesmo motor | pedido [prompts/02-nova-historia-mesmo-motor.md](prompts/02-nova-historia-mesmo-motor.md): sêÂ³ um `historia-N.json` | ê°Å¸Â§Â  ou ê°Å¸Â¤â |
| 9 | Renderizar a nova histêÂ³ria | `node ferramentas/render.mjs meus/<estilo> --historia historia-N.json` | ê¢Å¡â¢ê¯Â¸Â |
| 10 | Conferir que nada quebrou | `bash tests/rodar.sh` | ê¢Å¡â¢ê¯Â¸Â |
| 11 | (Opcional) dar textura num gerador de vêÂ­deo | [prompts/06-hibrido-modelo-de-video.md](prompts/06-hibrido-modelo-de-video.md); fora do kit, pago | ê°Å¸Â§Â  |

Passo 8 sem conversa:

```bash
# --allowedTools deixa o Claude ler, criar arquivo e rodar sêÂ³ o render (testado em 19/11/2026)
claude -p "Use o motor de exemplos/camadas-planas. NêÂ£o altere o motor. Crie exemplos/camadas-planas/historia-3.json: a raposa numa floresta de outono, de dia. Renderize com node ferramentas/render.mjs exemplos/camadas-planas --historia historia-3.json e diga o caminho do MP4." \
  --allowedTools "Read" "Write" "Glob" "Grep" "Bash(node ferramentas/render.mjs:*)"
```

## Os 4 jeitos de animar

| Jeito | O que êÂ© | Exemplo | Quando usar |
|---|---|---|---|
| **camadas-planas** | formas planas em camadas; o fundo anda menos que a frente | [exemplos/camadas-planas](exemplos/camadas-planas) | recorte de papel, xilogravura, giz, vetor |
| **fundo-pintado** | cenêÂ¡rio pintado uma vez + personagem de formas animada por cima | [exemplos/fundo-pintado](exemplos/fundo-pintado) | personagem com rosto, estilo anime simples |
| **cena-3d** | um mundo 3D com luz e sombra, e a cêÂ¢mera andando dentro | [exemplos/cena-3d](exemplos/cena-3d) | passeio de cêÂ¢mera, profundidade, maquete |
| **marionete** | uma ilustraêÂ§êÂ£o pronta, entortada por pequenas êÂ¡reas | [exemplos/marionete](exemplos/marionete) | vocêÂª jêÂ¡ tem o desenho e quer sêÂ³ dar vida |

Detalhes, forêÂ§as e fraquezas de cada um: [METODOS.md](METODOS.md).

## Medido nesta mêÂ¡quina

Render dos exemplos em 19/11/2026: 10 segundos de filme, 1920êâ1080, 30 quadros por segundo
(300 quadros), **sêÂ³ CPU, sem placa de vêÂ­deo**, 4 navegadores em paralelo, teto de 8 GB de memêÂ³ria.
Cada linha vem do `medida.json` do exemplo.

| Exemplo | Render completo | Por quadro | NêÂºcleos usados (mêÂ©dia) | MemêÂ³ria (pico) | MP4 |
|---|---|---|---|---|---|
| camadas-planas | 30,8 s | 87 ms | 3,4 de 20 | 2,6 GB | 5,5 MB |
| fundo-pintado | 25,5 s | 62 ms | 3,6 de 20 | 2,5 GB | 9,1 MB |
| cena-3d | 45,3 s | 104 ms | 10,7 de 20 | 2,3 GB | 7,3 MB |
| marionete | 37,0 s | 98 ms | 3,2 de 20 | 3,1 GB | 5,4 MB |

MêÂ¡quina: CPU Arm Cortex-X925 de 20 nêÂºcleos, Linux, Chrome 158 (WebGL calculado pela CPU,
SwiftShader), FFmpeg 6.1.1. Em outra mêÂ¡quina os tempos mudam. O que custa de verdade êÂ© a conversa
com o Claude, nêÂ£o o render: [CUSTO.md](CUSTO.md).

Para medir na sua: `bash ferramentas/medir-tudo.sh`.

## O que tem aqui

| Pasta / arquivo | O que êÂ© |
|---|---|
| `exemplos/<jeito>/` | um motor de cada jeito: `index.html`, `motor.js`, `historia.json`, `medida.json`, `quadro.jpg` |
| `comum/filme.js` | a parte igual de todo motor: lêÂª a histêÂ³ria, cria a tela, combina com o render, player de prêÂ©-visualizaêÂ§êÂ£o |
| `comum/som.js` | som feito em cêÂ³digo: nota, sino, corda, vento, batida, eco de sala |
| `ferramentas/render.mjs` | pêÂ¡gina ê¢â â quadros PNG ê¢â â som WAV ê¢â â MP4. Sem dependêÂªncia de npm |
| `ferramentas/ver.mjs` | assistir o motor no navegador |
| `ferramentas/medir-tudo.sh` | renderiza todos os exemplos e grava as medidas |
| `prompts/` | os 6 pedidos prontos e a [biblioteca de estilos](prompts/estilos/README.md) (31 estilos) |
| `tests/` | render curto, mesmo cêÂ³digo = mesmos quadros, MP4 com vêÂ­deo e som |
| `vendor/three/` | three.js 0.187.0 (licenêÂ§a MIT), para o exemplo 3D rodar sem internet |

## O contrato do motor

Todo motor expêÂµe isto na pêÂ¡gina (quem cria êÂ© o `comum/filme.js`):

```js
window.FILME = {
  largura, altura, fps, duracao,
  tela,          // o canvas onde tudo êÂ© desenhado
  pronto,        // promessa: resolve quando histêÂ³ria e imagens carregaram
  desenhar(t),   // desenha o quadro do segundo t ê¢â¬â conta pura, sem relêÂ³gio e sem memêÂ³ria
  som(),         // devolve { taxa, esq, dir }: as amostras do som, calculadas em cêÂ³digo
};
```

TrêÂªs regras fazem o mêÂ©todo funcionar:

- **`desenhar(t)` nêÂ£o lembra do quadro anterior.** Vento, partêÂ­cula, cêÂ¢mera: tudo sai de `t`.
- **Sorteio sêÂ³ com semente** (`Filme.sorteio(semente)`). Nada de `Math.random`.
- **Nada da histêÂ³ria dentro do motor.** O que muda entre episêÂ³dios mora no `historia.json`.

## Pedidos prontos

| Arquivo | Para quêÂª |
|---|---|
| [01-criar-motor.md](prompts/01-criar-motor.md) | criar o motor de um estilo, com conferêÂªncia de 3 quadros |
| [02-nova-historia-mesmo-motor.md](prompts/02-nova-historia-mesmo-motor.md) | filme novo sem mexer no motor |
| [03-com-sua-referencia.md](prompts/03-com-sua-referencia.md) | partir de uma imagem sua |
| [04-grade-storyboard.md](prompts/04-grade-storyboard.md) | grade 2êâ2 de quadros-chave ê¢â â animaêÂ§êÂ£o que passa de um ao outro |
| [05-gastar-menos.md](prompts/05-gastar-menos.md) | as alavancas de custo, em pedidos |
| [06-hibrido-modelo-de-video.md](prompts/06-hibrido-modelo-de-video.md) | usar o MP4 como referêÂªncia num gerador de vêÂ­deo (sêÂ³ documentado) |
| [estilos/](prompts/estilos/README.md) | 31 estilos "mesmo estilo, sua ideia", pelos 4 jeitos |

## Testes

```bash
bash tests/rodar.sh
```

Para cada exemplo: renderiza 1 segundo, confere que o MP4 tem vêÂ­deo e som, renderiza de novo em
outro lanêÂ§amento (com 1, 2 e 3 navegadores) e compara o hash dos quadros, confere que os quadros
mudam com o tempo, e que a segunda histêÂ³ria dêÂ¡ outro filme no mesmo motor. Rodam sem internet.

"Mesmo cêÂ³digo = mesmo vêÂ­deo" foi conferido **na mesma mêÂ¡quina e no mesmo navegador**. Entre
mêÂ¡quinas diferentes, as fontes de letra e a versêÂ£o do navegador podem mudar alguns pixels.

## O que este mêÂ©todo nêÂ£o faz

Fotorrealismo, rosto humano realista, luta, danêÂ§a, fala com boca sincronizada. Veja
[LIMITES.md](LIMITES.md), com as saêÂ­das: o caminho hêÂ­brido e o Blender.

## Kits irmêÂ£os

- **video-codigo**: vêÂ­deo em HTML/Canvas com voz local presa êÂ  palavra ê¢â¬â https://linnoff88-dev.github.io/
- **sincronia-em-codigo**: relêÂ³gio êÂºnico para imagem, contador e som; sêÂ©ries por planilha ê¢â¬â https://linnoff88-dev.github.io/
- **estilo-em-skill**: o estilo de um vêÂ­deo vira uma skill reutilizêÂ¡vel ê¢â¬â https://linnoff88-dev.github.io/

RepositêÂ³rios de cêÂ³digo aberto que servem a este mêÂ©todo, conferidos um a um: [REFERENCIAS.md](REFERENCIAS.md).

## LicenêÂ§a

MIT. Veja [LICENSE](LICENSE). A three.js em `vendor/three` tem licenêÂ§a MIT prêÂ³pria (`vendor/three/LICENSE`).
ConteêÂºdo aberto e gratuito do ARCKHê AI.

---

<div align="center">
  <img src="capa/logo.svg" alt="Arckhé AI" height="32" />
  <p><strong>Arckhé AI</strong></p>
</div>