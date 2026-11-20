from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
import math
from app.core.database import get_db
from app.models.models import Hospital
from app.schemas.schemas import HospitalResponse

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c


@router.get("/", response_model=List[HospitalResponse])
async def search_hospitals(
    city: Optional[str] = None,
    facility_type: Optional[str] = None,
    specialty: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    max_distance: float = Query(default=50.0, description="Max distance in km"),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Hospital).where(Hospital.is_active == True)

    if city:
        query = query.where(Hospital.city.ilike(f"%{city}%"))
    if facility_type:
        query = query.where(Hospital.facility_type == facility_type)
    if specialty:
        query = query.where(Hospital.specialties.ilike(f"%{specialty}%"))
    if search:
        query = query.where(Hospital.name.ilike(f"%{search}%") | Hospital.address.ilike(f"%{search}%"))

    result = await db.execute(query)
    hospitals = result.scalars().all()

    responses = []
    for h in hospitals:
        distance = None
        if lat is not None and lng is not None and h.latitude and h.longitude:
            distance = round(haversine(lat, lng, h.latitude, h.longitude), 1)
            if distance > max_distance:
                continue

        resp = HospitalResponse.model_validate(h)
        resp.distance_km = distance
        responses.append(resp)

    if lat is not None and lng is not None:
        responses.sort(key=lambda x: x.distance_km if x.distance_km is not None else float('inf'))

    return responses


@router.get("/{hospital_id}", response_model=HospitalResponse)
async def get_hospital(hospital_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Hospital).where(Hospital.id == hospital_id))
    hospital = result.scalar_one_or_none()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return HospitalResponse.model_validate(hospital)
