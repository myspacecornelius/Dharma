# Dharma

[![Python Version](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/release/python-3110/)
[![CI](https://github.com/myspacecornelius/Dharma/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/myspacecornelius/Dharma/actions/workflows/ci-cd.yml)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/myspacecornelius/Dharma)

Dharma

Dharma is an in-development platform for the sneakerhead community — built to go beyond bots.
It’s designed as the backbone of a next-generation sneakerhead network: combining the speed of automated checkout with the culture of cook groups, hyperlocal feeds, and tokenized participation.

The project combines robust tooling (checkout orchestration, anti-bot hygiene, adapters for multiple sites) with a roadmap for community governance and tokenized incentives, enabling users to participate in and benefit from the ecosystem they help power.

⸻

## 🚀 Project Overview

* **Core Purpose**: Automate checkout and carting flows with extensibility across retailers, while providing a community-driven, privacy-conscious backbone.
* **Vision**: Move beyond isolated automation scripts toward a production-ready framework that supports decentralized community participation, token incentives, and a plug-and-play adapter architecture.
* **Key Concepts**:
  * Checkout orchestration with retries, logging, and error handling
  * Multi-SKU carting and simulation harnesses
  * Adapter registry for new site integrations
  * Tokenized community environment for contribution and governance

⸻

## 🛠️ Technical Overview

Dharma is structured around modular services and tools:

* `services/`: Contains core checkout orchestration, adapters, and APIs.
  * `checkout/` – orchestrates carting, retries, error handling
  * `adapters/` – site-specific integrations for automated checkout
  * `community/` – backend for decentralized/tokenized participation (in-progress scaffolding)
* `tools/`: Utilities for CLI operations, testing harnesses, and adapter debugging.
* `tests/`: Unit and integration test suites (with TODOs for adapter simulation tests).
* `workflows/`: CI/CD, health checks, and resilience scaffolds for automated deployment.

⸻

## ⚙️ Tech Stack

* **Languages**: Python (services, tools, adapters), JavaScript/TypeScript (front-end + future dashboard)
* **Frameworks / Libraries**:
  * FastAPI / Flask (backend services)
  * Playwright / Puppeteer (browser automation, checkout simulation)
  * Pytest (testing suite)
* **Infrastructure**: Dockerized services, GitHub Actions workflows

⸻

## 📋 Requirements

* Python 3.11+
* Node.js 20+ (for future front-end scaffolds & tooling)
* Docker (recommended for containerized runs)
* Git

⸻

## ☁️ Development with GitHub Codespaces

This repository is configured for [GitHub Codespaces](https://github.com/features/codespaces) to provide a ready-to-use development environment.

To get started:

1. Click the "Code" button on the repository's page and select "Open with Codespaces".
2. Once the Codespace is created, it will automatically install all dependencies.
3. When the setup is complete, run the services with one command:

```bash
make up
```

Your development environment is now running!

⸻

## 🚀 Running the Project

This project can be run in different environments. Here's a quick comparison:

| Environment      | Setup                                                     | Use Case                               |
| ---------------- | --------------------------------------------------------- | -------------------------------------- |
| **GitHub Codespaces** | Easiest. Click "Open in Codespaces".                      | Quick start, standardized dev env.     |
| **Docker**       | `docker compose up`. Requires Docker Desktop.             | Local dev, simulates production.       |
| **Local Host**   | `pip install`, run services manually. Requires Python/DB. | Advanced debugging, custom setups.     |

### Key Commands

This project uses a `Makefile` to simplify common tasks. Here are the most important commands:

| Command         | Description                                                                              |
| --------------- | ---------------------------------------------------------------------------------------- |
| `make up`       | Starts all services (API, worker, etc.) in the background using Docker Compose.          |
| `make migrate`  | Applies database migrations. Run this after changing models.                             |
| `make doctor`   | Runs a health check to ensure your environment is set up correctly.                      |
| `make test`     | Runs the backend test suite using `pytest`.                                              |

⸻

## 🔧 Setup & Installation

Clone the repository:

```bash
git clone https://github.com/myspacecornelius/Dharma.git
cd Dharma
```

Set up a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Install Node dependencies (optional, for UI/dev tools):

```bash
npm install
```

Run services locally:

```bash
uvicorn backend.main:app --reload
```

⸻

## 📄 Environment Setup

This project requires environment variables to configure database, cache, and API access. Copy `.env.example` to `.env` and fill in the appropriate values for your setup.

| Variable              | Description                                 | Consumed By            |
| --------------------- | ------------------------------------------- | ---------------------- |
| `POSTGRES_USER`       | Database username                           | API, Worker (DB)       |
| `POSTGRES_PASSWORD`   | Database password                           | API, Worker (DB)       |
| `POSTGRES_DB`         | Database name                               | API, Worker (DB)       |
| `DATABASE_URL`        | Full SQLAlchemy URL                         | API (FastAPI), Worker  |
| `REDIS_URL`           | Redis connection string                     | API, Worker (queue)    |
| `API_PORT`            | Port for running the FastAPI service        | API                    |
| `FRONTEND_PORT`       | Port for the Vite frontend dev server       | Frontend               |
| `GEMINI_API_KEY`      | External Gemini API key (if integrating AI) | API, Worker            |

➡️ See `.env.example` in the repository root for the canonical template.

## Frontend Quickstart

To run the frontend development server:

```bash
cd frontend
npm install
npm run dev
```

## UI Features

The current UI is built with React, Vite, and Tailwind CSS. It includes the following features:

*   **Hyperlocal Feed**: A feed of sneaker drops and other community activity.
*   **Quest Board**: A list of tasks that users can complete to earn rewards.
*   **Drops Hub**: A calendar of upcoming sneaker drops and a "War Room" for real-time chat and status updates.
*   **Map**: A map view of stores and events. **Note**: This is currently a placeholder. A map library like `react-leaflet` needs to be installed and configured.
*   **Wallet**: A slide-in drawer that displays the user's coin balance, boosts, and bounties.

## 💻 Key Commands & Usage

Run checkout flow with a given adapter:

```bash
python tools/run_checkout.py --site nike --sku 12345
```

Run adapter simulation (browser-mode):

```bash
python tools/simulate_checkout.py --site adidas --dry-run
```

Run tests:

```bash
pytest tests/
```

Build & run Docker services:

```bash
docker compose up --build
```

⸻

## 🧩 Development Guide

### Adding a New Adapter

1. Create a new file under `services/checkout/adapters/`.
2. Implement required methods (`add_to_cart`, `checkout`, `handle_captcha`, etc.).
3. Register the adapter in the adapter registry (`services/checkout/registry.py`).
4. Write simulation + test cases in `tests/adapters/`.

### Resilience Features

* Built-in retries with exponential backoff
* Configurable timeouts
* Logging hooks for CI/CD monitoring

### Anti-Bot Hygiene

* Human-like browser flows (Playwright scaffolding)
* Proxy rotation and rate limiting
* TODO: Machine-learning-based request pattern randomization

⸻

## 🌐 Community & Tokenization Roadmap

The Dharma roadmap includes evolving into a tokenized community environment:

* **Contribution Rewards**: Developers earn tokens for new adapters, bug fixes, and infrastructure improvements.
* **Governance**: Token-holders influence feature priorities and community rules.
* **Marketplace**: Potential for decentralized exchange of adapters, tools, or community services.

Current Status: Backend scaffolds (`services/community/`) are live; tokenized logic remains TODO with smart contract stubs to be introduced.
