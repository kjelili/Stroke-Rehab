# Agentic Workflow: MedGemma Decisions, Tool-Calling, Session Orchestration

This document describes the **agentic workflow** implemented for the Agentic Workflow Prize: **Patient → Continuous AI reasoning → Adaptive session → Structured summary → Proactive intervention**.

## Flow

1. **Patient** completes or starts a session; session history and optional regression alerts are available.
2. **Continuous AI reasoning**: MedGemma (via Gemini API with medical prompts) receives:
   - Recent sessions (state memory across sessions)
   - Current or just-finished session
   - Optional: regression detected (e.g. score drop ≥20%)
   - Optional: persisted patient/agent state (last intensity, last intervention)
3. **MedGemma makes decisions** and can **call tools**:
   - `set_therapy_intensity` — Select next therapy intensity: `low` | `medium` | `high`.
   - `trigger_regression_intervention` — When regression is detected: record reason and suggested action (e.g. reduce intensity, suggest clinician review).
   - `record_session_summary` — After a session: structured summary and next focus for the patient.
4. **Session orchestration**: Backend runs a tool-calling loop: send context to MedGemma → if it returns function calls, execute them and append results to conversation → repeat until MedGemma returns text only (no more tool calls).
5. **Structured summary** and **proactive intervention** are returned to the client and shown in the UI; the client persists **state memory** (recommended intensity, last intervention) for the next session.

## MedGemma must show

- **MedGemma selecting next therapy intensity** — Via tool `set_therapy_intensity`; result shown in Dashboard and session start.
- **Regression detection triggering tool calls** — When the client sends `regressionDetected: true` (and alert context), the prompt asks MedGemma to consider calling `trigger_regression_intervention`; the backend executes it and returns the intervention to the UI.
- **State memory across sessions** — Session history and optional `patientState` (last intensity, last intervention) are sent to the orchestration API; the model’s decisions are persisted on the client for the next session.

## API

- **POST /api/agentic/orchestrate**  
  Body: `{ sessions, currentSession?, regressionDetected?, alerts?, patientState? }`  
  Returns: `{ recommendedIntensity?, interventions?, sessionSummary?, reasoning?, toolCallsMade? }`

## Frontend

- **Dashboard**: Shows “MedGemma recommends: intensity X” and last intervention (if any).
- **Session start**: Can call orchestrate to get recommended intensity; session can use it (e.g. duration or difficulty).
- **Session end**: Call orchestrate with completed session; show structured summary and next steps.
- **Clinician / regression**: When regression is detected, call orchestrate with `regressionDetected: true`; show “Regression detected → MedGemma: …” and any `trigger_regression_intervention` result.

## Tool definitions (backend)

Defined as Gemini function declarations and executed in `backend/src/agentic.js`; see that file for the exact schema and execution logic.
