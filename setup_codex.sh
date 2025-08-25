#!/usr/bin/env bash
set -euo pipefail

# ---- BASE VERSIONS (tweak if you need different) ----------------------------
PY_VERSION="${PY_VERSION:-system}"   # <— use the preinstalled 3.12
NODE_MAJOR="${NODE_MAJOR:-20}"

# ---- OS deps ----------------------------------------------------------------
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends \
  build-essential python3 python3-venv python3-dev \
  curl git ca-certificates pkg-config libpq-dev \
  openssl jq
rm -rf /var/lib/apt/lists/*

# ---- Node.js (for frontend) -------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash -
  apt-get update && apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*
fi
# enable package managers
corepack enable || true

# ---- Python: prefer uv, else venv -------------------------------------------
if ! command -v uv >/dev/null 2>&1; then
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
fi

# ---- Repo bootstrap ---------------------------------------------------------
# If Codex already cloned the repo, we are in it. Otherwise clone defensively.
if [ ! -f ".git/config" ] && [ -n "${GIT_REPO_URL:-}" ]; then
  git clone --depth=1 "$GIT_REPO_URL" .
fi

# Copy .env.example → .env where missing (root + common services)
copy_env () {
  local dir="$1"
  if [ -f "$dir/.env.example" ] && [ ! -f "$dir/.env" ]; then
    cp "$dir/.env.example" "$dir/.env"
  fi
}
copy_env "."
copy_env "backend"
copy_env "worker"
copy_env "services/api"
copy_env "frontend"

# ---- Python services install ------------------------------------------------
# Add/trim paths to match your monorepo
SERVICES=(
  "backend"
  "worker"
  "services/api"
)

for SVC in "${SERVICES[@]}"; do
  if [ -d "$SVC" ]; then
    echo "▶ Python setup in $SVC"
    cd "$SVC"

    if [ -f "requirements.txt" ]; then
      python3 -m venv .venv
      . .venv/bin/activate
      python -m pip install -U pip
      # Resilient uv install with retries
      export UV_HTTP_TIMEOUT=600
      export UV_CONCURRENCY=4
      for i in 1 2 3; do
        if uv pip install -r requirements.txt; then break; fi
        echo "uv install failed (attempt $i). Retrying..."
        sleep $((i*3))
      done
      deactivate
    elif [ -f "pyproject.toml" ]; then
      python3 -m venv .venv
      . .venv/bin/activate
      python -m pip install -U pip
      for i in 1 2 3; do
        if uv pip install -e .; then break; fi
        echo "uv install failed (attempt $i). Retrying..."
        sleep $((i*3))
      done
      deactivate
    fi
    cd - >/dev/null
  fi
done

# ---- Frontend install -------------------------------------------------------
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
  echo "▶ Node setup in frontend"
  cd frontend
  # prefer lockfile if present; pnpm is fastest when lock present
  if [ -f "pnpm-lock.yaml" ]; then
    corepack prepare pnpm@latest --activate || true
    pnpm install --frozen-lockfile || pnpm install
  elif [ -f "package-lock.json" ]; then
    echo "  - npm lockfile found. Attempting to install..."
    if npm ci; then
        echo "    'npm ci' succeeded."
    else
        echo "    'npm ci' failed. Falling back to a clean 'npm install'."
        rm -rf node_modules
        npm install
    fi
  else
    npm install
  fi
  cd - >/dev/null
fi

# ---- Optional DB migration hooks (only run if present) ----------------------
# Alembic: backend
if [ -d "backend" ] && [ -f "backend/alembic.ini" ]; then
  echo "▶ Alembic migrate"
  . backend/.venv/bin/activate
  cd backend
  alembic upgrade head || true
  cd - >/dev/null
  deactivate || true
fi

# ---- Developer hints --------------------------------------------------------
cat <<'EOF'

✅ Setup complete.

Python envs live at: <service>/.venv
Handy commands (from repo root):

# API (FastAPI example):
source backend/.venv/bin/activate && uvicorn app:app --reload

# Worker:
source worker/.venv/bin/activate && python -m worker

# Frontend:
cd frontend && npm run dev    # or: npm run build && npm run preview

EOF
