# Makefile for SNiped Project

.PHONY: build up down logs ps lint test migrate seed grafana

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down -v

logs:
	docker compose logs -f api worker

ps:
	docker compose ps

lint:
	docker compose exec api flake8 .

test:
	docker compose exec api pytest .

migrate:
	docker compose exec api alembic upgrade head

seed:
	docker compose exec api python seed.py

grafana:
	@echo "Grafana is running at http://localhost:3000"
	@echo "Default login: admin / admin"

all: build up