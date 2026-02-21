const fs = require('fs');
const path = require('path');
const https = require('https');
const API_KEY = process.env.ELEVENLABS_API_KEY || 'YOUR_KEY';
const ADAM = 'pNInz6obpgDQGcFmaJgB';
const segs = [
  {id:'live-03b',text:'What you are watching is a real session recording. The patient uses the Virtual Piano — each finger mapped to a key, the camera detecting extension in real time. Index plays C, middle plays E, ring plays G, pinky plays B.'},
  {id:'live-04b',text:'Now Bubble Popper. Bubbles appear overlaid on the live camera feed. The patient reaches and pinches to pop them. Notice the difficulty adapting in real time — bubbles slow and enlarge automatically when performance dips.'},
  {id:'live-05b',text:'The platform extracts six clinical biomarkers from every session: range of motion, smoothness, tremor index, reaction time, fatigue curve, and abnormal synergy patterns. These are the same metrics a physiotherapist estimates subjectively — now measured objectively, every single frame.'},
  {id:'live-06b',text:'Voice and emotional AI runs alongside motor tracking. When a patient says they are tired or struggling, the system detects fatigue, dysarthria, and cognitive load — adjusting difficulty instantly and flagging emotional decline to the clinical team.'},
  {id:'live-07b',text:'The AI Rehab Coach acts as a digital physiotherapist. It encourages patients with specific feedback, responds emotionally to distress, and rebuilds therapy plans automatically using reinforcement learning — giving every patient a unique neural recovery path.'},
  {id:'live-08b',text:'Here is the clinician dashboard. The recovery curve shows 8 sessions across 7 days. February 15th shows a sharp regression — the system flagged it automatically. One click exports the full dataset as HL7 FHIR R4, compatible with any NHS electronic health record.'},
  {id:'live-09b',text:'MedGemma processes raw biomarker data and generates a structured clinical summary. Patient John Smith: index finger range of motion up 30 percent, tremor index down 18 percent, fatigue threshold improved from 7 to 12 minutes. Running fully offline — no data leaves the device.'},
  {id:'live-10b',text:'The product roadmap takes this from MVP — six games, hand tracking, real-time adaptation — through voice AI, digital twin prediction, VR rehabilitation, and ultimately MHRA clinical device certification. This is not just an app. It is a new paradigm of AI-driven neurorehabilitation.'},
  {id:'live-11',text:'Neuro-Recover is NHS-compatible, GDPR compliant, aligned to NICE NG236 stroke rehabilitation guidelines, and deployable in any clinical environment — virtual wards, community rehab centres, or a patient home — without specialist hardware or cloud infrastructure.'},
  {id:'live-12',text:'Open source. TypeScript. Docker-ready. The first autonomous digital physiotherapist for the brain. Available now at github.com/kjelili/Stroke-Rehab.'},
];
function gen(text,voice,out){return new Promise((res,rej)=>{
  const b=JSON.stringify({text,model_id:'eleven_monolingual_v1',voice_settings:{stability:0.5,similarity_boost:0.75}});
  const o={hostname:'api.elevenlabs.io',path:'/v1/text-to-speech/'+voice,method:'POST',
    headers:{'Content-Type':'application/json','xi-api-key':API_KEY,'Accept':'audio/mpeg','Content-Length':Buffer.byteLength(b)}};
  const r=https.request(o,s=>{
    if(s.statusCode!==200){let e='';s.on('data',d=>e+=d);s.on('end',()=>rej(new Error(s.statusCode+': '+e)));return;}
    const c=[];s.on('data',x=>c.push(x));
    s.on('end',()=>{fs.writeFileSync(out,Buffer.concat(c));console.log('OK '+path.basename(out));res();});
  });
  r.on('error',rej);r.write(b);r.end();
});}
async function main(){
  if(API_KEY==='YOUR_KEY'){console.error('Set ELEVENLABS_API_KEY');process.exit(1);}
  const d=path.join(__dirname,'public','audio');
  if(!fs.existsSync(d))fs.mkdirSync(d,{recursive:true});
  console.log('Generating '+segs.length+' new voiceover segments...');
  for(const s of segs){
    const o=path.join(d,s.id+'.mp3');
    if(fs.existsSync(o)){console.log('Skip '+s.id);continue;}
    await gen(s.text,ADAM,o);
    await new Promise(r=>setTimeout(r,600));
  }
  console.log('Done! Run: npx remotion studio --force-new');
}
main().catch(e=>{console.error(e.message);process.exit(1);});