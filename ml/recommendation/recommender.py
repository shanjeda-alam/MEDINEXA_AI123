"""
Medinexa AI — Healthcare Specialty & Facility Matcher
Ranks doctors and hospitals based on clinical symptoms and proximity.
"""

from typing import List, Dict, Any, Optional

SPECIALTY_KEYWORDS = {
    "Cardiology": ["heart", "chest pain", "palpitations", "cardiac", "arrhythmia"],
    "Dermatology": ["skin", "rash", "acne", "eczema", "itch", "mole"],
    "Orthopedics": ["bone", "fracture", "joint", "knee", "back pain", "sprain"],
    "Pediatrics": ["baby", "child", "infant", "toddler"],
    "Ophthalmology": ["eye", "vision", "blur", "cornea"],
    "Neurology": ["headache", "migraine", "dizziness", "numbness", "nerve"],
    "ENT": ["ear", "nose", "throat", "sinus", "hearing"],
}

class RecommendationEngine:
    @staticmethod
    def match_specialty(symptom_description: str) -> str:
        text = symptom_description.lower()
        for specialty, keywords in SPECIALTY_KEYWORDS.items():
            if any(k in text for k in keywords):
                return specialty
        return "General Medicine"
