# Medinexa AI — System Architecture

## Overview
Medinexa AI is designed as a modular full-stack digital health application combining emergency triage, place/hospital discovery, verified physician appointments, and multimodal AI-assisted preliminary injury assessments.

```
+-----------------------------------------------------------+
|                     Client Layer                          |
|   Next.js App Router + React 19 + JSX + Tailwind/DaisyUI  |
|    - User Dashboard   - Doctor Dashboard   - Admin Suite  |
+-----------------------------------------------------------+
                             |
                   HTTP / REST API (JWT)
                             v
+-----------------------------------------------------------+
|                    FastAPI Backend                        |
|  - Auth & RBAC Middleware  - Appointment Conflict Guard   |
|  - Hospital Geo Service    - Triage Rules Safety Layer    |
+-----------------------------------------------------------+
          |                                  |
          v                                  v
+--------------------+             +--------------------+
|  SQLite / Postgres |             |   ML & Triage Hub  |
|  (SQLAlchemy ORM)  |             |  - Keyword Engine  |
|  - Verified Slots  |             |  - Vision Model    |
|  - Audit Log Trail |             |  - Emergency 999   |
+--------------------+             +--------------------+
```

## Security & Privacy Highlights
- **RBAC Enforcement**: Server-side role validation on every endpoint.
- **Password Protection**: Passwords salted and hashed with bcrypt.
- **Double Booking Guard**: Atomic overlap checks prevent conflicting doctor schedules.
- **Metadata Sanitization**: Uploaded injury photographs have EXIF & geolocation stripped prior to storage.
- **Demo Mode Transparency**: Seeded non-production records are explicitly tagged with `is_demo=True`.
