# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commonly Used Commands

### Build, Run, and Test

*   `make build`: Build all Docker images.
*   `make up`: Start all services in the background using Docker Compose.
*   `make down`: Stop and remove all services.
*   `make logs`: Tail the logs of the `api` and `worker` services.
*   `make ps`: List the running services.
*   `make lint`: Run the `flake8` linter on the `api` service.
*   `make test`: Run the `pytest` test suite on the `api` service.

### Development

*   `make migrate-in`: Run database migrations within a Docker container.
*   `make seed`: Seed the database with initial data.
*   `make reset`: Reset the database by stopping, recreating, migrating, and seeding the database.
*   `make doctor`: Run a health check to ensure your environment is set up correctly.

### Running a Single Test

To run a single test, you can use the following command:

```bash
docker compose exec api pytest <path_to_test_file>
```

## High-level Code Architecture and Structure

The Dharma project is a multi-service application designed for the sneakerhead community. It combines automated checkout functionality with community-driven features.

### Services

The project is composed of the following services, orchestrated by `docker-compose.yml`:

*   **`postgres`**: The primary database for the application.
*   **`redis`**: Used for caching and as a message broker for Celery.
*   **`api`**: The main backend API, built with FastAPI.
*   **`worker`**: A Celery worker for handling background tasks.
*   **`beat`**: A Celery beat service for scheduling periodic tasks.
*   **`frontend`**: The user-facing frontend application.
*   **`prometheus`**: For collecting metrics and monitoring.
*   **`grafana`**: For visualizing metrics.

### Code Structure

The codebase is organized into the following directories:

*   **`backend`**: Contains the FastAPI application, including database models, migrations, and API endpoints.
*   **`worker`**: Contains the Celery tasks and worker configuration.
*   **`frontend`**: Contains the frontend application code.
*   **`infra`**: Contains infrastructure-related configurations, such as `prometheus.yml` and Grafana dashboards.
*   **`scripts`**: Contains various scripts for development and operational tasks.
*   **`tests`**: Contains the test suite for the application.
