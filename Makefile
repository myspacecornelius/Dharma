.PHONY: help setup dev build up down logs clean test lint migrate seed grafana

help:
	@echo "Usage: make [target]"
	@echo "Targets:"
	@echo "  setup          - Set up the project for the first time"
	@echo "  build          - Build all docker images"
	@echo "  up             - Start all services in detached mode"
	@echo "  down           - Stop all services"
	@echo "  logs           - Tail logs for api and worker services"
	@echo "  clean          - Stop and remove all containers, networks, and volumes"
	@echo "  lint           - Run flake8 linter in all python services"
	@echo "  test           - Run pytest in api and monitor containers"
	@echo "  migrate        - Run database migrations"
	@echo "  seed           - Seed the database with demo data"
	@echo "  grafana        - Display Grafana login info"

setup:
	@echo "Setting up project..."
	@cp .env.example .env
	@docker compose build
	@docker compose up -d postgres redis
	@echo "Waiting for postgres to be healthy..."
	@sleep 5
	make migrate

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f api worker

clean:
	docker compose down -v --remove-orphans

lint:
	docker compose exec api flake8 .
	docker compose exec monitor flake8 .
	docker compose exec checkout flake8 .
	docker compose exec worker flake8 .

test:
	docker compose exec api pytest

migrate:
	docker compose exec api alembic upgrade head

seed:
	docker compose exec api python scripts/seed.py

grafana:
	@echo "Grafana URL: http://localhost:3000"
	@echo "User: admin"
	@echo "Password: admin"
