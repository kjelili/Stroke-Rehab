import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * Advert composition: Intro → Piano placeholder → Bubbles placeholder → CTA.
 * Use spring() and delay for sequencing. Drop real gameplay clips into the placeholder sections in post.
 * Duration: ~24s at 30fps (720 frames).
 */
const FPS = 30;
const INTRO_END = 180;
const PIANO_START = 180;
const PIANO_END = 360;
const BUBBLES_START = 360;
const BUBBLES_END = 540;
const CTA_START = 540;

export const NeuroRecoverAdvert: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 30, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const globalOpacity = fadeIn * fadeOut;

  const slideY = (s: number, pixels = 40) => interpolate(s, [0, 1], [pixels, 0], { extrapolateRight: 'clamp' });

  // —— Intro (0–180) ——
  const introIconSpring = spring({ frame, fps, config: { damping: 14, stiffness: 120 }, delay: 0 });
  const introTitleSpring = spring({ frame, fps, config: { damping: 14, stiffness: 120 }, delay: 10 });
  const introTaglineSpring = spring({ frame, fps, config: { damping: 14, stiffness: 120 }, delay: 22 });
  const introBodySpring = spring({ frame, fps, config: { damping: 15, stiffness: 100 }, delay: 34 });

  // —— Piano section (180–360) ——
  const pianoSectionStart = frame - PIANO_START;
  const pianoTitleSpring = spring({
    frame: pianoSectionStart,
    fps,
    config: { damping: 14, stiffness: 100 },
    delay: 8,
  });
  const pianoPlaceholderSpring = spring({
    frame: pianoSectionStart,
    fps,
    config: { damping: 12, stiffness: 90 },
    delay: 20,
  });
  const pianoVisible = frame >= PIANO_START && frame < PIANO_END;
  const pianoOpacity = pianoVisible ? interpolate(pianoSectionStart, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) : 0;
  const pianoFadeOut = frame >= PIANO_END - 15 ? interpolate(frame, [PIANO_END - 15, PIANO_END], [1, 0], { extrapolateLeft: 'clamp' }) : 1;

  // —— Bubbles section (360–540) ——
  const bubblesSectionStart = frame - BUBBLES_START;
  const bubblesTitleSpring = spring({
    frame: bubblesSectionStart,
    fps,
    config: { damping: 14, stiffness: 100 },
    delay: 8,
  });
  const bubblesPlaceholderSpring = spring({
    frame: bubblesSectionStart,
    fps,
    config: { damping: 12, stiffness: 90 },
    delay: 20,
  });
  const bubblesVisible = frame >= BUBBLES_START && frame < BUBBLES_END;
  const bubblesOpacity = bubblesVisible ? interpolate(bubblesSectionStart, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) : 0;
  const bubblesFadeOut = frame >= BUBBLES_END - 15 ? interpolate(frame, [BUBBLES_END - 15, BUBBLES_END], [1, 0], { extrapolateLeft: 'clamp' }) : 1;

  // —— CTA (540–end) ——
  const ctaSectionStart = frame - CTA_START;
  const ctaTitleSpring = spring({ frame: ctaSectionStart, fps, config: { damping: 14, stiffness: 120 }, delay: 0 });
  const ctaTaglineSpring = spring({ frame: ctaSectionStart, fps, config: { damping: 14, stiffness: 100 }, delay: 15 });
  const ctaButtonSpring = spring({ frame: ctaSectionStart, fps, config: { damping: 12, stiffness: 100 }, delay: 28 });
  const ctaVisible = frame >= CTA_START;
  const ctaOpacity = ctaVisible ? interpolate(ctaSectionStart, [0, 12], [0, 1], { extrapolateRight: 'clamp' }) : 0;

  const bg = 'linear-gradient(180deg, #0f1419 0%, #1a2229 50%, #0f1419 100%)';

  return (
    <AbsoluteFill
      style={{
        background: bg,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* —— INTRO —— */}
      {frame < PIANO_START + 30 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            opacity: frame < PIANO_START ? globalOpacity : interpolate(frame, [PIANO_START, PIANO_START + 30], [1, 0], { extrapolateLeft: 'clamp' }),
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 20, opacity: introIconSpring, transform: `translateY(${slideY(introIconSpring, 20)}px)` }}>
            🧠
          </div>
          <h1 style={{ fontSize: 64, fontWeight: 700, margin: 0, transform: `translateY(${slideY(introTitleSpring)}px)` }}>
            Neuro-Recover
          </h1>
          <p style={{ fontSize: 24, color: '#59c2ff', marginTop: 12, transform: `translateY(${slideY(introTaglineSpring, 30)}px)` }}>
            AI-Powered Stroke Rehabilitation
          </p>
          <p
            style={{
              fontSize: 20,
              color: '#9ca3af',
              marginTop: 32,
              maxWidth: 640,
              lineHeight: 1.5,
              transform: `translateY(${slideY(introBodySpring, 24)}px)`,
            }}
          >
            Turn recovery into games. Hand tracking, adaptive exercises, objective progress.
          </p>
        </div>
      )}

      {/* —— PIANO PLACEHOLDER —— */}
      {pianoVisible && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: pianoOpacity * pianoFadeOut * globalOpacity,
          }}
        >
          <p
            style={{
              fontSize: 36,
              fontWeight: 700,
              marginBottom: 24,
              transform: `translateY(${slideY(pianoTitleSpring, 24)}px)`,
              opacity: pianoTitleSpring,
            }}
          >
            🎹 Virtual Piano
          </p>
          <div
            style={{
              width: '80%',
              maxWidth: 900,
              aspectRatio: '16/9',
              backgroundColor: 'rgba(26, 34, 41, 0.9)',
              border: '3px dashed #33a3ff',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#9ca3af',
              transform: `translateY(${slideY(pianoPlaceholderSpring, 20)}px)`,
              opacity: pianoPlaceholderSpring,
            }}
          >
            <p style={{ fontSize: 22, marginBottom: 8 }}>Drop Piano gameplay clip here</p>
            <p style={{ fontSize: 16, color: '#6b7280' }}>Replace this placeholder in post with screen recording of the Piano game</p>
          </div>
        </div>
      )}

      {/* —— BUBBLES PLACEHOLDER —— */}
      {bubblesVisible && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: bubblesOpacity * bubblesFadeOut * globalOpacity,
          }}
        >
          <p
            style={{
              fontSize: 36,
              fontWeight: 700,
              marginBottom: 24,
              transform: `translateY(${slideY(bubblesTitleSpring, 24)}px)`,
              opacity: bubblesTitleSpring,
            }}
          >
            🫧 Bubble Popper
          </p>
          <div
            style={{
              width: '80%',
              maxWidth: 900,
              aspectRatio: '16/9',
              backgroundColor: 'rgba(26, 34, 41, 0.9)',
              border: '3px dashed #33a3ff',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#9ca3af',
              transform: `translateY(${slideY(bubblesPlaceholderSpring, 20)}px)`,
              opacity: bubblesPlaceholderSpring,
            }}
          >
            <p style={{ fontSize: 22, marginBottom: 8 }}>Drop Bubbles gameplay clip here</p>
            <p style={{ fontSize: 16, color: '#6b7280' }}>Replace this placeholder in post with screen recording of the Bubble Popper game</p>
          </div>
        </div>
      )}

      {/* —— CTA —— */}
      {ctaVisible && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            opacity: ctaOpacity * globalOpacity,
          }}
        >
          <h2
            style={{
              fontSize: 52,
              fontWeight: 700,
              margin: 0,
              transform: `translateY(${slideY(ctaTitleSpring)}px)`,
              opacity: ctaTitleSpring,
            }}
          >
            Ready to recover?
          </h2>
          <p
            style={{
              fontSize: 24,
              color: '#59c2ff',
              marginTop: 16,
              transform: `translateY(${slideY(ctaTaglineSpring, 20)}px)`,
              opacity: ctaTaglineSpring,
            }}
          >
            Try Neuro-Recover — no wearables, just your hand and the camera.
          </p>
          <div
            style={{
              marginTop: 40,
              padding: '20px 48px',
              backgroundColor: '#33a3ff',
              borderRadius: 12,
              transform: `translateY(${slideY(ctaButtonSpring, 16)}px)`,
              opacity: ctaButtonSpring,
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 600 }}>Get started</span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
}
