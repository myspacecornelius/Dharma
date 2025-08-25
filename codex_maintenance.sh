#!/usr/bin/env bash
set -euo pipefail

# ---- Configuration ----------------------------------------------------------
export UV_HTTP_TIMEOUT=300
export UV_CONCURRENCY=4

# ---- Helper function to detect changes in dependency files ------------------
changed () {
  local key="$1"; shift
  local tmp_dir=".codex-checksums"; mkdir -p "$tmp_dir"
  local sumfile="$tmp_dir/${key}.sha256"
  
  # Calculate current checksum
  local current_sum
  current_sum=$(cat "$@" 2>/dev/null | sha256sum | awk '{print $1}' || echo "none")
  
  # Get previous checksum
  local previous_sum
  previous_sum=$(cat "$sumfile" 2>/dev/null || echo "none")
  
  # Compare and update if changed
  if [[ "$current_sum" != "$previous_sum" ]]; then
    echo "$current_sum" > "$sumfile"
    return 0 # Indicates a change
  else
    return 1 # No change
  fi
}

# ---- Python Dependency Maintenance ------------------------------------------
echo "▶ Checking Python dependencies..."
PYTHON_SERVICES=("backend" "worker" "services/api")
for SVC in "${PYTHON_SERVICES[@]}"; do
  if [ -d "$SVC" ] && [ -f "$SVC/requirements.txt" ]; then
    if changed "${SVC//\//_}_reqs" "$SVC/requirements.txt"; then
      echo "  - Changes detected in $SVC/requirements.txt. Installing..."
      VENV_PATH="$SVC/.venv/bin/activate"
      if [ -f "$VENV_PATH" ]; then
        source "$VENV_PATH"
        for i in 1 2; do
          if uv pip install -r "$SVC/requirements.txt"; then break; fi
          echo "    uv install for $SVC failed (attempt $i). Retrying..."
          sleep 3
        done
        deactivate || true
      else
        echo "    Warning: Virtual environment for $SVC not found. Skipping."
      fi
    else
      echo "  - No changes in $SVC dependencies."
    fi
  fi
done

# ---- Frontend Dependency Maintenance ----------------------------------------
echo "▶ Checking frontend dependencies..."
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
  if [ -f "frontend/pnpm-lock.yaml" ] && changed "frontend_pnpm_lock" "frontend/pnpm-lock.yaml"; then
    echo "  - pnpm lockfile changed. Installing..."
    (cd frontend && pnpm install --frozen-lockfile || pnpm install)
  elif [ -f "frontend/package-lock.json" ] && changed "frontend_npm_lock" "frontend/package-lock.json"; then
    echo "  - npm lockfile changed. Attempting to install..."
    if (cd frontend && npm ci); then
        echo "    'npm ci' succeeded."
    else
        echo "    'npm ci' failed. Falling back to a clean 'npm install'."
        (cd frontend && rm -rf node_modules && npm install)
    fi
  else
      echo "  - No changes in frontend dependencies."
  fi
fi

# ---- Database Migrations (Alembic) ------------------------------------------
echo "▶ Checking for database migrations..."
if [ -d "backend" ] && [ -f "backend/alembic.ini" ]; then
  VENV_PATH="backend/.venv/bin/activate"
  if [ -f "$VENV_PATH" ]; then
    echo "  - Running Alembic migrations for 'backend'..."
    source "$VENV_PATH"
    (cd backend && alembic upgrade head || echo "    Alembic upgrade failed, but continuing.")
    deactivate || true
  else
    echo "  - Warning: Virtual environment for 'backend' not found. Skipping migrations."
  fi
fi

echo "✅ Maintenance complete."
