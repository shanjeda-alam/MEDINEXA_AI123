from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from datetime import datetime, timedelta, timezone
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.models import Appointment, DoctorProfile, DoctorAvailability, User, Notification
from app.schemas.schemas import AppointmentCreateRequest, AppointmentResponse

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post("/", response_model=AppointmentResponse)
async def create_appointment(
    req: AppointmentCreateRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    # Verify doctor exists
    result = await db.execute(
        select(DoctorProfile).where(DoctorProfile.id == req.doctor_id)
    )
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Set end time (30 min default)
    end_time = req.date_time + timedelta(minutes=30)

    # Check for double booking
    result = await db.execute(
        select(Appointment).where(
            Appointment.doctor_id == req.doctor_id,
            Appointment.status.in_(["requested", "confirmed"]),
            Appointment.date_time < end_time,
            Appointment.end_time > req.date_time
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="This time slot is already booked")

    appointment = Appointment(
        patient_id=user_id,
        doctor_id=req.doctor_id,
        date_time=req.date_time,
        end_time=end_time,
        consultation_type=req.consultation_type,
        reason=req.reason,
        status="requested",
        is_demo=True,
    )
    db.add(appointment)

    # Notify doctor
    notification = Notification(
        user_id=doctor.user_id,
        title="New Appointment Request",
        message=f"You have a new appointment request for {req.date_time.strftime('%B %d, %Y at %I:%M %p')}",
        type="appointment"
    )
    db.add(notification)

    await db.commit()
    await db.refresh(appointment)

    # Get names
    patient = await db.execute(select(User).where(User.id == user_id))
    patient_user = patient.scalar_one_or_none()
    doctor_user = await db.execute(select(User).where(User.id == doctor.user_id))
    doctor_u = doctor_user.scalar_one_or_none()

    return AppointmentResponse(
        id=appointment.id,
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        patient_name=patient_user.full_name if patient_user else "",
        doctor_name=doctor_u.full_name if doctor_u else "",
        date_time=appointment.date_time,
        end_time=appointment.end_time,
        consultation_type=appointment.consultation_type,
        status=appointment.status,
        reason=appointment.reason,
        notes=appointment.notes,
        is_demo=appointment.is_demo,
        created_at=appointment.created_at
    )


@router.get("/", response_model=List[AppointmentResponse])
async def list_appointments(
    status: Optional[str] = None,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    query = select(Appointment).where(Appointment.patient_id == user_id)
    if status:
        query = query.where(Appointment.status == status)
    query = query.order_by(Appointment.date_time.desc())

    result = await db.execute(query)
    appointments = result.scalars().all()

    responses = []
    for apt in appointments:
        doctor = await db.execute(select(DoctorProfile).where(DoctorProfile.id == apt.doctor_id))
        doc = doctor.scalar_one_or_none()
        doctor_user = None
        specialty = ""
        if doc:
            du = await db.execute(select(User).where(User.id == doc.user_id))
            doctor_user = du.scalar_one_or_none()
            if doc.specialty_id:
                from app.models.models import Specialty
                sp = await db.execute(select(Specialty).where(Specialty.id == doc.specialty_id))
                spec = sp.scalar_one_or_none()
                specialty = spec.name if spec else ""

        responses.append(AppointmentResponse(
            id=apt.id, patient_id=apt.patient_id, doctor_id=apt.doctor_id,
            patient_name="You",
            doctor_name=doctor_user.full_name if doctor_user else "",
            specialty=specialty,
            date_time=apt.date_time, end_time=apt.end_time,
            consultation_type=apt.consultation_type, status=apt.status,
            reason=apt.reason, notes=apt.notes, is_demo=apt.is_demo, created_at=apt.created_at
        ))
    return responses


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Appointment).where(Appointment.id == appointment_id, Appointment.patient_id == user_id)
    )
    apt = result.scalar_one_or_none()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    return AppointmentResponse(
        id=apt.id, patient_id=apt.patient_id, doctor_id=apt.doctor_id,
        date_time=apt.date_time, end_time=apt.end_time,
        consultation_type=apt.consultation_type, status=apt.status,
        reason=apt.reason, notes=apt.notes, is_demo=apt.is_demo, created_at=apt.created_at
    )


@router.put("/{appointment_id}/cancel")
async def cancel_appointment(
    appointment_id: int,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Appointment).where(Appointment.id == appointment_id, Appointment.patient_id == user_id)
    )
    apt = result.scalar_one_or_none()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if apt.status in ["completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Cannot cancel this appointment")

    apt.status = "cancelled"
    await db.commit()
    return {"message": "Appointment cancelled"}
