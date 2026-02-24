/**
 * AdvertDemo.tsx — Real Footage Edition
 * Built around actual recorded sessions from a.mp4 / b.mp4
 *
 * ACT 1  0:00-0:28  (0-840)    THE PROBLEM
 * ACT 2  0:28-1:05  (840-1950) THE APP IN ACTION — real clips
 * ACT 3  1:05-1:45  (1950-3150) MEDGEMMA ENGINE
 * ACT 4  1:45-2:20  (3150-4200) CLINICIAN VIEW
 * ACT 5  2:20-3:00  (4200-5400) IMPACT + CTA
 *
 * 5400 frames @ 30fps = exactly 3:00
 */
import React from 'react';
import {
  AbsoluteFill, Sequence, Audio, Img, staticFile,
  interpolate, spring, useCurrentFrame, OffthreadVideo,
} from 'remotion';

const C = {
  black:'#000000', deep:'#04040A', ink:'#080810', panel:'#10101A',
  white:'#FFFFFF', warm:'#F0ECE4',
  dim:'rgba(255,255,255,0.32)', bright:'rgba(255,255,255,0.78)',
  fog:'rgba(255,255,255,0.10)', mist:'rgba(255,255,255,0.055)',
  gold:'#C8A44A', red:'#E63F3F',
  blue:'#4BA8FF', blueDim:'rgba(75,168,255,0.15)',
  teal:'#2DD4BF', tealDim:'rgba(45,212,191,0.12)',
  pink:'#E87AAE', pinkDim:'rgba(232,122,174,0.13)',
};
const F = {
  serif:'"Georgia","Times New Roman",serif',
  sans:'"Helvetica Neue","Arial",sans-serif',
  mono:'"Courier New",monospace',
};

const cl = (f,from,to,s,e) =>
  interpolate(f,[s,e],[from,to],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const fi = (f,d=0,dur=25) => cl(f,0,1,d,d+dur);
const fo = (f,s,dur=22) => cl(f,1,0,s,s+dur);
const ty = (f,d=0,amt=18,dur=28) => cl(f,amt,0,d,d+dur);

const Bars = ({h=50}:{h?:number}) => (
  <>
    <div style={{position:'absolute',top:0,left:0,right:0,height:h,background:C.black,zIndex:200}} />
    <div style={{position:'absolute',bottom:0,left:0,right:0,height:h,background:C.black,zIndex:200}} />
  </>
);
const Grain = () => (
  <div style={{
    position:'absolute',inset:0,zIndex:190,pointerEvents:'none',
    backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
    opacity:0.030,mixBlendMode:'overlay',
  }} />
);
const Eyebrow = ({text,color=C.teal,d=0}:{text:string;color?:string;d?:number}) => {
  const f = useCurrentFrame();
  return <div style={{fontSize:11,letterSpacing:4.5,textTransform:'uppercase' as const,color,fontFamily:F.sans,fontWeight:500,opacity:fi(f,d,20)}}>{text}</div>;
};
const Rule = ({d=0,w=60,color='rgba(255,255,255,0.14)'}:{d?:number;w?:number;color?:string}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display:'flex',justifyContent:'center',margin:'22px 0'}}>
      <div style={{height:1,width:cl(f,0,w,d,d+36)+'px',background:color}} />
    </div>
  );
};

const Clip = ({src,startFrom=0,caption,badge,delay=0,style={}}:{src:string;startFrom?:number;caption?:string;badge?:string;delay?:number;style?:React.CSSProperties}) => {
  const f = useCurrentFrame();
  const sp = spring({frame:f-delay,fps:30,from:0,to:1,config:{stiffness:52,damping:15}});
  return (
    <div style={{position:'relative',borderRadius:10,overflow:'hidden',boxShadow:'0 20px 65px rgba(0,0,0,0.82)',transform:`scale(${sp})`,opacity:sp,...style}}>
      <OffthreadVideo src={staticFile(src)} startFrom={startFrom} style={{width:'100%',display:'block'}} />
      <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.80) 0%,rgba(0,0,0,0.10) 55%,rgba(0,0,0,0.45) 100%)'}} />
      {badge && (
        <div style={{position:'absolute',top:12,left:14,display:'flex',alignItems:'center',gap:7}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:C.red,boxShadow:`0 0 8px ${C.red}`}} />
          <span style={{fontSize:10,color:C.white,letterSpacing:3,fontFamily:F.sans}}>{badge}</span>
        </div>
      )}
      {caption && <div style={{position:'absolute',bottom:14,left:16,right:16,fontSize:13,color:C.white,fontFamily:F.serif,fontStyle:'italic',lineHeight:1.4}}>{caption}</div>}
    </div>
  );
};

const Shot = ({src,delay=0,rotate=0,w=500,glow=C.blueDim}:{src:string;delay?:number;rotate?:number;w?:number;glow?:string}) => {
  const f = useCurrentFrame();
  const sp = spring({frame:f-delay,fps:30,from:0,to:1,config:{stiffness:52,damping:15}});
  return (
    <div style={{width:w,borderRadius:10,overflow:'hidden',transform:`rotate(${rotate}deg) scale(${sp})`,opacity:sp,boxShadow:`0 22px 70px rgba(0,0,0,0.78),0 0 0 1px rgba(255,255,255,0.07),0 0 40px ${glow}`}}>
      <Img src={staticFile(src)} style={{width:'100%',display:'block'}} />
    </div>
  );
};

const Typewriter = ({text,d=0,speed=1.3}:{text:string;d?:number;speed?:number}) => {
  const f = useCurrentFrame();
  const n = Math.floor(cl(f,0,text.length,d,d+text.length*speed));
  const cur = f>d && n<text.length;
  return (
    <span style={{fontFamily:F.mono}}>
      {text.slice(0,n)}<span style={{opacity:cur?(Math.sin(f*0.3)>0?1:0):0,color:C.pink}}>|</span>
    </span>
  );
};

// ── ACT 1: THE PROBLEM ────────────────────────────────────────────────────────
const Act1 = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background:C.black}}>
      <Grain/><Bars/>
      <div style={{position:'absolute',top:'40%',left:'50%',transform:'translate(-50%,-50%)',width:750,height:750,borderRadius:'50%',background:'radial-gradient(circle,rgba(230,63,63,0.18) 0%,transparent 65%)',opacity:0.55+0.45*Math.sin(f/32)}} />

      {f<275 && (
        <AbsoluteFill style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',opacity:fo(f,250,22)}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:11,color:C.gold,letterSpacing:5,textTransform:'uppercase',fontFamily:F.sans,marginBottom:18,opacity:fi(f,12,20)}}>The problem with stroke rehab</div>
            <div style={{fontSize:172,fontWeight:700,color:C.red,lineHeight:0.88,fontFamily:F.serif,letterSpacing:-9,opacity:fi(f,18,16),textShadow:'0 0 100px rgba(230,63,63,0.4)',transform:`scale(${cl(f,0.85,1,18,36)})`}}>80%</div>
            <div style={{fontSize:22,color:C.dim,fontFamily:F.sans,fontWeight:300,marginTop:20,maxWidth:520,margin:'20px auto 0',lineHeight:1.7,opacity:fi(f,42,25)}}>
              abandon prescribed physiotherapy before completing it — not because they can't, but because no one can see them getting better.
            </div>
          </div>
        </AbsoluteFill>
      )}

      {f>=255 && (
        <AbsoluteFill style={{display:'flex',alignItems:'center',justifyContent:'center',opacity:fi(f,255,28)}}>
          <div style={{textAlign:'center',maxWidth:660}}>
            <Eyebrow text="What if every session was measured?" d={268}/>
            <div style={{height:16}}/>
            <div style={{fontSize:52,color:C.warm,fontFamily:F.serif,lineHeight:1.38,opacity:fi(f,278,32)}}>
              Rehab that adapts, tracks, and reports — like having a physio in the room, 24 hours a day.
            </div>
            <Rule d={380} w={52}/>
            <div style={{fontSize:18,color:C.dim,fontFamily:F.sans,fontWeight:300,opacity:fi(f,418,28),letterSpacing:0.3}}>Introducing Neuro-Recover.</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ── ACT 2: THE APP ────────────────────────────────────────────────────────────
const Act2 = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background:C.deep}}>
      <Grain/><Bars/>

      {f<250 && (
        <AbsoluteFill style={{padding:'82px 80px',display:'flex',gap:52,alignItems:'center',opacity:fo(f,228,20)}}>
          <div style={{flex:'0 0 auto',width:580}}>
            <Clip src="clip-dashboard.mp4" startFrom={0} badge="LIVE SESSION" caption="Dashboard — AI coach + last session summary" delay={8} style={{width:580}}/>
          </div>
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:18}}>
            <Eyebrow text="Browser-native · No install required" color={C.blue} d={20}/>
            <div style={{fontSize:36,color:C.warm,fontFamily:F.serif,lineHeight:1.42,opacity:fi(f,30,28)}}>Open a tab. Allow camera access. Start your session.</div>
            <div style={{fontSize:15,color:C.dim,fontFamily:F.sans,fontWeight:300,lineHeight:1.7,opacity:fi(f,65,26)}}>Works on any laptop or tablet. MediaPipe runs in the browser — no app, no hardware, no cloud dependency required.</div>
          </div>
        </AbsoluteFill>
      )}

      {f>=228 && f<582 && (
        <AbsoluteFill style={{opacity:Math.min(fi(f,228,26),fo(f,558,22))}}>
          <OffthreadVideo src={staticFile('clip-piano.mp4')} startFrom={0} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.15) 52%,rgba(0,0,0,0.55) 100%)'}}/>
          <Bars/>
          <div style={{position:'absolute',top:68,left:52,display:'flex',alignItems:'center',gap:9,opacity:fi(f,235,18)}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:C.red,boxShadow:`0 0 10px ${C.red}`}}/>
            <span style={{fontSize:11,color:C.white,letterSpacing:3,fontFamily:F.sans}}>LIVE · Virtual Piano</span>
          </div>
          <div style={{position:'absolute',top:68,right:52,opacity:fi(f,240,18)}}>
            <div style={{background:'rgba(75,168,255,0.15)',border:'1px solid rgba(75,168,255,0.30)',borderRadius:5,padding:'6px 14px'}}>
              <span style={{fontSize:12,color:C.blue,letterSpacing:2,fontFamily:F.sans}}>Finger isolation · ROM · Reaction time</span>
            </div>
          </div>
          <div style={{position:'absolute',bottom:80,left:0,right:0,textAlign:'center',padding:'0 140px'}}>
            {f<360 && <div style={{opacity:Math.min(fi(f,245,28),fo(f,340,22))}}>
              <div style={{fontSize:12,color:C.teal,letterSpacing:4,textTransform:'uppercase',marginBottom:10}}>21 hand landmarks · 30fps</div>
              <div style={{fontSize:32,color:C.white,fontFamily:F.serif,fontStyle:'italic',lineHeight:1.4}}>Each finger extension is a piano key — and a clinical measurement.</div>
            </div>}
            {f>=345 && f<482 && <div style={{opacity:Math.min(fi(f,345,26),fo(f,460,20))}}>
              <div style={{fontSize:32,color:C.white,fontFamily:F.serif,fontStyle:'italic',lineHeight:1.4}}>The system sees exactly what the clinician cannot.</div>
            </div>}
            {f>=465 && <div style={{opacity:Math.min(fi(f,465,26),fo(f,548,20))}}>
              <div style={{fontSize:32,color:C.white,fontFamily:F.serif,fontStyle:'italic'}}>ROM. Tremor. Reaction time. All measured. Automatically.</div>
            </div>}
          </div>
        </AbsoluteFill>
      )}

      {f>=552 && f<790 && (
        <AbsoluteFill style={{opacity:Math.min(fi(f,552,26),fo(f,768,22))}}>
          <OffthreadVideo src={staticFile('clip-fingertap.mp4')} startFrom={0} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.10) 55%,rgba(0,0,0,0.48) 100%)'}}/>
          <Bars/>
          <div style={{position:'absolute',top:68,left:52,display:'flex',alignItems:'center',gap:9,opacity:fi(f,558,18)}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:C.red,boxShadow:`0 0 10px ${C.red}`}}/>
            <span style={{fontSize:11,color:C.white,letterSpacing:3,fontFamily:F.sans}}>LIVE · Finger Tap</span>
          </div>
          <div style={{position:'absolute',bottom:80,left:0,right:0,textAlign:'center',padding:'0 160px',opacity:fi(f,562,28)}}>
            <div style={{fontSize:12,color:C.teal,letterSpacing:4,textTransform:'uppercase',marginBottom:10}}>Sequencing · Coordination · Isolation</div>
            <div style={{fontSize:30,color:C.white,fontFamily:F.serif,fontStyle:'italic',lineHeight:1.4}}>Alternate fingers on cue. The app tracks accuracy and response time for each digit independently.</div>
          </div>
        </AbsoluteFill>
      )}

      {f>=760 && (
        <AbsoluteFill style={{opacity:fi(f,760,26)}}>
          <OffthreadVideo src={staticFile('clip-bubbles.mp4')} startFrom={0} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.12) 55%,rgba(0,0,0,0.50) 100%)'}}/>
          <Bars/>
          <div style={{position:'absolute',top:68,left:52,display:'flex',alignItems:'center',gap:9,opacity:fi(f,768,18)}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:C.red,boxShadow:`0 0 10px ${C.red}`}}/>
            <span style={{fontSize:11,color:C.white,letterSpacing:3,fontFamily:F.sans}}>LIVE · Bubble Popper</span>
          </div>
          <div style={{position:'absolute',bottom:80,left:0,right:0,textAlign:'center',padding:'0 160px'}}>
            {f<900 && <div style={{opacity:Math.min(fi(f,772,26),fo(f,882,20))}}>
              <div style={{fontSize:30,color:C.white,fontFamily:F.serif,fontStyle:'italic',lineHeight:1.45}}>Pinch or tap to pop. Difficulty adapts in real time — slower if fatigued, faster if improving.</div>
            </div>}
            {f>=880 && <div style={{opacity:fi(f,880,26)}}>
              <div style={{fontSize:12,color:C.teal,letterSpacing:4,textTransform:'uppercase',marginBottom:10}}>Reach · Pinch · Accuracy</div>
              <div style={{fontSize:30,color:C.white,fontFamily:F.serif,fontStyle:'italic'}}>6 games. 6 therapy targets. Every one mapped to activities of daily living.</div>
            </div>}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ── ACT 3: MEDGEMMA ───────────────────────────────────────────────────────────
const Act3 = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background:C.ink}}>
      <Grain/><Bars/>
      <div style={{position:'absolute',top:'35%',left:'50%',transform:'translate(-50%,-50%)',width:820,height:520,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(232,122,174,0.09) 0%,transparent 68%)',opacity:0.6+0.4*Math.sin(f/48)}}/>

      {f<300 && (
        <AbsoluteFill style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',opacity:fo(f,278,22)}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:11,color:C.pink,letterSpacing:6,textTransform:'uppercase',fontFamily:F.sans,marginBottom:22,opacity:fi(f,15,22)}}>Powered by Google Health AI</div>
            <div style={{fontSize:82,fontFamily:F.serif,color:C.warm,fontWeight:400,letterSpacing:1,opacity:fi(f,28,35),textShadow:'0 0 60px rgba(232,122,174,0.25)'}}>MedGemma</div>
            <div style={{fontSize:15,color:C.dim,fontFamily:F.sans,fontWeight:300,letterSpacing:3.5,marginTop:14,opacity:fi(f,68,28)}}>HAI-DEF · Health AI Developer Foundations · Google Cloud Vertex AI</div>
            <Rule d={100} w={50} color="rgba(232,122,174,0.28)"/>
            <div style={{fontSize:20,color:C.bright,fontFamily:F.serif,fontStyle:'italic',opacity:fi(f,145,30),maxWidth:600,margin:'0 auto',lineHeight:1.6}}>
              Clinical reasoning. Agentic orchestration. SOAP notes. ICD-10. FHIR. Vertex AI — or fully offline.
            </div>
          </div>
        </AbsoluteFill>
      )}

      {f>=272 && f<732 && (
        <AbsoluteFill style={{padding:'88px 90px',display:'flex',gap:52,alignItems:'center',opacity:Math.min(fi(f,272,26),fo(f,710,22))}}>
          <div style={{flex:1}}>
            <Eyebrow text="Agentic clinical loop — real tool calls" color={C.pink} d={282}/>
            <div style={{height:18}}/>
            <div style={{background:'rgba(232,122,174,0.05)',border:'1px solid rgba(232,122,174,0.18)',borderRadius:9,padding:'22px 26px',opacity:fi(f,290,20)}}>
              <div style={{fontSize:10,color:C.pink,letterSpacing:3,textTransform:'uppercase',marginBottom:14,fontFamily:F.sans}}>✦ MedGemma · Session Analysis</div>
              <div style={{fontSize:14,color:C.warm,lineHeight:1.8,fontFamily:F.mono}}>
                <Typewriter d={298} text={"Patient: Feb 20 piano session\nScore: 42 | Duration: 2m 58s\nROM delta: +4° index finger\nTremor: stable\n\n→ set_therapy_intensity: MEDIUM\n→ Next: Bubbles (adaptive)\n→ Regression flag: NONE\n\nSummary: Consistent improvement\nacross 8 sessions. Continue\ncurrent programme."} speed={1.25}/>
              </div>
            </div>
            <div style={{marginTop:20,opacity:fi(f,520,25)}}>
              {[{fn:'set_therapy_intensity()',col:C.pink},{fn:'trigger_regression_intervention()',col:C.teal},{fn:'record_session_summary()',col:C.blue}].map((item,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10,opacity:fi(f,528+i*38,22)}}>
                  <div style={{width:5,height:5,borderRadius:'50%',background:item.col,flexShrink:0}}/>
                  <span style={{fontSize:13,color:item.col,fontFamily:F.mono}}>{item.fn}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{flex:1}}>
            <Clip src="clip-progress.mp4" startFrom={0} badge="LIVE" caption="Progress — 8 sessions, recovery curve + MedGemma PDF report" delay={305} style={{width:'100%'}}/>
          </div>
        </AbsoluteFill>
      )}

      {f>=702 && (
        <AbsoluteFill style={{padding:'88px 100px',display:'flex',flexDirection:'column',justifyContent:'center',gap:30,opacity:fi(f,702,26)}}>
          <Eyebrow text="Three HAI-DEF models — one platform" color={C.pink} d={715}/>
          <div style={{display:'flex',gap:24}}>
            {[
              {name:'MedGemma',role:'Reports · SOAP · Agentic tools · ICD-10 · FHIR · Coaching',status:'Live on Vertex AI',color:C.pink},
              {name:'HEAR',role:'Health Acoustic Representations — voice embeddings for dysarthria & cough screening',status:'Endpoint configured',color:C.teal},
              {name:'MedSigLIP',role:'Medical image-text encoder — hand function photo embeddings & visual assessment',status:'Endpoint ready',color:C.blue},
            ].map((m,i)=>(
              <div key={i} style={{flex:1,background:'rgba(255,255,255,0.030)',border:'1px solid rgba(255,255,255,0.075)',borderRadius:10,padding:'22px 20px',opacity:fi(f,720+i*55,26),transform:`translateY(${ty(f,720+i*55,18,26)})`}}>
                <div style={{fontSize:10,color:m.color,letterSpacing:3,textTransform:'uppercase',marginBottom:10,fontFamily:F.sans}}>{m.status}</div>
                <div style={{fontSize:20,color:C.warm,fontFamily:F.serif,marginBottom:10}}>{m.name}</div>
                <div style={{fontSize:13,color:C.dim,fontFamily:F.sans,fontWeight:300,lineHeight:1.65}}>{m.role}</div>
              </div>
            ))}
          </div>
          <div style={{background:'rgba(232,122,174,0.055)',border:'1px solid rgba(232,122,174,0.16)',borderRadius:8,padding:'14px 22px',opacity:fi(f,900,26)}}>
            <span style={{fontSize:13,color:C.pink,fontFamily:F.sans}}>✦ Offline mode: Docker + Ollama + MedGemma 2B/8B. No data leaves device. Designed for NHS air-gapped environments. GDPR compliant by architecture.</span>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ── ACT 4: CLINICIAN ──────────────────────────────────────────────────────────
const Act4 = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background:'#0A0A14'}}>
      <Grain/><Bars/>

      {f<492 && (
        <AbsoluteFill style={{padding:'85px 80px',display:'flex',gap:50,alignItems:'center',opacity:fo(f,468,22)}}>
          <div style={{flex:1.25}}><Shot src="ss-clinician.jpg" delay={15} w={540} glow={C.tealDim}/></div>
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:20}}>
            <Eyebrow text="Clinician dashboard" color={C.teal} d={22}/>
            <div style={{fontSize:36,color:C.warm,fontFamily:F.serif,lineHeight:1.42,opacity:fi(f,32,30)}}>See the recovery curve. Catch the regression. Before the next appointment.</div>
            <div style={{fontSize:15,color:C.dim,fontFamily:F.sans,fontWeight:300,lineHeight:1.7,opacity:fi(f,68,26)}}>Feb 15: grab-cup score 8 — flagged automatically. MedGemma adjusted intensity. Feb 16: recovery resumes. The clinician knew on day three.</div>
            {[
              {label:'Export FHIR R4',detail:'NHS EHR-compatible in one click'},
              {label:'Export PDF',detail:'MedGemma-generated narrative report'},
              {label:'NICE NG236',detail:'Aligned to UK stroke guidelines'},
              {label:'GDPR by design',detail:'Data on-device, never sent to cloud'},
            ].map((item,i)=>(
              <div key={i} style={{borderLeft:`2px solid ${C.teal}`,paddingLeft:16,opacity:fi(f,105+i*35,20)}}>
                <div style={{fontSize:14,color:C.warm,fontFamily:F.sans,fontWeight:600}}>{item.label}</div>
                <div style={{fontSize:12,color:C.dim,fontFamily:F.sans,fontWeight:300,marginTop:3}}>{item.detail}</div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      )}

      {f>=462 && (
        <AbsoluteFill style={{padding:'85px 80px',display:'flex',gap:50,alignItems:'center',opacity:fi(f,462,26)}}>
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:18}}>
            <Eyebrow text="8 sessions · real patient data" color={C.teal} d={475}/>
            <Shot src="ss-progress.jpg" delay={482} w={480} glow={C.tealDim}/>
          </div>
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:24}}>
            <Eyebrow text="Objective clinical outcomes" color={C.blue} d={520}/>
            <div style={{fontSize:32,color:C.warm,fontFamily:F.serif,lineHeight:1.42,opacity:fi(f,530,28)}}>Not self-reported. Not estimated. Measured every session.</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,opacity:fi(f,575,26)}}>
              {[
                {val:'+30%',label:'Finger ROM',},{val:'-18%',label:'Tremor index'},
                {val:'8/8',label:'Sessions kept'},{val:'12min',label:'Fatigue threshold'},
              ].map((m,i)=>(
                <div key={i} style={{background:'rgba(255,255,255,0.035)',borderRadius:8,padding:'16px 18px',opacity:fi(f,582+i*28,22)}}>
                  <div style={{fontSize:38,fontWeight:700,color:C.teal,fontFamily:F.serif,lineHeight:1}}>{m.val}</div>
                  <div style={{fontSize:11,color:C.dim,fontFamily:F.sans,letterSpacing:1.5,textTransform:'uppercase',marginTop:7}}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ── ACT 5: CTA ────────────────────────────────────────────────────────────────
const Act5 = () => {
  const f = useCurrentFrame();
  const p = 0.55+0.45*Math.sin(f/44);
  return (
    <AbsoluteFill style={{background:C.black}}>
      <Grain/><Bars/>
      <div style={{position:'absolute',top:'38%',left:'50%',transform:'translate(-50%,-50%)',width:720,height:720,borderRadius:'50%',background:'radial-gradient(circle,rgba(45,212,191,0.042) 0%,transparent 68%)',opacity:p}}/>
      <div style={{position:'absolute',top:'42%',left:'28%',width:380,height:380,borderRadius:'50%',background:'radial-gradient(circle,rgba(232,122,174,0.032) 0%,transparent 68%)',opacity:p}}/>
      <AbsoluteFill style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center'}}>
          {[{t:'Every rep, measured.',c:C.warm},{t:'Every session, remembered.',c:C.warm},{t:'Every patient, seen.',c:C.teal}].map((line,i)=>(
            <div key={i} style={{fontSize:54,fontFamily:F.serif,color:line.c,fontWeight:400,lineHeight:1.4,letterSpacing:0.5,opacity:fi(f,18+i*65,40),transform:`translateY(${ty(f,18+i*65,18,40)})`}}>{line.t}</div>
          ))}
        </div>
        <Rule d={240} w={55}/>
        <div style={{textAlign:'center',opacity:fi(f,328,38),marginBottom:36}}>
          <div style={{display:'flex',alignItems:'center',gap:14,justifyContent:'center'}}>
            <span style={{fontSize:26}}>🧠</span>
            <span style={{fontSize:22,fontFamily:F.serif,color:C.dim,letterSpacing:4,textTransform:'uppercase'}}>Neuro-Recover</span>
          </div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.20)',letterSpacing:3,textTransform:'uppercase',marginTop:8,fontFamily:F.sans,opacity:fi(f,358,28)}}>MedGemma Impact Challenge · Google Health AI · 2026</div>
        </div>
        <div style={{opacity:fi(f,388,45),textAlign:'center'}}>
          <div style={{fontSize:11,color:C.dim,letterSpacing:3,textTransform:'uppercase',marginBottom:16,fontFamily:F.sans}}>Open source · Free · Ready to deploy</div>
          <div style={{display:'inline-flex',alignItems:'center',gap:16,border:'1px solid rgba(255,255,255,0.22)',borderRadius:6,padding:'17px 36px',background:'rgba(255,255,255,0.038)',boxShadow:'0 0 48px rgba(45,212,191,0.07)'}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={C.warm}>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span style={{fontSize:18,color:C.warm,fontFamily:F.sans,fontWeight:400,letterSpacing:0.8}}>github.com/kjelili/Stroke-Rehab</span>
          </div>
        </div>
        <div style={{marginTop:46,fontSize:14,color:'rgba(255,255,255,0.15)',fontFamily:F.serif,fontStyle:'italic',opacity:fi(f,480,58)}}>
          The first open-source agentic digital physiotherapist for the post-stroke brain.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── ROOT EXPORT ───────────────────────────────────────────────────────────────
export const AdvertDemo: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0}>    <Audio src={staticFile('audio/ad-01.mp3')} volume={1}/></Sequence>
    <Sequence from={260}>  <Audio src={staticFile('audio/ad-02.mp3')} volume={1}/></Sequence>
    <Sequence from={350}>  <Audio src={staticFile('audio/ad-03.mp3')} volume={1}/></Sequence>
    <Sequence from={630}>  <Audio src={staticFile('audio/ad-04.mp3')} volume={1}/></Sequence>
    <Sequence from={840}>  <Audio src={staticFile('audio/ad-05.mp3')} volume={1}/></Sequence>
    <Sequence from={1290}> <Audio src={staticFile('audio/ad-06.mp3')} volume={1}/></Sequence>
    <Sequence from={1950}> <Audio src={staticFile('audio/ad-07.mp3')} volume={1}/></Sequence>
    <Sequence from={2400}> <Audio src={staticFile('audio/ad-08.mp3')} volume={1}/></Sequence>
    <Sequence from={3150}> <Audio src={staticFile('audio/ad-09.mp3')} volume={1}/></Sequence>
    <Sequence from={3630}> <Audio src={staticFile('audio/ad-10.mp3')} volume={1}/></Sequence>
    <Sequence from={4200}> <Audio src={staticFile('audio/ad-11.mp3')} volume={1}/></Sequence>
    <Sequence from={0}    durationInFrames={840}>  <Act1/></Sequence>
    <Sequence from={840}  durationInFrames={1110}> <Act2/></Sequence>
    <Sequence from={1950} durationInFrames={1200}> <Act3/></Sequence>
    <Sequence from={3150} durationInFrames={1050}> <Act4/></Sequence>
    <Sequence from={4200} durationInFrames={1200}> <Act5/></Sequence>
  </AbsoluteFill>
);
