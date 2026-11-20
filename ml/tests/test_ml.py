"""
Unit tests for Medinexa ML & Triage Safety Engine
"""

from ml.triage.engine import TriageEngine
from ml.recommendation.recommender import RecommendationEngine
from ml.injury_assessment.model import InjuryAssessmentModel

def test_emergency_trigger_chest_pain():
    res = TriageEngine.evaluate("Patient has severe crushing chest pain")
    assert res["urgency"] == "emergency"
    assert res["requires_immediate_dispatch"] is True
    assert res["emergency_phone"] == "999"

def test_emergency_trigger_severe_bleeding():
    res = TriageEngine.evaluate("Cut leg and there is severe bleeding won't stop")
    assert res["urgency"] == "emergency"

def test_urgent_trigger_fracture():
    res = TriageEngine.evaluate("Fell from stairs and suspected broken bone in forearm")
    assert res["urgency"] == "urgent"

def test_non_urgent_cold():
    res = TriageEngine.evaluate("Mild runny nose and sneezing for one day")
    assert res["urgency"] == "non_urgent"

def test_specialty_matching():
    spec = RecommendationEngine.match_specialty("Experiencing red itchy skin rash on arm")
    assert spec == "Dermatology"

def test_vision_model_safety():
    model = InjuryAssessmentModel()
    res = model.predict(None, "Cut on finger")
    assert res["is_clinically_validated"] is False
    assert "limitations" in res
