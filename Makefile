# Makefile for Dharma Development

.PHONY: doctor setup dev test migrate down logs

doctor:
	@test -f .env || (echo "Missing .env. Run: cp .env.example .env && edit secrets"; exit 1)
	@docker info >/dev/null
	@echo "Doctor OK"

setup:
	@echo "Setting up environment files..."
	@cp .env.example .env
	@./scripts/bootstrap_envs.sh

dev:
	@echo "Starting services..."
	@docker-compose up -d --build

test:
	@echo "Running frontend tests..."
	@npm run test --workspace=frontend

migrate:
	@echo "Running database migrations..."
	@docker-compose exec api alembic upgrade head

down:
	@echo "Stopping and removing containers..."
	@docker-compose down

logs:
	@docker-compose logs -f --tail=200
