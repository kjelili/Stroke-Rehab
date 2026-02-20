# Neuro-Recover Demo Video (Remotion)

Advertisement demo for **Neuro-Recover** — AI-Powered Stroke Rehabilitation.

## When to use

Run this **after** the main web app (`../web-app`) is built, tested, and verified.

## Mock session data (for advert recording)

To show a populated Dashboard and Progress in the web app when recording the advert:

1. **URL:** Open the app with `?seedDemo=1` or `?demo=1`, e.g. `http://localhost:5173/app?seedDemo=1`. Sessions are seeded once on load.
2. **Console:** In the browser console run `window.__seedMockSessions()` to seed; `window.__clearMockSessions()` to clear.

Seeded data includes Piano, Bubbles, and Grab cup sessions with varied scores and dates so the app looks active.

## Setup

```bash
cd demo-video
npm install
npx remotion browser ensure
```

The last command downloads Chrome Headless Shell so Remotion can render without a system Chrome.

## Preview (Remotion Studio)

```bash
npm run dev
```

Opens Remotion Studio. Choose composition **NeuroRecoverDemo** (short) or **NeuroRecoverAdvert** (intro → games → CTA).

## Render to MP4

- **Short demo (~10s):** `npm run render` → `out/demo.mp4`
- **Advert (~24s):** `npm run render:advert` → `out/advert.mp4`

## Compositions

| Id | Duration | Description |
|----|----------|-------------|
| NeuroRecoverDemo | 10s | Single-screen intro + tagline + copy + icons. |
| NeuroRecoverAdvert | 24s | Intro → **Piano placeholder** → **Bubbles placeholder** → CTA. Use placeholders as instructions for dropping in real gameplay clips in post. |

### Advert placeholders

- **Piano:** A slide titled "Virtual Piano" with a dashed box and the text "Drop Piano gameplay clip here". Replace that segment in post with a screen recording of the Piano game.
- **Bubbles:** Same idea for "Bubble Popper" and "Drop Bubbles gameplay clip here".

Edit `src/NeuroRecoverAdvert.tsx` for timing (spring delays, section boundaries) and copy.
