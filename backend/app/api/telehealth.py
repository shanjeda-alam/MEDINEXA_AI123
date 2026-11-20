from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional, List
import uuid
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.models import ChatMessage, User, DoctorProfile, Specialty, Hospital
from app.schemas.schemas import ChatRequest, ChatResponse, ChatMessageResponse, DoctorProfileResponse
from app.services.triage import TriageService

router = APIRouter(prefix="/telehealth", tags=["Telehealth"])

EMERGENCY_KEYWORDS = [
    "chest pain", "can't breathe", "difficulty breathing", "unconscious",
    "severe bleeding", "stroke", "seizure", "heart attack", "poisoning",
    "choking", "anaphylaxis", "suicidal", "overdose"
]


def detect_specialty(text: str) -> Optional[str]:
    text_lower = text.lower()
    mapping = {
        "heart": "Cardiology", "chest": "Cardiology", "cardiac": "Cardiology",
        "skin": "Dermatology", "rash": "Dermatology", "acne": "Dermatology",
        "bone": "Orthopedics", "fracture": "Orthopedics", "joint": "Orthopedics", "back pain": "Orthopedics",
        "child": "Pediatrics", "baby": "Pediatrics", "kid": "Pediatrics",
        "eye": "Ophthalmology", "vision": "Ophthalmology",
        "teeth": "Dentistry", "tooth": "Dentistry", "dental": "Dentistry",
        "mental": "Psychiatry", "depression": "Psychiatry", "anxiety": "Psychiatry",
        "stomach": "Gastroenterology", "digestion": "Gastroenterology",
        "brain": "Neurology", "headache": "Neurology", "nerve": "Neurology",
        "pregnant": "Obstetrics & Gynecology", "pregnancy": "Obstetrics & Gynecology", "gynec": "Obstetrics & Gynecology",
        "ear": "ENT", "nose": "ENT", "throat": "ENT",
        "kidney": "Nephrology", "urine": "Urology",
        "lung": "Pulmonology", "breathing": "Pulmonology", "asthma": "Pulmonology",
        "diabetes": "Endocrinology", "thyroid": "Endocrinology", "hormone": "Endocrinology",
        "cancer": "Oncology", "tumor": "Oncology",
    }
    for keyword, specialty in mapping.items():
        if keyword in text_lower:
            return specialty
    return None


def generate_response(message: str, session_messages: list, suggested_doctors: list = None) -> str:
    msg_lower = message.lower()
    msg_count = len(session_messages)

    if any(kw in msg_lower for kw in EMERGENCY_KEYWORDS):
        return None  # handled by emergency logic

    if msg_count <= 1:
        return (
            "Welcome to Medinexa AI Health Assistant! 🏥\n\n"
            "I can help you find the right doctor and book an appointment. "
            "Could you tell me:\n\n"
            "1. What symptoms are you experiencing?\n"
            "2. How long have you had these symptoms?\n"
            "3. What type of doctor are you looking for?\n\n"
            "⚠️ **Important**: If you're experiencing a medical emergency, please call 999 immediately. "
            "This assistant does not replace professional medical care."
        )

    specialty = detect_specialty(message)

    if specialty and suggested_doctors:
        doctor_list = "\n".join([
            f"• **Dr. {d.full_name}** — {d.specialty.name if d.specialty else specialty}"
            f"{' (Verified ✓)' if d.is_verified else ' (Demo availability)'}"
            f" | Fee: ৳{int(d.consultation_fee) if d.consultation_fee else 'N/A'}"
            for d in suggested_doctors[:3]
        ])
        return (
            f"Based on your symptoms, I'd suggest consulting a **{specialty}** specialist.\n\n"
            f"Here are available doctors:\n{doctor_list}\n\n"
            "Would you like to book an appointment with any of these doctors? "
            "You can also specify your preferred time and consultation type (in-person or telehealth).\n\n"
            "⚠️ *This is demo data. Doctor availability is not verified.*"
        )

    if specialty:
        return (
            f"Based on what you've described, you may want to consult a **{specialty}** specialist.\n\n"
            "I'm searching for available doctors in your area. Could you tell me:\n"
            "- Your preferred city/location?\n"
            "- Preferred consultation type (in-person or telehealth)?\n"
            "- Any preferred time?\n\n"
            "⚠️ *This is a demo assistant. Please consult a qualified healthcare professional for medical advice.*"
        )

    if any(word in msg_lower for word in ["appointment", "book", "schedule"]):
        return (
            "I'd be happy to help you book an appointment! Please tell me:\n\n"
            "1. What type of doctor do you need?\n"
            "2. Your preferred date and time?\n"
            "3. In-person or telehealth?\n\n"
            "You can also browse doctors directly from the Doctor Directory page."
        )

    if any(word in msg_lower for word in ["hospital", "clinic", "near"]):
        return (
            "I can help you find nearby hospitals! You can:\n\n"
            "1. Use the **Find Hospitals** page for a full map and list view\n"
            "2. Tell me your city and I'll suggest hospitals\n"
            "3. Filter by government or private facilities\n\n"
            "Would you like to search for hospitals in a specific area?"
        )

    return (
        "Thank you for sharing that information. To better assist you, could you provide more details about:\n\n"
        "- Your specific symptoms or health concern\n"
        "- How long you've been experiencing this\n"
        "- Any relevant medical history\n\n"
        "This will help me suggest the right type of specialist for you.\n\n"
        "⚠️ *This is a demo health assistant. It does not provide medical diagnoses. "
        "Please consult a qualified healthcare professional for medical advice.*"
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    session_id = req.session_id or str(uuid.uuid4())

    # Save user message
    user_msg = ChatMessage(
        user_id=user_id, session_id=session_id,
        role="user", content=req.message
    )
    db.add(user_msg)

    # Get session history
    result = await db.execute(
        select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at)
    )
    session_messages = result.scalars().all()

    # Check emergency
    is_emergency = any(kw in req.message.lower() for kw in EMERGENCY_KEYWORDS)
    emergency_message = None

    if is_emergency:
        emergency_message = (
            "🚨 **EMERGENCY DETECTED** 🚨\n\n"
            "Based on what you've described, this may require immediate medical attention.\n\n"
            "**Please take these steps immediately:**\n"
            "1. Call **999** (Bangladesh Emergency) or your local emergency number\n"
            "2. Go to the nearest emergency department\n"
            "3. Do not wait for online assistance\n\n"
            "If someone is unconscious, not breathing, or bleeding severely, "
            "call emergency services immediately."
        )
        reply = emergency_message
    else:
        # Find suggested doctors based on detected specialty
        specialty = detect_specialty(req.message)
        suggested_doctors = []

        if specialty:
            doc_result = await db.execute(
                select(DoctorProfile).options(
                    selectinload(DoctorProfile.user),
                    selectinload(DoctorProfile.specialty),
                    selectinload(DoctorProfile.hospital)
                ).join(Specialty, DoctorProfile.specialty_id == Specialty.id)
                .where(Specialty.name.ilike(f"%{specialty}%"))
            )
            suggested_doctors = list(doc_result.scalars().all())

        reply = generate_response(req.message, session_messages, suggested_doctors)

    # Save assistant reply
    assistant_msg = ChatMessage(
        user_id=user_id, session_id=session_id,
        role="assistant", content=reply
    )
    db.add(assistant_msg)
    await db.commit()

    # Build suggested doctor responses
    doctor_responses = None
    if not is_emergency:
        specialty = detect_specialty(req.message)
        if specialty:
            doc_result = await db.execute(
                select(DoctorProfile).options(
                    selectinload(DoctorProfile.user),
                    selectinload(DoctorProfile.specialty),
                    selectinload(DoctorProfile.hospital)
                ).join(Specialty, DoctorProfile.specialty_id == Specialty.id)
                .where(Specialty.name.ilike(f"%{specialty}%"))
            )
            docs = doc_result.scalars().all()
            if docs:
                doctor_responses = [
                    DoctorProfileResponse(
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
                    ) for d in docs[:3]
                ]

    return ChatResponse(
        reply=reply,
        session_id=session_id,
        suggested_doctors=doctor_responses,
        is_emergency=is_emergency,
        emergency_message=emergency_message
    )


@router.get("/chat/history", response_model=List[ChatMessageResponse])
async def chat_history(session_id: str, user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChatMessage).where(
            ChatMessage.session_id == session_id,
            ChatMessage.user_id == user_id
        ).order_by(ChatMessage.created_at)
    )
    return [ChatMessageResponse.model_validate(m) for m in result.scalars().all()]
