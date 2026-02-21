# Neuro-Recover — Remotion Video Project

Programmatic video demos for the **Neuro-Recover** AI-powered stroke rehabilitation platform.  
Built with [Remotion](https://www.remotion.dev/) — videos are fully written in React + TypeScript.

---

## 📹 Two Videos Included

### 1. `LiveDemo` — Technical Live Demo (3 minutes)
Aimed at **developers, investors, and clinical tech evaluators**.  
Shows the app actually works — architecture, CV tracking, speech engine, adaptive games, AI companion, and dashboard analytics.

| Scene | Duration | Content |
|---|---|---|
| 1 | 6s | Title card, feature overview |
| 2 | 12s | System architecture + tech stack |
| 3 | 18s | Patient onboarding flow |
| 4 | 24s | Computer vision pose tracking (live animated skeleton) |
| 5 | 30s | Speech analysis engine + waveform + phoneme grid |
| 6 | 30s | Adaptive game mechanics (catch-the-ball simulation) |
| 7 | 30s | AI companion chat interface |
| 8 | 30s | Clinician dashboard + analytics + closing |

### 2. `AdvertDemo` — Marketing Advertisement (3 minutes)
Aimed at **patients, carers, and clinicians**.  
Emotional arc: frustration → hope → engagement → proof → trust → call to action.

| Scene | Duration | Content |
|---|---|---|
| 1 | 8s | Problem: 80% of patients drop out of rehab |
| 2 | 12s | Brand reveal — cinematic flash + logo |
| 3 | 20s | Feature showcase: Vision / Speech / Games |
| 4 | 30s | Patient recovery journey with animated metrics |
| 5 | 30s | Clinical trust signals + NHS/NICE alignment |
| 6 | 40s | 3 testimonials: patient, clinician, carer |
| 7 | 40s | CTA: Start free trial / For clinicians |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (v22 confirmed working)
- npm 10+
- Chrome installed (Remotion uses it for rendering)

### Install & Run Studio

```bash
cd neuro-recover-videos
npm install
npm start
```

This opens **Remotion Studio** at `http://localhost:3000`.  
Use the sidebar to select `LiveDemo` or `AdvertDemo`.  
Press Space to play, scrub the timeline with the slider.

### Render to MP4

```bash
# Render Live Demo
npm run render:live-demo
# Output: out/live-demo.mp4

# Render Advert Demo  
npm run render:advert
# Output: out/advert-demo.mp4

# Or render both with Remotion CLI directly:
npx remotion render src/index.ts LiveDemo out/live-demo.mp4 --codec=h264
npx remotion render src/index.ts AdvertDemo out/advert-demo.mp4 --codec=h264
```

---

## 📁 Project Structure

```
neuro-recover-videos/
├── src/
│   ├── index.ts                     # Remotion entry point (registerRoot)
│   ├── Root.tsx                     # Registers both compositions
│   ├── components/
│   │   ├── tokens.ts                # Brand colours, fonts, video config
│   │   └── SharedComponents.tsx     # Reusable animated components
│   ├── LiveDemo/
│   │   └── LiveDemo.tsx             # Full 3-min live demo (8 scenes)
│   └── AdvertDemo/
│       └── AdvertDemo.tsx           # Full 3-min advert (7 scenes)
├── public/                          # Static assets (add images/fonts here)
├── out/                             # Rendered MP4s go here
├── package.json
├── tsconfig.json
└── remotion.config.ts
```

---

## 🎨 Design System

All brand tokens are in `src/components/tokens.ts`:

| Token | Value | Usage |
|---|---|---|
| `COLORS.brain` | `#7C3AED` | Primary purple — AI/brain |
| `COLORS.neural` | `#06B6D4` | Cyan — connections |
| `COLORS.energy` | `#10B981` | Emerald — progress/health |
| `COLORS.warmth` | `#F59E0B` | Amber — gamification |
| `COLORS.dark` | `#0F0A1E` | Background |

Video spec: **1920×1080px @ 30fps**, 5400 frames = 180 seconds = 3 minutes exactly.

---

## 🔧 Remotion Key APIs Used

| API | Purpose |
|---|---|
| `useCurrentFrame()` | Get current frame number for animation |
| `useVideoConfig()` | Get fps, width, height, durationInFrames |
| `interpolate()` | Map frame ranges to CSS values (opacity, translateY, etc.) |
| `spring()` | Physics-based bounce/spring animations |
| `<Sequence>` | Time-shift and segment scenes |
| `<AbsoluteFill>` | Full-composition layer |

### Animation pattern (used throughout):

```tsx
const frame = useCurrentFrame();
const { fps } = useVideoConfig();

// Linear interpolation (e.g. fade in over 20 frames starting at frame 30)
const opacity = interpolate(frame, [30, 50], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});

// Spring animation (natural bounce feel)
const scale = spring({ frame, fps, from: 0, to: 1, config: { stiffness: 80, damping: 18 } });
```

---

## 🛠️ Customisation Guide

### Swapping in real app screenshots
1. Add your screenshots/screen recordings to `public/`
2. Replace SVG mockups in `LiveDemo.tsx` scenes with:
```tsx
import { Img, staticFile } from 'remotion';
<Img src={staticFile('screenshot.png')} style={{ width: '100%' }} />
```

### Adding real video footage
```tsx
import { OffthreadVideo, staticFile } from 'remotion';
<OffthreadVideo src={staticFile('patient-session.mp4')} />
```

### Adding voiceover/music
```tsx
import { Audio, staticFile } from 'remotion';
<Audio src={staticFile('voiceover.mp3')} />
```

### Changing duration
In `src/components/tokens.ts`, adjust:
```ts
export const VIDEO_CONFIG = {
  fps: 30,
  durationFrames: 5400, // 3 min. Change e.g. to 3600 for 2 min
};
```
Then update the scene `durationInFrames` values in each composition accordingly.

---

## ☁️ Cloud Rendering (Remotion Lambda)
For faster render times (parallelised on AWS Lambda):

```bash
npm install @remotion/lambda
npx remotion lambda sites create src/index.ts
npx remotion lambda render <SITE_ID> LiveDemo
```

See [Remotion Lambda docs](https://www.remotion.dev/docs/lambda) for full setup.

---

## 📖 Documentation References
- Remotion fundamentals: https://www.remotion.dev/docs/the-fundamentals
- Animation: https://www.remotion.dev/docs/animating-properties
- `interpolate()`: https://www.remotion.dev/docs/interpolate
- `spring()`: https://www.remotion.dev/docs/spring
- `<Sequence>`: https://www.remotion.dev/docs/sequence
- API overview: https://www.remotion.dev/docs/api

---

## 🔑 Remotion License Note
Remotion is free for personal/open-source projects.  
Companies with revenue > $1M/year need a commercial licence.  
See: https://www.remotion.dev/docs/license

---

Built with ❤️ for **Neuro-Recover** — github.com/kjelili/Stroke-Rehab
