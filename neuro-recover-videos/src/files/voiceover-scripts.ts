/**
 * Voiceover Scripts & Timing
 * ==========================
 * Each entry maps a voiceover segment to frame ranges.
 * Generate MP3s via ElevenLabs and place in public/audio/
 *
 * ElevenLabs API: POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
 * Recommended voice: "Rachel" (professional, warm) voice_id: 21m00Tcm4TlvDq8ikWAM
 * Or "Adam" (authoritative) voice_id: pNInz6obpgDQGcFmaJgB
 */

export interface VoiceSegment {
  id: string;
  text: string;
  startFrame: number;
  durationFrames: number;
  file: string; // filename in public/audio/
}

// ── LIVE DEMO VOICEOVER (3 min @ 30fps) ──────────────────────────────────────
export const LIVE_DEMO_VOICE: VoiceSegment[] = [
  {
    id: 'live-01',
    text: "Welcome to Neuro-Recover — an AI-powered, gamified stroke rehabilitation platform built for the real world.",
    startFrame: 0,
    durationFrames: 180,
    file: 'live-01.mp3',
  },
  {
    id: 'live-02',
    text: "The platform runs entirely in the browser — no app install, no specialist hardware. Just a webcam and a patient.",
    startFrame: 180,
    durationFrames: 270,
    file: 'live-02.mp3',
  },
  {
    id: 'live-03',
    text: "Hand tracking detects finger positions at 30 frames per second using MediaPipe — right in the browser via WebAssembly.",
    startFrame: 450,
    durationFrames: 300,
    file: 'live-03.mp3',
  },
  {
    id: 'live-04',
    text: "Here's the Virtual Piano game. The patient extends each finger to trigger a key — building finger isolation and reaction time. The camera feed shows live hand detection.",
    startFrame: 750,
    durationFrames: 360,
    file: 'live-04.mp3',
  },
  {
    id: 'live-05',
    text: "Bubble Popper. Reach, pinch, and pop. The difficulty adapts in real time — slower and larger bubbles when fatigued, faster when improving. No manual tuning required.",
    startFrame: 1110,
    durationFrames: 360,
    file: 'live-05.mp3',
  },
  {
    id: 'live-06',
    text: "Reach and Hold. The patient extends their index finger to a moving target and holds for one-point-five seconds. 14 reaches logged in this session.",
    startFrame: 1470,
    durationFrames: 330,
    file: 'live-06.mp3',
  },
  {
    id: 'live-07',
    text: "Every session feeds into the Progress dashboard. Scores, durations, and game types — all timestamped and exportable.",
    startFrame: 1800,
    durationFrames: 330,
    file: 'live-07.mp3',
  },
  {
    id: 'live-08',
    text: "The Clinician Dashboard shows the recovery curve across sessions. Feb 15th shows a regression — the system flags it automatically. One click exports the full session history as HL7 FHIR.",
    startFrame: 2130,
    durationFrames: 420,
    file: 'live-08.mp3',
  },
  {
    id: 'live-09',
    text: "MedGemma processes raw biomarker data — range of motion, smoothness, tremor, and fatigue — and generates a structured clinical summary, running fully offline using open-weight models.",
    startFrame: 2550,
    durationFrames: 420,
    file: 'live-09.mp3',
  },
  {
    id: 'live-10',
    text: "Neuro-Recover brings AI-powered neurorehabilitation to any clinical environment — without reliance on centralised infrastructure. Open source. TypeScript. Docker-ready. Available now.",
    startFrame: 2970,
    durationFrames: 430,
    file: 'live-10.mp3',
  },
];

// ── ADVERT VOICEOVER (3 min @ 30fps) ─────────────────────────────────────────
export const ADVERT_VOICE: VoiceSegment[] = [
  {
    id: 'ad-01',
    text: "Over eighty percent of stroke survivors fail to complete their prescribed physiotherapy. Not because they can't. Because it's repetitive, isolating, and gives no sense of progress.",
    startFrame: 60,
    durationFrames: 360,
    file: 'ad-01.mp3',
  },
  {
    id: 'ad-02',
    text: "Neuro-Recover changes that.",
    startFrame: 480,
    durationFrames: 120,
    file: 'ad-02.mp3',
  },
  {
    id: 'ad-03',
    text: "It turns your recovery exercises into games — adapting to you in real time, tracking your progress objectively, and celebrating every improvement.",
    startFrame: 660,
    durationFrames: 360,
    file: 'ad-03.mp3',
  },
  {
    id: 'ad-04',
    text: "Play the Virtual Piano with your fingers. Pop bubbles with a pinch. Reach and hold targets to rebuild stability. Every movement counts.",
    startFrame: 1080,
    durationFrames: 360,
    file: 'ad-04.mp3',
  },
  {
    id: 'ad-05',
    text: "Your clinician sees everything. The recovery curve. Session by session. Regressions flagged automatically so nothing is missed.",
    startFrame: 1500,
    durationFrames: 330,
    file: 'ad-05.mp3',
  },
  {
    id: 'ad-06',
    text: "Built with neurologists and physiotherapists. Aligned to NICE stroke rehabilitation guidelines. GDPR compliant. NHS compatible.",
    startFrame: 1890,
    durationFrames: 330,
    file: 'ad-06.mp3',
  },
  {
    id: 'ad-07',
    text: "I actually look forward to my exercises now. For the first time, I can see myself getting better.",
    startFrame: 2280,
    durationFrames: 300,
    file: 'ad-07.mp3',
  },
  {
    id: 'ad-08',
    text: "The data granularity I get from Neuro-Recover far exceeds what I could observe in a weekly clinic.",
    startFrame: 2640,
    durationFrames: 270,
    file: 'ad-08.mp3',
  },
  {
    id: 'ad-09',
    text: "Dad actually does his exercises without me having to remind him. The games make it something he genuinely wants to do.",
    startFrame: 2970,
    durationFrames: 300,
    file: 'ad-09.mp3',
  },
  {
    id: 'ad-10',
    text: "Neuro-Recover. Rehabilitation, reimagined. Every rep counts. Every word matters. Every day is progress.",
    startFrame: 3360,
    durationFrames: 300,
    file: 'ad-10.mp3',
  },
  {
    id: 'ad-11',
    text: "Free to start. Works on any device. Start your recovery today.",
    startFrame: 3720,
    durationFrames: 240,
    file: 'ad-11.mp3',
  },
];
