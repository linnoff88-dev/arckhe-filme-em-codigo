# Limites: o que este método não faz (e por onde sair)

Filme em código é desenho feito por conta. Ele é ótimo em **estilo**, **repetição** e
**controle**. Ele é fraco em tudo o que depende de **imitar o mundo real**.

## O que não sai bem

| Você quer | O que acontece | Saída |
|---|---|---|
| **Fotorrealismo, cara de filmagem** | o código desenha formas; pele, tecido e luz reais não saem | caminho híbrido, ou filmar de verdade |
| **Rosto humano realista** | qualquer erro pequeno no rosto fica estranho; rosto estilizado (olhos grandes, poucas linhas) funciona | estilizar, ou marionete com um retrato ilustrado seu |
| **Ação complexa: luta, dança, esporte** | cada pose precisa ser descrita; o corpo não tem peso nem contato de verdade | caminho híbrido; ou Blender, com esqueleto e animação |
| **Personagem que anda, vira e pega objetos** | dá, mas cada movimento novo é código novo no motor | manter a personagem num lugar, com gestos; ou 3D com esqueleto |
| **Fala com a boca sincronizada** | o kit não faz voz nem boca | os kits irmãos tratam de voz; boca sincronizada é trabalho à parte |
| **Água, fumaça, cabelo e pano "de verdade"** | o que sai é a versão estilizada (ondas de seno, mechas) | aceitar o estilo, ou híbrido |
| **3D com material realista** | o 3D do kit é de formas simples e roda na CPU | Blender |
| **Texto longo na tela** | funciona, mas a letra depende das fontes da máquina | título curto; legenda no editor |
| **Filme longo num pedido só** | a conversa fica cara e o Claude perde o fio | várias histórias de 5 a 10 s no mesmo motor, juntadas depois |

## Limites do próprio kit

- **"Mesmo código = mesmo vídeo" vale na mesma máquina e no mesmo navegador.** Foi isso que o
  teste conferiu (3 renders separados, hash igual). Em outra máquina, a fonte de letra e a
  versão do navegador podem mudar alguns pixels.
- **O hash conferido é o dos quadros e o do som**, não o do arquivo MP4.
- **Só quatro estilos têm motor pronto e medido.** Os outros 27 da biblioteca de estilos são
  receitas para pedir o motor: ainda não foram renderizados por este kit.
- **3D pela CPU é lento para efeito pesado.** O exemplo (formas simples, uma sombra, sem efeito
  de câmera) levou 104 ms por quadro em 1920×1080, com 4 navegadores. Brilho, desfoque e
  reflexo não foram medidos e vão custar mais.
- **A marionete não inventa o que está atrás da peça.** Se a ilustração não tem a "placa" (o
  fundo pintado por trás do cabelo, do pano), aparece buraco quando a peça mexe.
- **Medido em uma máquina só** (CPU Arm de 20 núcleos, Linux). macOS e Windows não foram
  testados; o render procura o Chrome nos lugares de costume, ou em `CHROME_PATH`.
- **O caminho híbrido não foi testado.** Está documentado em
  [prompts/06-hibrido-modelo-de-video.md](prompts/06-hibrido-modelo-de-video.md); o kit não
  chama nenhum serviço.

## Saída 1 — caminho híbrido

Use o MP4 do código como **vídeo de referência** num gerador de vídeo de IA (ex.: Seedance,
Kling, Veo). O código decide composição, câmera, tempo e personagem; o gerador acrescenta
textura, luz e movimento cheio.

Você ganha acabamento. Você perde: a garantia de sair igual toda vez, e paga a geração.
Passo a passo e pedidos: [prompts/06-hibrido-modelo-de-video.md](prompts/06-hibrido-modelo-de-video.md).

## Saída 2 — Blender, para 3D realista

O Blender é um programa aberto de 3D, com materiais, luz e esqueleto de personagem de verdade.
O Claude pode escrever o **script Python** que monta a cena, ou controlar o Blender por um
conector (veja `ahujasid/mcp-for-blender` em [REFERENCIAS.md](REFERENCIAS.md)).

A ideia do motor continua valendo: um script que monta o estilo + um arquivo com o que muda.
O que muda: o render do Blender é pesado, e ali uma placa de vídeo faz muita diferença.

## Saída 3 — os kits irmãos

- Narração com voz local e imagem presa à palavra: **video-codigo**.
- Imagem, contador e som lendo a mesma lista de tempos, e série por planilha: **sincronia-em-codigo**.
- Tirar o estilo de um vídeo de referência e guardar como skill: **estilo-em-skill**.

Links no [README](README.md#kits-irmãos).

## Regra de bolso

> Se dá para **desenhar com régua, compasso e tesoura**, o código faz bem.
> Se precisa **parecer filmado**, use o código como planta e outra ferramenta como acabamento.
