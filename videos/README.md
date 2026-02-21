# Neuro-Recover Edge — 3-minute advert (Remotion)

This folder contains a **Remotion** project that generates the 3-minute advert video with script, timings, and overlays. No screen recording required for the base render; you can optionally replace segments with B-roll or app capture.

## Script and timings

| Time       | Segment            | Content |
|-----------|--------------------|--------|
| **0:00–0:20**  | 1. Problem         | Real-world problem: bored patient doing repetitive exercises. |
| **0:20–1:00**  | 2. Live demo       | Hand tracking, bubble pop interaction, real-time ROM metric. |
| **1:00–1:40**  | 3. MedGemma        | Raw metrics → structured clinical summary. **Overlay:** “Running fully offline using open-weight MedGemma”. |
| **1:40–2:20**  | 4. Clinician       | Recovery curve, flagged regression, FHIR export. |
| **2:20–3:00**  | 5. Close           | “Neuro-Recover Edge brings AI-powered neurorehabilitation to any clinical environment, without reliance on centralized infrastructure.” |

## Setup

```bash
cd video
npm install
```

## Preview in Remotion Studio

```bash
npm run dev
```

Opens Remotion Studio so you can scrub the timeline, tweak content, and preview the full 3 minutes.

## Render to MP4

**Full 3-minute video:**

```bash
npm run render
```

Output: `out/advert.mp4` (1920×1080, 30fps, 3:00). Encoding may take several minutes.

**Test render (first 3 seconds):**

```bash
npx remotion render src/index.ts NeuroRecoverAdvert out/advert-test.mp4 --frames=0-90
```

To render with a different codec or path:

```bash
npx remotion render src/index.ts NeuroRecoverAdvert out/advert.mp4 --codec h264
```

## Shot list (for B-roll or replacement)

- **Segment 1:** B-roll of patient doing repetitive hand exercises (or keep current title slide).
- **Segment 2:** Screen capture of the app: `/demo` → Bubbles, hand in frame, pinch to pop, then session complete with ROM.
- **Segment 3:** Screen capture: Progress → Export PDF; add burn-in overlay “Running fully offline using open-weight MedGemma” (already in composition).
- **Segment 4:** Screen capture: Clinician dashboard (recovery curve, alerts, Export FHIR).
- **Segment 5:** Keep as closing title card or overlay on logo.

## Edit notes

- **Overlay text** is already in the composition for segment 3 (MedGemma) and segment 5 (closing line).
- **B-roll:** Replace any `<Segment*>` content in `src/NeuroRecoverAdvert.tsx` with `<Video src="path/to/broll.mp4" />` (from `remotion`) and trim with `Sequence` if needed.
- **Burn-in:** Overlays are drawn in the React components; adjust `overlayStyle` / `closingStyle` in `NeuroRecoverAdvert.tsx` for position and font.

## Composition details

- **ID:** `NeuroRecoverAdvert`
- **Duration:** 180 s (5400 frames at 30 fps)
- **Size:** 1920×1080
- **Entry:** `src/index.ts` → `Root.tsx` → `NeuroRecoverAdvert.tsx`
