from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# --- Enums ---
class UserRole(str, Enum):
    USER = "user"
    DOCTOR = "doctor"
    ADMIN = "admin"


class UrgencyLevel(str, Enum):
    EMERGENCY = "emergency"
    URGENT = "urgent"
    NON_URGENT = "non_urgent"
    INFO_ONLY = "info_only"


class AppointmentStatus(str, Enum):
    REQUESTED = "requested"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    RESCHEDULE_REQUESTED = "reschedule_requested"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"


# --- Auth ---
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)
    full_name: str = Field(min_length=2, max_length=255)
    phone: Optional[str] = None
    role: UserRole = UserRole.USER
    country: str = "BD"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    country: str
    language: str
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshRequest(BaseModel):
    refresh_token: str


# --- User ---
class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None


class DashboardStats(BaseModel):
    upcoming_appointments: int = 0
    total_assessments: int = 0
    saved_hospitals: int = 0
    unread_notifications: int = 0


# --- Specialty ---
class SpecialtyResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None

    class Config:
        from_attributes = True


# --- Doctor ---
class DoctorProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str = ""
    email: str = ""
    specialty: Optional[SpecialtyResponse] = None
    hospital_name: Optional[str] = None
    hospital_id: Optional[int] = None
    qualifications: Optional[str] = None
    experience_years: int = 0
    languages: str = "English"
    consultation_modes: str = "in_person,telehealth"
    bio: Optional[str] = None
    consultation_fee: Optional[float] = None
    is_verified: bool = False
    verification_status: str = "pending"
    is_demo: bool = True
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class DoctorUpdateRequest(BaseModel):
    qualifications: Optional[str] = None
    experience_years: Optional[int] = None
    languages: Optional[str] = None
    consultation_modes: Optional[str] = None
    bio: Optional[str] = None
    consultation_fee: Optional[float] = None
    specialty_id: Optional[int] = None
    hospital_id: Optional[int] = None


class DoctorAvailabilityResponse(BaseModel):
    id: int
    doctor_id: int
    day_of_week: int
    start_time: str
    end_time: str
    is_available: bool
    slot_duration_minutes: int = 30

    class Config:
        from_attributes = True


class AvailabilityUpdateRequest(BaseModel):
    day_of_week: int = Field(ge=0, le=6)
    start_time: str
    end_time: str
    is_available: bool = True
    slot_duration_minutes: int = 30


# --- Hospital ---
class HospitalResponse(BaseModel):
    id: int
    name: str
    address: str
    city: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    facility_type: str
    specialties: Optional[str] = None
    departments: Optional[str] = None
    emergency_services: bool = False
    bed_count: Optional[int] = None
    is_active: bool = True
    is_demo: bool = True
    source: str = "Demo Data"
    last_verified: Optional[datetime] = None
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True


class HospitalCreateRequest(BaseModel):
    name: str = Field(min_length=2)
    address: str
    city: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    facility_type: str = "government"
    specialties: Optional[str] = None
    departments: Optional[str] = None
    emergency_services: bool = False
    bed_count: Optional[int] = None


class HospitalUpdateRequest(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    facility_type: Optional[str] = None
    specialties: Optional[str] = None
    departments: Optional[str] = None
    emergency_services: Optional[bool] = None
    bed_count: Optional[int] = None
    is_active: Optional[bool] = None


# --- Appointment ---
class AppointmentCreateRequest(BaseModel):
    doctor_id: int
    date_time: datetime
    consultation_type: str = "in_person"
    reason: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    patient_name: str = ""
    doctor_name: str = ""
    specialty: str = ""
    date_time: datetime
    end_time: datetime
    consultation_type: str
    status: str
    reason: Optional[str] = None
    notes: Optional[str] = None
    is_demo: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus
    notes: Optional[str] = None


# --- Assessment ---
class AssessmentCreateRequest(BaseModel):
    description: str = Field(min_length=5)


class AssessmentResponse(BaseModel):
    id: int
    user_id: int
    description: str
    image_path: Optional[str] = None
    urgency: str
    ai_response: Optional[str] = None
    observations: Optional[str] = None
    limitations: Optional[str] = None
    next_steps: Optional[str] = None
    first_aid: Optional[str] = None
    warning_signs: Optional[str] = None
    model_version: str = "demo-v1.0"
    is_demo: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Chat ---
class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    session_id: Optional[str] = None


class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    session_id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    suggested_doctors: Optional[List[DoctorProfileResponse]] = None
    is_emergency: bool = False
    emergency_message: Optional[str] = None


# --- Notification ---
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    link: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Admin ---
class AdminDashboardStats(BaseModel):
    total_users: int = 0
    total_doctors: int = 0
    total_appointments: int = 0
    pending_verifications: int = 0
    total_hospitals: int = 0
    total_assessments: int = 0


class DoctorVerifyRequest(BaseModel):
    status: str  # approved or rejected
    notes: Optional[str] = None


class UserStatusUpdate(BaseModel):
    is_active: bool


class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Paginated ---
class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    per_page: int
    pages: int
