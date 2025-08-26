# Makefile for Dharma Development

.PHONY: setup dev test migrate down

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
