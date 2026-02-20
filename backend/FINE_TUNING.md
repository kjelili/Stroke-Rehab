# Fine-tuning section: dataset, LoRA, evaluation, before/after

This section documents how to fine-tune a MedGemma-style model for Neuro-Recover: **dataset description**, **LoRA approach**, **evaluation metrics** (BLEU, ROUGE, clinician rating), and **before vs after fine-tuning output** examples.

---

## 1. Dataset description

Fine-tuning targets the following **domain data** (all de-identified where required):

| Dataset | Description | Use in pipeline |
|--------|--------------|------------------|
| **Rehab session notes** | Short narrative summaries of therapy sessions: game type, duration, scores, ROM/tremor/smoothness, and one- or two-sentence clinician impression. | Progress report generation, session interpretation, SOAP Objective/Assessment. |
| **SOAP notes** | Structured Subjective, Objective, Assessment, Plan notes from stroke rehab. Subjective: patient/caregiver report. Objective: vitals, session metrics, ROM. Assessment: trend and risk. Plan: next steps. | SOAP formatter, clinical reasoning. |
| **Stroke clinical data** | De-identified stroke rehab outcomes: discharge summaries, therapy logs, progress notes, and (where available) ICD-10 and FHIR-style snippets. | ICD-10 tagging, FHIR structuring, clinical reasoning. |

**Format for training**  
- Instruction/response pairs in JSONL, e.g.:  
  `{"instruction": "Generate a SOAP note from this session data.", "input": "<session summary>", "output": "Subjective: ...\nObjective: ...\nAssessment: ...\nPlan: ..."}`  
- For ICD-10 and FHIR, output is JSON; instruction/input/output should match the API contracts (code lists, Bundle structure).

**Volume (indicative)**  
- Minimum: 500–1k instruction/response pairs per task for LoRA.  
- Better: 2k–5k for rehab notes + SOAP; 1k+ for ICD-10/FHIR if code diversity is high.

---

## 2. LoRA approach

**Base model**  
MedGemma (e.g. 2B or 8B) or another medical/clinical foundation model.

**Method**  
- **LoRA** (Low-Rank Adaptation): train only low-rank matrices on top of selected linear layers (e.g. `q_proj`, `v_proj`; optionally `k_proj`, `o_proj`).  
- **Typical hyperparameters**: rank 8–16, alpha 16–32, dropout 0.05–0.1, 1–3 epochs.  
- **Framework**: Hugging Face PEFT (`peft` + `transformers`) or Unsloth.  
- **Output**: adapter weights only; at inference, load base model + adapter.

**Training**  
- Separate (or mixed) JSONL per task: progress report, session interpretation, SOAP, clinical reasoning, ICD-10, FHIR-style.  
- Max sequence length aligned with longest examples (e.g. 512–1024).  
- Optimizer: AdamW; LR 2e-5–5e-5 typical for LoRA.

**Deployment**  
- Replace the Gemini client in `backend/src/llm.js` with a call to a server that loads base + LoRA (e.g. Python FastAPI with `transformers` + `peft`, or TGI/Vertex) so all current endpoints (generative + clinical reasoning, SOAP, ICD-10, FHIR) use the fine-tuned model.

---

## 3. Evaluation metrics

| Metric | Purpose |
|--------|--------|
| **BLEU** | N-gram overlap between model output and reference (e.g. progress report, SOAP sections). Use for fluency and terminology overlap. |
| **ROUGE** | ROUGE-1/2/L F1 for recall of key phrases and sentence overlap. Use for progress narratives and SOAP. |
| **Clinician rating** | Human evaluation (e.g. 1–5) on relevance, safety, and clinical appropriateness. Sample 50–100 outputs per task; report mean and variance. |

**Suggested reporting**  
- **Before fine-tuning**: run the same eval set with the base model (zero-shot or with current prompts). Report BLEU, ROUGE, and (if available) clinician rating.  
- **After fine-tuning**: same eval set with the LoRA adapter; report delta and statistical significance if applicable.

---

## 4. Before vs after fine-tuning output

Below are **illustrative** before (base model, zero-shot) vs after (LoRA fine-tuned on rehab/SOAP/stroke data) examples. Real numbers depend on your data and eval set.

### Progress report (narrative)

**Input (summary):**  
`piano 42 pts, 3m; bubbles 28, 2m; piano 38, 3m; bubbles 22, 2m.`

**Before (base, zero-shot):**  
*“The patient completed several sessions of piano and bubble games. Scores and duration suggest consistent participation. Continued practice may support motor recovery.”*

**After (fine-tuned):**  
*“Over the past week, piano scores improved from 38 to 42 with stable 3-minute sessions; bubble-popping volume is consistent (22–28). ROM and engagement are trending positively. Recommend maintaining current frequency and adding one reach-hold session next week.”*

*(Fine-tuned output uses domain terms and a clearer trend + plan.)*

---

### SOAP note (formatted)

**Input:** Same session summary + optional subjective: *“Patient said: a bit tired today.”*

**Before (base):**  
- Subjective and Objective often generic; Plan vague.

**After (fine-tuned):**  
- **Subjective:** “Patient reported feeling a bit tired today; agreed to shorter sessions.”  
- **Objective:** “Piano 42/3 min, Bubbles 28/2 min; ROM and reaction time within prior range.”  
- **Assessment:** “Stable performance despite fatigue; no decline in scores.”  
- **Plan:** “Continue home program; if fatigue persists, consider rest day or single game next session.”

*(Fine-tuned output is structured, uses session data explicitly, and aligns with SOAP style.)*

---

### ICD-10 tagging

**Input:** “Stroke rehab, right hemiplegia, upper limb exercise, fatigue reported.”

**Before (base):**  
Often generic or incomplete code set.

**After (fine-tuned):**  
e.g. `[{"code":"I69.351","description":"Hemiplegia of right dominant side following cerebral infarction"}, {"code":"G81.91","description":"Hemiplegia, unspecified affecting right dominant side"}, {"code":"R53.83","description":"Fatigue"}]`  
*(Fine-tuned model produces relevant, specific ICD-10-CM codes.)*

---

### Clinical reasoning (structured steps)

**Input:** Sessions + alert: “Piano score dropped 42 → 38.”

**Before (base):**  
Single paragraph or loosely ordered points.

**After (fine-tuned):**  
e.g. `["Step 1: Identify trend — piano score decreased from 42 to 38 over one week.", "Step 2: Consider confounders — check session duration and patient fatigue.", "Step 3: Compare to other games — bubbles stable; isolate to piano.", "Step 4: Recommendation — maintain frequency, consider difficulty or rest before piano."]`  
*(Fine-tuned output is stepwise and actionable.)*

---

## Summary

| Item | Content |
|------|--------|
| **Dataset** | Rehab session notes, SOAP notes, stroke clinical data (de-identified); JSONL instruction/input/output. |
| **LoRA** | PEFT/Unsloth; rank 8–16, alpha 16–32; train adapters; deploy base + adapter. |
| **Evaluation** | BLEU, ROUGE, clinician rating; report before (base) vs after (LoRA) on same eval set. |
| **Before/after** | Progress report, SOAP, ICD-10, and clinical reasoning examples show clearer structure and domain alignment after fine-tuning. |
