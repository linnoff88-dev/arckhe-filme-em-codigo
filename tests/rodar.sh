#!/usr/bin/env bash
# Roda todos os testes do kit (sem internet). Uso: bash tests/rodar.sh
set -euo pipefail
cd "$(dirname "$0")/.."
node tests/testes.mjs
