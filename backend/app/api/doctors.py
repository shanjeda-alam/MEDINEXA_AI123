from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional, List
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.models import User, DoctorProfile, Specialty, Hospital, DoctorAvailability, Appointment, AppointmentStatus, Notification
from app.schemas.schemas import (
    DoctorProfileResponse, DoctorUpdateRequest, DoctorAvailabilityResponse,
    AvailabilityUpdateRequest, AppointmentResponse, DashboardStats, AppointmentStatusUpdate
)
from datetime import datetime, timezone

router = APIRouter(prefix="/doctors", tags=["Doctors"])


def _doctor_to_response(profile: DoctorProfile) -> DoctorProfileResponse:
    return DoctorProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        full_name=profile.user.full_name if profile.user else "",
        email=profile.user.email if profile.user else "",
        specialty=None if not profile.specialty else {"id": profile.specialty.id, "name": profile.specialty.name, "description": profile.specialty.description, "icon": profile.specialty.icon},
        hospital_name=profile.hospital.name if profile.hospital else None,
        hospital_id=profile.hospital_id,
        qualifications=profile.qualifications,
        experience_years=profile.experience_years,
        languages=profile.languages,
        consultation_modes=profile.consultation_modes,
        bio=profile.bio,
        consultation_fee=profile.consultation_fee,
        is_verified=profile.is_verified,
        verification_status=profile.verification_status,
        is_demo=profile.is_demo,
        avatar_url=profile.user.avatar_url if profile.user else None,
    )


@router.get("/specialties", response_model=List[dict])
async def list_specialties(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Specialty))
    specialties = result.scalars().all()
    return [{"id": s.id, "name": s.name, "description": s.description, "icon": s.icon} for s in specialties]


@router.get("/", response_model=List[DoctorProfileResponse])
async def list_doctors(
    specialty: Optional[str] = None,
    city: Optional[str] = None,
    consultation_type: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(DoctorProfile).options(
        selectinload(DoctorProfile.user),
        selectinload(DoctorProfile.specialty),
        selectinload(DoctorProfile.hospital)
    ).join(User, DoctorProfile.user_id == User.id).where(User.is_active == True)

    if specialty:
        query = query.join(Specialty, DoctorProfile.specialty_id == Specialty.id).where(Specialty.name.ilike(f"%{specialty}%"))
    if city:
        query = query.join(Hospital, DoctorProfile.hospital_id == Hospital.id, isouter=True).where(Hospital.city.ilike(f"%{city}%"))
    if consultation_type:
        query = query.where(DoctorProfile.consultation_modes.contains(consultation_type))
    if search:
        query = query.where(User.full_name.ilike(f"%{search}%"))

    result = await db.execute(query)
    doctors = result.scalars().all()
    return [_doctor_to_response(d) for d in doctors]


@router.get("/{doctor_id}", response_model=DoctorProfileResponse)
async def get_doctor(doctor_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DoctorProfile).options(
            selectinload(DoctorProfile.user),
            selectinload(DoctorProfile.specialty),
            selectinload(DoctorProfile.hospital)
        ).where(DoctorProfile.id == doctor_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return _doctor_to_response(profile)


@router.get("/{doctor_id}/availability", response_model=List[DoctorAvailabilityResponse])
async def get_availability(doctor_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DoctorAvailability).where(DoctorAvailability.doctor_id == doctor_id, DoctorAvailability.is_available == True)
    )
    return [DoctorAvailabilityResponse.model_validate(a) for a in result.scalars().all()]


@router.put("/profile", response_model=DoctorProfileResponse)
async def update_doctor_profile(req: DoctorUpdateRequest, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DoctorProfile).options(
            selectinload(DoctorProfile.user),
            selectinload(DoctorProfile.specialty),
            selectinload(DoctorProfile.hospital)
        ).where(DoctorProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    await db.commit()
    await db.refresh(profile)
    return _doctor_to_response(profile)


@router.put("/availability", response_model=DoctorAvailabilityResponse)
async def update_availability(req: AvailabilityUpdateRequest, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    existing = await db.execute(
        select(DoctorAvailability).where(
            DoctorAvailability.doctor_id == profile.id,
            DoctorAvailability.day_of_week == req.day_of_week
        )
    )
    slot = existing.scalar_one_or_none()

    if slot:
        slot.start_time = req.start_time
        slot.end_time = req.end_time
        slot.is_available = req.is_available
        slot.slot_duration_minutes = req.slot_duration_minutes
    else:
        slot = DoctorAvailability(
            doctor_id=profile.id,
            day_of_week=req.day_of_week,
            start_time=req.start_time,
            end_time=req.end_time,
            is_available=req.is_available,
            slot_duration_minutes=req.slot_duration_minutes
        )
        db.add(slot)

    await db.commit()
    await db.refresh(slot)
    return DoctorAvailabilityResponse.model_validate(slot)


@router.get("/dashboard/stats", response_model=DashboardStats)
async def doctor_dashboard(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    now = datetime.now(timezone.utc)
    upcoming = await db.execute(
        select(func.count()).where(
            Appointment.doctor_id == profile.id,
            Appointment.date_time >= now,
            Appointment.status.in_([AppointmentStatus.CONFIRMED.value])
        )
    )
    pending = await db.execute(
        select(func.count()).where(
            Appointment.doctor_id == profile.id,
            Appointment.status == AppointmentStatus.REQUESTED.value
        )
    )
    unread = await db.execute(
        select(func.count()).where(Notification.user_id == user_id, Notification.is_read == False)
    )

    return DashboardStats(
        upcoming_appointments=upcoming.scalar() or 0,
        total_assessments=pending.scalar() or 0,
        unread_notifications=unread.scalar() or 0
    )


@router.get("/appointments/list", response_model=List[AppointmentResponse])
async def doctor_appointments(
    status: Optional[str] = None,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    query = select(Appointment).where(Appointment.doctor_id == profile.id)
    if status:
        query = query.where(Appointment.status == status)
    query = query.order_by(Appointment.date_time.desc())

    result = await db.execute(query)
    appointments = result.scalars().all()

    responses = []
    for apt in appointments:
        patient = await db.execute(select(User).where(User.id == apt.patient_id))
        patient_user = patient.scalar_one_or_none()
        responses.append(AppointmentResponse(
            id=apt.id, patient_id=apt.patient_id, doctor_id=apt.doctor_id,
            patient_name=patient_user.full_name if patient_user else "",
            doctor_name=profile.user.full_name if profile.user else "",
            specialty=profile.specialty.name if profile.specialty else "",
            date_time=apt.date_time, end_time=apt.end_time,
            consultation_type=apt.consultation_type, status=apt.status,
            reason=apt.reason, notes=apt.notes, is_demo=apt.is_demo, created_at=apt.created_at
        ))
    return responses


@router.put("/appointments/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: int,
    req: AppointmentStatusUpdate,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id, Appointment.doctor_id == profile.id))
    apt = result.scalar_one_or_none()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    apt.status = req.status.value
    if req.notes:
        apt.notes = req.notes

    # Create notification for patient
    notification = Notification(
        user_id=apt.patient_id,
        title=f"Appointment {req.status.value}",
        message=f"Your appointment has been {req.status.value}.",
        type="appointment"
    )
    db.add(notification)

    await db.commit()
    return {"message": f"Appointment {req.status.value}", "status": req.status.value}
