const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.ELEVENLABS_API_KEY || 'YOUR_API_KEY_HERE';
const VOICES = {
  rachel: '21m00Tcm4TlvDq8ikWAM',
  adam:   'pNInz6obpgDQGcFmaJgB',
};
const LIVE_DEMO_VOICE_ID = VOICES.adam;
const ADVERT_VOICE_ID = VOICES.rachel;

const liveSegments = [
  { id: 'live-01', text: "Welcome to Neuro-Recover — an AI-powered, gamified stroke rehabilitation platform built for the real world." },
  { id: 'live-02', text: "The platform runs entirely in the browser — no app install, no specialist hardware. Just a webcam and a patient." },
  { id: 'live-03', text: "Hand tracking detects finger positions at 30 frames per second using MediaPipe — right in the browser via WebAssembly." },
  { id: 'live-04', text: "Here's the Virtual Piano game. The patient extends each finger to trigger a key — building finger isolation and reaction time. The camera feed shows live hand detection." },
  { id: 'live-05', text: "Bubble Popper. Reach, pinch, and pop. The difficulty adapts in real time — slower and larger when fatigued, faster when improving. No manual tuning required." },
  { id: 'live-06', text: "Reach and Hold. The patient extends their index finger to a moving target and holds for one-point-five seconds. 14 reaches logged in this session." },
  { id: 'live-07', text: "Every session feeds into the Progress dashboard. Scores, durations, and game types — all timestamped and exportable." },
  { id: 'live-08', text: "The Clinician Dashboard shows the recovery curve across sessions. February 15th shows a regression — the system flags it automatically. One click exports the full session history as HL7 FHIR." },
  { id: 'live-09', text: "MedGemma processes raw biomarker data — range of motion, smoothness, tremor, and fatigue — and generates a structured clinical summary, running fully offline using open-weight models." },
  { id: 'live-10', text: "Neuro-Recover brings AI-powered neurorehabilitation to any clinical environment — without reliance on centralised infrastructure. Open source. TypeScript. Docker-ready. Available now." },
];

const advertSegments = [
  { id: 'ad-01', text: "Over eighty percent of stroke survivors fail to complete their prescribed physiotherapy. Not because they can't. Because it's repetitive, isolating, and gives no sense of progress." },
  { id: 'ad-02', text: "Neuro-Recover changes that." },
  { id: 'ad-03', text: "It turns your recovery exercises into games — adapting to you in real time, tracking your progress objectively, and celebrating every improvement." },
  { id: 'ad-04', text: "Play the Virtual Piano with your fingers. Pop bubbles with a pinch. Reach and hold targets to rebuild stability. Every movement counts." },
  { id: 'ad-05', text: "Your clinician sees everything. The recovery curve. Session by session. Regressions flagged automatically so nothing is missed." },
  { id: 'ad-06', text: "Built with neurologists and physiotherapists. Aligned to NICE stroke rehabilitation guidelines. GDPR compliant. NHS compatible." },
  { id: 'ad-07', text: "I actually look forward to my exercises now. For the first time, I can see myself getting better." },
  { id: 'ad-08', text: "The data granularity I get from Neuro-Recover far exceeds what I could observe in a weekly clinic." },
  { id: 'ad-09', text: "Dad actually does his exercises without me having to remind him. The games make it something he genuinely wants to do." },
  { id: 'ad-10', text: "Neuro-Recover. Rehabilitation, reimagined. Every rep counts. Every word matters. Every day is progress." },
  { id: 'ad-11', text: "Free to start. Works on any device. Start your recovery today." },
];

function generateAudio(text, voiceId, outputPath) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ text, model_id: 'eleven_monolingual_v1', voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true } });
    const options = { hostname: 'api.elevenlabs.io', path: `/v1/text-to-speech/${voiceId}`, method: 'POST', headers: { 'Content-Type': 'application/json', 'xi-api-key': API_KEY, 'Accept': 'audio/mpeg', 'Content-Length': Buffer.byteLength(body) } };
    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) { let e=''; res.on('data',d=>e+=d); res.on('end',()=>reject(new Error(`ElevenLabs ${res.statusCode}: ${e}`))); return; }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => { fs.writeFileSync(outputPath, Buffer.concat(chunks)); console.log(`✅ ${outputPath}`); resolve(); });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

async function main() {
  if (API_KEY === 'YOUR_API_KEY_HERE') { console.error('❌ Set your API key: $env:ELEVENLABS_API_KEY="sk_..."'); process.exit(1); }
  const audioDir = path.join(__dirname, 'public', 'audio');
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
  console.log('🎙️  Live Demo (Adam)...');
  for (const seg of liveSegments) {
    const out = path.join(audioDir, `${seg.id}.mp3`);
    if (fs.existsSync(out)) { console.log(`⏭️  Skipping ${seg.id}`); continue; }
    await generateAudio(seg.text, LIVE_DEMO_VOICE_ID, out);
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('\n🎙️  Advert (Rachel)...');
  for (const seg of advertSegments) {
    const out = path.join(audioDir, `${seg.id}.mp3`);
    if (fs.existsSync(out)) { console.log(`⏭️  Skipping ${seg.id}`); continue; }
    await generateAudio(seg.text, ADVERT_VOICE_ID, out);
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('\n✅ Done! Run: npm start');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
