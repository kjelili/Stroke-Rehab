/**
 * 3-minute Neuro-Recover Edge advert.
 * Script and timings: 0:00–0:20, 0:20–1:00, 1:00–1:40, 1:40–2:20, 2:20–3:00.
 */

import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';

const FPS = 30;

// Segment durations in seconds → frames
const S1 = 20 * FPS;   // 0:00–0:20  Problem
const S2 = 40 * FPS;   // 0:20–1:00  Live demo
const S3 = 40 * FPS;   // 1:00–1:40  MedGemma/offline
const S4 = 40 * FPS;   // 1:40–2:20  Clinician
const S5 = 40 * FPS;   // 2:20–3:00  Close

const bg = '#0f172a';
const surface = '#1e293b';
const brand = '#3b82f6';
const text = '#f1f5f9';
const muted = '#94a3b8';

const slideStyle: React.CSSProperties = {
  backgroundColor: bg,
  padding: 80,
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: 42,
  fontWeight: 700,
  color: brand,
  marginBottom: 24,
  textTransform: 'uppercase',
  letterSpacing: 2,
};

const scriptStyle: React.CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: 32,
  color: text,
  maxWidth: 900,
  lineHeight: 1.5,
};

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 60,
  left: 60,
  right: 60,
  fontFamily: 'system-ui, sans-serif',
  fontSize: 28,
  color: brand,
  fontWeight: 600,
  textAlign: 'center',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
};

const closingStyle: React.CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: 36,
  color: text,
  maxWidth: 1000,
  lineHeight: 1.6,
  fontWeight: 500,
};

// --- Segment 1: Real-world problem (0:00–0:20)
const Segment1Problem: React.FC = () => (
  <AbsoluteFill style={slideStyle}>
    <div style={titleStyle}>Real-world problem</div>
    <p style={scriptStyle}>
      Bored patient doing repetitive exercises.
    </p>
    <p style={{ ...scriptStyle, fontSize: 24, color: muted, marginTop: 32 }}>
      Repetitive exercises. Low engagement.
    </p>
  </AbsoluteFill>
);

// --- Segment 2: Live demonstration (0:20–1:00)
const Segment2LiveDemo: React.FC = () => (
  <AbsoluteFill style={slideStyle}>
    <div style={titleStyle}>Live demonstration</div>
    <p style={scriptStyle}>
      Hand tracking · Bubble pop interaction · Real-time ROM metric
    </p>
    <p style={{ ...scriptStyle, fontSize: 22, color: muted, marginTop: 48 }}>
      Neuro-Recover app: Dashboard → Bubbles. Camera + pinch to pop. Session metrics include ROM, tremor, smoothness.
    </p>
  </AbsoluteFill>
);

// --- Segment 3: MedGemma inference (1:00–1:40) + overlay
const Segment3MedGemma: React.FC = () => (
  <AbsoluteFill style={slideStyle}>
    <div style={titleStyle}>MedGemma inference (offline)</div>
    <p style={scriptStyle}>
      Raw metrics → structured clinical summary
    </p>
    <p style={{ ...scriptStyle, fontSize: 22, color: muted, marginTop: 32 }}>
      Progress → Export report (PDF). Rule-based or LLM narrative. No cloud required.
    </p>
    <div style={overlayStyle}>
      Running fully offline using open-weight MedGemma
    </div>
  </AbsoluteFill>
);

// --- Segment 4: Clinician dashboard (1:40–2:20)
const Segment4Clinician: React.FC = () => (
  <AbsoluteFill style={slideStyle}>
    <div style={titleStyle}>Clinician dashboard</div>
    <p style={scriptStyle}>
      Recovery curve · Flagged regression · FHIR export
    </p>
    <p style={{ ...scriptStyle, fontSize: 22, color: muted, marginTop: 32 }}>
      Score over time chart, alerts, and Export FHIR for interoperable data.
    </p>
  </AbsoluteFill>
);

// --- Segment 5: Close (2:20–3:00)
const Segment5Close: React.FC = () => (
  <AbsoluteFill style={slideStyle}>
    <div style={{ ...titleStyle, marginBottom: 48 }}>Neuro-Recover Edge</div>
    <p style={closingStyle}>
      Neuro-Recover Edge brings AI-powered neurorehabilitation to any clinical environment, without reliance on centralized infrastructure.
    </p>
  </AbsoluteFill>
);

export const NeuroRecoverAdvert: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <Sequence from={0} durationInFrames={S1} name="1. Problem">
        <Segment1Problem />
      </Sequence>
      <Sequence from={S1} durationInFrames={S2} name="2. Live demo">
        <Segment2LiveDemo />
      </Sequence>
      <Sequence from={S1 + S2} durationInFrames={S3} name="3. MedGemma">
        <Segment3MedGemma />
      </Sequence>
      <Sequence from={S1 + S2 + S3} durationInFrames={S4} name="4. Clinician">
        <Segment4Clinician />
      </Sequence>
      <Sequence from={S1 + S2 + S3 + S4} durationInFrames={S5} name="5. Close">
        <Segment5Close />
      </Sequence>
    </AbsoluteFill>
  );
};
