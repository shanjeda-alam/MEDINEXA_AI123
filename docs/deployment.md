# Medinexa AI — Deployment Guide

## Prerequisites
- Docker Engine 24+ & Docker Compose v2+ OR
- Python 3.10+ and Node.js 18+

## Local Quickstart (Bare Metal)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python scripts/seed.py
uvicorn app.main:app --reload --port 8000
```
Backend API and Swagger UI will be running at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
# Windows PowerShell: Copy-Item .env.example .env.local
# Linux/macOS:
cp .env.example .env.local
npm run dev
```
Frontend web application will be live at `http://localhost:3000`. The default API URL is `http://localhost:8000/api/v1`; set `NEXT_PUBLIC_API_URL` in `.env.local` if the backend runs elsewhere.

---

## Docker Compose Quickstart (Single Command)
To run the full stack (FastAPI Backend + React Frontend + Seeded SQLite):
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`
