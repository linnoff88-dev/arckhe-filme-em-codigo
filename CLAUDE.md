# CLAUDE.md — filme-em-codigo

Kit aberto do INEMA.CLUB: filme animado feito em código (página → quadros → som → MP4), sem
modelo de vídeo e sem placa de vídeo. Método: **um motor por estilo**. Público: quem não
programa. Tudo em português do Brasil, simples e direto.

- Motores de exemplo: `exemplos/<jeito>/` (camadas-planas, fundo-pintado, cena-3d, marionete).
  Motores novos de quem usa o kit: `meus/<nome>/`.
- O motor nunca tem a história dentro: o que muda fica em `historia.json`.
- `desenhar(t)` é conta pura (sem relógio, sem `Math.random`, sem memória entre quadros).
  Sorteio só com `Filme.sorteio(semente)`.
- Render: `node ferramentas/render.mjs <pasta> [--historia X.json] [--quadros 1,4,7]`.
  Sem dependência de npm; fala com o Chromium pelo protocolo DevTools.
- Antes de render completo: 3 quadros soltos, olhar, corrigir (no máximo 3 rodadas).
- Testes: `bash tests/rodar.sh` (offline). Todo motor novo em `exemplos/` entra na lista de `tests/testes.mjs`.
- Medidas: `bash ferramentas/medir-tudo.sh`. Só número medido entra em README, CUSTO e LIMITES.
- Nada de rede nos exemplos; biblioteca de terceiro só em `vendor/`, com a licença ao lado.
- Não commitar MP4, PNG nem WAV (`.gitignore`). Só `quadro*.jpg` pequeno por exemplo.
- Sem crédito de fonte: o kit não cita vídeo, canal, autor nem patrocinador. Links de terceiros
  só para repositórios de código aberto, em `REFERENCIAS.md` (conferidos com `gh api`).
- O kit não chama API de modelo nenhum. O caminho híbrido é só documentado.
- README em três idiomas: PT é o original; EN e ES saem do tradutor central (`inema-traduz`).
  Mudou o README.md, refaça os outros dois.
- Commits: autor `inematds <inematds@gmail.com>`. O guia (`guia/`) é feito à parte.

## Self-learning

When I correct you, or you catch yourself making a mistake: before continuing, add the lesson as a one-line rule at the TOP of [LESSONS.md](LESSONS.md) (not here), so it never happens again.

## Lessons

Lições ficam em [LESSONS.md](LESSONS.md). Antes de mexer em motor, render, som ou ilustração, rode `grep -in "<palavra>" LESSONS.md`.
