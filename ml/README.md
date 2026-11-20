# Medinexa AI — Machine Learning & Clinical Triage Service

This directory hosts the algorithmic and AI/ML services for Medinexa AI.

## Architecture & Safety Principles
Medinexa AI adheres strictly to clinical safety guidelines:
1. **Never Clinical Diagnosis**: Models provide preliminary risk and urgency classification only.
2. **Deterministic Emergency Overrides**: Any red-flag phrase (arterial hemorrhage, loss of consciousness, stroke signs, cardiac arrest indicators) short-circuits ML processing and directly yields an **Emergency (999)** protocol.
3. **No Fabricated Accuracies**: Seed and baseline classifiers are explicitly labeled as `Prototype / Non-Clinically Validated`.
4. **Metadata Sanitization**: All images have EXIF / GPS metadata stripped prior to storage or inference.

## Structure
- `injury_assessment/`: Vision-based wound and burn preliminary feature screening.
- `triage/`: Rule-based clinical triage engine and emergency keyword filtering.
- `recommendation/`: Medical specialty and healthcare facility ranking algorithm.
- `voice/`: Audio speech transcript analysis and medical entity extraction.
- `tests/`: Automated unit tests for safety rules, triage classification, and boundary conditions.
