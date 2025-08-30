# Makefile for Dharma Development

.PHONY: doctor setup build dev test migrate down logs

doctor:
	@test -f .env || (echo "Missing .env. Run: cp .env.example .env && edit secrets"; exit 1)
	@docker info >/dev/null
	@echo "Doctor OK"

setup:
	@echo "Setting up environment files..."
	@cp .env.example .env
	@./scripts/bootstrap_envs.sh

build:
	@echo "Building services..."
	@docker compose build --no-cache

dev:
	@echo "Starting services..."
	@docker compose up -d

test:
	@echo "Running frontend tests..."
	@npm run test --workspace=frontend

migrate:
	@echo "Running database migrations..."
	@docker compose exec -w /app/backend api alembic upgrade head

down:
	@echo "Stopping and removing containers..."
	@docker compose down

logs:
	@docker compose logs -f --tail=200
