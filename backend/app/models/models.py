from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey, Enum as SAEnum, Time
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    USER = "user"
    DOCTOR = "doctor"
    ADMIN = "admin"


class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class AppointmentStatus(str, enum.Enum):
    REQUESTED = "requested"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    RESCHEDULE_REQUESTED = "reschedule_requested"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"


class UrgencyLevel(str, enum.Enum):
    EMERGENCY = "emergency"
    URGENT = "urgent"
    NON_URGENT = "non_urgent"
    INFO_ONLY = "info_only"


class FacilityType(str, enum.Enum):
    GOVERNMENT = "government"
    PRIVATE = "private"


class ConsultationType(str, enum.Enum):
    IN_PERSON = "in_person"
    TELEHEALTH = "telehealth"


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(String(20), nullable=False, default=UserRole.USER.value)
    country = Column(String(10), default="BD")
    language = Column(String(10), default="en")
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False)
    appointments_as_patient = relationship("Appointment", back_populates="patient", foreign_keys="Appointment.patient_id")
    assessments = relationship("InjuryAssessment", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    chat_messages = relationship("ChatMessage", back_populates="user")


class Specialty(Base):
    __tablename__ = "specialties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)

    doctors = relationship("DoctorProfile", back_populates="specialty")


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    phone = Column(String(30), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    facility_type = Column(String(20), nullable=False, default=FacilityType.GOVERNMENT.value)
    specialties = Column(Text, nullable=True)  # JSON string of specialty names
    departments = Column(Text, nullable=True)
    emergency_services = Column(Boolean, default=False)
    bed_count = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=True)
    source = Column(String(100), default="Demo Data")
    last_verified = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    doctors = relationship("DoctorProfile", back_populates="hospital")


class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    specialty_id = Column(Integer, ForeignKey("specialties.id"), nullable=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    qualifications = Column(Text, nullable=True)
    experience_years = Column(Integer, default=0)
    languages = Column(String(255), default="English")
    consultation_modes = Column(String(100), default="in_person,telehealth")
    bio = Column(Text, nullable=True)
    consultation_fee = Column(Float, nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_status = Column(String(20), default=VerificationStatus.PENDING.value)
    verification_notes = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="doctor_profile")
    specialty = relationship("Specialty", back_populates="doctors")
    hospital = relationship("Hospital", back_populates="doctors")
    availability = relationship("DoctorAvailability", back_populates="doctor")
    appointments = relationship("Appointment", back_populates="doctor", foreign_keys="Appointment.doctor_id")


class DoctorAvailability(Base):
    __tablename__ = "doctor_availability"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctor_profiles.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(String(5), nullable=False)  # HH:MM
    end_time = Column(String(5), nullable=False)
    is_available = Column(Boolean, default=True)
    slot_duration_minutes = Column(Integer, default=30)

    doctor = relationship("DoctorProfile", back_populates="availability")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctor_profiles.id"), nullable=False)
    date_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    consultation_type = Column(String(20), default=ConsultationType.IN_PERSON.value)
    status = Column(String(30), default=AppointmentStatus.REQUESTED.value)
    reason = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    patient = relationship("User", back_populates="appointments_as_patient", foreign_keys=[patient_id])
    doctor = relationship("DoctorProfile", back_populates="appointments", foreign_keys=[doctor_id])


class InjuryAssessment(Base):
    __tablename__ = "injury_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    description = Column(Text, nullable=False)
    image_path = Column(String(500), nullable=True)
    urgency = Column(String(20), default=UrgencyLevel.INFO_ONLY.value)
    ai_response = Column(Text, nullable=True)
    observations = Column(Text, nullable=True)
    limitations = Column(Text, nullable=True)
    next_steps = Column(Text, nullable=True)
    first_aid = Column(Text, nullable=True)
    warning_signs = Column(Text, nullable=True)
    model_version = Column(String(50), default="demo-v1.0")
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="assessments")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(String(100), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="chat_messages")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info")  # info, appointment, assessment, system
    is_read = Column(Boolean, default=False)
    link = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=utcnow)


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
