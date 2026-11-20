from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional, List
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.models import User, DoctorProfile, Hospital, Appointment, InjuryAssessment, AuditLog, Specialty, Notification
from app.schemas.schemas import (
    AdminDashboardStats, UserResponse, DoctorProfileResponse, HospitalResponse,
    HospitalCreateRequest, HospitalUpdateRequest, AppointmentResponse,
    DoctorVerifyRequest, UserStatusUpdate, AuditLogResponse
)

router = APIRouter(prefix="/admin", tags=["Admin"])


async def require_admin(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/dashboard", response_model=AdminDashboardStats)
async def admin_dashboard(admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    users = await db.execute(select(func.count()).select_from(User))
    doctors = await db.execute(select(func.count()).select_from(DoctorProfile))
    appointments = await db.execute(select(func.count()).select_from(Appointment))
    pending = await db.execute(select(func.count()).where(DoctorProfile.verification_status == "pending"))
    hospitals = await db.execute(select(func.count()).select_from(Hospital))
    assessments = await db.execute(select(func.count()).select_from(InjuryAssessment))

    return AdminDashboardStats(
        total_users=users.scalar() or 0,
        total_doctors=doctors.scalar() or 0,
        total_appointments=appointments.scalar() or 0,
        pending_verifications=pending.scalar() or 0,
        total_hospitals=hospitals.scalar() or 0,
        total_assessments=assessments.scalar() or 0,
    )


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, le=100),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    query = select(User)
    if search:
        query = query.where(User.full_name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
    if role:
        query = query.where(User.role == role)
    query = query.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    return [UserResponse.model_validate(u) for u in result.scalars().all()]


@router.put("/users/{uid}/status")
async def update_user_status(uid: int, req: UserStatusUpdate, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = req.is_active

    log = AuditLog(user_id=admin.id, action=f"{'activated' if req.is_active else 'suspended'} user {uid}")
    db.add(log)
    await db.commit()
    return {"message": f"User {'activated' if req.is_active else 'suspended'}"}


@router.get("/doctors/pending", response_model=List[DoctorProfileResponse])
async def pending_doctors(admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DoctorProfile).options(
            selectinload(DoctorProfile.user),
            selectinload(DoctorProfile.specialty),
            selectinload(DoctorProfile.hospital)
        ).where(DoctorProfile.verification_status == "pending")
    )
    doctors = result.scalars().all()
    responses = []
    for d in doctors:
        responses.append(DoctorProfileResponse(
            id=d.id, user_id=d.user_id,
            full_name=d.user.full_name if d.user else "",
            email=d.user.email if d.user else "",
            specialty={"id": d.specialty.id, "name": d.specialty.name, "description": d.specialty.description, "icon": d.specialty.icon} if d.specialty else None,
            hospital_name=d.hospital.name if d.hospital else None,
            hospital_id=d.hospital_id,
            qualifications=d.qualifications,
            experience_years=d.experience_years,
            languages=d.languages,
            consultation_modes=d.consultation_modes,
            bio=d.bio,
            consultation_fee=d.consultation_fee,
            is_verified=d.is_verified,
            verification_status=d.verification_status,
            is_demo=d.is_demo,
        ))
    return responses


@router.put("/doctors/{doctor_id}/verify")
async def verify_doctor(doctor_id: int, req: DoctorVerifyRequest, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DoctorProfile).where(DoctorProfile.id == doctor_id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    profile.verification_status = req.status
    profile.is_verified = req.status == "approved"
    profile.verification_notes = req.notes

    log = AuditLog(user_id=admin.id, action=f"Doctor {doctor_id} verification: {req.status}", details=req.notes)
    db.add(log)
    await db.commit()
    return {"message": f"Doctor verification {req.status}"}


@router.get("/hospitals", response_model=List[HospitalResponse])
async def admin_list_hospitals(admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Hospital))
    return [HospitalResponse.model_validate(h) for h in result.scalars().all()]


@router.post("/hospitals", response_model=HospitalResponse)
async def create_hospital(req: HospitalCreateRequest, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    hospital = Hospital(**req.model_dump())
    db.add(hospital)
    await db.commit()
    await db.refresh(hospital)

    log = AuditLog(user_id=admin.id, action=f"Created hospital: {hospital.name}")
    db.add(log)
    await db.commit()
    return HospitalResponse.model_validate(hospital)


@router.put("/hospitals/{hospital_id}", response_model=HospitalResponse)
async def update_hospital(hospital_id: int, req: HospitalUpdateRequest, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Hospital).where(Hospital.id == hospital_id))
    hospital = result.scalar_one_or_none()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(hospital, key, value)

    await db.commit()
    await db.refresh(hospital)
    return HospitalResponse.model_validate(hospital)


@router.get("/appointments", response_model=List[AppointmentResponse])
async def admin_appointments(
    status: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    query = select(Appointment)
    if status:
        query = query.where(Appointment.status == status)
    query = query.order_by(Appointment.created_at.desc()).limit(50)

    result = await db.execute(query)
    appointments = result.scalars().all()

    responses = []
    for apt in appointments:
        patient = await db.execute(select(User).where(User.id == apt.patient_id))
        patient_user = patient.scalar_one_or_none()
        doctor_profile = await db.execute(
            select(DoctorProfile).options(selectinload(DoctorProfile.user), selectinload(DoctorProfile.specialty))
            .where(DoctorProfile.id == apt.doctor_id)
        )
        doc = doctor_profile.scalar_one_or_none()

        responses.append(AppointmentResponse(
            id=apt.id, patient_id=apt.patient_id, doctor_id=apt.doctor_id,
            patient_name=patient_user.full_name if patient_user else "",
            doctor_name=doc.user.full_name if doc and doc.user else "",
            specialty=doc.specialty.name if doc and doc.specialty else "",
            date_time=apt.date_time, end_time=apt.end_time,
            consultation_type=apt.consultation_type, status=apt.status,
            reason=apt.reason, notes=apt.notes, is_demo=apt.is_demo, created_at=apt.created_at
        ))
    return responses


@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, le=100),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(AuditLog).order_by(AuditLog.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    )
    return [AuditLogResponse.model_validate(l) for l in result.scalars().all()]
