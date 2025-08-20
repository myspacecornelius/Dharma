# Makefile for SNiped Project

.PHONY: build up down logs ps lint test migrate migrate-in db-logs seed grafana doctor reset

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
	alembic -c backend/alembic.ini upgrade head

migrate-in:
	docker compose run --rm api bash -lc 'alembic -c backend/alembic.ini upgrade head'

db-logs:
	docker compose logs -f postgres

seed:
	docker compose exec api python seed.py

reset:
	docker compose down -v
	docker compose up -d
	$(MAKE) migrate-in
	$(MAKE) seed

grafana:
	@echo "Grafana is running at http://localhost:3000"
	@echo "Default login: admin / admin"

doctor:
	@./scripts/doctor.sh

all: build up