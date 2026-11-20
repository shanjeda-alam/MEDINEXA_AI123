from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.models import User, Appointment, InjuryAssessment, Notification, AppointmentStatus
from app.schemas.schemas import UserResponse, UserUpdateRequest, DashboardStats
from datetime import datetime, timezone

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=UserResponse)
async def get_profile(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(user)


@router.put("/profile", response_model=UserResponse)
async def update_profile(req: UserUpdateRequest, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)

    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)

    upcoming = await db.execute(
        select(func.count()).where(
            Appointment.patient_id == user_id,
            Appointment.date_time >= now,
            Appointment.status.in_([AppointmentStatus.REQUESTED.value, AppointmentStatus.CONFIRMED.value])
        )
    )
    assessments = await db.execute(
        select(func.count()).where(InjuryAssessment.user_id == user_id)
    )
    unread = await db.execute(
        select(func.count()).where(Notification.user_id == user_id, Notification.is_read == False)
    )

    return DashboardStats(
        upcoming_appointments=upcoming.scalar() or 0,
        total_assessments=assessments.scalar() or 0,
        saved_hospitals=0,
        unread_notifications=unread.scalar() or 0
    )
