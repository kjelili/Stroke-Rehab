/**
 * LiveDemo.tsx — Enhanced with real screenshots + ElevenLabs voiceover
 * 3 minutes @ 30fps = 5400 frames
 */
import React from 'react';
import {
  AbsoluteFill, Sequence, Img, Audio, staticFile,
  interpolate, spring, useCurrentFrame, useVideoConfig,
} from 'remotion';
import { COLORS, FONTS } from '../components/tokens';
import {
  GradientBg, NeuralWeb, FloatingParticles, FadeIn, SlideUp,
  BrainIcon, AnimatedProgressBar, FeatureBadge,
  SectionTitle, CalloutBox, FrameCounter,
} from '../components/SharedComponents';

// ── Browser chrome wrapper around a screenshot ───────────────────────────────
const ScreenShot: React.FC<{
  src: string; label: string; delay?: number;
  highlightText?: string;
}> = ({ src, label, delay = 0, highlightText }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: frame - delay, fps, config: { stiffness: 70, damping: 20 } });
  const opacity = interpolate(sp, [0, 1], [0, 1]);
  const scale  = interpolate(sp, [0, 1], [0.93, 1]);
  const pulse  = 0.5 + 0.5 * Math.sin(frame / 20);

  return (
    <div style={{ opacity, transform: `scale(${scale})`, position: 'relative' }}>
      <div style={{
        backgroundColor: '#1A1A2E', border: `1px solid ${COLORS.whiteAlpha20}`,
        borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        {/* tab bar */}
        <div style={{
          backgroundColor: '#0F0F1E', padding: '8px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {['#FF5F57','#FFBD2E','#28C840'].map((c,i) => (
            <div key={i} style={{ width:10, height:10, borderRadius:'50%', backgroundColor:c }} />
          ))}
          <div style={{
            flex:1, backgroundColor: COLORS.whiteAlpha10, borderRadius:4,
            padding:'3px 12px', fontSize:11, color: COLORS.whiteAlpha40,
            fontFamily: FONTS.mono, marginLeft:8,
          }}>
            localhost:3000 — Neuro-Recover
          </div>
        </div>
        <div style={{ overflow:'hidden', maxHeight:440 }}>
          <Img src={staticFile(src)} style={{ width:'100%', display:'block' }} />
        </div>
      </div>
      {/* highlight badge */}
      {highlightText && frame > delay + 50 && (
        <div style={{
          position:'absolute', bottom:-14, left:'50%', transform:'translateX(-50%)',
          backgroundColor: COLORS.neural, borderRadius:50,
          padding:'4px 16px', fontSize:12, color:'#000', fontWeight:700,
          whiteSpace:'nowrap',
          opacity: interpolate(frame - delay - 50, [0,20],[0,1], { extrapolateLeft:'clamp', extrapolateRight:'clamp' }),
          boxShadow: `0 0 ${10*pulse}px ${COLORS.neural}`,
        }}>
          {highlightText}
        </div>
      )}
      <div style={{
        position:'absolute', bottom: highlightText ? -38 : -16, left:'50%',
        transform:'translateX(-50%)',
        backgroundColor: COLORS.dark, border:`1px solid ${COLORS.whiteAlpha20}`,
        borderRadius:50, padding:'5px 18px',
        fontSize:12, color: COLORS.whiteAlpha70, fontFamily: FONTS.body, whiteSpace:'nowrap',
      }}>
        {label}
      </div>
    </div>
  );
};

// ── Animated Bubble Popper simulation ────────────────────────────────────────
const BubbleSim: React.FC = () => {
  const frame = useCurrentFrame();
  const bubbles = [
    {bx:120,by:180,phase:0,   size:44},
    {bx:280,by:110,phase:1.2, size:36},
    {bx:380,by:250,phase:2.4, size:52},
    {bx:200,by:320,phase:0.7, size:40},
    {bx:440,by:160,phase:1.8, size:38},
    {bx:90, by:290,phase:3.1, size:30},
  ];
  const score = Math.floor(frame / 22);
  const hx = 240 + Math.sin(frame/18)*110;
  const hy = 220 + Math.cos(frame/22)*80;

  return (
    <div style={{
      backgroundColor:'#0D1117',
      border:`1px solid ${COLORS.whiteAlpha10}`,
      borderRadius:12, overflow:'hidden', position:'relative',
    }}>
      {/* header */}
      <div style={{
        padding:'12px 20px', borderBottom:`1px solid ${COLORS.whiteAlpha10}`,
        display:'flex', alignItems:'center', gap:16,
      }}>
        <span style={{color:COLORS.white, fontSize:18, fontWeight:700}}>🫧 Bubble Popper</span>
        <div style={{
          marginLeft:'auto', backgroundColor:'#1C2A3A',
          borderRadius:8, padding:'5px 14px',
          color:COLORS.white, fontSize:16, fontWeight:700,
        }}>Score: {score}</div>
      </div>
      <div style={{display:'flex'}}>
        {/* camera area */}
        <div style={{
          flex:1, height:350, backgroundColor:'#111827',
          position:'relative', overflow:'hidden',
          borderRight:`1px solid ${COLORS.whiteAlpha10}`,
        }}>
          {/* body silhouette */}
          <div style={{
            position:'absolute', bottom:0, left:'25%',
            width:140, height:290,
            background:'linear-gradient(to top,#2D3748,#1A202C)',
            borderRadius:'70px 70px 0 0',
          }}/>
          <div style={{
            position:'absolute', bottom:260, left:'32%',
            width:95, height:95, borderRadius:'50%',
            backgroundColor:'#2D3748',
          }}/>
          {/* bubbles */}
          {bubbles.map((b,i) => {
            const fy = b.by + Math.sin(frame/38+b.phase)*14;
            const fx = b.bx + Math.cos(frame/32+b.phase)*9;
            const cyclePos = (frame + b.phase*28) % 85;
            const popped = cyclePos > 68;
            const popScale = popped ? interpolate(cyclePos,[68,85],[1,2.8],{extrapolateRight:'clamp'}) : 1+Math.sin(frame/18+b.phase)*0.07;
            const popOpacity = popped ? interpolate(cyclePos,[68,85],[0.8,0],{extrapolateRight:'clamp'}) : 0.88;
            return (
              <div key={i} style={{
                position:'absolute', left:fx, top:fy,
                width:b.size, height:b.size, borderRadius:'50%',
                backgroundColor: popped ? '#38BDF8':'#60A5FA',
                opacity:popOpacity, transform:`scale(${popScale})`,
                boxShadow:`0 0 ${b.size*0.4}px rgba(96,165,250,0.7)`,
                border:'2px solid rgba(147,197,253,0.5)',
              }}/>
            );
          })}
          {/* hand cursor */}
          <div style={{
            position:'absolute', left:hx-14, top:hy-14,
            width:28, height:28, borderRadius:'50%',
            border:`3px solid ${COLORS.energy}`,
            boxShadow:`0 0 12px ${COLORS.energy}`,
          }}/>
          <div style={{
            position:'absolute', left:hx-5, top:hy-5,
            width:10, height:10, borderRadius:'50%',
            backgroundColor:COLORS.energy,
          }}/>
          {/* rehab label */}
          <div style={{
            position:'absolute', bottom:8, left:8, right:8,
            backgroundColor:'#1C2A3A', borderRadius:6, padding:'5px 10px',
            fontSize:12, color:COLORS.whiteAlpha70,
          }}>
            <strong style={{color:COLORS.white}}>Rehab focus:</strong> Reach, pinch, accuracy — difficulty adapts in real time.
          </div>
        </div>
        {/* score panel */}
        <div style={{
          width:190, backgroundColor:'#161B22',
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          gap:14, padding:18,
        }}>
          <div style={{fontSize:11, color:COLORS.whiteAlpha40, textTransform:'uppercase', letterSpacing:1}}>Bubbles popped</div>
          <div style={{fontSize:40, fontWeight:900, color:COLORS.white}}>{score}</div>
          <AnimatedProgressBar progress={Math.min(score/20,1)} color={COLORS.neural} width={150} label="Session" />
          <div style={{
            backgroundColor:`${COLORS.neural}22`,
            border:`1px solid ${COLORS.neural}44`,
            borderRadius:8, padding:'8px 12px',
            fontSize:12, color:COLORS.white, textAlign:'center',
          }}>
            🎯 AI adapting<br/><span style={{color:COLORS.neural}}>difficulty in real time</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Recovery Curve (matches actual clinician dashboard) ──────────────────────
const RecoveryCurve: React.FC = () => {
  const frame = useCurrentFrame();
  const pts = [
    {x:0,y:31,d:'Feb 13'},{x:1,y:28,d:'Feb 14'},{x:2,y:8,d:'Feb 15'},
    {x:3,y:35,d:'Feb 16'},{x:4,y:22,d:'Feb 17'},{x:5,y:38,d:'Feb 18'},
    {x:6,y:30,d:'Feb 19'},{x:7,y:47,d:'Feb 20'},
  ];
  const visible = Math.ceil(interpolate(frame,[0,200],[1,8],{extrapolateRight:'clamp'}));
  const W=580, H=150, yMax=60;
  const sx = (p:typeof pts[0]) => p.x*(W/7);
  const sy = (p:typeof pts[0]) => H-(p.y/yMax)*H;
  const show = pts.slice(0,visible);
  const pathD = show.length>1 ? show.map((p,i)=>`${i===0?'M':'L'} ${sx(p)} ${sy(p)}`).join(' ') : '';

  return (
    <div style={{
      backgroundColor:'#161B22', border:`1px solid ${COLORS.whiteAlpha20}`,
      borderRadius:12, padding:20,
    }}>
      <div style={{fontSize:15,fontWeight:700,color:COLORS.white,marginBottom:12}}>
        Recovery curve (score over time)
      </div>
      <svg width="100%" height={H+35} viewBox={`0 0 ${W} ${H+35}`}>
        {[15,30,45,60].map(v=>{
          const y=H-(v/yMax)*H;
          return <line key={v} x1={0} y1={y} x2={W} y2={y} stroke={COLORS.whiteAlpha20} strokeWidth={1} strokeDasharray="4,4"/>;
        })}
        {pathD && <>
          <path d={`${pathD} L ${sx(show[show.length-1])} ${H} L 0 ${H} Z`}
            fill="url(#ag)" opacity={0.25}/>
          <path d={pathD} fill="none" stroke="#3B82F6" strokeWidth={2.5} strokeLinecap="round"/>
          <defs>
            <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.5}/>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
        </>}
        {show.map((p,i)=>{
          const reg = p.d==='Feb 15';
          return (
            <g key={i}>
              <circle cx={sx(p)} cy={sy(p)} r={5} fill={reg?'#EF4444':'#3B82F6'}
                style={{filter:reg?'drop-shadow(0 0 6px #EF4444)':'none'}}/>
              <text x={sx(p)} y={H+18} textAnchor="middle" fill={COLORS.whiteAlpha40} fontSize={9}>{p.d}</text>
            </g>
          );
        })}
        {visible>2 && (
          <g>
            <line x1={sx(pts[2])} y1={0} x2={sx(pts[2])} y2={H}
              stroke="#EF4444" strokeWidth={1} strokeDasharray="4,4" opacity={0.5}/>
            <rect x={sx(pts[2])-38} y={4} width={76} height={18} rx={4}
              fill="#EF444433" stroke="#EF4444" strokeWidth={1}/>
            <text x={sx(pts[2])} y={16} textAnchor="middle" fill="#EF4444" fontSize={9} fontWeight="bold">
              ⚠ Regression
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

// ── MedGemma typing panel ─────────────────────────────────────────────────────
const MedGemmaPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const summary = `Patient demonstrates moderate fatigue with decreased ROM in 
right-hand exercises. Tremor within normal post-stroke range. 
Recommend: reduce session intensity 15%, increase Bubble Popper 
difficulty to maintain engagement threshold. Next review: 3 days.`;
  const typed = Math.floor(interpolate(frame,[40,280],[0,summary.length],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}));

  const metrics = [
    {label:'Range of Motion', val:'47°',   note:'▼ -8° vs last', color:'#EF4444'},
    {label:'Smoothness',      val:'0.72',  note:'▲ +0.04',       color:COLORS.energy},
    {label:'Tremor Score',    val:'0.18',  note:'→ stable',      color:COLORS.warmth},
    {label:'Fatigue',         val:'Mod.',  note:'Optimal length', color:COLORS.neural},
  ];

  return (
    <div style={{display:'flex',gap:24}}>
      <div style={{flex:1,display:'flex',flexDirection:'column',gap:10}}>
        <div style={{fontSize:13,color:COLORS.whiteAlpha40,textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>
          Raw Biomarkers
        </div>
        {metrics.map((m,i)=>{
          const sp=spring({frame:frame-i*18,fps:30,from:0,to:1});
          return (
            <div key={i} style={{
              backgroundColor:COLORS.whiteAlpha10,
              border:`1px solid ${m.color}33`, borderLeft:`3px solid ${m.color}`,
              borderRadius:8, padding:'10px 14px', opacity:sp,
            }}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:13,color:COLORS.whiteAlpha70}}>{m.label}</span>
                <span style={{fontSize:20,fontWeight:800,color:m.color,fontFamily:FONTS.mono}}>{m.val}</span>
              </div>
              <div style={{fontSize:11,color:COLORS.whiteAlpha40,marginTop:2}}>{m.note}</div>
            </div>
          );
        })}
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',gap:12}}>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <div style={{
            backgroundColor:`${COLORS.brain}33`,border:`1px solid ${COLORS.brainLight}`,
            borderRadius:6,padding:'3px 10px',fontSize:12,color:COLORS.brainLight,fontWeight:600,
          }}>🧠 MedGemma 27B</div>
          <div style={{
            backgroundColor:`${COLORS.energy}22`,border:`1px solid ${COLORS.energy}`,
            borderRadius:6,padding:'3px 10px',fontSize:11,color:COLORS.energy,
          }}>✓ Offline</div>
        </div>
        <div style={{
          backgroundColor:'#0A0A1A', border:`1px solid ${COLORS.brainLight}33`,
          borderRadius:8, padding:16,
          fontFamily:FONTS.mono, fontSize:13, color:COLORS.white, lineHeight:1.7, flex:1,
        }}>
          <div style={{color:COLORS.brainLight,marginBottom:6,fontSize:11}}>{'>'} Clinical Summary:</div>
          {summary.slice(0,typed)}
          {typed<summary.length && (
            <span style={{
              backgroundColor:COLORS.brainLight, width:8, height:15,
              display:'inline-block', opacity:Math.round(frame/10)%2,
            }}/>
          )}
        </div>
        <div style={{fontSize:11,color:COLORS.whiteAlpha40,textAlign:'center',fontFamily:FONTS.mono}}>
          Inference: 1.2s • No data leaves device
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Scenes
// ─────────────────────────────────────────────────────────────────────────────
const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps}=useVideoConfig();
  const ls=spring({frame,fps,from:0,to:1,config:{stiffness:90,damping:15}});
  const pulse=0.5+0.5*Math.sin(frame/20);
  return (
    <AbsoluteFill>
      <GradientBg/><NeuralWeb opacity={0.2}/><FloatingParticles/>
      <AbsoluteFill style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:28}}>
        <div style={{transform:`scale(${ls)}`}}>
          <div style={{width:120,height:120,borderRadius:'50%',backgroundColor:`${COLORS.brain}44`,border:`3px solid ${COLORS.brainLight}`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 0 ${50*pulse}px ${COLORS.brainLight}66`}}>
            <BrainIcon size={76} color={COLORS.brainLight}/>
          </div>
        </div>
        <SlideUp delay={20}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:76,fontWeight:900,color:COLORS.white,letterSpacing:-2,lineHeight:1}}>Neuro-Recover</div>
            <div style={{fontSize:20,color:COLORS.neural,letterSpacing:5,textTransform:'uppercase',marginTop:8}}>Live Technical Demo</div>
          </div>
        </SlideUp>
        <FadeIn delay={50} duration={30}>
          <div style={{display:'flex',gap:16}}>
            <FeatureBadge icon="👁️" text="Hand Tracking" color={COLORS.neural}/>
            <FeatureBadge icon="🎮" text="6 Adaptive Games" color={COLORS.energy}/>
            <FeatureBadge icon="🧠" text="MedGemma Offline" color={COLORS.brainLight}/>
            <FeatureBadge icon="🏥" text="FHIR Export" color={COLORS.warmth}/>
          </div>
        </FadeIn>
      </AbsoluteFill>
      <div style={{
        position:'absolute',top:36,right:40,display:'flex',alignItems:'center',gap:8,
        backgroundColor:'#EF444433',border:'1px solid #EF4444',borderRadius:50,padding:'8px 18px',
        opacity:interpolate(frame,[20,50],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),
      }}>
        <div style={{width:8,height:8,borderRadius:'50%',backgroundColor:'#EF4444',boxShadow:`0 0 ${6*pulse}px #EF4444`}}/>
        <span style={{color:COLORS.white,fontSize:14,fontWeight:700,fontFamily:FONTS.body}}>LIVE DEMO</span>
      </div>
      <FrameCounter/>
    </AbsoluteFill>
  );
};

const S2: React.FC = () => {
  const frame=useCurrentFrame();
  return (
    <AbsoluteFill style={{fontFamily:FONTS.body}}>
      <GradientBg colors={[COLORS.dark,'#0A1020',COLORS.darkMid]}/>
      <AbsoluteFill style={{padding:'55px 90px',display:'flex',gap:56,alignItems:'center'}}>
        <div style={{flex:1}}>
          <FadeIn duration={25}><SectionTitle title="Browser-Native" subtitle="No install. No hardware. Just a webcam — and recovery begins." accent={COLORS.neural}/></FadeIn>
          <div style={{marginTop:36,display:'flex',flexDirection:'column',gap:16}}>
            {[
              {icon:'⚛️',label:'React + TypeScript',sub:'Full-stack web app'},
              {icon:'🦾',label:'MediaPipe WebAssembly',sub:'30fps hand tracking in browser'},
              {icon:'🐳',label:'Docker Compose',sub:'One-command deployment'},
              {icon:'📊',label:'HL7 FHIR Export',sub:'NHS-compatible data format'},
            ].map((item,i)=>{
              const sp=spring({frame:frame-i*28,fps:30,from:0,to:1});
              return (
                <div key={i} style={{display:'flex',alignItems:'center',gap:14,backgroundColor:COLORS.whiteAlpha10,borderRadius:10,padding:'12px 18px',opacity:sp,transform:`translateX(${interpolate(sp,[0,1],[-36,0])}px)`}}>
                  <span style={{fontSize:24}}>{item.icon}</span>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,color:COLORS.white}}>{item.label}</div>
                    <div style={{fontSize:12,color:COLORS.whiteAlpha40}}>{item.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{flex:1.2}}>
          <ScreenShot src="screen-hero.png" label="Neuro-Recover — Landing page" delay={15}/>
        </div>
      </AbsoluteFill>
      <FrameCounter/>
    </AbsoluteFill>
  );
};

const S3: React.FC = () => {
  const frame=useCurrentFrame();
  return (
    <AbsoluteFill style={{fontFamily:FONTS.body}}>
      <GradientBg colors={['#060E18','#0A1828','#06121C']}/>
      <AbsoluteFill style={{padding:'50px 90px',display:'flex',gap:56,alignItems:'center'}}>
        <div style={{flex:1.2}}>
          <ScreenShot src="screen-how-it-works.png" label="6 game modes — each targeting specific rehab outcomes" delay={0}/>
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:18}}>
          <FadeIn duration={25}><SectionTitle title="6 Rehab Games" subtitle="Vision + voice targeting specific clinical outcomes" accent={COLORS.energy}/></FadeIn>
          {[
            {icon:'🎹',name:'Virtual Piano',  focus:'Finger isolation, reaction time'},
            {icon:'🫧',name:'Bubble Popper', focus:'Reach, pinch, accuracy'},
            {icon:'🎯',name:'Reach & Hold',  focus:'Shoulder reach, stability'},
            {icon:'☕',name:'Grab Cup',       focus:'Fist formation, ADL grasp'},
            {icon:'🔘',name:'Button',         focus:'Fine motor, pinch precision'},
            {icon:'👆',name:'Finger Tap',     focus:'Isolation, coordination'},
          ].map((g,i)=>{
            const sp=spring({frame:frame-i*22,fps:30,from:0,to:1});
            return (
              <div key={i} style={{display:'flex',alignItems:'center',gap:12,opacity:sp,transform:`translateX(${interpolate(sp,[0,1],[28,0])}px)`}}>
                <span style={{fontSize:20,width:28}}>{g.icon}</span>
                <span style={{fontSize:14,fontWeight:600,color:COLORS.white,minWidth:110}}>{g.name}</span>
                <span style={{fontSize:12,color:COLORS.whiteAlpha40}}>{g.focus}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <FrameCounter/>
    </AbsoluteFill>
  );
};

const S4: React.FC = () => {
  const frame=useCurrentFrame();
  return (
    <AbsoluteFill style={{fontFamily:FONTS.body}}>
      <GradientBg colors={['#060A14','#0A1020','#0E1428']}/>
      <AbsoluteFill style={{padding:'50px 80px'}}>
        <FadeIn duration={20}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
            <SectionTitle title="Virtual Piano" subtitle="Finger isolation & reaction time — MediaPipe hand tracking" accent={COLORS.neural}/>
          </div>
        </FadeIn>
        <div style={{display:'flex',gap:40}}>
          <div style={{flex:1.1}}>
            <ScreenShot src="screen-piano.png" label="Real session — hand tracking active" delay={0} highlightText="21 hand landmarks tracked at 30fps"/>
          </div>
          <div style={{flex:0.9,display:'flex',flexDirection:'column',gap:16,justifyContent:'center'}}>
            <FadeIn delay={30} duration={25}>
              <CalloutBox accentColor={COLORS.neural}>
                <div style={{fontSize:14,color:COLORS.white,lineHeight:1.6}}>
                  Each finger maps to a piano key. Patient extends one finger at a time —
                  building <strong style={{color:COLORS.neural}}>finger isolation</strong>, range of motion, and reaction speed.
                </div>
              </CalloutBox>
            </FadeIn>
            {[
              {stat:'30fps', label:'Hand tracking',   color:COLORS.neural},
              {stat:'21',    label:'Landmarks/hand',  color:COLORS.energy},
              {stat:'<50ms', label:'Gesture latency', color:COLORS.brainLight},
              {stat:'100%',  label:'Browser native',  color:COLORS.warmth},
            ].map((s,i)=>(
              <FadeIn key={i} delay={50+i*20} duration={20}>
                <div style={{backgroundColor:`${s.color}15`,border:`1px solid ${s.color}33`,borderRadius:10,padding:'12px 18px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:14,color:COLORS.whiteAlpha70}}>{s.label}</span>
                  <span style={{fontSize:24,fontWeight:900,color:s.color,fontFamily:FONTS.mono}}>{s.stat}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </AbsoluteFill>
      <FrameCounter/>
    </AbsoluteFill>
  );
};

const S5: React.FC = () => {
  const frame=useCurrentFrame();
  return (
    <AbsoluteFill style={{fontFamily:FONTS.body}}>
      <GradientBg colors={['#060A14','#0C1424','#080E1C']}/>
      <AbsoluteFill style={{padding:'50px 80px'}}>
        <FadeIn duration={20}>
          <div style={{marginBottom:24}}>
            <SectionTitle title="Bubble Popper" subtitle="Real-time adaptive difficulty — reach, pinch, and accuracy" accent="#60A5FA"/>
          </div>
        </FadeIn>
        <div style={{display:'flex',gap:36}}>
          <div style={{flex:1.1}}><BubbleSim/></div>
          <div style={{flex:0.9,display:'flex',flexDirection:'column',gap:16,paddingTop:10}}>
            <FadeIn delay={20} duration={25}>
              <ScreenShot src="screen-bubbles.png" label="Live screenshot — patient session" delay={0}/>
            </FadeIn>
            <FadeIn delay={80} duration={25}>
              <CalloutBox accentColor="#60A5FA">
                <div style={{fontSize:13,color:COLORS.white,lineHeight:1.6}}>
                  <strong style={{color:'#60A5FA'}}>Adaptive algorithm</strong> adjusts speed and size
                  every 5 seconds — always keeping the patient in the optimal challenge zone.
                </div>
              </CalloutBox>
            </FadeIn>
          </div>
        </div>
      </AbsoluteFill>
      <FrameCounter/>
    </AbsoluteFill>
  );
};

const S6: React.FC = () => {
  const frame=useCurrentFrame();
  return (
    <AbsoluteFill style={{fontFamily:FONTS.body}}>
      <GradientBg colors={['#060A10','#0A1418','#06100E']}/>
      <AbsoluteFill style={{padding:'50px 90px',display:'flex',gap:56,alignItems:'center'}}>
        <div style={{flex:1.1}}>
          <ScreenShot src="screen-reach-hold.png" label="Reach & Hold — 14 reaches logged" delay={0} highlightText="🎯 Target locked — Hold 1.5s"/>
        </div>
        <div style={{flex:0.9,display:'flex',flexDirection:'column',gap:20}}>
          <FadeIn duration={25}><SectionTitle title="Reach & Hold" subtitle="Shoulder reach, index extension, positional stability" accent={COLORS.energy}/></FadeIn>
          <FadeIn delay={40} duration={25}>
            <CalloutBox accentColor={COLORS.energy}>
              <div style={{fontSize:14,color:COLORS.white,lineHeight:1.7}}>
                Patient extends index finger to target circle, holds for <strong style={{color:COLORS.energy}}>1.5 seconds</strong>.
                Target moves to challenge different shoulder angles.
              </div>
            </CalloutBox>
          </FadeIn>
          {[
            {label:'Reaches this session',value:'14', color:COLORS.energy},
            {label:'Avg hold duration',   value:'1.8s',color:COLORS.neural},
            {label:'Arm extension angle', value:'112°',color:COLORS.brainLight},
          ].map((m,i)=>(
            <FadeIn key={i} delay={60+i*28} duration={20}>
              <div style={{backgroundColor:`${m.color}15`,border:`1px solid ${m.color}33`,borderRadius:10,padding:'12px 18px',display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:14,color:COLORS.whiteAlpha70}}>{m.label}</span>
                <span style={{fontSize:24,fontWeight:800,color:m.color,fontFamily:FONTS.mono}}>{m.value}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </AbsoluteFill>
      <FrameCounter/>
    </AbsoluteFill>
  );
};

const S7: React.FC = () => {
  const frame=useCurrentFrame();
  return (
    <AbsoluteFill style={{fontFamily:FONTS.body}}>
      <GradientBg colors={['#060A10','#0A1420','#060E18']}/>
      <AbsoluteFill style={{padding:'50px 90px',display:'flex',gap:56,alignItems:'center'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:20}}>
          <FadeIn duration={25}><SectionTitle title="Progress Dashboard" subtitle="Every session timestamped, scored, and exportable as PDF" accent={COLORS.warmth}/></FadeIn>
          <FadeIn delay={30} duration={25}>
            <div style={{backgroundColor:'#1C2A3A',border:`1px solid ${COLORS.whiteAlpha20}`,borderRadius:10,padding:'14px 20px'}}>
              <div style={{fontSize:14,color:COLORS.whiteAlpha40,marginBottom:4}}>Summary</div>
              <div style={{fontSize:16,color:COLORS.white}}>Total practice: <strong style={{color:COLORS.energy}}>21.5 minutes</strong></div>
              <div style={{fontSize:16,color:COLORS.white,marginTop:4}}>Sessions: <strong style={{color:COLORS.energy}}>8</strong></div>
            </div>
          </FadeIn>
          <FadeIn delay={60} duration={25}>
            <CalloutBox accentColor={COLORS.warmth}>
              <div style={{fontSize:13,color:COLORS.white,lineHeight:1.6}}>
                Score trending <strong style={{color:COLORS.energy}}>upward</strong> — 32 → 35 → 38 across
                piano sessions. One click exports full PDF report for clinician review.
              </div>
            </CalloutBox>
          </FadeIn>
          <FadeIn delay={100} duration={25}>
            <ScreenShot src="screen-progress2.png" label="Score over time table" delay={0}/>
          </FadeIn>
        </div>
        <div style={{flex:1.1}}>
          <ScreenShot src="screen-progress.png" label="Progress Dashboard — 8 sessions" delay={20}/>
        </div>
      </AbsoluteFill>
      <FrameCounter/>
    </AbsoluteFill>
  );
};

const S8: React.FC = () => {
  const frame=useCurrentFrame();
  return (
    <AbsoluteFill style={{fontFamily:FONTS.body}}>
      <GradientBg colors={['#060810','#0A1020','#080C18']}/>
      <AbsoluteFill style={{padding:'50px 90px'}}>
        <FadeIn duration={25}><SectionTitle title="Clinician Dashboard" subtitle="Recovery curve, auto-flagged regression, FHIR export" accent={COLORS.neural}/></FadeIn>
        <div style={{marginTop:32,display:'flex',gap:36}}>
          <div style={{flex:1.1}}>
            <ScreenShot src="screen-clinician.png" label="Clinician Dashboard — Feb 13–20" delay={0} highlightText="⚠ Feb 15 regression auto-detected"/>
          </div>
          <div style={{flex:0.9,display:'flex',flexDirection:'column',gap:18}}>
            <FadeIn delay={20} duration={25}><RecoveryCurve/></FadeIn>
            <FadeIn delay={180} duration={25}>
              <div style={{display:'flex',gap:14}}>
                <div style={{flex:1,backgroundColor:'#EF444422',border:'1px solid #EF4444',borderRadius:10,padding:'12px 14px'}}>
                  <div style={{fontSize:11,color:'#EF4444',fontWeight:700,marginBottom:4}}>⚠ AUTO-FLAGGED</div>
                  <div style={{fontSize:12,color:COLORS.white}}>Score drop Feb 15: 35→8. Possible fatigue. Review recommended.</div>
                </div>
                <div style={{flex:1,backgroundColor:`${COLORS.energy}22`,border:`1px solid ${COLORS.energy}`,borderRadius:10,padding:'12px 14px'}}>
                  <div style={{fontSize:11,color:COLORS.energy,fontWeight:700,marginBottom:4}}>✓ FHIR READY</div>
                  <div style={{fontSize:12,color:COLORS.white}}>Export full session data in HL7 FHIR R4 for EHR integration.</div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </AbsoluteFill>
      <FrameCounter/>
    </AbsoluteFill>
  );
};

const S9: React.FC = () => {
  const frame=useCurrentFrame();
  return (
    <AbsoluteFill style={{fontFamily:FONTS.body}}>
      <GradientBg colors={[COLORS.dark,COLORS.darkMid,'#1E0A4A']}/>
      <NeuralWeb opacity={0.15}/>
      <AbsoluteFill style={{padding:'50px 90px'}}>
        <FadeIn duration={25}><SectionTitle title="MedGemma AI Inference" subtitle="Raw biomarkers → clinical summary — running fully offline" accent={COLORS.brainLight}/></FadeIn>
        <div style={{marginTop:36}}><MedGemmaPanel/></div>
        <FadeIn delay={200} duration={30}>
          <div style={{marginTop:28}}>
            <CalloutBox accentColor={COLORS.brainLight}>
              <div style={{fontSize:15,color:COLORS.white,textAlign:'center',lineHeight:1.6}}>
                🔒 <strong style={{color:COLORS.brainLight}}>Running fully offline using open-weight MedGemma</strong> —
                patient data never leaves the device. Deploy anywhere without internet dependency.
              </div>
            </CalloutBox>
          </div>
        </FadeIn>
      </AbsoluteFill>
      <FrameCounter/>
    </AbsoluteFill>
  );
};

const S10: React.FC = () => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const pulse=0.5+0.5*Math.sin(frame/20);
  const ls=spring({frame,fps,from:0,to:1,config:{stiffness:80,damping:18}});
  return (
    <AbsoluteFill style={{fontFamily:FONTS.body}}>
      <GradientBg colors={[COLORS.dark,COLORS.darkMid,COLORS.brainDark]} animate/>
      <NeuralWeb opacity={0.2}/><FloatingParticles/>
      <AbsoluteFill style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        {[1,2,3].map(r=>(
          <div key={r} style={{position:'absolute',width:180+r*130,height:180+r*130,borderRadius:'50%',border:`1px solid ${COLORS.brainLight}`,opacity:(0.15/r)+0.07*Math.sin(frame/30+r)}}/>
        ))}
        <div style={{transform:`scale(${ls})`,textAlign:'center',zIndex:1}}>
          <div style={{width:130,height:130,borderRadius:'50%',backgroundColor:`${COLORS.brain}44`,border:`3px solid ${COLORS.brainLight}`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 32px',boxShadow:`0 0 ${60*pulse}px ${COLORS.brainLight}66`}}>
            <BrainIcon size={84} color={COLORS.brainLight}/>
          </div>
          <div style={{fontSize:78,fontWeight:900,color:COLORS.white,letterSpacing:-2,lineHeight:1}}>Neuro-Recover</div>
          <div style={{fontSize:18,color:COLORS.neural,letterSpacing:4,textTransform:'uppercase',marginTop:10}}>
            AI-Powered Neurorehabilitation
          </div>
        </div>
        <FadeIn delay={40} duration={40}>
          <div style={{fontSize:20,color:COLORS.whiteAlpha70,textAlign:'center',maxWidth:820,marginTop:28,lineHeight:1.6,padding:'0 40px',fontStyle:'italic'}}>
            "Brings AI-powered neurorehabilitation to any clinical environment —<br/>
            without reliance on centralised infrastructure."
          </div>
        </FadeIn>
        {frame>80 && (
          <FadeIn delay={80} duration={40}>
            <div style={{display:'flex',gap:14,marginTop:36,flexWrap:'wrap',justifyContent:'center'}}>
              <FeatureBadge icon="⚛️" text="TypeScript" color={COLORS.neural}/>
              <FeatureBadge icon="🐳" text="Docker Ready" color={COLORS.energy}/>
              <FeatureBadge icon="🧠" text="MedGemma Offline" color={COLORS.brainLight}/>
              <FeatureBadge icon="🔒" text="FHIR Export" color={COLORS.warmth}/>
            </div>
          </FadeIn>
        )}
        {frame>140 && (
          <FadeIn duration={30}>
            <div style={{marginTop:24,color:COLORS.whiteAlpha40,fontSize:15,fontFamily:FONTS.mono}}>
              github.com/kjelili/Stroke-Rehab
            </div>
          </FadeIn>
        )}
      </AbsoluteFill>
      <FrameCounter/>
    </AbsoluteFill>
  );
};

// ── Main export ───────────────────────────────────────────────────────────────
export const LiveDemo: React.FC = () => (
  <AbsoluteFill>
    {/* Voiceover — generate MP3s first with: node generate-voiceover.js */}
    <Sequence from={0}>   <Audio src={staticFile('audio/live-01.mp3')} volume={1}/></Sequence>
    <Sequence from={180}> <Audio src={staticFile('audio/live-02.mp3')} volume={1}/></Sequence>
    <Sequence from={450}> <Audio src={staticFile('audio/live-03.mp3')} volume={1}/></Sequence>
    <Sequence from={750}> <Audio src={staticFile('audio/live-04.mp3')} volume={1}/></Sequence>
    <Sequence from={1110}><Audio src={staticFile('audio/live-05.mp3')} volume={1}/></Sequence>
    <Sequence from={1470}><Audio src={staticFile('audio/live-06.mp3')} volume={1}/></Sequence>
    <Sequence from={1800}><Audio src={staticFile('audio/live-07.mp3')} volume={1}/></Sequence>
    <Sequence from={2130}><Audio src={staticFile('audio/live-08.mp3')} volume={1}/></Sequence>
    <Sequence from={2550}><Audio src={staticFile('audio/live-09.mp3')} volume={1}/></Sequence>
    <Sequence from={2970}><Audio src={staticFile('audio/live-10.mp3')} volume={1}/></Sequence>

    {/* Scenes */}
    <Sequence from={0}    durationInFrames={180}> <S1/></Sequence>
    <Sequence from={180}  durationInFrames={270}> <S2/></Sequence>
    <Sequence from={450}  durationInFrames={300}> <S3/></Sequence>
    <Sequence from={750}  durationInFrames={360}> <S4/></Sequence>
    <Sequence from={1110} durationInFrames={360}> <S5/></Sequence>
    <Sequence from={1470} durationInFrames={330}> <S6/></Sequence>
    <Sequence from={1800} durationInFrames={330}> <S7/></Sequence>
    <Sequence from={2130} durationInFrames={420}> <S8/></Sequence>
    <Sequence from={2550} durationInFrames={420}> <S9/></Sequence>
    <Sequence from={2970} durationInFrames={2430}><S10/></Sequence>
  </AbsoluteFill>
);
