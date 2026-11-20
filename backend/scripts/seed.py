"""
Medinexa AI — Seed Script
Seeds the database with demo data for development and demonstrations.
All data is clearly marked as DEMO.

Demo Credentials:
- Admin:  admin@medinexa.ai / Admin123!
- Doctor: doctor@medinexa.ai / Doctor123!
- User:   user@medinexa.ai / User123!
"""

import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta, timezone
from app.core.database import engine, async_session, Base
from app.core.security import hash_password
from app.models.models import (
    User, Specialty, Hospital, DoctorProfile, DoctorAvailability,
    Appointment, InjuryAssessment, Notification, SystemSetting
)


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # === SPECIALTIES ===
        specialties_data = [
            ("General Medicine", "Primary care and internal medicine", "stethoscope"),
            ("Cardiology", "Heart and cardiovascular system", "heart"),
            ("Dermatology", "Skin, hair, and nail conditions", "scan"),
            ("Orthopedics", "Bones, joints, muscles, and ligaments", "bone"),
            ("Pediatrics", "Medical care for infants, children, and adolescents", "baby"),
            ("Ophthalmology", "Eye care and vision", "eye"),
            ("ENT", "Ear, nose, and throat", "ear"),
            ("Neurology", "Brain and nervous system disorders", "brain"),
            ("Obstetrics & Gynecology", "Women's health, pregnancy, and childbirth", "heart-pulse"),
            ("Psychiatry", "Mental health and behavioral disorders", "brain"),
            ("Gastroenterology", "Digestive system disorders", "pill"),
            ("Pulmonology", "Lung and respiratory conditions", "wind"),
            ("Endocrinology", "Hormonal and metabolic disorders", "activity"),
            ("Nephrology", "Kidney conditions", "droplets"),
            ("Oncology", "Cancer diagnosis and treatment", "shield"),
        ]
        specialties = []
        for name, desc, icon in specialties_data:
            s = Specialty(name=name, description=desc, icon=icon)
            db.add(s)
            specialties.append(s)
        await db.flush()

        # === USERS ===
        admin_user = User(
            email="admin@medinexa.ai", password_hash=hash_password("Admin123!"),
            full_name="Admin User", phone="+8801700000001", role="admin",
            country="BD", language="en", is_demo=True
        )
        doctor_user = User(
            email="doctor@medinexa.ai", password_hash=hash_password("Doctor123!"),
            full_name="Dr. Sarah Ahmed", phone="+8801700000002", role="doctor",
            country="BD", language="en", is_demo=True
        )
        patient_user = User(
            email="user@medinexa.ai", password_hash=hash_password("User123!"),
            full_name="Rahim Khan", phone="+8801700000003", role="user",
            country="BD", language="en", is_demo=True
        )
        db.add_all([admin_user, doctor_user, patient_user])

        # Additional demo doctors
        doctor_users_data = [
            ("dr.karim@medinexa.ai", "Dr. Abdul Karim", "+8801700000004"),
            ("dr.fatima@medinexa.ai", "Dr. Fatima Begum", "+8801700000005"),
            ("dr.hassan@medinexa.ai", "Dr. Hassan Ali", "+8801700000006"),
            ("dr.nusrat@medinexa.ai", "Dr. Nusrat Jahan", "+8801700000007"),
            ("dr.rahman@medinexa.ai", "Dr. Mizanur Rahman", "+8801700000008"),
        ]
        additional_doctors = []
        for email, name, phone in doctor_users_data:
            u = User(
                email=email, password_hash=hash_password("Doctor123!"),
                full_name=name, phone=phone, role="doctor",
                country="BD", language="en", is_demo=True
            )
            db.add(u)
            additional_doctors.append(u)
        await db.flush()

        # === HOSPITALS ===
        hospitals_data = [
            ("Dhaka Medical College Hospital", "Secretariat Rd, Dhaka 1000", "Dhaka", 23.7266, 90.3977, "+880-2-55165088", "government", True, 2600),
            ("Bangabandhu Sheikh Mujib Medical University", "Shahbag, Dhaka 1000", "Dhaka", 23.7393, 90.3961, "+880-2-9661064", "government", True, 1800),
            ("Sir Salimullah Medical College", "Mitford Rd, Dhaka 1100", "Dhaka", 23.7085, 90.3952, "+880-2-7319002", "government", True, 1500),
            ("National Institute of Cardiovascular Diseases", "Sher-e-Bangla Nagar, Dhaka", "Dhaka", 23.7643, 90.3756, "+880-2-9116061", "government", True, 450),
            ("Square Hospital", "18/F, BU Bhuiyan Rd, Dhaka 1205", "Dhaka", 23.7523, 90.3875, "+880-2-8159457", "private", True, 400),
            ("United Hospital", "Plot 15, Rd 71, Dhaka 1212", "Dhaka", 23.7937, 90.4124, "+880-2-8431661", "private", True, 500),
            ("Evercare Hospital Dhaka", "Plot 81, Block E, Dhaka 1229", "Dhaka", 23.8120, 90.4230, "+880-2-8431661", "private", True, 425),
            ("Ibn Sina Hospital", "House 48, Rd 9/A, Dhaka 1205", "Dhaka", 23.7488, 90.3813, "+880-2-8431222", "private", True, 200),
            ("Labaid Specialized Hospital", "House 1, Rd 4, Dhaka 1205", "Dhaka", 23.7515, 90.3845, "+880-2-9612345", "private", True, 350),
            ("Chittagong Medical College Hospital", "KB Fazlul Kader Rd, Chittagong", "Chittagong", 22.3569, 91.8318, "+880-31-630868", "government", True, 2000),
            ("Parkview Hospital", "Nasirabad, Chittagong", "Chittagong", 22.3620, 91.8225, "+880-31-657890", "private", True, 150),
            ("Rajshahi Medical College Hospital", "Medical Rd, Rajshahi", "Rajshahi", 24.3714, 88.5900, "+880-721-772150", "government", True, 1200),
            ("Sylhet MAG Osmani Medical College Hospital", "Medical College Rd, Sylhet", "Sylhet", 24.8955, 91.8711, "+880-821-713667", "government", True, 1000),
            ("Khulna Medical College Hospital", "KDA Avenue, Khulna", "Khulna", 22.8456, 89.5403, "+880-41-720040", "government", True, 800),
            ("Popular Diagnostic Centre", "House 16, Rd 2, Dhaka 1205", "Dhaka", 23.7495, 90.3835, "+880-2-9143242", "private", False, 100),
        ]

        hospitals = []
        for name, addr, city, lat, lng, phone, ftype, emergency, beds in hospitals_data:
            h = Hospital(
                name=name, address=addr, city=city,
                latitude=lat, longitude=lng, phone=phone,
                facility_type=ftype,
                specialties="General Medicine,Emergency Medicine,Surgery" if emergency else "General Medicine,Specialist Care",
                emergency_services=emergency,
                bed_count=beds,
                is_demo=True, source="Demo Data",
                last_verified=datetime.now(timezone.utc),
            )
            db.add(h)
            hospitals.append(h)
        await db.flush()

        # === DOCTOR PROFILES ===
        profiles_data = [
            (doctor_user.id, 0, 0, "MBBS, FCPS (Medicine)", 12, "English,Bangla", "Experienced general physician with over 12 years of practice.", 800),
            (additional_doctors[0].id, 1, 1, "MBBS, MD (Cardiology), FACC", 18, "English,Bangla", "Leading cardiologist specializing in interventional cardiology.", 1500),
            (additional_doctors[1].id, 2, 4, "MBBS, DDV (Dermatology)", 8, "English,Bangla,Hindi", "Dermatologist with expertise in cosmetic and clinical dermatology.", 1000),
            (additional_doctors[2].id, 3, 3, "MBBS, MS (Orthopedics)", 15, "English,Bangla", "Orthopedic surgeon specializing in joint replacement.", 1200),
            (additional_doctors[3].id, 4, 5, "MBBS, DCH (Pediatrics)", 10, "English,Bangla", "Caring pediatrician dedicated to child healthcare.", 700),
            (additional_doctors[4].id, 7, 6, "MBBS, MD (Neurology)", 20, "English,Bangla", "Expert neurologist with 20 years of experience.", 2000),
        ]

        doctor_profiles = []
        for user_id, spec_idx, hosp_idx, quals, exp, langs, bio, fee in profiles_data:
            p = DoctorProfile(
                user_id=user_id,
                specialty_id=specialties[spec_idx].id,
                hospital_id=hospitals[hosp_idx].id,
                qualifications=quals,
                experience_years=exp,
                languages=langs,
                consultation_modes="in_person,telehealth",
                bio=bio,
                consultation_fee=fee,
                is_verified=True,
                verification_status="approved",
                is_demo=True,
            )
            db.add(p)
            doctor_profiles.append(p)
        await db.flush()

        # === AVAILABILITY ===
        for profile in doctor_profiles:
            for day in range(5):  # Monday to Friday
                avail = DoctorAvailability(
                    doctor_id=profile.id,
                    day_of_week=day,
                    start_time="09:00",
                    end_time="17:00",
                    is_available=True,
                    slot_duration_minutes=30,
                )
                db.add(avail)
            # Saturday half day
            db.add(DoctorAvailability(
                doctor_id=profile.id, day_of_week=5,
                start_time="09:00", end_time="13:00",
                is_available=True, slot_duration_minutes=30,
            ))

        # === SAMPLE APPOINTMENTS ===
        now = datetime.now(timezone.utc)
        appointments_data = [
            (patient_user.id, doctor_profiles[0].id, now + timedelta(days=2, hours=2), "confirmed", "Regular checkup"),
            (patient_user.id, doctor_profiles[1].id, now + timedelta(days=5, hours=4), "requested", "Heart palpitations"),
            (patient_user.id, doctor_profiles[2].id, now - timedelta(days=3), "completed", "Skin rash consultation"),
        ]
        for pid, did, dt, status, reason in appointments_data:
            apt = Appointment(
                patient_id=pid, doctor_id=did,
                date_time=dt, end_time=dt + timedelta(minutes=30),
                consultation_type="in_person", status=status,
                reason=reason, is_demo=True,
            )
            db.add(apt)

        # === SAMPLE ASSESSMENT ===
        assessment = InjuryAssessment(
            user_id=patient_user.id,
            description="I have a small cut on my finger from cooking. It's bleeding a little.",
            urgency="non_urgent",
            ai_response="ℹ️ Non-urgent — Self-care with monitoring. This appears to be a minor cut that can be treated at home.",
            observations="Minor cut described, light bleeding noted.",
            limitations="Cannot assess depth, infection risk, or whether stitches are needed without examination.",
            next_steps="1. Clean wound\n2. Apply pressure\n3. Bandage\n4. Monitor for infection",
            first_aid="1. Wash hands\n2. Clean cut under running water\n3. Apply pressure with clean cloth\n4. Apply antibiotic ointment\n5. Cover with sterile bandage",
            warning_signs="Seek care if: bleeding won't stop, wound is deep, signs of infection (redness, warmth, swelling, pus).",
            model_version="demo-v1.0",
            is_demo=True,
        )
        db.add(assessment)

        # === NOTIFICATIONS ===
        db.add(Notification(
            user_id=patient_user.id,
            title="Welcome to Medinexa AI!",
            message="Your account has been created. Start by checking an injury or finding a hospital near you.",
            type="system",
        ))
        db.add(Notification(
            user_id=patient_user.id,
            title="Appointment Confirmed",
            message="Your appointment with Dr. Sarah Ahmed has been confirmed.",
            type="appointment",
        ))
        db.add(Notification(
            user_id=doctor_user.id,
            title="New Appointment Request",
            message="You have a new appointment request from Rahim Khan.",
            type="appointment",
        ))

        # === SYSTEM SETTINGS ===
        settings_data = [
            ("demo_mode", "true", "Enable demo mode with sample data"),
            ("default_country", "BD", "Default country for the platform"),
            ("emergency_number_BD", "999", "Emergency number for Bangladesh"),
            ("max_upload_size_mb", "5", "Maximum upload size in MB"),
            ("appointment_slot_duration", "30", "Default appointment slot in minutes"),
        ]
        for key, value, desc in settings_data:
            db.add(SystemSetting(key=key, value=value, description=desc))

        await db.commit()
        print("Database seeded successfully!")
        print("\nDemo Credentials:")
        print("  Admin:  admin@medinexa.ai / Admin123!")
        print("  Doctor: doctor@medinexa.ai / Doctor123!")
        print("  User:   user@medinexa.ai / User123!")


if __name__ == "__main__":
    asyncio.run(seed())
