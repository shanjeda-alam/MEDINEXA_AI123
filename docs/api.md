# Medinexa AI — REST API Documentation

Base URL: `/api/v1`

## API Groups

### 1. Health
- `GET /health/` — System status and demo mode indicator.

### 2. Authentication (`/auth`)
- `POST /auth/register` — Register a new patient or doctor account.
- `POST /auth/login` — Authenticate and receive Access & Refresh JWTs.
- `POST /auth/refresh` — Issue new access token using refresh token.
- `GET /auth/me` — Retrieve active authenticated user session.

### 3. Users (`/users`)
- `GET /users/profile` — Fetch profile details.
- `PUT /users/profile` — Update name, phone, emergency country.
- `GET /users/dashboard` — Fetch patient summary metrics.

### 4. Doctors (`/doctors`)
- `GET /doctors/` — Query verified doctors with filters (specialty, city, mode).
- `GET /doctors/{id}` — Doctor credential & profile detail.
- `GET /doctors/{id}/availability` — Available consultation slots.
- `PUT /doctors/profile` — Update professional bio and consultation fee.
- `GET /doctors/appointments/list` — Doctor's incoming patient queue.
- `PUT /doctors/appointments/{id}/status` — Accept, reject, or complete booking.

### 5. Hospitals (`/hospitals`)
- `GET /hospitals/` — Filter facilities by city, government/private, or GPS radius.
- `GET /hospitals/{id}` — Hospital profile, departments, and phone contact.

### 6. Appointments (`/appointments`)
- `POST /appointments/` — Book a consultation slot (with overlap conflict prevention).
- `GET /appointments/` — Retrieve user's personal booking history.
- `PUT /appointments/{id}/cancel` — Cancel pending/confirmed consultation.

### 7. Assessments (`/assessments`)
- `POST /assessments/` — Submit symptom description and optional injury photograph.
- `GET /assessments/` — History of preliminary assessments.
- `GET /assessments/{id}` — Detailed triage result with first-aid instructions.

### 8. Telehealth (`/telehealth`)
- `POST /telehealth/chat` — Conversational assistant with red-flag detection and doctor suggestion.
- `GET /telehealth/chat/history` — Session message logs.

### 9. Admin (`/admin`)
- `GET /admin/dashboard` — Global platform statistics.
- `GET /admin/users` — User directory management.
- `PUT /admin/users/{id}/status` — Suspend or activate accounts.
- `GET /admin/doctors/pending` — Doctor license applications awaiting verification.
- `PUT /admin/doctors/{id}/verify` — Approve or reject doctor verification.
- `POST /admin/hospitals` — Add new hospital facility.
- `GET /admin/audit-logs` — System security audit trail.
