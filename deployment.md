# SNPD Deployment Guide

## 🚀 Overview
This guide explains how to set up and run the SNPD platform locally or in a containerized environment. It reflects the **current SNPD stack** (API service, adapters, optional frontend) and trims legacy Sniped-era details.

---

## 📋 Requirements
- Python 3.11+
- Node.js 20+ (optional frontend/dashboard)
- Docker & Docker Compose
- Git

---

## 🔧 Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/myspacecornelius/SNPD.git
cd SNPD
```

### 2. Environment setup
```bash
cp .env.example .env
# Edit .env with your local configuration
# (API keys, database URLs, etc.)
```

### 3. Python environment
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 4. Optional frontend
```bash
cd frontend
npm install
npm run dev   # or npm run build for production
```

---

## ▶️ Running SNPD

### Local run (API only)
```bash
uvicorn services.api.main:app --reload
```

### Dockerized run
```bash
docker compose up --build
```

---

## 🧪 Testing
```bash
pytest tests/
```

---

## 🌐 Deployment Notes
- API runs by default on port `8000`.
- Frontend (if enabled) runs on `5173`.
- Docker Compose handles multi-service orchestration.
- Monitoring/metrics can be layered in via Prometheus/Grafana if desired, but are not required for core usage.

---

_Last Updated: August 2025_
