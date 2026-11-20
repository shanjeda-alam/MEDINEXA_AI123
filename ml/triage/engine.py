"""
Medinexa AI — Clinical Triage Safety Engine
Implements deterministic emergency detection and clinical urgency classification.
"""

from typing import Dict, Any

EMERGENCY_RED_FLAGS = [
    "chest pain", "cardiac arrest", "unconscious", "not breathing",
    "severe bleeding", "arterial bleeding", "heavy blood", "stroke",
    "facial droop", "slurred speech", "seizure", "poison", "overdose",
    "anaphylaxis", "throat swelling", "deep burn", "third degree burn"
]

URGENT_INDICATORS = [
    "fracture", "broken bone", "dislocation", "deep cut", "fever over 103",
    "fever over 39", "severe vomiting", "headache with stiff neck", "animal bite"
]

class TriageEngine:
    @staticmethod
    def evaluate(symptoms: str) -> Dict[str, Any]:
        text = symptoms.lower()

        # Check Emergency
        for flag in EMERGENCY_RED_FLAGS:
            if flag in text:
                return {
                    "urgency": "emergency",
                    "requires_immediate_dispatch": True,
                    "emergency_phone": "999",
                    "country": "BD",
                    "trigger_flag": flag,
                    "action": "Call local emergency services (999) or proceed immediately to nearest emergency room."
                }

        # Check Urgent
        for flag in URGENT_INDICATORS:
            if flag in text:
                return {
                    "urgency": "urgent",
                    "requires_immediate_dispatch": False,
                    "trigger_flag": flag,
                    "action": "Consult a physician or urgent care clinic within 6-12 hours."
                }

        # Non-Urgent
        return {
            "urgency": "non_urgent",
            "requires_immediate_dispatch": False,
            "trigger_flag": None,
            "action": "Practice supportive home care and monitor symptoms. Schedule an appointment if symptoms persist."
        }
