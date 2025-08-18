# Dharma

Dharma is a next-generation checkout automation and community platform, originally incubated as SNPD. It has since evolved into a broader ecosystem focused on resilient automation, decentralized/tokenized community interaction, and extensible adapters for commerce flows.

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
uvicorn services.api.main:app --reload
```

⸻

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
