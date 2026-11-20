# Clinical Safety Protocols & Platform Limitations

## Core Safety Imperatives
Medinexa AI is a health-tech prototype designed for first-aid education, hospital discovery, and care navigation. **It is NOT an automated diagnostic device.**

### 1. Emergency Red-Flag Overrides
If user input includes indicators of immediate life threats:
- Heavy/uncontrolled arterial hemorrhage
- Crushing chest pain or cardiac distress
- Stroke symptoms (facial drooping, arm weakness, slurred speech)
- Complete obstruction of airway or cyanosis
- Sudden loss of consciousness or convulsions

**System Action**: The system displays a prominent emergency banner instructing the user to call local emergency dispatch (**999** in Bangladesh) or proceed directly to an emergency department.

### 2. Limitations of Multimodal Image Screening
- Visual examination cannot rule out deep tissue infection, internal bleeding, or bone fractures.
- Images with low resolution or inadequate lighting may obscure clinical details.
- AI inferences are always framed as *cautious preliminary observations*, never definitive diagnoses.

### 3. Data Integrity & Transparent Demo Labels
- All unverified providers or simulation data are flagged as `Demo`.
- Doctor availability is not represented as real-time until verified via live integration.
