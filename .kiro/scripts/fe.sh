#!/usr/bin/env bash
#
# fe.sh — jalankan frontend-exec lalu frontend-review secara berurutan.
#
#   ./.kiro/scripts/fe.sh "buatkan menu product"
#
# Tahap 1: frontend-exec (qwen3-coder-next) menulis kode.
# Tahap 2: frontend-review (claude-sonnet-5) membaca diff dan melaporkan verdict.
#
# Review SELALU dijalankan, termasuk saat exec gagal — diff parsial tetap
# berguna untuk tahu sejauh mana perubahan sudah masuk.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

if [ "$#" -eq 0 ]; then
  echo "usage: $0 \"<deskripsi tugas>\"" >&2
  exit 64
fi

TASK="$*"

# Tool yang di-trust saat non-interactive. Fence allowedPaths / allowedCommands
# di config agent tetap berlaku, jadi write hanya bisa masuk ke direktori yang
# diizinkan dan shell hanya bisa menjalankan command yang di-allowlist.
EXEC_TRUST="read,write,grep,glob,code,shell"
REVIEW_TRUST="read,grep,glob,code,shell"

hr() { printf '\n%s\n' "────────────────────────────────────────────────────────"; }

hr
echo "TAHAP 1/2 — frontend-exec"
echo "tugas: $TASK"
hr

kiro-cli chat \
  --agent frontend-exec \
  --trust-tools="$EXEC_TRUST" \
  --no-interactive \
  "$TASK"
EXEC_STATUS=$?

if [ "$EXEC_STATUS" -ne 0 ]; then
  echo >&2
  echo "!! frontend-exec keluar dengan status $EXEC_STATUS — review tetap dijalankan atas perubahan yang sudah ada." >&2
fi

hr
echo "TAHAP 2/2 — frontend-review"
hr

kiro-cli chat \
  --agent frontend-review \
  --trust-tools="$REVIEW_TRUST" \
  --no-interactive \
  "Review semua perubahan yang belum di-commit di working tree. Konteks tugas yang dikerjakan: ${TASK}. Jalankan git diff HEAD dan git status, baca juga file untracked yang relevan, lalu laporkan VERDICT beserta temuannya."
REVIEW_STATUS=$?

hr
echo "exec: status $EXEC_STATUS   |   review: status $REVIEW_STATUS"
echo "Perubahan belum di-commit. Periksa verdict di atas sebelum commit."
hr

# Status exec yang menentukan exit code, supaya kegagalan implementasi
# tidak tertutupi oleh review yang sukses.
if [ "$EXEC_STATUS" -ne 0 ]; then
  exit "$EXEC_STATUS"
fi
exit "$REVIEW_STATUS"
