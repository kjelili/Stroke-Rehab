# Neuro-Recover — Remotion Video Project (Enhanced)

Programmatic 3-minute videos for **Neuro-Recover** built with Remotion + ElevenLabs.
Includes **real app screenshots**, **animated game simulations**, and **AI voiceover**.

---

## 🚀 Quick Start (3 steps)

### Step 1 — Install
```powershell
cd neuro-recover-videos
npm install
```

### Step 2 — Generate voiceover (ElevenLabs)
```powershell
$env:ELEVENLABS_API_KEY="your_api_key_here"
node generate-voiceover.js
```
Get a FREE key at https://elevenlabs.io (10,000 chars/month free)

### Step 3 — Preview
```powershell
npm start        # Opens Remotion Studio at localhost:3000
```

### Render to MP4
```powershell
npm run render:live-demo    # → out/live-demo.mp4
npm run render:advert       # → out/advert-demo.mp4
```

---

## 🎙️ ElevenLabs Setup

1. Go to https://elevenlabs.io → sign up free
2. Profile → API Key → copy it
3. Run: `$env:ELEVENLABS_API_KEY="sk_..."` then `node generate-voiceover.js`

Voices: **Adam** (authoritative, Live Demo) + **Rachel** (warm, Advert)

---

## 📁 Structure

```
neuro-recover-videos/
├── src/
│   ├── index.ts / Root.tsx
│   ├── voiceover/scripts.ts       ← all scripts + frame timings
│   ├── components/tokens.ts
│   ├── components/SharedComponents.tsx
│   ├── LiveDemo/LiveDemo.tsx      ← 10-scene technical demo
│   └── AdvertDemo/AdvertDemo.tsx  ← 8-scene cinematic advert
├── public/
│   ├── audio/                     ← ElevenLabs MP3s (auto-created)
│   ├── screen-*.png               ← 9 real app screenshots
├── generate-voiceover.js          ← ElevenLabs generator script
└── out/                           ← Rendered MP4s
```

---

## 🎬 Scene Maps

### Live Demo (3 min)
S1 Title → S2 Hero+Tech → S3 Six Games → S4 Piano → S5 Bubbles → S6 Reach&Hold → S7 Progress → S8 Clinician → S9 MedGemma → S10 Closing

### Advert (3 min)
A1 Problem → A2 Brand Reveal → A3 Features → A4 All Six Games → A5 Clinician View → A6 Trust Signals → A7 Testimonials → A8 CTA

---

## 📖 Key Docs
- Remotion: https://www.remotion.dev/docs/the-fundamentals
- interpolate: https://www.remotion.dev/docs/interpolate
- spring: https://www.remotion.dev/docs/spring
- Audio: https://www.remotion.dev/docs/audio
- ElevenLabs API: https://elevenlabs.io/docs/api-reference/text-to-speech

github.com/kjelili/Stroke-Rehab
