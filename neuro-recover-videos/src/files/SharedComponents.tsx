import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from './tokens';

// ── Fade In wrapper ──────────────────────────────────────────────────────────
export const FadeIn: React.FC<{
  from?: number;
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}> = ({ from = 0, children, delay = 0, duration = 20 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [from, from + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <div style={{ opacity }}>{children}</div>;
};

// ── Slide Up wrapper ─────────────────────────────────────────────────────────
export const SlideUp: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { stiffness: 80, damping: 18 } });
  const translateY = interpolate(progress, [0, 1], [60, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  return (
    <div style={{ transform: `translateY(${translateY}px)`, opacity }}>
      {children}
    </div>
  );
};

// ── Scale In wrapper ─────────────────────────────────────────────────────────
export const ScaleIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame: frame - delay, fps, from: 0.6, to: 1, config: { stiffness: 120, damping: 15 } });
  const opacity = spring({ frame: frame - delay, fps, from: 0, to: 1, config: { stiffness: 80, damping: 20 } });
  return (
    <div style={{ transform: `scale(${scale})`, opacity }}>
      {children}
    </div>
  );
};

// ── Gradient Background ──────────────────────────────────────────────────────
export const GradientBg: React.FC<{
  colors?: [string, string, string?];
  animate?: boolean;
}> = ({
  colors = [COLORS.dark, COLORS.darkMid, COLORS.brainDark],
  animate = true,
}) => {
  const frame = useCurrentFrame();
  const shift = animate ? Math.sin(frame / 120) * 10 : 0;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at ${50 + shift}% ${40 - shift * 0.5}%, ${colors[2] ?? COLORS.brainDark} 0%, ${colors[1]} 40%, ${colors[0]} 100%)`,
      }}
    />
  );
};

// ── Neural Network SVG decoration ───────────────────────────────────────────
export const NeuralWeb: React.FC<{ opacity?: number }> = ({ opacity = 0.15 }) => {
  const frame = useCurrentFrame();
  const pulse = 0.5 + 0.5 * Math.sin(frame / 40);
  const nodes = [
    { x: 200, y: 200 }, { x: 500, y: 150 }, { x: 800, y: 300 },
    { x: 300, y: 500 }, { x: 650, y: 450 }, { x: 950, y: 200 },
    { x: 150, y: 750 }, { x: 500, y: 700 }, { x: 850, y: 650 },
    { x: 1100, y: 400 }, { x: 1200, y: 100 }, { x: 1300, y: 600 },
  ];
  const edges = [
    [0,1],[1,2],[0,3],[1,4],[2,4],[3,4],[4,5],[3,6],[4,7],[5,8],
    [6,7],[7,8],[5,9],[9,10],[9,11],[8,11],
  ];
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width="100%" height="100%" viewBox="0 0 1400 900">
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x} y1={nodes[a].y}
            x2={nodes[b].x} y2={nodes[b].y}
            stroke={COLORS.neural}
            strokeWidth={1}
            opacity={0.4 + 0.3 * pulse}
          />
        ))}
        {nodes.map((n, i) => (
          <circle
            key={i}
            cx={n.x} cy={n.y}
            r={4 + 2 * pulse}
            fill={COLORS.neural}
            opacity={0.6 + 0.4 * pulse}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// ── Particle dots ────────────────────────────────────────────────────────────
export const FloatingParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: (i * 137 + 50) % 1920,
    y: (i * 89 + 100) % 1080,
    speed: 0.3 + (i % 5) * 0.1,
    size: 2 + (i % 4),
    phase: i * 1.2,
  }));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {particles.map((p, i) => {
        const y = ((p.y + frame * p.speed) % 1080);
        const opacity = 0.2 + 0.3 * Math.sin(frame / 60 + p.phase);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: COLORS.brainLight,
              opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ── Brain Icon SVG ────────────────────────────────────────────────────────────
export const BrainIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 80,
  color = COLORS.brainLight,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <ellipse cx="50" cy="52" rx="34" ry="28" stroke={color} strokeWidth="3" fill="none" />
    <path d="M50 24 C50 14 36 10 30 18 C22 14 14 22 18 32 C12 36 12 48 22 50" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M50 24 C50 14 64 10 70 18 C78 14 86 22 82 32 C88 36 88 48 78 50" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <line x1="50" y1="24" x2="50" y2="80" stroke={color} strokeWidth="2" opacity="0.5"/>
    <circle cx="35" cy="55" r="5" fill={color} opacity="0.7"/>
    <circle cx="65" cy="50" r="4" fill={color} opacity="0.7"/>
    <circle cx="42" cy="68" r="3.5" fill={color} opacity="0.6"/>
    <circle cx="60" cy="65" r="3" fill={color} opacity="0.6"/>
  </svg>
);

// ── Progress Bar ──────────────────────────────────────────────────────────────
export const AnimatedProgressBar: React.FC<{
  progress: number; // 0-1
  color?: string;
  label?: string;
  width?: number;
}> = ({ progress, color = COLORS.energy, label, width = 400 }) => (
  <div style={{ fontFamily: FONTS.body }}>
    {label && (
      <div style={{ color: COLORS.whiteAlpha70, fontSize: 16, marginBottom: 8 }}>{label}</div>
    )}
    <div style={{
      width,
      height: 12,
      backgroundColor: COLORS.whiteAlpha20,
      borderRadius: 6,
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${progress * 100}%`,
        height: '100%',
        backgroundColor: color,
        borderRadius: 6,
        boxShadow: `0 0 12px ${color}`,
        transition: 'width 0.1s',
      }} />
    </div>
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
export const StatCard: React.FC<{
  value: string;
  label: string;
  color?: string;
}> = ({ value, label, color = COLORS.energy }) => (
  <div style={{
    backgroundColor: COLORS.whiteAlpha10,
    border: `1px solid ${COLORS.whiteAlpha20}`,
    borderRadius: 16,
    padding: '24px 32px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
    fontFamily: FONTS.body,
  }}>
    <div style={{ fontSize: 48, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 16, color: COLORS.whiteAlpha70, marginTop: 8 }}>{label}</div>
  </div>
);

// ── Feature Badge ─────────────────────────────────────────────────────────────
export const FeatureBadge: React.FC<{
  icon: string;
  text: string;
  color?: string;
}> = ({ icon, text, color = COLORS.neural }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.whiteAlpha10,
    border: `1px solid ${color}44`,
    borderRadius: 50,
    padding: '12px 24px',
    fontFamily: FONTS.body,
    fontSize: 18,
    color: COLORS.white,
    backdropFilter: 'blur(8px)',
  }}>
    <span style={{ fontSize: 24 }}>{icon}</span>
    <span>{text}</span>
  </div>
);

// ── Section Title ─────────────────────────────────────────────────────────────
export const SectionTitle: React.FC<{
  title: string;
  subtitle?: string;
  accent?: string;
}> = ({ title, subtitle, accent = COLORS.neural }) => (
  <div style={{ textAlign: 'center', fontFamily: FONTS.body }}>
    <div style={{
      fontSize: 56,
      fontWeight: 800,
      color: COLORS.white,
      lineHeight: 1.1,
      textShadow: `0 0 40px ${accent}88`,
    }}>{title}</div>
    {subtitle && (
      <div style={{
        fontSize: 24,
        color: COLORS.whiteAlpha70,
        marginTop: 16,
        fontWeight: 400,
      }}>{subtitle}</div>
    )}
  </div>
);

// ── Callout Box ───────────────────────────────────────────────────────────────
export const CalloutBox: React.FC<{
  children: React.ReactNode;
  accentColor?: string;
}> = ({ children, accentColor = COLORS.brain }) => (
  <div style={{
    backgroundColor: `${accentColor}22`,
    border: `2px solid ${accentColor}66`,
    borderLeft: `6px solid ${accentColor}`,
    borderRadius: 12,
    padding: '20px 28px',
    fontFamily: FONTS.body,
    backdropFilter: 'blur(8px)',
  }}>
    {children}
  </div>
);

// ── Countdown timer decoration ────────────────────────────────────────────────
export const FrameCounter: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const elapsed = Math.floor(frame / fps);
  const total = Math.floor(durationInFrames / fps);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  const tm = Math.floor(total / 60);
  const ts = total % 60;
  return (
    <div style={{
      position: 'absolute',
      bottom: 32,
      right: 40,
      fontFamily: FONTS.mono,
      fontSize: 14,
      color: COLORS.whiteAlpha40,
    }}>
      {m}:{String(s).padStart(2,'0')} / {tm}:{String(ts).padStart(2,'0')}
    </div>
  );
};
