# SneakerSniper Bot Engine - Optimized Architecture

A high-performance, microservices-based sneaker bot platform designed for speed, scalability, and observability.

## ✨ Features

-   **Microservices Architecture:** Independent services for API, monitoring, and checkout, enabling scalability and resilience.
-   **Dual-Mode Checkout:** Supports both fast `request` mode and robust `browser` mode (via Playwright) for bypassing anti-bot measures.
-   **Natural Language Commands:** An intuitive chat-based interface to control the bot.
-   **Real-time Monitoring:** High-frequency product stock monitoring with WebSocket updates to the frontend.
-   **Comprehensive Observability:** Pre-configured Grafana dashboards for monitoring system health and performance metrics via Prometheus.
-   **Secure by Design:** End-to-end encryption for sensitive profile data like credit card numbers.

## 🚀 Technology Stack

-   **Frontend:** React (TypeScript)
-   **Backend:** Python, FastAPI (API Gateway), Celery (Task Queue)
-   **Database:** PostgreSQL (for persistent data like profiles and orders)
-   **Cache & Message Broker:** Redis
-   **Containerization:** Docker & Docker Compose
-   **Observability:** Prometheus & Grafana

## 🏗️ Project Structure

```
.
├── frontend/         # React frontend application
├── infra/            # Prometheus & Grafana configurations
├── services/
│   ├── api/          # FastAPI gateway, handles all client requests
│   ├── checkout/     # Manages and executes checkout tasks
│   ├── monitor/      # Runs high-frequency stock monitors
│   └── ...
├── worker/           # Celery worker for background processing
├── docker-compose.yml # Defines all services for local development
├── setup.sh          # Initialization script
└── README.md         # You are here
```

## 🏁 Quick Start

Follow these steps to get the entire platform running on your local machine.

### Prerequisites

-   Docker
-   Docker Compose

### 1. Setup

Run the setup script to initialize the environment. This will create a `.env` file from the example and prepare service directories.

```bash
./setup.sh
```

### 2. Configuration

The `setup.sh` script creates a `.env` file. You **must** edit this file to provide the necessary secrets.

-   **Generate an Encryption Key:** The checkout service requires a secret key to encrypt user profiles. Generate one and add it to your `.env` file.

    ```bash
    # Run this once and copy the output to ENCRYPTION_KEY in .env
    python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    ```

### 3. Launch Services

Build and launch all services using Docker Compose. The `Makefile` provides a convenient shortcut.

```bash
docker-compose up --build -d
```

You can view logs for all services with `docker-compose logs -f`.

## 💻 Usage

Once the services are running, you can access the different parts of the platform.

### Access Points

-   **Frontend UI:** http://localhost:5173
    -   This is the main control center. Use the chat interface to issue commands.
-   **API Gateway:** http://localhost:8000/docs
    -   Interactive API documentation (Swagger UI).
-   **Grafana Dashboards:** http://localhost:3000
    -   Login with `admin` / `admin`.
    -   View pre-configured dashboards for system health and checkout metrics.

### Example Commands

Interact with the bot using natural language in the frontend chat window:

-   `monitor travis scott jordan 1 low`
-   `run 100 checkouts using main-profile`
-   `clear all tasks`
-   `what is the current success rate?`

## 🔧 Development

-   **Live Reload:** The FastAPI (`api`) service is configured with live reload. Any changes to the code in `services/api/` will automatically restart the service.
-   **Stopping Services:** To stop all running containers, run `docker-compose down`.
-   **Viewing Logs:** To view logs from a specific service, use `docker-compose logs -f <service_name>`, e.g., `docker-compose logs -f checkout`.
