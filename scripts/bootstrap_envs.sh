#!/usr/bin/env bash
set -euo pipefail

mkdir -p frontend
if [ ! -f frontend/.env ]; then
  cat > frontend/.env <<'EOF'
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
VITE_ENV=local
EOF
  echo "Created frontend/.env"
fi

for f in backend/.env services/.env services/api/.env; do
  if [ -f "${f}.example" ] && [ ! -f "$f" ]; then
    cp "${f}.example" "$f"
    echo "Created $f from ${f}.example"
  fi
done
