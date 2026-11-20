# Medinexa AI
### AI-Powered First Aid, Hospital Discovery, Doctor Appointment & Telehealth Platform

> **Clinical Disclaimer**: Medinexa AI is a health navigation prototype. It does not provide medical diagnoses or replace emergency medical responders. In acute emergencies in Bangladesh, immediately call **999**.

---

## 🚀 Key Features

1. **Multimodal Injury & Symptom Triage**:
   - Describe injuries via text, speech dictation (Web Speech API), or photo upload.
   - Deterministic safety triage engine detects red flags (cardiac arrest, arterial bleeding, convulsions, stroke).
   - Generates cautious first-aid steps, visual observations, limitations, and warning signs.
2. **Hospital & Emergency Discovery**:
   - Geolocation-based distance calculation for medical centers in Bangladesh.
   - Filter by government vs. private facilities, emergency care capability, and department specialties.
   - Instant navigation via Google Maps integration.
3. **Verified Doctor Appointment Booking**:
   - Search certified specialists (Cardiology, Dermatology, Orthopedics, Pediatrics, etc.).
   - Conflict-free slot booking with database overlap prevention.
4. **AI Telehealth Assistant**:
   - Conversational assistant for symptom intake and specialist recommendation.
   - Demo consultation room entrance.
5. **Three Role-Based Dashboards (RBAC)**:
   - **User Dashboard**: Overview, assessment history, appointment tracking, profile settings.
   - **Doctor Dashboard**: Manage appointment queue (confirm/decline/complete), view patient reasons, schedule availability.
   - **Admin Dashboard**: Audit logs, user activation/suspension, doctor credential verification, hospital management.

---

## 🔑 Demo Credentials (Development & Review)

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Patient / User** | `user@medinexa.ai` | `User123!` | Injury assessment, hospital search, appointment booking |
| **Doctor** | `doctor@medinexa.ai` | `Doctor123!` | Appointment queue, status updates, consultation desk |
| **Administrator** | `admin@medinexa.ai` | `Admin123!` | System stats, verify doctors, hospital management, audit logs |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Next.js App Router, JavaScript/JSX, Tailwind CSS, DaisyUI, Lucide Icons.
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy Async, SQLite (aiosqlite), Pydantic v2, JWT (python-jose), Bcrypt.
- **ML & Triage**: Custom Rule-based Clinical Triage Engine & Vision Assessment Prototype.
- **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD workflows.

---

## ⚡ Quick Start

### Option A: Local Development
```bash
# 1. Start Backend
cd backend
python -m pip install -r requirements.txt
python scripts/seed.py
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# 2. In a separate terminal, start Frontend
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

### Option B: Docker Compose
```bash
docker-compose up --build
```
Open **http://localhost:3000** in your browser.
