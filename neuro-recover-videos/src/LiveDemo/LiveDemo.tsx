/**
 * LiveDemo.tsx — Enhanced v3
 * 4 minutes @ 30fps = 7200 frames
 * Real gameplay video + screenshots + rich content from platform doc
 */
import React from 'react';
import {
  AbsoluteFill, Sequence, Img, Audio, staticFile,
  interpolate, spring, useCurrentFrame, useVideoConfig,
  OffthreadVideo,
} from 'remotion';
import { COLORS, FONTS } from '../components/tokens';
import {
  GradientBg, NeuralWeb, FloatingParticles, FadeIn, SlideUp, ScaleIn,
  BrainIcon, AnimatedProgressBar, FeatureBadge, SectionTitle, CalloutBox,
} from '../components/SharedComponents';

// ── Helpers ───────────────────────────────────────────────────────────────────
const sc = (v: number) => 'scale(' + v + ')';
const tx = (v: number) => 'translateX(' + v + 'px)';
const ty = (v: number) => 'translateY(' + v + 'px)';

// Browser chrome screenshot frame
const Shot: React.FC<{ src: string; label?: string; delay?: number; badge?: string }> = ({ src, label, delay = 0, badge }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: frame - delay, fps, config: { stiffness: 70, damping: 20 } });
  const pulse = 0.5 + 0.5 * Math.sin(frame / 20);
  return (
    <div style={{ opacity: sp, transform: sc(interpolate(sp, [0, 1], [0.93, 1])), position: 'relative' }}>
      <div style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ backgroundColor: '#0F0F1E', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          {['#FF5F57', '#FFBD2E', '#28C840'].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c }} />
          ))}
          <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: '3px 12px', fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: FONTS.mono, marginLeft: 8 }}>
            localhost:3000 — Neuro-Recover
          </div>
        </div>
        <Img src={staticFile(src)} style={{ width: '100%', display: 'block', maxHeight: 400 }} />
      </div>
      {badge && frame > delay + 40 && (
        <div style={{
          position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)',
          backgroundColor: COLORS.neural, borderRadius: 50, padding: '4px 16px',
          fontSize: 12, color: '#000', fontWeight: 700, whiteSpace: 'nowrap',
          boxShadow: '0 0 ' + (10 * pulse) + 'px ' + COLORS.neural,
          opacity: interpolate(frame - delay - 40, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          {badge}
        </div>
      )}
      {label && (
        <div style={{
          position: 'absolute', bottom: badge ? -38 : -16, left: '50%', transform: 'translateX(-50%)',
          backgroundColor: COLORS.dark, border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 50, padding: '4px 16px', fontSize: 12, color: 'rgba(255,255,255,0.6)',
          whiteSpace: 'nowrap', fontFamily: FONTS.body,
        }}>
          {label}
        </div>
      )}
    </div>
  );
};

// Metric card
const Metric: React.FC<{ value: string; label: string; color: string; delay?: number }> = ({ value, label, color, delay = 0 }) => {
  const frame = useCurrentFrame();
  const sp = spring({ frame: frame - delay, fps: 30, from: 0, to: 1 });
  return (
    <div style={{
      backgroundColor: color + '15', border: '1px solid ' + color + '33',
      borderRadius: 10, padding: '12px 18px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      opacity: sp, transform: tx(interpolate(sp, [0, 1], [-28, 0])),
    }}>
      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontFamily: FONTS.body }}>{label}</span>
      <span style={{ fontSize: 24, fontWeight: 900, color, fontFamily: FONTS.mono }}>{value}</span>
    </div>
  );
};

// Animated recovery curve matching real data
const RecoveryCurve: React.FC = () => {
  const frame = useCurrentFrame();
  const pts = [
    { x: 0, y: 31, d: 'Feb 13' }, { x: 1, y: 28, d: 'Feb 14' }, { x: 2, y: 8, d: 'Feb 15' },
    { x: 3, y: 35, d: 'Feb 16' }, { x: 4, y: 22, d: 'Feb 17' }, { x: 5, y: 38, d: 'Feb 18' },
    { x: 6, y: 30, d: 'Feb 19' }, { x: 7, y: 47, d: 'Feb 20' },
  ];
  const visible = Math.ceil(interpolate(frame, [0, 220], [1, 8], { extrapolateRight: 'clamp' }));
  const W = 560, H = 140, yMax = 60;
  const sx = (p: typeof pts[0]) => p.x * (W / 7);
  const sy = (p: typeof pts[0]) => H - (p.y / yMax) * H;
  const show = pts.slice(0, visible);
  const pathD = show.length > 1 ? show.map((p, i) => (i === 0 ? 'M' : 'L') + ' ' + sx(p) + ' ' + sy(p)).join(' ') : '';
  return (
    <div style={{ backgroundColor: '#161B22', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.white, marginBottom: 10, fontFamily: FONTS.body }}>Recovery curve (score over time)</div>
      <svg width="100%" height={H + 30} viewBox={'0 0 ' + W + ' ' + (H + 30)}>
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        {[15, 30, 45, 60].map(v => (
          <line key={v} x1={0} y1={H - (v / yMax) * H} x2={W} y2={H - (v / yMax) * H} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="4,4" />
        ))}
        {pathD && <>
          <path d={pathD + ' L ' + sx(show[show.length - 1]) + ' ' + H + ' L 0 ' + H + ' Z'} fill="url(#rg)" opacity={0.3} />
          <path d={pathD} fill="none" stroke="#3B82F6" strokeWidth={2.5} strokeLinecap="round" />
        </>}
        {show.map((p, i) => {
          const reg = p.d === 'Feb 15';
          return (
            <g key={i}>
              <circle cx={sx(p)} cy={sy(p)} r={5} fill={reg ? '#EF4444' : '#3B82F6'} />
              <text x={sx(p)} y={H + 18} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={9}>{p.d}</text>
            </g>
          );
        })}
        {visible > 2 && (
          <g>
            <line x1={sx(pts[2])} y1={0} x2={sx(pts[2])} y2={H} stroke="#EF4444" strokeWidth={1} strokeDasharray="3,3" opacity={0.6} />
            <rect x={sx(pts[2]) - 34} y={3} width={68} height={16} rx={3} fill="#EF444433" stroke="#EF4444" strokeWidth={1} />
            <text x={sx(pts[2])} y={14} textAnchor="middle" fill="#EF4444" fontSize={8} fontWeight="bold">⚠ Regression</text>
          </g>
        )}
      </svg>
    </div>
  );
};

// MedGemma typing panel
const MedGemmaPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const summary = `Patient: John Smith | Ischemic stroke (left MCA)
Findings:
• Index finger ROM: +30% improvement this week
• Tremor index: -18% (significant reduction)
• Fatigue threshold: 7min → 12min (71% improvement)
• Speech clarity: +22% over 4 weeks
• Recommendation: Increase Bubble Popper difficulty.
  Schedule reach-and-hold session tomorrow.`;
  const typed = Math.floor(interpolate(frame, [30, 260], [0, summary.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const metrics = [
    { label: 'Range of Motion', val: '+30%', color: COLORS.energy },
    { label: 'Tremor Index', val: '-18%', color: COLORS.neural },
    { label: 'Fatigue Threshold', val: '12min', color: COLORS.warmth },
    { label: 'Speech Clarity', val: '+22%', color: COLORS.brainLight },
  ];
  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontFamily: FONTS.body }}>Digital Biomarkers</div>
        {metrics.map((m, i) => {
          const sp = spring({ frame: frame - i * 16, fps: 30, from: 0, to: 1 });
          return (
            <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid ' + m.color + '33', borderLeft: '3px solid ' + m.color, borderRadius: 8, padding: '9px 14px', opacity: sp }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontFamily: FONTS.body }}>{m.label}</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: m.color, fontFamily: FONTS.mono }}>{m.val}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ backgroundColor: COLORS.brain + '33', border: '1px solid ' + COLORS.brainLight, borderRadius: 6, padding: '3px 10px', fontSize: 12, color: COLORS.brainLight, fontWeight: 600, fontFamily: FONTS.body }}>🧠 MedGemma 27B</div>
          <div style={{ backgroundColor: COLORS.energy + '22', border: '1px solid ' + COLORS.energy, borderRadius: 6, padding: '3px 10px', fontSize: 11, color: COLORS.energy, fontFamily: FONTS.body }}>✓ Offline</div>
        </div>
        <div style={{ backgroundColor: '#0A0A1A', border: '1px solid ' + COLORS.brainLight + '33', borderRadius: 8, padding: 14, fontFamily: FONTS.mono, fontSize: 12, color: COLORS.white, lineHeight: 1.8, flex: 1, whiteSpace: 'pre' }}>
          <div style={{ color: COLORS.brainLight, marginBottom: 6, fontSize: 10 }}>{'>'} Clinical Summary:</div>
          {summary.slice(0, typed)}
          {typed < summary.length && <span style={{ backgroundColor: COLORS.brainLight, width: 7, height: 14, display: 'inline-block', opacity: Math.round(frame / 10) % 2 }} />}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontFamily: FONTS.mono }}>1.2s inference • No data leaves device</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENES
// ─────────────────────────────────────────────────────────────────────────────

// S1: Title (0-180, 6s)
const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ls = spring({ frame, fps, from: 0, to: 1, config: { stiffness: 90, damping: 15 } });
  const pulse = 0.5 + 0.5 * Math.sin(frame / 20);
  return (
    <AbsoluteFill>
      <GradientBg /><NeuralWeb opacity={0.22} /><FloatingParticles />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, fontFamily: FONTS.body }}>
        <div style={{ transform: sc(ls) }}>
          <div style={{ width: 130, height: 130, borderRadius: '50%', backgroundColor: COLORS.brain + '44', border: '3px solid ' + COLORS.brainLight, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 ' + (55 * pulse) + 'px ' + COLORS.brainLight + '66' }}>
            <BrainIcon size={84} color={COLORS.brainLight} />
          </div>
        </div>
        <SlideUp delay={20}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 80, fontWeight: 900, color: COLORS.white, letterSpacing: -2, lineHeight: 1 }}>Neuro-Recover</div>
            <div style={{ fontSize: 20, color: COLORS.neural, letterSpacing: 5, textTransform: 'uppercase', marginTop: 10 }}>AI-Powered Gamified Stroke Rehabilitation</div>
          </div>
        </SlideUp>
        <FadeIn delay={50} duration={30}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <FeatureBadge icon="🎮" text="Adaptive Games" color={COLORS.energy} />
            <FeatureBadge icon="👁️" text="Computer Vision" color={COLORS.neural} />
            <FeatureBadge icon="🗣️" text="Voice AI" color={COLORS.warmth} />
            <FeatureBadge icon="🧠" text="MedGemma" color={COLORS.brainLight} />
            <FeatureBadge icon="🏥" text="NHS Ready" color={COLORS.energy} />
          </div>
        </FadeIn>
      </AbsoluteFill>
      <div style={{ position: 'absolute', top: 36, right: 40, display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#EF444433', border: '1px solid #EF4444', borderRadius: 50, padding: '8px 18px', opacity: interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EF4444', boxShadow: '0 0 ' + (6 * pulse) + 'px #EF4444' }} />
        <span style={{ color: COLORS.white, fontSize: 14, fontWeight: 700, fontFamily: FONTS.body }}>LIVE DEMO</span>
      </div>
    </AbsoluteFill>
  );
};

// S2: Platform overview + hero screenshot (180-510, 11s)
const S2: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: FONTS.body }}>
      <GradientBg colors={[COLORS.dark, '#0A1020', COLORS.darkMid]} />
      <AbsoluteFill style={{ padding: '52px 88px', display: 'flex', gap: 52, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <FadeIn duration={25}>
            <SectionTitle title="The Platform" subtitle="Duolingo meets Wii Rehab meets AI Physiotherapist — in your browser" accent={COLORS.neural} />
          </FadeIn>
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '🌐', label: 'Browser-native', sub: 'No install — just a webcam' },
              { icon: '🦾', label: 'MediaPipe WebAssembly', sub: '21 hand landmarks at 30fps' },
              { icon: '🎮', label: '6 adaptive rehab games', sub: 'Each targeting clinical outcomes' },
              { icon: '🧠', label: 'MedGemma AI — offline', sub: 'Clinical summaries, no data leaves device' },
              { icon: '🏥', label: 'HL7 FHIR export', sub: 'NHS-compatible, EHR-ready' },
              { icon: '🐳', label: 'Docker Compose', sub: 'One-command deployment anywhere' },
            ].map((item, i) => {
              const sp = spring({ frame: frame - i * 24, fps: 30, from: 0, to: 1 });
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '11px 16px', opacity: sp, transform: tx(interpolate(sp, [0, 1], [-32, 0])) }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.white }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{item.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ flex: 1.1 }}>
          <Shot src="screen-hero.png" label="Turn recovery into games." badge="Browser-native · No install required" delay={20} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// S3: Real gameplay video (510-1680, 39s — full video)
const S3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleSp = spring({ frame, fps, from: 0, to: 1, config: { stiffness: 70, damping: 18 } });
  const pulse = 0.5 + 0.5 * Math.sin(frame / 24);

  // Score counter synced to video
  const pianoScore = Math.min(Math.floor(frame / 14), 38);
  const bubbleScore = frame > 600 ? Math.min(Math.floor((frame - 600) / 18), 24) : 0;

  return (
    <AbsoluteFill style={{ fontFamily: FONTS.body }}>
      <GradientBg colors={['#050810', '#0A1020', '#060C18']} />
      <AbsoluteFill style={{ padding: '40px 60px' }}>
        {/* Header */}
        <FadeIn duration={20}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.white, lineHeight: 1 }}>Live Gameplay</div>
              <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Real session — hand tracking active, difficulty adapting</div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ backgroundColor: '#EF444422', border: '1px solid #EF4444', borderRadius: 50, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EF4444', boxShadow: '0 0 ' + (5 * pulse) + 'px #EF4444' }} />
                <span style={{ color: COLORS.white, fontSize: 13, fontWeight: 700 }}>REC</span>
              </div>
              <div style={{ backgroundColor: COLORS.neural + '22', border: '1px solid ' + COLORS.neural, borderRadius: 50, padding: '6px 16px', fontSize: 13, color: COLORS.neural, fontWeight: 600 }}>
                30fps · MediaPipe
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Video + overlay */}
        <div style={{ display: 'flex', gap: 28 }}>
          <div style={{ flex: 1.6, position: 'relative' }}>
            <div style={{ borderRadius: 14, overflow: 'hidden', border: '2px solid ' + COLORS.neural + '44', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
              <OffthreadVideo
                src={staticFile('game-demo.mp4')}
                style={{ width: '100%', display: 'block' }}
              />
            </div>
            {/* Corner brackets */}
            {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([rx, ry], i) => (
              <div key={i} style={{
                position: 'absolute',
                top: ry === 0 ? 8 : undefined, bottom: ry === 1 ? 8 : undefined,
                left: rx === 0 ? 8 : undefined, right: rx === 1 ? 8 : undefined,
                width: 20, height: 20,
                borderTop: ry === 0 ? '2px solid ' + COLORS.neural : 'none',
                borderBottom: ry === 1 ? '2px solid ' + COLORS.neural : 'none',
                borderLeft: rx === 0 ? '2px solid ' + COLORS.neural : 'none',
                borderRight: rx === 1 ? '2px solid ' + COLORS.neural : 'none',
              }} />
            ))}
          </div>

          {/* Side stats */}
          <div style={{ flex: 0.9, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FadeIn delay={20} duration={25}>
              <div style={{ backgroundColor: '#161B22', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Session Live</div>
                {[
                  { label: '🎹 Piano score', val: pianoScore, max: 38, color: COLORS.neural },
                  { label: '🫧 Bubbles popped', val: bubbleScore, max: 24, color: '#60A5FA' },
                ].map((s, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{s.label}</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: s.color, fontFamily: FONTS.mono }}>{s.val}</span>
                    </div>
                    <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: (s.val / s.max * 100) + '%', backgroundColor: s.color, borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={40} duration={25}>
              <CalloutBox accentColor={COLORS.energy}>
                <div style={{ fontSize: 13, color: COLORS.white, lineHeight: 1.6 }}>
                  <strong style={{ color: COLORS.energy }}>Adaptive difficulty</strong> — monitors score rate every 5 seconds. Bubbles slow and enlarge when fatigued, speed up when improving.
                </div>
              </CalloutBox>
            </FadeIn>

            <FadeIn delay={80} duration={25}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '🎹', label: 'Virtual Piano', desc: 'Finger isolation + reaction time', color: COLORS.neural },
                  { icon: '🫧', label: 'Bubble Popper', desc: 'Reach, pinch, accuracy', color: '#60A5FA' },
                  { icon: '🎯', label: 'Reach & Hold', desc: 'Shoulder reach + stability', color: COLORS.energy },
                  { icon: '☕', label: 'Grab Cup', desc: 'ADL grasp training', color: COLORS.warmth },
                ].map((g, i) => {
                  const sp = spring({ frame: frame - 100 - i * 20, fps: 30, from: 0, to: 1 });
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: sp }}>
                      <span style={{ fontSize: 18, width: 26 }}>{g.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.white }}>{g.label}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{g.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </FadeIn>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// S4: Computer Vision & Biomarkers (1680-2160, 16s)
const S4: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: FONTS.body }}>
      <GradientBg colors={['#060A14', '#0A1828', '#060E1C']} />
      <AbsoluteFill style={{ padding: '50px 88px', display: 'flex', gap: 52, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <FadeIn duration={25}>
            <SectionTitle title="Computer Vision Layer" subtitle="21 hand landmarks · 30fps · Extracted clinical biomarkers" accent={COLORS.neural} />
          </FadeIn>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { metric: 'ROM', meaning: 'Max finger extension/flexion angle', icon: '📐', color: COLORS.neural },
              { metric: 'Smoothness', meaning: 'Jerk & acceleration variance', icon: '〰️', color: COLORS.energy },
              { metric: 'Tremor Index', meaning: 'Micro-oscillation frequency', icon: '📉', color: COLORS.warmth },
              { metric: 'Reaction Time', meaning: 'Stimulus → movement latency', icon: '⚡', color: COLORS.brainLight },
              { metric: 'Fatigue Curve', meaning: 'Performance decay over session', icon: '📊', color: '#60A5FA' },
              { metric: 'Synergy Patterns', meaning: 'Abnormal co-movement detection', icon: '🔗', color: COLORS.energy },
            ].map((b, i) => {
              const sp = spring({ frame: frame - i * 20, fps: 30, from: 0, to: 1 });
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: sp, transform: tx(interpolate(sp, [0, 1], [-24, 0])) }}>
                  <span style={{ fontSize: 20, width: 28 }}>{b.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: b.color, minWidth: 120, fontFamily: FONTS.mono }}>{b.metric}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{b.meaning}</span>
                </div>
              );
            })}
          </div>
          <FadeIn delay={160} duration={30}>
            <CalloutBox accentColor={COLORS.neural}>
              <div style={{ fontSize: 14, color: COLORS.white, lineHeight: 1.6 }}>
                These become <strong style={{ color: COLORS.neural }}>objective digital biomarkers</strong> of stroke recovery — the same data a physio estimates subjectively, now measured precisely every frame.
              </div>
            </CalloutBox>
          </FadeIn>
        </div>
        <div style={{ flex: 1 }}>
          <Shot src="screen-reach-hold.png" label="Reach & Hold — 14 reaches, 112° arm extension" delay={10} badge="Real-time landmark tracking" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// S5: Voice AI + Emotional Intelligence (2160-2610, 15s)
const S5: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: FONTS.body }}>
      <GradientBg colors={['#080610', '#100A20', '#060812']} />
      <AbsoluteFill style={{ padding: '50px 88px', display: 'flex', gap: 52, alignItems: 'center' }}>
        <div style={{ flex: 1.1 }}>
          <Shot src="screen-how-it-works.png" label="6 game modes — each clinically designed" delay={0} />
        </div>
        <div style={{ flex: 1 }}>
          <FadeIn duration={25}>
            <SectionTitle title="Voice & Emotional AI" subtitle="The system listens — and adapts" accent={COLORS.warmth} />
          </FadeIn>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FadeIn delay={30} duration={25}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, borderLeft: '3px solid ' + COLORS.warmth }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Patient says:</div>
                {['"I\'m tired"', '"This is hard"', '"My hand hurts"'].map((q, i) => {
                  const sp = spring({ frame: frame - 40 - i * 30, fps: 30, from: 0, to: 1 });
                  return <div key={i} style={{ fontSize: 16, color: COLORS.white, fontStyle: 'italic', opacity: sp, marginBottom: 4 }}>{q}</div>;
                })}
              </div>
            </FadeIn>
            <FadeIn delay={140} duration={25}>
              <div style={{ backgroundColor: COLORS.warmth + '12', border: '1px solid ' + COLORS.warmth + '44', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, color: COLORS.warmth, fontWeight: 700, marginBottom: 8 }}>AI extracts:</div>
                {[
                  { label: 'Emotional state', val: 'Fatigue detected' },
                  { label: 'Speech motor quality', val: 'Dysarthria score: 0.18' },
                  { label: 'Cognitive load', val: 'Hesitation pattern' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
                    <span style={{ fontSize: 13, color: COLORS.white, fontWeight: 600 }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={220} duration={25}>
              <CalloutBox accentColor={COLORS.warmth}>
                <div style={{ fontSize: 13, color: COLORS.white, lineHeight: 1.6 }}>
                  Detects <strong style={{ color: COLORS.warmth }}>post-stroke depression</strong>, adjusts difficulty automatically, and flags emotional decline to clinicians in real time.
                </div>
              </CalloutBox>
            </FadeIn>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// S6: AI Rehab Coach (2610-3060, 15s)
const S6: React.FC = () => {
  const frame = useCurrentFrame();
  const messages = [
    { role: 'ai', text: 'Great job! Your index finger moved 12% further than yesterday.', delay: 20, color: COLORS.neural },
    { role: 'ai', text: "You're 2 sessions away from your weekly goal. Keep going!", delay: 80, color: COLORS.energy },
    { role: 'patient', text: "I can hear you're tired. Let's switch to lighter exercises.", delay: 150, color: COLORS.warmth },
    { role: 'ai', text: 'Rebuilding your therapy plan now based on today\'s performance.', delay: 220, color: COLORS.brainLight },
  ];
  return (
    <AbsoluteFill style={{ fontFamily: FONTS.body }}>
      <GradientBg colors={[COLORS.dark, COLORS.darkMid, '#1A0A3A']} />
      <NeuralWeb opacity={0.15} />
      <AbsoluteFill style={{ padding: '50px 88px' }}>
        <FadeIn duration={25}>
          <SectionTitle title="AI Rehab Coach" subtitle="The digital physiotherapist — encouraging, adaptive, emotionally aware" accent={COLORS.brainLight} />
        </FadeIn>
        <div style={{ marginTop: 36, display: 'flex', gap: 48 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((m, i) => {
              const sp = spring({ frame: frame - m.delay, fps: 30, from: 0, to: 1 });
              return (
                <div key={i} style={{ opacity: sp, transform: ty(interpolate(sp, [0, 1], [20, 0])), backgroundColor: m.color + '15', border: '1px solid ' + m.color + '33', borderRadius: 12, padding: '14px 18px', borderLeft: '3px solid ' + m.color }}>
                  <div style={{ fontSize: 11, color: m.color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{m.role === 'ai' ? '🧠 AI Coach' : '👤 Patient'}</div>
                  <div style={{ fontSize: 15, color: COLORS.white, lineHeight: 1.6, fontStyle: 'italic' }}>"{m.text}"</div>
                </div>
              );
            })}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FadeIn delay={80} duration={25}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 22px' }}>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Behavioural Engine</div>
                {[
                  { icon: '🎯', text: 'Reinforcement learning — learns what works per patient' },
                  { icon: '🧩', text: 'Gamification psychology — streaks, goals, rewards' },
                  { icon: '💬', text: 'CBT-style phrasing — evidence-based motivational framing' },
                  { icon: '📈', text: 'Unique neural recovery path — rebuilds plans automatically' },
                ].map((item, i) => {
                  const sp = spring({ frame: frame - 100 - i * 28, fps: 30, from: 0, to: 1 });
                  return (
                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, opacity: sp }}>
                      <span style={{ fontSize: 18 }}>{item.icon}</span>
                      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </FadeIn>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// S7: Progress + Clinician Dashboard (3060-3600, 18s)
const S7: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: FONTS.body }}>
      <GradientBg colors={['#060810', '#0A1020', '#060E18']} />
      <AbsoluteFill style={{ padding: '50px 88px' }}>
        <FadeIn duration={25}>
          <SectionTitle title="Clinical Intelligence Layer" subtitle="Automated reports · Recovery curves · Regression detection · FHIR export" accent={COLORS.warmth} />
        </FadeIn>
        <div style={{ marginTop: 32, display: 'flex', gap: 36 }}>
          <div style={{ flex: 1 }}>
            <Shot src="screen-progress.png" label="Progress — 8 sessions logged" delay={0} />
            <div style={{ marginTop: 36 }}>
              <Shot src="screen-clinician.png" label="Clinician dashboard — recovery curve" delay={30} badge="⚠ Feb 15 regression auto-flagged" />
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 10 }}>
            <FadeIn delay={20} duration={25}><RecoveryCurve /></FadeIn>
            <FadeIn delay={180} duration={25}>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ flex: 1, backgroundColor: '#EF444422', border: '1px solid #EF4444', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 700, marginBottom: 4 }}>⚠ AUTO-FLAGGED</div>
                  <div style={{ fontSize: 12, color: COLORS.white, lineHeight: 1.5 }}>Score drop Feb 15: 35→8. Fatigue pattern. Clinical review recommended.</div>
                </div>
                <div style={{ flex: 1, backgroundColor: COLORS.energy + '22', border: '1px solid ' + COLORS.energy, borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: COLORS.energy, fontWeight: 700, marginBottom: 4 }}>✓ FHIR R4 READY</div>
                  <div style={{ fontSize: 12, color: COLORS.white, lineHeight: 1.5 }}>Export full session history in HL7 FHIR format for NHS EHR integration.</div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={230} duration={25}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>Automated report — John Smith</div>
                {[
                  { label: 'Index finger ROM', val: '+30%', color: COLORS.energy },
                  { label: 'Tremor index', val: '-18%', color: COLORS.neural },
                  { label: 'Fatigue threshold', val: '7min → 12min', color: COLORS.warmth },
                  { label: 'Speech clarity', val: '+22%', color: COLORS.brainLight },
                ].map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{m.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: m.color, fontFamily: FONTS.mono }}>{m.val}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// S8: MedGemma Offline (3600-4080, 16s)
const S8: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: FONTS.body }}>
      <GradientBg colors={[COLORS.dark, COLORS.darkMid, '#200A4A']} />
      <NeuralWeb opacity={0.18} />
      <AbsoluteFill style={{ padding: '50px 88px' }}>
        <FadeIn duration={25}>
          <SectionTitle title="MedGemma Offline Inference" subtitle="Raw biomarkers → structured clinical summary · No internet required" accent={COLORS.brainLight} />
        </FadeIn>
        <div style={{ marginTop: 36 }}>
          <MedGemmaPanel />
        </div>
        <FadeIn delay={220} duration={30}>
          <div style={{ marginTop: 28 }}>
            <CalloutBox accentColor={COLORS.brainLight}>
              <div style={{ fontSize: 15, color: COLORS.white, textAlign: 'center', lineHeight: 1.6 }}>
                🔒 <strong style={{ color: COLORS.brainLight }}>Running fully offline using open-weight MedGemma</strong> — deploy in any NHS trust, community clinic, or home environment without cloud dependency or data residency concerns.
              </div>
            </CalloutBox>
          </div>
        </FadeIn>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// S9: NHS Integration + Roadmap (4080-4560, 16s)
const S9: React.FC = () => {
  const frame = useCurrentFrame();
  const roadmap = [
    { phase: 'MVP', status: '✓ Live', cap: 'Hand tracking + 6 games', color: COLORS.energy },
    { phase: 'Phase 2', status: 'In dev', cap: 'Voice emotion + AI reports', color: COLORS.neural },
    { phase: 'Phase 3', status: 'Planned', cap: 'Adaptive AI therapist', color: COLORS.warmth },
    { phase: 'Phase 4', status: 'Research', cap: 'Digital twin + prediction', color: COLORS.brainLight },
    { phase: 'Phase 5', status: 'Future', cap: 'VR rehab + wearables', color: COLORS.brain },
    { phase: 'Phase 6', status: 'Target', cap: 'FDA / MHRA clinical device', color: '#EF4444' },
  ];
  return (
    <AbsoluteFill style={{ fontFamily: FONTS.body }}>
      <GradientBg colors={['#060A10', '#0A1420', '#06120E']} />
      <AbsoluteFill style={{ padding: '50px 88px', display: 'flex', gap: 52, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <FadeIn duration={25}>
            <SectionTitle title="NHS Ready · Globally Scalable" subtitle="Perfect for virtual wards, community rehab, tele-neurology" accent={COLORS.energy} />
          </FadeIn>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '🏥', text: 'Clinicians prescribe exercises remotely for 100+ patients' },
              { icon: '⚠️', text: 'Automated alerts: "Patient X showing decline in right hand control"' },
              { icon: '📤', text: 'FHIR-compatible reports + PDFs for consultants' },
              { icon: '🔬', text: 'Research datasets for clinical trials' },
              { icon: '🌍', text: 'Scalable globally — no specialist hardware required' },
            ].map((item, i) => {
              const sp = spring({ frame: frame - i * 28, fps: 30, from: 0, to: 1 });
              return (
                <div key={i} style={{ display: 'flex', gap: 14, opacity: sp, transform: tx(interpolate(sp, [0, 1], [-24, 0])) }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{item.text}</span>
                </div>
              );
            })}
          </div>
          <FadeIn delay={180} duration={30}>
            <div style={{ marginTop: 20, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {['📋 NICE NG236', '🔐 GDPR', '🌐 HL7 FHIR R4', '🩺 Clinician Reviewed'].map((b, i) => (
                <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 50, padding: '7px 18px', color: COLORS.white, fontSize: 13, fontWeight: 600 }}>{b}</div>
              ))}
            </div>
          </FadeIn>
        </div>
        <div style={{ flex: 1 }}>
          <FadeIn delay={40} duration={25}>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Product Roadmap</div>
            {roadmap.map((r, i) => {
              const sp = spring({ frame: frame - i * 30, fps: 30, from: 0, to: 1 });
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, opacity: sp, transform: tx(interpolate(sp, [0, 1], [24, 0])) }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: r.color, boxShadow: '0 0 8px ' + r.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: r.color, minWidth: 72, fontFamily: FONTS.mono }}>{r.phase}</span>
                  <span style={{ fontSize: 11, backgroundColor: r.color + '22', border: '1px solid ' + r.color + '44', borderRadius: 50, padding: '2px 10px', color: r.color, minWidth: 60, textAlign: 'center' }}>{r.status}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{r.cap}</span>
                </div>
              );
            })}
          </FadeIn>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// S10: Closing CTA (4560-7200, 44s)
const S10: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = 0.5 + 0.5 * Math.sin(frame / 20);
  const ls = spring({ frame, fps, from: 0, to: 1, config: { stiffness: 75, damping: 18 } });
  return (
    <AbsoluteFill style={{ fontFamily: FONTS.body }}>
      <GradientBg colors={[COLORS.dark, COLORS.darkMid, COLORS.brainDark]} animate />
      <NeuralWeb opacity={0.2} /><FloatingParticles />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {[1, 2, 3].map(r => (
          <div key={r} style={{ position: 'absolute', width: 180 + r * 130, height: 180 + r * 130, borderRadius: '50%', border: '1px solid ' + COLORS.brainLight, opacity: (0.14 / r) + 0.07 * Math.sin(frame / 30 + r) }} />
        ))}
        <div style={{ transform: sc(ls), textAlign: 'center', zIndex: 1 }}>
          <div style={{ width: 140, height: 140, borderRadius: '50%', backgroundColor: COLORS.brain + '44', border: '3px solid ' + COLORS.brainLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 36px', boxShadow: '0 0 ' + (65 * pulse) + 'px ' + COLORS.brainLight + '66' }}>
            <BrainIcon size={90} color={COLORS.brainLight} />
          </div>
          <div style={{ fontSize: 82, fontWeight: 900, color: COLORS.white, letterSpacing: -2, lineHeight: 1 }}>Neuro-Recover</div>
          <div style={{ fontSize: 20, color: COLORS.neural, letterSpacing: 4, textTransform: 'uppercase', marginTop: 12 }}>The First Autonomous Digital Physiotherapist</div>
        </div>
        <FadeIn delay={40} duration={40}>
          <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: 820, marginTop: 32, lineHeight: 1.6, padding: '0 40px', fontStyle: 'italic' }}>
            "AI-powered neurorehabilitation to any clinical environment — without reliance on centralised infrastructure."
          </div>
        </FadeIn>
        {frame > 80 && (
          <FadeIn delay={80} duration={40}>
            <div style={{ display: 'flex', gap: 14, marginTop: 36, flexWrap: 'wrap', justifyContent: 'center' }}>
              <FeatureBadge icon="⚛️" text="TypeScript" color={COLORS.neural} />
              <FeatureBadge icon="🐳" text="Docker Ready" color={COLORS.energy} />
              <FeatureBadge icon="🧠" text="MedGemma Offline" color={COLORS.brainLight} />
              <FeatureBadge icon="🏥" text="FHIR R4" color={COLORS.warmth} />
              <FeatureBadge icon="🔒" text="GDPR" color={COLORS.neural} />
              <FeatureBadge icon="📋" text="NICE NG236" color={COLORS.energy} />
            </div>
          </FadeIn>
        )}
        {frame > 150 && (
          <FadeIn duration={30}>
            <div style={{ marginTop: 24, color: 'rgba(255,255,255,0.35)', fontSize: 15, fontFamily: FONTS.mono }}>github.com/kjelili/Stroke-Rehab</div>
          </FadeIn>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Main export ────────────────────────────────
// AUTO-GENERATED by measure-and-fix.js
// Audio timings measured from actual MP3 file durations - zero overlap guaranteed
// Total: 5924 frames = 3.3 minutes @ 30fps
export const LiveDemo: React.FC = () => (
  <AbsoluteFill>
    {/* Audio - each segment starts after previous one ends */}
    <Sequence from={0}><Audio src={staticFile('audio/live-01.mp3')} volume={1} /></Sequence>
    <Sequence from={217}><Audio src={staticFile('audio/live-02.mp3')} volume={1} /></Sequence>
    <Sequence from={435}><Audio src={staticFile('audio/live-03b.mp3')} volume={1} /></Sequence>
    <Sequence from={875}><Audio src={staticFile('audio/live-04b.mp3')} volume={1} /></Sequence>
    <Sequence from={1307}><Audio src={staticFile('audio/live-05b.mp3')} volume={1} /></Sequence>
    <Sequence from={1935}><Audio src={staticFile('audio/live-06b.mp3')} volume={1} /></Sequence>
    <Sequence from={2462}><Audio src={staticFile('audio/live-07b.mp3')} volume={1} /></Sequence>
    <Sequence from={2995}><Audio src={staticFile('audio/live-08b.mp3')} volume={1} /></Sequence>
    <Sequence from={3569}><Audio src={staticFile('audio/live-09b.mp3')} volume={1} /></Sequence>
    <Sequence from={4087}><Audio src={staticFile('audio/live-11.mp3')} volume={1} /></Sequence>
    <Sequence from={4664}><Audio src={staticFile('audio/live-12.mp3')} volume={1} /></Sequence>

    {/* Scenes - each scene spans its audio segment(s) exactly */}
    <Sequence from={0} durationInFrames={217}><S1 /></Sequence>
    <Sequence from={217} durationInFrames={218}><S2 /></Sequence>
    <Sequence from={435} durationInFrames={872}><S3 /></Sequence>
    <Sequence from={1307} durationInFrames={628}><S4 /></Sequence>
    <Sequence from={1935} durationInFrames={527}><S5 /></Sequence>
    <Sequence from={2462} durationInFrames={533}><S6 /></Sequence>
    <Sequence from={2995} durationInFrames={574}><S7 /></Sequence>
    <Sequence from={3569} durationInFrames={518}><S8 /></Sequence>
    <Sequence from={4087} durationInFrames={577}><S9 /></Sequence>
    <Sequence from={4664} durationInFrames={1260}><S10 /></Sequence>
  </AbsoluteFill>
);
