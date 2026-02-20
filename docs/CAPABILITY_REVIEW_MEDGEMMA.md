# Capability Review: MedGemma-Based Features

This document compares the requested MedGemma-backed capabilities with what the Neuro-Recover app currently implements.

| Component | Requested model | Current capability | Gap |
| --------- | --------------- | ------------------ | --- |
| **Progress report generation** | MedGemma | Rule-based PDF export only. Session and progress reports use **fixed templates** and **deterministic “AI interpretation”** (score/reaction/duration rules + digital-twin recovery message). No LLM. | **No** MedGemma. Would need an API that calls MedGemma to generate narrative progress summaries. |
| **Clinician reasoning summaries** | MedGemma | **Rule-based alerts** only (e.g. “score dropped from X to Y. Consider review.”). Clinician dashboard shows session table and these alerts. No natural-language reasoning or summaries. | **No** MedGemma. Would need MedGemma (or similar) to produce clinician-facing reasoning summaries from session/trend data. |
| **Emotion-aware patient coaching** | MedGemma fine-tuned | **Keyword-based** only. Voice uses browser **Speech Recognition** to detect “tired”, “hard”, “hurts” and shows fixed responses (break, easier mode, rest). Coach banner uses **rule-based** messages (score, reaction time, improvement %). No emotion detection, no LLM. | **No** MedGemma. Would need MedGemma (e.g. fine-tuned) to infer emotion from voice/text and generate adaptive coaching. |
| **Dysarthria linguistic pattern analysis** | MedGemma | **None.** No speech/language analysis. Voice is used only for keyword spotting (tired/hard/hurts). No transcription analysis for dysarthria or other linguistic patterns. | **No** MedGemma. Would need speech input plus MedGemma (or a dedicated model) for dysarthria/linguistic analysis. |
| **Clinical decision suggestions** | MedGemma | **Rule-based** only. Clinician view suggests “Consider review” when score drops &gt;20%. No LLM-generated suggestions or differential-style guidance. | **No** MedGemma. Would need MedGemma to propose clinical decision suggestions from patient/session context. |

---

## Summary

- **The app does not currently use MedGemma (or any LLM) for any of the five components.**
- Progress reports, clinician alerts, coaching, and “AI interpretation” are all **rule-based / template-based**.
- Voice is **browser Speech Recognition** for a few keywords only; no emotion or dysarthria analysis.
- The only AI model in use is **MediaPipe Hand Landmarker** (client-side) for hand tracking.

To add the requested capabilities you would need to:

1. Introduce a backend (or serverless) API that calls **MedGemma** (or a hosted variant).
2. **Progress reports:** Send session/trend data to MedGemma; use generated narrative in PDF and UI.
3. **Clinician summaries:** Send session/alert context to MedGemma; display generated reasoning summaries in the clinician dashboard.
4. **Emotion-aware coaching:** Send voice/transcript (and optionally tone) to a fine-tuned MedGemma; use output to drive coaching messages and suggestions.
5. **Dysarthria analysis:** Send speech/transcript to MedGemma (or a specialist model); surface linguistic pattern analysis for clinicians or adaptation.
6. **Clinical decision suggestions:** Send patient/session/trend context to MedGemma; show suggested actions or follow-ups in the clinician view.

This file can sit in `docs/` alongside other implementation and compliance notes.
