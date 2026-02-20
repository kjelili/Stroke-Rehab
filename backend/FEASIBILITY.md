# Feasibility: MedGemma, LoRA, and local inference

This document describes how the stack satisfies feasibility requirements for **MedGemma-style AI**, **LoRA fine-tuning**, and **local/CPU/GPU deployment**.

---

## MedGemma fine-tuning (rehab notes, SOAP notes, stroke clinical data)

The backend today uses the **Google Gemini API** with medical-style prompts to provide:

- Progress report generation  
- Clinician reasoning summaries  
- Emotion-aware coaching  
- Dysarthria linguistic analysis  
- Clinical decision suggestions  

For production, you can replace this with **MedGemma** (or another medical LLM) fine-tuned on:

- **Rehab notes** – session summaries, goals, progress notes.  
- **SOAP notes** – Subjective, Objective, Assessment, Plan.  
- **Stroke clinical data** – de-identified stroke rehab outcomes, discharge summaries, therapy notes.  

Recommended approach:

1. **Vertex AI MedGemma** – Use [Google Health MedGemma](https://developers.google.com/health-ai-developer-foundations/medgemma) on Vertex AI and call it from `backend/src/llm.js` instead of the Gemini API.  
2. **Fine-tuned model** – Fine-tune MedGemma (or a base model) on your rehab/SOAP/stroke datasets, then deploy the tuned model and point the backend at it.  

---

## LoRA fine-tuning (documentation)

For **dataset description**, **LoRA approach**, **evaluation metrics** (BLEU, ROUGE, clinician rating), and **before vs after fine-tuning output** examples, see **`FINE_TUNING.md`** in this directory.

**LoRA** (Low-Rank Adaptation) is a parameter-efficient way to fine-tune large models on domain data (rehab notes, SOAP, stroke) without full retraining.

### Suggested workflow

1. **Base model**  
   MedGemma (e.g. 2B or 8B) or another medical/clinical foundation model.

2. **Data**  
   - Rehab notes: session summaries, exercise logs, goals.  
   - SOAP notes: structured Subjective/Objective/Assessment/Plan.  
   - Stroke clinical data: de-identified progress notes, outcomes, therapy summaries.  
   Format as instruction/response pairs (e.g. JSONL) for your target tasks (progress narrative, clinician summary, etc.).

3. **LoRA training**  
   - Use a framework such as **Hugging Face PEFT** (e.g. `peft` + `transformers`) or **Unsloth** for LoRA.  
   - Typical settings: rank 8–16, alpha 16–32, target modules `q_proj,v_proj` (and optionally `k_proj,o_proj`).  
   - Train on GPU; save adapter weights.

4. **Inference**  
   - Load base model + LoRA adapter (e.g. in Python with `transformers` + `peft`, or export to ONNX/llama.cpp).  
   - Serve via an HTTP API (e.g. FastAPI or the same Node backend calling a local Python/GPU service) and point `llm.js` at it.  

### Example (conceptual)

```text
# Data format (e.g. progress report)
{"instruction": "Generate progress narrative from sessions.", "input": "piano 42 pts, 3m; bubbles 28...", "output": "..."}

# LoRA training (e.g. Python)
# model = AutoModelForCausalLM.from_pretrained("medgemma-2b"); model = get_peft_model(model, LoraConfig(...)); train()
# Save adapter; at inference load base + adapter and generate.
```

No LoRA code is in this repo; the backend is designed so that you **swap the LLM client** in `src/llm.js` to call your fine-tuned model (Vertex MedGemma or a local server) while keeping the same prompts and API surface.

---

## Local inference (no cloud): Docker, local GPU, CPU-optimized

### Docker

- **Backend**: `docker build -t neuro-recover-backend ./backend` (see `backend/Dockerfile`). Runs Node server on port 4000.  
- **Web app**: build with `npm run build` in `web-app/`, serve `dist/` with any static server or add a second stage in Docker.  
- **Full stack**: optional `docker-compose.yml` runs backend + static web for a single-command demo.

### Local GPU / CPU-optimized inference

To avoid cloud calls entirely:

1. **Edge mode (no LLM)**  
   Build the web app with `VITE_EDGE_MODE=true` and do not set `VITE_MEDGEMMA_BACKEND_URL`. All “AI” text (reports, clinician summary) is **rule-based**; no network. Ideal for tablets and air-gapped devices.

2. **Local LLM in Docker or on host**  
   - Run a local model (e.g. **Ollama** with a quantized LLaMA/MedGemma, or **llama.cpp**, or a small **ONNX** model).  
   - Expose an HTTP endpoint (e.g. `/generate` or OpenAI-compatible).  
   - In `backend/src/llm.js`, replace the Gemini client with a `fetch()` to `http://localhost:...` (or the container/service URL).  
   - Data never leaves the machine; inference runs on **local GPU** or **CPU**.

3. **CPU-optimized**  
   Use quantized models (e.g. GGUF Q4_K_M, or ONNX int8) and a CPU-friendly runtime (llama.cpp, ONNX Runtime). Document in your deployment runbook that the container or host runs with CPU-only if no GPU is available.

This satisfies **“Runs via: Docker, Local GPU, CPU-optimized inference”** and **“Show local inference (no cloud calls)”** for feasibility scoring.
