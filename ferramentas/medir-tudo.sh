#!/usr/bin/env bash
# medir-tudo.sh — renderiza os 4 exemplos (e as segundas histórias) em 1920x1080 e grava
# o medida.json de cada um ao lado do motor. É assim que os números do CUSTO.md foram medidos.
#
# Uso:  bash ferramentas/medir-tudo.sh [pasta de saída]      (padrêo: saida/)
#
# No Linux com systemd, cada render roda com teto de 8 GB de memória (se passar, o render
# é interrompido em vez de travar o computador). Em outros sistemas roda sem teto.
set -euo pipefail
cd "$(dirname "$0")/.."
SAIDA="${1:-saida}"

TETO=()
if command -v systemd-run >/dev/null 2>&1 && systemd-run --user --scope -q true >/dev/null 2>&1; then
  TETO=(systemd-run --user --scope -q -p MemoryMax=8G -p MemorySwapMax=0)
fi
# opcional: um comando para ir na frente de cada render (ex.: a fila de render da sua máquina)
read -r -a PREFIXO <<< "${FILME_PREFIXO:-}"

um() { # um <exemplo> <história> <segundo da capa>
  local ex="$1" hist="$2" capa="$3" suf=""
  [ "$hist" != "historia.json" ] && suf="-${hist%.json}"
  echo "== $ex ($hist)"
  ${PREFIXO[@]+"${PREFIXO[@]}"} ${TETO[@]+"${TETO[@]}"} node ferramentas/render.mjs "exemplos/$ex" \
    --historia "$hist" --saida "$SAIDA/$ex$suf" --capa "$capa" --medida "exemplos/$ex/medida$suf.json" --apagar-quadros
}

um camadas-planas historia.json   8.0
um camadas-planas historia-2.json 8.0
um fundo-pintado  historia.json   8.2
um fundo-pintado  historia-2.json 8.2
um cena-3d        historia.json   8.6
um marionete      historia.json   8.0
echo "Terminei: medidas em exemplos/*/medida*.json e vídeos em $SAIDA/"
