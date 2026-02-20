import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * Neuro-Recover advertisement demo (10s at 30fps).
 * Uses Remotion best practices: spring() for motion, delay for sequencing.
 * Run: npm run dev (preview) or npm run render (export demo.mp4).
 */
export const NeuroRecoverDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [durationInFrames - 25, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = fadeIn * fadeOut;

  const iconSpring = spring({ frame, fps, config: { damping: 14, stiffness: 120 }, delay: 0 });
  const titleSpring = spring({ frame, fps, config: { damping: 14, stiffness: 120 }, delay: 12 });
  const taglineSpring = spring({ frame, fps, config: { damping: 14, stiffness: 120 }, delay: 24 });
  const bodySpring = spring({ frame, fps, config: { damping: 15, stiffness: 100 }, delay: 36 });
  const iconsSpring = spring({ frame, fps, config: { damping: 12, stiffness: 100 }, delay: 54 });
  const footerSpring = spring({ frame, fps, config: { damping: 15, stiffness: 100 }, delay: 66 });

  const slideY = (s: number, pixels = 40) => interpolate(s, [0, 1], [pixels, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0f1419 0%, #1a2229 50%, #0f1419 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{ textAlign: 'center', opacity }}>
        <div style={{ fontSize: 64, marginBottom: 24, opacity: iconSpring, transform: `translateY(${slideY(iconSpring, 20)}px)` }}>
          🧠
        </div>
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            margin: 0,
            transform: `translateY(${slideY(titleSpring)}px)`,
          }}
        >
          Neuro-Recover
        </h1>
        <p
          style={{
            fontSize: 28,
            color: '#59c2ff',
            marginTop: 16,
            transform: `translateY(${slideY(taglineSpring, 30)}px)`,
          }}
        >
          AI-Powered Stroke Rehabilitation
        </p>
        <p
          style={{
            fontSize: 22,
            color: '#9ca3af',
            marginTop: 48,
            maxWidth: 700,
            lineHeight: 1.5,
            transform: `translateY(${slideY(bodySpring, 24)}px)`,
          }}
        >
          Turn recovery into games. Hand tracking, adaptive exercises, and objective progress — like Duolingo meets your physio.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 24,
            justifyContent: 'center',
            marginTop: 48,
            transform: `translateY(${slideY(iconsSpring, 16)}px)`,
            opacity: iconsSpring,
          }}
        >
          <span style={{ fontSize: 32 }}>🎹</span>
          <span style={{ fontSize: 32 }}>🫧</span>
        </div>
        <p
          style={{
            fontSize: 18,
            color: '#6b7280',
            marginTop: 24,
            transform: `translateY(${slideY(footerSpring, 12)}px)`,
            opacity: footerSpring,
          }}
        >
          Virtual Piano • Bubble Popper • Progress Analytics
        </p>
      </div>
    </AbsoluteFill>
  );
}
