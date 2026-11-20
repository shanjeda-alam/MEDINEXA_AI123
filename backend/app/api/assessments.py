from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
import uuid
import os
import json
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.core.config import settings
from app.models.models import InjuryAssessment, User
from app.schemas.schemas import AssessmentResponse, AssessmentCreateRequest
from app.services.triage import TriageService

router = APIRouter(prefix="/assessments", tags=["Assessments"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/", response_model=AssessmentResponse)
async def create_assessment(
    description: str = Form(...),
    image: Optional[UploadFile] = File(None),
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    image_path = None

    if image:
        if image.content_type not in ALLOWED_TYPES:
            raise HTTPException(status_code=400, detail="Only JPEG, PNG, and WebP images are allowed")

        content = await image.read()
        if len(content) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=400, detail="Image exceeds 5MB limit")

        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        ext = image.filename.split(".")[-1] if image.filename else "jpg"
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(settings.UPLOAD_DIR, filename)

        with open(filepath, "wb") as f:
            f.write(content)

        image_path = filename

    triage = TriageService()
    result = triage.assess(description, has_image=image is not None)

    assessment = InjuryAssessment(
        user_id=user_id,
        description=description,
        image_path=image_path,
        urgency=result["urgency"],
        ai_response=result["ai_response"],
        observations=result.get("observations"),
        limitations=result.get("limitations"),
        next_steps=result.get("next_steps"),
        first_aid=result.get("first_aid"),
        warning_signs=result.get("warning_signs"),
        model_version="demo-v1.0",
        is_demo=True,
    )
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)

    return AssessmentResponse.model_validate(assessment)


@router.get("/", response_model=List[AssessmentResponse])
async def list_assessments(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(InjuryAssessment).where(InjuryAssessment.user_id == user_id).order_by(InjuryAssessment.created_at.desc())
    )
    return [AssessmentResponse.model_validate(a) for a in result.scalars().all()]


@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(assessment_id: int, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(InjuryAssessment).where(InjuryAssessment.id == assessment_id, InjuryAssessment.user_id == user_id)
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return AssessmentResponse.model_validate(assessment)


@router.delete("/{assessment_id}")
async def delete_assessment(assessment_id: int, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(InjuryAssessment).where(InjuryAssessment.id == assessment_id, InjuryAssessment.user_id == user_id)
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    if assessment.image_path:
        filepath = os.path.join(settings.UPLOAD_DIR, assessment.image_path)
        if os.path.exists(filepath):
            os.remove(filepath)

    await db.delete(assessment)
    await db.commit()
    return {"message": "Assessment deleted"}
