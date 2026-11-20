"""
Medinexa AI — Triage Service (Demo / Rules-Based)

This is a DEMO triage system using keyword matching rules.
It is NOT a clinically validated model and must NEVER be used for real medical decisions.
"""

from typing import Dict, Optional
import re


EMERGENCY_KEYWORDS = [
    "chest pain", "heart attack", "can't breathe", "cannot breathe",
    "difficulty breathing", "shortness of breath", "unconscious", "not breathing",
    "severe bleeding", "won't stop bleeding", "heavy bleeding",
    "seizure", "convulsion", "stroke", "face drooping", "arm weakness", "speech difficulty",
    "poisoning", "poison", "overdose", "swallowed",
    "choking", "can't swallow",
    "head injury", "head trauma", "spine injury", "neck injury",
    "major burn", "third degree burn", "electrical burn",
    "anaphylaxis", "severe allergic", "throat swelling",
    "suicidal", "suicide", "self harm", "want to die",
    "gunshot", "stabbing", "stab wound",
]

URGENT_KEYWORDS = [
    "broken bone", "fracture", "dislocation",
    "deep cut", "laceration", "wound",
    "high fever", "fever over 103", "fever over 39",
    "vomiting blood", "blood in stool", "blood in urine",
    "severe pain", "intense pain", "unbearable pain",
    "allergic reaction", "hives", "swelling",
    "eye injury", "eye pain", "sudden vision loss",
    "animal bite", "snake bite", "insect sting",
    "infection", "pus", "red streaks",
    "dehydration", "not urinating",
    "concussion", "dizzy", "fainting",
]

FIRST_AID_GUIDANCE = {
    "cut": {
        "first_aid": "1. Apply firm pressure with a clean cloth\n2. Elevate the injured area above heart level\n3. Keep pressure for 10-15 minutes\n4. Clean the wound with water once bleeding stops\n5. Apply antibiotic ointment and a sterile bandage",
        "warning": "Seek medical care if bleeding doesn't stop after 15 minutes, the wound is deep/wide, or you can see bone/tendon."
    },
    "burn": {
        "first_aid": "1. Cool the burn under cool (not cold) running water for 10-20 minutes\n2. Do NOT use ice, butter, or toothpaste\n3. Remove jewelry/clothing near the burn before swelling\n4. Cover loosely with a sterile bandage\n5. Take over-the-counter pain relief if needed",
        "warning": "Seek emergency care for burns larger than your palm, on face/hands/joints/genitals, or if skin is white/charred."
    },
    "sprain": {
        "first_aid": "1. Rest the injured area\n2. Apply ice wrapped in cloth for 20 minutes every 2-3 hours\n3. Compress with an elastic bandage\n4. Elevate above heart level\n5. Take over-the-counter pain relief",
        "warning": "See a doctor if you can't bear weight, notice significant swelling, or hear a popping sound during injury."
    },
    "headache": {
        "first_aid": "1. Rest in a quiet, dark room\n2. Stay hydrated\n3. Apply a cold or warm compress to your forehead\n4. Take over-the-counter pain relief as directed\n5. Avoid screen time",
        "warning": "Seek emergency care for sudden severe headache, headache with fever/stiff neck, headache after head injury, or vision changes."
    },
    "fever": {
        "first_aid": "1. Rest and stay hydrated\n2. Take temperature regularly\n3. Use light clothing and bedding\n4. Take over-the-counter fever reducer as directed\n5. Apply lukewarm (not cold) compresses",
        "warning": "Seek medical care if fever exceeds 103°F/39.4°C, lasts more than 3 days, or is accompanied by severe headache, rash, or confusion."
    },
    "nosebleed": {
        "first_aid": "1. Sit upright and lean slightly forward\n2. Pinch the soft part of your nose firmly\n3. Hold for 10-15 minutes without checking\n4. Apply ice to the bridge of your nose\n5. Avoid blowing your nose for several hours",
        "warning": "Seek care if bleeding lasts over 20 minutes, follows a head injury, or happens frequently."
    },
    "default": {
        "first_aid": "1. Keep the area clean and protected\n2. Apply ice for swelling if applicable\n3. Rest and avoid aggravating activities\n4. Monitor symptoms for changes\n5. Take over-the-counter pain relief as needed",
        "warning": "Seek medical attention if symptoms worsen, don't improve within 48 hours, or new symptoms develop."
    }
}


class TriageService:
    """Demo triage service using rules-based keyword matching."""

    def assess(self, description: str, has_image: bool = False) -> Dict:
        text = description.lower().strip()

        # Check emergency
        for keyword in EMERGENCY_KEYWORDS:
            if keyword in text:
                return self._emergency_response(description, keyword)

        # Check urgent
        for keyword in URGENT_KEYWORDS:
            if keyword in text:
                return self._urgent_response(description, keyword, has_image)

        # Non-urgent assessment
        return self._non_urgent_response(description, has_image)

    def _emergency_response(self, description: str, trigger: str) -> Dict:
        return {
            "urgency": "emergency",
            "ai_response": (
                "🚨 **EMERGENCY — Seek immediate medical attention** 🚨\n\n"
                f"Your description mentions symptoms that may indicate a serious emergency.\n\n"
                "**Call 999 (Bangladesh) or your local emergency number immediately.**\n\n"
                "Do NOT wait for online assessment results. Go to the nearest emergency department or call an ambulance.\n\n"
                "⚠️ This is an automated preliminary screening, NOT a medical diagnosis."
            ),
            "observations": f"The description mentions '{trigger}' which is flagged as a potential emergency indicator.",
            "limitations": "This automated system cannot assess the true severity of your condition. Only a qualified medical professional can provide a proper evaluation.",
            "next_steps": "1. Call 999 or your local emergency number immediately\n2. Go to the nearest emergency department\n3. Do not delay seeking care",
            "first_aid": "While waiting for emergency services, stay calm and follow any instructions given by the emergency dispatcher.",
            "warning_signs": "Any change in consciousness, difficulty breathing, severe pain, or heavy bleeding requires immediate emergency care.",
        }

    def _urgent_response(self, description: str, trigger: str, has_image: bool) -> Dict:
        # Find matching first aid
        first_aid_key = "default"
        for key in FIRST_AID_GUIDANCE:
            if key in description.lower():
                first_aid_key = key
                break

        guidance = FIRST_AID_GUIDANCE[first_aid_key]
        image_note = ""
        if has_image:
            image_note = "\n\n📷 *An image was provided. Note: Image analysis is in demo mode. Visual assessment alone cannot determine injury severity, internal damage, or infection status.*"

        return {
            "urgency": "urgent",
            "ai_response": (
                "⚠️ **Urgent — Medical attention recommended**\n\n"
                f"Based on your description, this condition may need prompt medical attention.\n\n"
                "This is a preliminary assessment and NOT a diagnosis. Please see a healthcare professional."
                + image_note
            ),
            "observations": f"The description indicates symptoms associated with '{trigger}'. This requires medical evaluation.",
            "limitations": "This system cannot determine the true extent of injury or illness. Internal damage, fractures, infections, and other conditions require professional examination.",
            "next_steps": "1. Consider visiting a doctor or urgent care clinic today\n2. Follow the first aid guidance below\n3. Monitor symptoms for worsening\n4. If symptoms become severe, go to the emergency department",
            "first_aid": guidance["first_aid"],
            "warning_signs": guidance["warning"],
        }

    def _non_urgent_response(self, description: str, has_image: bool) -> Dict:
        first_aid_key = "default"
        for key in FIRST_AID_GUIDANCE:
            if key in description.lower():
                first_aid_key = key
                break

        guidance = FIRST_AID_GUIDANCE[first_aid_key]
        image_note = ""
        if has_image:
            image_note = "\n\n📷 *An image was provided. Note: Image analysis is in demo mode and cannot provide reliable visual assessment.*"

        return {
            "urgency": "non_urgent",
            "ai_response": (
                "ℹ️ **Non-urgent — Self-care with monitoring**\n\n"
                "Based on your description, this appears to be a non-urgent condition that may respond to basic self-care.\n\n"
                "However, this is NOT a diagnosis. If symptoms persist or worsen, please consult a healthcare professional."
                + image_note
            ),
            "observations": "Based on the description provided, this does not appear to show immediate emergency warning signs.",
            "limitations": "This automated system provides general educational information only. It cannot diagnose conditions, prescribe treatment, or assess the full clinical picture.",
            "next_steps": "1. Follow basic first aid guidance\n2. Monitor symptoms over the next 24-48 hours\n3. Schedule a doctor appointment if symptoms persist\n4. Keep the area clean and protected",
            "first_aid": guidance["first_aid"],
            "warning_signs": guidance["warning"],
        }
