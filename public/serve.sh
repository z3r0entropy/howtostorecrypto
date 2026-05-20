#!/usr/bin/env sh
# Start a tiny local web server for the How to Store Crypto offline bundle.
# Tries several runtimes in order of how likely they are to already exist.
set -e
cd "$(dirname "$0")"

PORT="${PORT:-8000}"

open_browser() {
  if command -v open >/dev/null 2>&1; then       open  "http://localhost:$PORT/" >/dev/null 2>&1 || true
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "http://localhost:$PORT/" >/dev/null 2>&1 || true
  fi
}

echo "→ How to Store Crypto · offline bundle"
echo "→ Opening http://localhost:$PORT/  (Ctrl-C to stop)"
echo

# Try the most common runtimes.
if command -v python3 >/dev/null 2>&1; then
  ( sleep 1 ; open_browser ) &
  exec python3 -m http.server "$PORT"
elif command -v python >/dev/null 2>&1; then
  ( sleep 1 ; open_browser ) &
  exec python -m http.server "$PORT"
elif command -v npx >/dev/null 2>&1; then
  ( sleep 1 ; open_browser ) &
  exec npx --yes serve -l "$PORT" .
elif command -v php >/dev/null 2>&1; then
  ( sleep 1 ; open_browser ) &
  exec php -S "localhost:$PORT"
else
  echo "No HTTP server runtime found."
  echo "Install one of: Python 3, Node.js (npx), or PHP — then re-run this script."
  exit 1
fi
