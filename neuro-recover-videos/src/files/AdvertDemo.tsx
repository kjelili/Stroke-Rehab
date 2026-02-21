/**
 * AdvertDemo.tsx — Enhanced with real screenshots + ElevenLabs voiceover
 * 3 minutes @ 30fps = 5400 frames
 * Tone: Emotional, hopeful, cinematic — patients, carers, clinicians
 */
import React from 'react';
import {
  AbsoluteFill, Sequence, Img, Audio, staticFile,
  interpolate, spring, useCurrentFrame, useVideoConfig,
} from 'remotion';
import { COLORS, FONTS } from '../components/tokens';
import {
  GradientBg, NeuralWeb, FloatingParticles, FadeIn, SlideUp, ScaleIn,
  BrainIcon, AnimatedProgressBar, FeatureBadge, SectionTitle, CalloutBox,
} from '../components/SharedComponents';

// ── Cinematic letterbox ───────────────────────────────────────────────────────
const Bars: React.FC = () => (
  <>
    <div style={{position:'absolute',top:0,left:0,right:0,height:56,backgroundColor:'#000',zIndex:10}}/>
    <div style={{position:'absolute',bottom:0,left:0,right:0,height:56,backgroundColor:'#000',zIndex:10}}/>
  </>
);

// ── Screenshot in elegant rounded frame ──────────────────────────────────────
const AppScreen: React.FC<{src:string; label?:string; delay?:number; style?:React.CSSProperties}> = ({src,label,delay=0,style}) => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const sp=spring({frame:frame-delay,fps,config:{stiffness:65,damping:20}});
  const opacity=interpolate(sp,[0,1],[0,1]);
  const scale=interpolate(sp,[0,1],[0.94,1]);
  return (
    <div style={{opacity,transform:`scale(${scale})`,position:'relative',...style}}>
      <div style={{
        borderRadius:16, overflow:'hidden',
        boxShadow:'0 32px 100px rgba(0,0,0,0.7)',
        border:`1px solid rgba(255,255,255,0.12)`,
      }}>
        <Img src={staticFile(src)} style={{width:'100%',display:'block'}}/>
      </div>
      {label && (
        <div style={{
          position:'absolute',bottom:-14,left:'50%',transform:'translateX(-50%)',
          backgroundColor:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',
          border:'1px solid rgba(255,255,255,0.15)',
          borderRadius:50,padding:'4px 16px',
          fontSize:12,color:'rgba(255,255,255,0.6)',whiteSpace:'nowrap',
          fontFamily:FONTS.body,
        }}>
          {label}
        </div>
      )}
    </div>
  );
};

// ── Scene 1: Problem (0-360, 12s) ──────────────────────────────────────────
const A1: React.FC = () => {
  const frame=useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background:'linear-gradient(135deg,#050508 0%,#0C0C14 60%,#07070E 100%)'}}/>
      <Bars/>
      <AbsoluteFill style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 200px'}}>
        <FadeIn duration={30}>
          <div style={{display:'flex',gap:16,marginBottom:50,opacity:0.35}}>
            {Array.from({length:7},(_,i)=>(
              <div key={i} style={{
                width:52,height:52,borderRadius:10,
                backgroundColor:'rgba(255,255,255,0.05)',
                border:'1px solid rgba(255,255,255,0.1)',
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,
              }}>💪</div>
            ))}
          </div>
        </FadeIn>
        <SlideUp delay={20}>
          <div style={{fontSize:62,fontWeight:900,color:COLORS.white,textAlign:'center',lineHeight:1.15,fontFamily:FONTS.body}}>
            Stroke rehabilitation<br/>
            <span style={{color:'#6B7280'}}>shouldn't feel like</span><br/>
            <span style={{textDecoration:'line-through',color:'#4B5563'}}>a daily chore.</span>
          </div>
        </SlideUp>
        <FadeIn delay={70} duration={30}>
          <div style={{marginTop:36,fontSize:22,color:'rgba(255,255,255,0.4)',textAlign:'center',maxWidth:760,lineHeight:1.7,fontFamily:FONTS.body}}>
            Over <span style={{color:COLORS.white,fontWeight:700}}>80% of stroke survivors</span> fail to
            complete prescribed physiotherapy — not because they can't, but because repetitive
            exercises offer no engagement, no feedback, and no sense of progress.
          </div>
        </FadeIn>
        {frame>130 && (
          <FadeIn duration={30}>
            <div style={{marginTop:48,display:'flex',gap:56}}>
              {[
                {stat:'80%',  label:'drop out of rehab'},
                {stat:'6mo',  label:'recovery window'},
                {stat:'1.2M', label:'survivors in UK'},
              ].map((s,i)=>(
                <div key={i} style={{textAlign:'center'}}>
                  <div style={{fontSize:52,fontWeight:900,color:'#EF4444',fontFamily:FONTS.body}}>{s.stat}</div>
                  <div style={{fontSize:14,color:'rgba(255,255,255,0.35)',marginTop:4,fontFamily:FONTS.body}}>{s.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 2: Brand Reveal (360-600, 8s) ──────────────────────────────────────
const A2: React.FC = () => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const flash=interpolate(frame,[0,8,18],[1,0.3,0],{extrapolateRight:'clamp'});
  const expand=spring({frame,fps,from:0,to:1,config:{stiffness:55,damping:20}});
  const pulse=0.5+0.5*Math.sin(frame/22);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{backgroundColor:COLORS.white,opacity:flash,zIndex:20}}/>
      <GradientBg colors={[COLORS.dark,COLORS.darkMid,COLORS.brainDark]} animate/>
      <NeuralWeb opacity={0.22}/><FloatingParticles/>
      <Bars/>
      <AbsoluteFill style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:0}}>
        <div style={{
          width:160*expand,height:160*expand,borderRadius:'50%',
          backgroundColor:`${COLORS.brain}44`,border:`4px solid ${COLORS.brainLight}`,
          display:'flex',alignItems:'center',justifyContent:'center',
          boxShadow:`0 0 ${70*pulse}px ${COLORS.brainLight}66, 0 0 ${130*pulse}px ${COLORS.brain}33`,
          marginBottom:40,
        }}>
          <div style={{transform:`scale(${expand})`}}>
            <BrainIcon size={100} color={COLORS.brainLight}/>
          </div>
        </div>
        <ScaleIn delay={15}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:100,fontWeight:900,color:COLORS.white,letterSpacing:-3,lineHeight:1,textShadow:`0 0 100px ${COLORS.brainLight}44`,fontFamily:FONTS.body}}>
              Neuro-Recover
            </div>
            <div style={{fontSize:22,color:COLORS.neural,letterSpacing:7,textTransform:'uppercase',marginTop:10,fontWeight:500,fontFamily:FONTS.body}}>
              Rehabilitation, Reimagined
            </div>
          </div>
        </ScaleIn>
        <FadeIn delay={50} duration={40}>
          <div style={{fontSize:22,color:'rgba(255,255,255,0.65)',textAlign:'center',maxWidth:680,marginTop:36,lineHeight:1.7,fontFamily:FONTS.body}}>
            Turn your recovery exercises into games.
            Track progress with computer vision.
            Be supported by AI — every single day.
          </div>
        </FadeIn>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 3: Feature Showcase (600-1080, 16s) ─────────────────────────────
const A3: React.FC = () => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const features=[
    {icon:'👁️',title:'See Every Move',desc:'Our computer vision watches your movements in real time — counting reps, measuring range of motion, celebrating every improvement.',color:COLORS.neural,delay:0,screen:'screen-reach-hold.png'},
    {icon:'🎮',title:'Play Your Way',desc:'Bubble Popper, Virtual Piano, Reach & Hold — each exercise becomes a game that adapts to your ability in real time.',color:COLORS.energy,delay:100,screen:'screen-bubbles.png'},
    {icon:'📊',title:'Track Your Progress',desc:'Your clinician sees your recovery curve, session by session. Regressions flagged. FHIR exported. Nothing missed.',color:COLORS.warmth,delay:200,screen:'screen-clinician.png'},
  ];
  return (
    <AbsoluteFill style={{fontFamily:FONTS.body}}>
      <GradientBg colors={[COLORS.dark,'#0F1828','#081428']}/>
      <FloatingParticles/>
      <Bars/>
      <AbsoluteFill style={{padding:'70px 80px'}}>
        <FadeIn duration={30}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <div style={{fontSize:52,fontWeight:900,color:COLORS.white,lineHeight:1,fontFamily:FONTS.body}}>
              Everything you need.<br/>
              <span style={{color:COLORS.neural}}>Nothing you don't.</span>
            </div>
          </div>
        </FadeIn>
        <div style={{display:'flex',gap:32}}>
          {features.map((f,i)=>{
            const sp=spring({frame:frame-f.delay,fps,config:{stiffness:68,damping:18}});
            const ty=interpolate(sp,[0,1],[70,0]);
            const opacity=interpolate(sp,[0,1],[0,1]);
            const pulse=0.5+0.5*Math.sin(frame/28+i*1.8);
            return (
              <div key={i} style={{
                flex:1,backgroundColor:`${f.color}0E`,
                border:`1px solid ${f.color}2E`,borderTop:`4px solid ${f.color}`,
                borderRadius:20,padding:'28px 28px 32px',
                opacity,transform:`translateY(${ty}px)`,
                display:'flex',flexDirection:'column',gap:16,
              }}>
                <div style={{
                  width:64,height:64,borderRadius:'50%',
                  backgroundColor:`${f.color}20`,border:`2px solid ${f.color}44`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:30,boxShadow:`0 0 ${18*pulse}px ${f.color}44`,
                }}>
                  {f.icon}
                </div>
                <div style={{fontSize:22,fontWeight:800,color:COLORS.white}}>{f.title}</div>
                <div style={{fontSize:14,color:'rgba(255,255,255,0.65)',lineHeight:1.7,flex:1}}>{f.desc}</div>
                <AppScreen src={f.screen} delay={f.delay+60}/>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 4: Games in action (1080-1800, 24s) ────────────────────────────────
const A4: React.FC = () => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const screens=[
    {src:'screen-piano.png',    label:'🎹 Virtual Piano — finger isolation',    color:COLORS.neural, delay:0},
    {src:'screen-bubbles.png',  label:'🫧 Bubble Popper — reach & pinch',       color:'#60A5FA',     delay:80},
    {src:'screen-reach-hold.png',label:'🎯 Reach & Hold — stability training',  color:COLORS.energy, delay:160},
    {src:'screen-dashboard-games.png',label:'📋 Dashboard — 6 games overview',  color:COLORS.warmth, delay:240},
  ];
  return (
    <AbsoluteFill style={{fontFamily:FONTS.body}}>
      <GradientBg colors={['#060A14','#0C1424','#080E1C']}/>
      <Bars/>
      <AbsoluteFill style={{padding:'70px 80px'}}>
        <FadeIn duration={25}>
          <div style={{textAlign:'center',marginBottom:40}}>
            <div style={{fontSize:50,fontWeight:900,color:COLORS.white,lineHeight:1}}>6 Games. One Goal.</div>
            <div style={{fontSize:20,color:'rgba(255,255,255,0.55)',marginTop:12}}>
              Every rep counts. Every movement tracked. Every improvement celebrated.
            </div>
          </div>
        </FadeIn>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:28}}>
          {screens.map((s,i)=>{
            const sp=spring({frame:frame-s.delay,fps,config:{stiffness:70,damping:20}});
            return (
              <div key={i} style={{
                opacity:interpolate(sp,[0,1],[0,1]),
                transform:`scale(${interpolate(sp,[0,1],[0.92,1])})`,
              }}>
                <div style={{
                  backgroundColor:`${s.color}10`,border:`1px solid ${s.color}33`,
                  borderRadius:16,overflow:'hidden',
                }}>
                  <Img src={staticFile(s.src)} style={{width:'100%',display:'block',maxHeight:220,objectFit:'cover'}}/>
                  <div style={{
                    padding:'10px 16px',fontSize:13,color:'rgba(255,255,255,0.7)',
                    borderTop:`1px solid ${s.color}22`,fontWeight:600,
                  }}>
                    {s.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 5: Clinician view (1800-2160, 12s) ─────────────────────────────────
const A5: React.FC = () => {
  const frame=useCurrentFrame();
  return (
    <AbsoluteFill style={{fontFamily:FONTS.body}}>
      <GradientBg colors={['#060810','#0A1020','#060E18']}/>
      <Bars/>
      <AbsoluteFill style={{padding:'60px 90px',display:'flex',gap:56,alignItems:'center'}}>
        <div style={{flex:1.1}}>
          <AppScreen src="screen-clinician.png" label="Clinician Dashboard — Feb 13–20" delay={0}/>
        </div>
        <div style={{flex:0.9,display:'flex',flexDirection:'column',gap:22}}>
          <FadeIn duration={25}>
            <SectionTitle title="Clinicians See Everything" subtitle="Recovery curve, regressions flagged, FHIR data ready for EHR" accent={COLORS.neural}/>
          </FadeIn>
          <FadeIn delay={40} duration={25}>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {[
                {icon:'📈',text:'Recovery curve across all sessions',           color:COLORS.neural},
                {icon:'⚠️',text:'Regressions automatically detected and flagged', color:'#EF4444'},
                {icon:'📤',text:'One click HL7 FHIR export for EHR systems',     color:COLORS.energy},
                {icon:'👥',text:'Multi-patient support in production',           color:COLORS.brainLight},
              ].map((item,i)=>{
                const sp=spring({frame:frame-i*30,fps:30,from:0,to:1});
                return (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:14,opacity:sp,transform:`translateX(${interpolate(sp,[0,1],[30,0])}px)`}}>
                    <span style={{fontSize:22}}>{item.icon}</span>
                    <span style={{fontSize:15,color:COLORS.white,lineHeight:1.5}}>{item.text}</span>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 6: Trust signals (2160-2700, 18s) ───────────────────────────────────
const A6: React.FC = () => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const signals=[
    {icon:'🏥',title:'Clinician-Designed',   desc:'Built with neurologists and physiotherapists from day one.',         color:COLORS.neural},
    {icon:'📋',title:'Evidence-Based',        desc:'Exercises aligned with NICE NG236 stroke rehabilitation guidelines.', color:COLORS.energy},
    {icon:'🔒',title:'NHS Compatible',        desc:'GDPR compliant, HL7 FHIR R4 format, ready for NHS integration.',     color:COLORS.brainLight},
    {icon:'🛡️',title:'Clinician Oversight', desc:'Therapists receive weekly summaries and can adjust remotely.',        color:COLORS.warmth},
  ];
  return (
    <AbsoluteFill style={{fontFamily:FONTS.body}}>
      <GradientBg colors={['#060A10','#0A1220','#06121C']}/>
      <FloatingParticles/>
      <Bars/>
      <AbsoluteFill style={{padding:'70px 90px'}}>
        <FadeIn duration={25}>
          <SectionTitle title="Built for Trust" subtitle="Rehabilitation is serious — we treat it that way" accent={COLORS.neural}/>
        </FadeIn>
        <div style={{marginTop:48,display:'grid',gridTemplateColumns:'1fr 1fr',gap:28}}>
          {signals.map((s,i)=>{
            const sp=spring({frame:frame-i*45,fps,config:{stiffness:78,damping:18}});
            const scale=interpolate(sp,[0,1],[0.86,1]);
            const opacity=interpolate(sp,[0,1],[0,1]);
            const pulse=0.5+0.5*Math.sin(frame/38+i);
            return (
              <div key={i} style={{
                backgroundColor:`${s.color}0F`,border:`1px solid ${s.color}2E`,
                borderRadius:18,padding:'32px 36px',
                opacity,transform:`scale(${scale})`,
              }}>
                <div style={{
                  width:60,height:60,borderRadius:14,
                  backgroundColor:`${s.color}20`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:28,marginBottom:20,
                  boxShadow:`0 0 ${14*pulse}px ${s.color}33`,
                }}>
                  {s.icon}
                </div>
                <div style={{fontSize:20,fontWeight:700,color:COLORS.white,marginBottom:10}}>{s.title}</div>
                <div style={{fontSize:15,color:'rgba(255,255,255,0.6)',lineHeight:1.7}}>{s.desc}</div>
              </div>
            );
          })}
        </div>
        {frame>220 && (
          <FadeIn duration={35}>
            <div style={{marginTop:36,display:'flex',gap:18,justifyContent:'center',flexWrap:'wrap'}}>
              {['📋 NICE NG236','🔐 GDPR Compliant','🌐 HL7 FHIR R4','🩺 Clinician Reviewed'].map((b,i)=>(
                <div key={i} style={{
                  backgroundColor:COLORS.whiteAlpha10,border:`1px solid ${COLORS.whiteAlpha20}`,
                  borderRadius:50,padding:'9px 22px',color:COLORS.white,fontSize:14,fontWeight:600,
                }}>{b}</div>
              ))}
            </div>
          </FadeIn>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 7: Testimonials (2700-3900, 40s) ──────────────────────────────────
const A7: React.FC = () => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const testi=[
    {
      name:'Margaret, 72',role:'Stroke Survivor, 8 months post-stroke',icon:'👵',color:COLORS.energy,delay:0,
      quote:"I actually look forward to my exercises now. For the first time, I can see myself getting better.",
    },
    {
      name:'Dr. Amara Okafor',role:'Consultant Neurologist, NHS',icon:'👩‍⚕️',color:COLORS.neural,delay:120,
      quote:"The data granularity far exceeds what I could observe in a weekly clinic. I can intervene earlier and more precisely.",
    },
    {
      name:'David, 45',role:'Carer for his father',icon:'👨‍👴',color:COLORS.brainLight,delay:240,
      quote:"Dad actually does his exercises without me having to remind him. The games make it something he genuinely wants to do.",
    },
  ];
  return (
    <AbsoluteFill style={{fontFamily:FONTS.body}}>
      <GradientBg colors={[COLORS.dark,COLORS.darkMid,COLORS.brainDark]} animate/>
      <NeuralWeb opacity={0.1}/>
      <Bars/>
      <AbsoluteFill style={{padding:'70px 90px'}}>
        <FadeIn duration={25}>
          <SectionTitle title="Voices of Recovery" subtitle="From patients, carers, and clinicians who use Neuro-Recover every day" accent={COLORS.brainLight}/>
        </FadeIn>
        <div style={{marginTop:50,display:'flex',gap:32}}>
          {testi.map((t,i)=>{
            const sp=spring({frame:frame-t.delay,fps,config:{stiffness:65,damping:20}});
            const ty=interpolate(sp,[0,1],[90,0]);
            const opacity=interpolate(sp,[0,1],[0,1]);
            const pulse=0.4+0.6*Math.sin(frame/48+i*1.5);
            return (
              <div key={i} style={{
                flex:1,backgroundColor:`${t.color}0E`,
                border:`1px solid ${t.color}2E`,borderRadius:22,padding:36,
                opacity,transform:`translateY(${ty}px)`,
                display:'flex',flexDirection:'column',gap:20,
              }}>
                <div style={{fontSize:56,color:t.color,opacity:0.35,lineHeight:0.7,marginBottom:4}}>"</div>
                <div style={{fontSize:17,color:COLORS.white,lineHeight:1.75,flex:1,fontStyle:'italic'}}>
                  {t.quote}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:14,borderTop:`1px solid ${t.color}22`,paddingTop:18}}>
                  <div style={{
                    width:52,height:52,borderRadius:'50%',
                    backgroundColor:`${t.color}30`,border:`2px solid ${t.color}`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:26,boxShadow:`0 0 ${12*pulse}px ${t.color}44`,
                  }}>
                    {t.icon}
                  </div>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,color:COLORS.white}}>{t.name}</div>
                    <div style={{fontSize:12,color:'rgba(255,255,255,0.35)',marginTop:2}}>{t.role}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {frame>360 && (
          <FadeIn duration={40}>
            <div style={{marginTop:44,textAlign:'center'}}>
              <div style={{display:'flex',gap:6,justifyContent:'center',fontSize:32}}>
                {Array.from({length:5},(_,i)=><span key={i} style={{color:COLORS.warmth}}>★</span>)}
              </div>
              <div style={{color:'rgba(255,255,255,0.35)',fontSize:15,marginTop:10}}>
                Rated 4.9/5 by patients, carers, and clinicians in beta trials
              </div>
            </div>
          </FadeIn>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 8: CTA (3900-5400, 50s) ───────────────────────────────────────────
const A8: React.FC = () => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const pulse=0.5+0.5*Math.sin(frame/18);
  const ls=spring({frame,fps,from:0,to:1,config:{stiffness:75,damping:18}});

  return (
    <AbsoluteFill style={{fontFamily:FONTS.body}}>
      <GradientBg colors={[COLORS.dark,COLORS.darkMid,COLORS.brainDark]} animate/>
      <NeuralWeb opacity={0.18}/><FloatingParticles/>
      <Bars/>
      <AbsoluteFill style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        {[1,2,3].map(r=>(
          <div key={r} style={{
            position:'absolute',
            width:190+r*130,height:190+r*130,borderRadius:'50%',
            border:`1px solid ${COLORS.brainLight}`,
            opacity:(0.14/r)+0.07*Math.sin(frame/28+r),
          }}/>
        ))}
        <div style={{transform:`scale(${ls})`,textAlign:'center',zIndex:1}}>
          <div style={{
            width:150,height:150,borderRadius:'50%',
            backgroundColor:`${COLORS.brain}44`,border:`3px solid ${COLORS.brainLight}`,
            display:'flex',alignItems:'center',justifyContent:'center',
            margin:'0 auto 36px',
            boxShadow:`0 0 ${65*pulse}px ${COLORS.brainLight}66, 0 0 ${130*pulse}px ${COLORS.brain}33`,
          }}>
            <BrainIcon size={96} color={COLORS.brainLight}/>
          </div>
          <div style={{fontSize:90,fontWeight:900,color:COLORS.white,letterSpacing:-3,lineHeight:1,textShadow:`0 0 120px ${COLORS.brainLight}33`}}>
            Neuro-Recover
          </div>
          <div style={{fontSize:22,color:COLORS.neural,letterSpacing:6,textTransform:'uppercase',marginTop:12,fontWeight:500}}>
            Rehabilitation, Reimagined
          </div>
        </div>

        <FadeIn delay={40} duration={40}>
          <div style={{fontSize:26,color:'rgba(255,255,255,0.65)',textAlign:'center',maxWidth:700,marginTop:44,lineHeight:1.5}}>
            Every rep counts. Every word matters. Every day is progress.
          </div>
        </FadeIn>

        {frame>90 && (
          <FadeIn delay={90} duration={40}>
            <div style={{display:'flex',gap:24,marginTop:52}}>
              <div style={{
                background:`linear-gradient(135deg,${COLORS.brain},${COLORS.brainDark})`,
                borderRadius:16,padding:'18px 48px',
                color:COLORS.white,fontSize:20,fontWeight:700,
                boxShadow:`0 0 40px ${COLORS.brain}66`,
              }}>
                🚀 Start Free Trial
              </div>
              <div style={{
                backgroundColor:'transparent',border:`2px solid ${COLORS.whiteAlpha40}`,
                borderRadius:16,padding:'18px 48px',
                color:COLORS.white,fontSize:20,fontWeight:600,
              }}>
                🏥 For Clinicians
              </div>
            </div>
          </FadeIn>
        )}

        {frame>150 && (
          <FadeIn duration={30}>
            <div style={{marginTop:28,color:'rgba(255,255,255,0.3)',fontSize:15,fontFamily:FONTS.mono}}>
              github.com/kjelili/Stroke-Rehab
            </div>
          </FadeIn>
        )}

        {frame>190 && (
          <FadeIn duration={40}>
            <div style={{display:'flex',gap:16,marginTop:32,flexWrap:'wrap',justifyContent:'center'}}>
              <FeatureBadge icon="🆓" text="Free to start"       color={COLORS.energy}/>
              <FeatureBadge icon="🏥" text="NHS compatible"      color={COLORS.neural}/>
              <FeatureBadge icon="🔒" text="GDPR compliant"      color={COLORS.brainLight}/>
              <FeatureBadge icon="📱" text="Works on any device" color={COLORS.warmth}/>
            </div>
          </FadeIn>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Main export ───────────────────────────────────────────────────────────────
export const AdvertDemo: React.FC = () => (
  <AbsoluteFill>
    {/* Voiceover — generate first with: node generate-voiceover.js */}
    <Sequence from={60}>  <Audio src={staticFile('audio/ad-01.mp3')} volume={1}/></Sequence>
    <Sequence from={480}> <Audio src={staticFile('audio/ad-02.mp3')} volume={1}/></Sequence>
    <Sequence from={660}> <Audio src={staticFile('audio/ad-03.mp3')} volume={1}/></Sequence>
    <Sequence from={1080}><Audio src={staticFile('audio/ad-04.mp3')} volume={1}/></Sequence>
    <Sequence from={1500}><Audio src={staticFile('audio/ad-05.mp3')} volume={1}/></Sequence>
    <Sequence from={1890}><Audio src={staticFile('audio/ad-06.mp3')} volume={1}/></Sequence>
    <Sequence from={2280}><Audio src={staticFile('audio/ad-07.mp3')} volume={1}/></Sequence>
    <Sequence from={2640}><Audio src={staticFile('audio/ad-08.mp3')} volume={1}/></Sequence>
    <Sequence from={2970}><Audio src={staticFile('audio/ad-09.mp3')} volume={1}/></Sequence>
    <Sequence from={3360}><Audio src={staticFile('audio/ad-10.mp3')} volume={1}/></Sequence>
    <Sequence from={3720}><Audio src={staticFile('audio/ad-11.mp3')} volume={1}/></Sequence>

    {/* Scenes */}
    <Sequence from={0}    durationInFrames={360}> <A1/></Sequence>
    <Sequence from={360}  durationInFrames={240}> <A2/></Sequence>
    <Sequence from={600}  durationInFrames={480}> <A3/></Sequence>
    <Sequence from={1080} durationInFrames={720}> <A4/></Sequence>
    <Sequence from={1800} durationInFrames={360}> <A5/></Sequence>
    <Sequence from={2160} durationInFrames={540}> <A6/></Sequence>
    <Sequence from={2700} durationInFrames={1200}><A7/></Sequence>
    <Sequence from={3900} durationInFrames={1500}><A8/></Sequence>
  </AbsoluteFill>
);
