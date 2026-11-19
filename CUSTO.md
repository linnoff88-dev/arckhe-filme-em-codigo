# Custo: onde ele está e como baixar

Neste método há dois gastos bem diferentes:

1. **O render** (transformar o motor em MP4). Roda no seu computador, na CPU. Não gasta crédito.
2. **A conversa com o Claude** (escrever o motor, olhar quadros, corrigir). É aqui que está o
   custo de verdade, e ele depende do seu plano e do modelo que você usa.

Este arquivo só traz números **medidos neste kit**. Preço de plano, de crédito ou de token não
está aqui: confira no seu plano.

## O que foi medido (19/11/2026)

Máquina: CPU Arm Cortex-X925 de 20 núcleos, Linux, Chrome 158, FFmpeg 6.1.1. **Sem placa de
vídeo** (o navegador foi aberto com `--disable-gpu`; o 3D foi calculado pela CPU). Quatro
navegadores em paralelo, teto de 8 GB de memória. Fonte: `exemplos/*/medida*.json`.

### Render completo — 10 s de filme, 1920×1080, 30 quadros por segundo

| Exemplo | Total | Abrir | Quadros | Som | FFmpeg | Núcleos (média) | Memória (pico) |
|---|---|---|---|---|---|---|---|
| camadas-planas | 30,8 s | 1,6 s | 26,0 s | 0,2 s | 2,8 s | 3,4 | 2,6 GB |
| camadas-planas (história 2) | 28,6 s | 1,5 s | 23,8 s | 0,2 s | 2,8 s | 3,5 | 2,5 GB |
| fundo-pintado | 25,5 s | 2,4 s | 18,7 s | 0,2 s | 3,9 s | 3,6 | 2,5 GB |
| fundo-pintado (história 2) | 25,4 s | 2,1 s | 19,8 s | 0,2 s | 3,2 s | 3,7 | 2,5 GB |
| cena-3d | 45,3 s | 10,6 s | 31,1 s | 0,3 s | 3,2 s | 10,7 | 2,3 GB |
| marionete | 37,0 s | 4,0 s | 29,5 s | 0,2 s | 3,2 s | 3,2 | 3,1 GB |

Lendo a tabela:
- Cada segundo de filme levou de **2,5 a 4,5 segundos** de render nesta máquina.
- O som, feito em código, custa quase nada: 0,2 a 0,3 s.
- No 3D, "abrir" é maior (10,6 s): essa etapa inclui cada um dos 4 navegadores montar a cena e
  desenhar o primeiro quadro. Ele também usa mais núcleos (10,7 em média), porque é a CPU
  fazendo o papel da placa de vídeo.
- A segunda história levou o mesmo tempo da primeira: trocar a história não encarece o render.

### Rascunhos (o que você usa enquanto conversa)

| O quê | Tempo medido |
|---|---|
| 3 quadros soltos de camadas-planas, 1920×1080 | 2,5 s |
| 3 quadros soltos de cena-3d, 1920×1080 | 7,8 s |
| filme inteiro de camadas-planas em 640×360 (300 quadros) | 5,9 s |
| todos os testes do kit (`bash tests/rodar.sh`: 14 renders curtos) | 51,5 s |

### Tamanho do que o Claude precisa escrever

| | Motor (código) | História |
|---|---|---|
| camadas-planas | 18,9 KB | 0,6 KB |
| fundo-pintado | 45,8 KB (3 arquivos) | 0,7 KB |
| cena-3d | 23,8 KB | 0,8 KB |
| marionete | 13,7 KB + ilustração de 50,8 KB | 4,1 KB |

No `fundo-pintado`, a história é cerca de **70 vezes menor** que o motor. É por isso que o método
se chama "um motor por estilo": o texto que o Claude escreve para um filme novo é uma fração do
que ele escreveu para o primeiro.

### O que NÃO foi medido

- Quanto custa, em crédito ou em token, a conversa que cria um motor. Depende do modelo, do
  plano e de quantas rodadas de conferência você deixa fazer.
- Render em outra máquina, em nuvem ou com placa de vídeo.
- O caminho híbrido (gerador de vídeo de IA): nenhum serviço foi chamado por este kit.

## As alavancas, da maior para a menor

### 1. Reaproveitar o motor
Criar o motor é a parte cara; trocar a história é barato (tabela acima). Antes de pedir um
filme, pergunte: **já tenho um motor desse estilo?**
Pedido pronto: [prompts/02-nova-historia-mesmo-motor.md](prompts/02-nova-historia-mesmo-motor.md).

### 2. Conversa nova para cada filme
O Claude relê a conversa inteira a cada resposta. Uma conversa em que o motor nasceu, com
quadros e correções, é comprida. Abra outra para a história seguinte e mande ler só o
`historia.json`.

### 3. Menos rodadas de conferência
Cada rodada é: renderizar quadros, o Claude olhar as imagens, corrigir. Olhar imagem custa.
O pedido 01 põe um **teto de 3 rodadas**; para estilo simples, peça 1 ou 2.

### 4. Rascunho pequeno
Confira em quadros soltos e em 640×360. O filme inteiro em 1920×1080 só no final. Aqui, o
rascunho do filme inteiro em 640×360 levou 5,9 s, contra 30,8 s em tamanho cheio.

### 5. Modelo mais simples para estilo simples
Formas planas e troca de história não pedem o modelo mais forte. Guarde-o para motor novo de
estilo difícil (rosto, 3D, marionete). Não medimos a diferença de custo entre modelos: teste no
seu plano com o mesmo pedido.

### 6. Mudança pequena, pedido pequeno
"Mude só a função do vento" custa menos que "melhore o filme". Diga o arquivo e a função.

### 7. Render local × nuvem
O render não usa IA: é navegador + FFmpeg. No seu computador não custa nada além de energia e
de 25 a 45 segundos por filme de 10 s (nesta máquina). Em máquina alugada você paga a hora da
máquina. Se o Claude renderiza dentro do ambiente dele (chat com execução de código), o tempo de
render entra no tempo da conversa.

### 8. Filme curto primeiro
Comece com 5 a 10 segundos. Filme longo = várias histórias curtas no mesmo motor, juntadas com o
FFmpeg (comando em [prompts/05-gastar-menos.md](prompts/05-gastar-menos.md)).

## Como medir na sua máquina

```bash
bash ferramentas/medir-tudo.sh        # renderiza os exemplos e regrava exemplos/*/medida*.json
```

Cada `medida.json` traz: tempo total e por etapa, quadros, resolução, tamanho do MP4, navegadores
em paralelo, núcleos da máquina, núcleos usados em média e pico de memória (esses dois só quando
o render roda dentro de `systemd-run --scope`, no Linux), e o renderizador de WebGL, que prova se
houve ou não placa de vídeo.
