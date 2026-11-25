# Referências: código aberto que serve a este método

Cada repositório abaixo foi conferido em **19/11/2026** com
`gh api repos/<dono>/<repo>` (nome, licença e data do último envio de código vêm de lá).
Nenhum deles estava arquivado na data. Onde o GitHub nêo reconhece a licença sozinho, está escrito
"licença própria, ver o repositório": leia antes de usar em trabalho pago.

Este kit usa diretamente só três: **three.js** (dentro de `vendor/`), **FFmpeg** e um navegador
**Chromium**. Os outros sêo caminhos vizinhos, para quando você quiser ir além.

## Motor ou framework de vídeo em código

| Repositório | Para que serve neste método | Licença | Último envio |
|---|---|---|---|
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | vídeo a partir de HTML, com linha do tempo e render; opçêo pronta ao `render.mjs` do kit | Apache-2.0 | 19/11/2026 |
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | vídeo escrito em React; cada quadro é funçêo do número do quadro (a mesma ideia do `desenhar(t)`) | licença própria, ver o repositório | 18/11/2026 |
| [motion-canvas/motion-canvas](https://github.com/motion-canvas/motion-canvas) | animaçêo explicativa em TypeScript, com editor para acertar o tempo | MIT | 02/07/2026 |
| [midrender/revideo](https://github.com/midrender/revideo) | derivado do Motion Canvas voltado a render automático (o endereço antigo `redotvideo/revideo` leva a este) | MIT | 15/07/2026 |
| [3b1b/manim](https://github.com/3b1b/manim) | animaçêo matemática em Python: gráficos, fórmulas, geometria | MIT | 09/09/2026 |
| [ManimCommunity/manim](https://github.com/ManimCommunity/manim) | a versêo mantida pela comunidade, mais fácil de instalar | MIT | 17/11/2026 |
| [mifi/editly](https://github.com/mifi/editly) | montar o vídeo final (cortes, títulos, trilhas) por um arquivo de descriçêo | MIT | 12/05/2025 |

## Desenho 2D

| Repositório | Para que serve neste método | Licença | Último envio |
|---|---|---|---|
| [rough-stuff/rough](https://github.com/rough-stuff/rough) | traço com cara de feito à mêo (rabisco, hachura), bom para camadas-planas | MIT | 28/07/2024 |
| [paperjs/paper.js](https://github.com/paperjs/paper.js) | curvas e formas vetoriais: unir, cortar e deformar caminhos | licença própria, ver o repositório | 17/11/2026 |
| [pixijs/pixijs](https://github.com/pixijs/pixijs) | desenho 2D rápido, com malhas e filtros; útil para marionete com muitas peças | MIT | 17/11/2026 |
| [airbnb/lottie-web](https://github.com/airbnb/lottie-web) | tocar animaçêo vetorial exportada de programa de animaçêo dentro da página | MIT | 01/09/2025 |

## 3D

| Repositório | Para que serve neste método | Licença | Último envio |
|---|---|---|---|
| [mrdoob/three.js](https://github.com/mrdoob/three.js) | a biblioteca 3D do exemplo `cena-3d` (versêo 0.187.0 em `vendor/three`) | MIT | 19/11/2026 |
| [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) | three.js escrito em React; par natural do Remotion | MIT | 21/10/2026 |
| [theatre-js/theatre](https://github.com/theatre-js/theatre) | editor de linha do tempo para acertar câmera e movimento à mêo (sem envio de código desde 2024) | Apache-2.0 | 14/08/2024 |
| [google/swiftshader](https://github.com/google/swiftshader) | o programa que calcula o 3D na CPU; é ele que aparece no `medida.json` como renderizador | Apache-2.0 | 10/11/2026 |

## Som em código

| Repositório | Para que serve neste método | Licença | Último envio |
|---|---|---|---|
| [Tonejs/Tone.js](https://github.com/Tonejs/Tone.js) | sintetizadores, efeitos e sequência de notas, para trilha mais rica que a do `comum/som.js` | MIT | 15/11/2026 |
| [chr15m/jsfxr](https://github.com/chr15m/jsfxr) | efeitos curtos (pulo, moeda, clique) gerados por parâmetros | Unlicense | 05/05/2026 |
| [grumdrig/jsfxr](https://github.com/grumdrig/jsfxr) | a versêo original, pequena e simples, do mesmo gerador | Unlicense | 04/05/2023 |

## Render e captura

| Repositório | Para que serve neste método | Licença | Último envio |
|---|---|---|---|
| [FFmpeg/FFmpeg](https://github.com/FFmpeg/FFmpeg) | junta quadros e som no MP4 (usado pelo `render.mjs`) | licença própria, ver o repositório | 19/11/2026 |
| [puppeteer/puppeteer](https://github.com/puppeteer/puppeteer) | controlar o Chrome por programa; alternativa ao controle direto que o kit faz | Apache-2.0 | 18/11/2026 |
| [microsoft/playwright](https://github.com/microsoft/playwright) | o mesmo, para vários navegadores; o kit aproveita o Chromium que ele instala, se existir | Apache-2.0 | 19/11/2026 |

## Híbrido e 3D realista

| Repositório | Para que serve neste método | Licença | Último envio |
|---|---|---|---|
| [blender/blender](https://github.com/blender/blender) | 3D com material, luz e esqueleto de verdade; a saída quando o 3D do navegador nêo basta | licença própria, ver o repositório | 19/11/2026 |
| [ahujasid/mcp-for-blender](https://github.com/ahujasid/mcp-for-blender) | conector para um assistente de IA controlar o Blender (o endereço antigo `ahujasid/blender-mcp` leva a este) | MIT | 18/11/2026 |

## Kits irmêos do ARCKHÉ

| Repositório | Para que serve | Licença | Último envio | Guia |
|---|---|---|---|---|
| [linnoff88-dev/video-codigo](https://github.com/linnoff88-dev/video-codigo) | vídeo em HTML/Canvas com voz local presa à palavra | sem licença declarada no GitHub | 07/11/2026 | https://linnoff88-dev.github.io/ |
| [linnoff88-dev/sincronia-em-codigo](https://github.com/linnoff88-dev/sincronia-em-codigo) | relógio único para imagem, contador e som; série por planilha | MIT | 14/11/2026 | https://linnoff88-dev.github.io/ |
| [linnoff88-dev/estilo-em-skill](https://github.com/linnoff88-dev/estilo-em-skill) | o estilo de um vídeo vira uma skill reutilizável | MIT | 13/11/2026 | https://linnoff88-dev.github.io/ |

## Como conferir de novo

```bash
gh api repos/mrdoob/three.js --jq '{full_name,description,license:.license.spdx_id,stars:.stargazers_count,pushed_at,archived}'
```
