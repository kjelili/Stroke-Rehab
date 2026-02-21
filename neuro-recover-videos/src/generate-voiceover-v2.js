/**
 * generate-voiceover-v2.js
 * ========================
 * Extended voiceover for the enhanced Live Demo — 4 minutes, 10 scenes
 * Run AFTER generate-voiceover.js (re-uses ad-*.mp3 from before)
 *
 * Usage:
 *   $env:ELEVENLABS_API_KEY="sk_..."
 *   node generate-voiceover-v2.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.ELEVENLABS_API_KEY || 'YOUR_API_KEY_HERE';
const ADAM = 'pNInz6obpgDQGcFmaJgB'; // Deep, authoritative — Live Demo voice

// Extended Live Demo segments — covering 4 full minutes
// Existing live-01 through live-10 are reused for S1/S2/parts of S3
// These new segments cover S3 gameplay through S10 closing
const newSegments = [
  {
    id: 'live-03b',
    text: "What you're watching now is a real session recording. The patient is using the Virtual Piano — each finger mapped to a key, the camera detecting extension in real time. Index plays C, middle plays E, ring plays G, pinky plays B.",
  },
  {
    id: 'live-04b',
    text: "Now Bubble Popper. Bubbles appear overlaid on the live camera feed. The patient reaches and pinches to pop them. Notice the difficulty adapting — bubbles slow and enlarge automatically when performance dips.",
  },
  {
    id: 'live-05b',
    text: "The platform extracts six clinical biomarkers from every session: range of motion, smoothness, tremor index, reaction time, fatigue curve, and abnormal synergy patterns. These are the same metrics a physiotherapist estimates subjectively — now measured objectively, every frame.",
  },
  {
    id: 'live-06b',
    text: "Voice and emotional AI runs alongside motor tracking. When a patient says they're tired or struggling, the system detects fatigue, dysarthria, and cognitive load — adjusting difficulty instantly and flagging emotional decline to the clinical team.",
  },
  {
    id: 'live-07b',
    text: "The AI Rehab Coach acts as a digital physiotherapist. It encourages: your index finger moved 12 percent further than yesterday. It responds emotionally: I can hear you're tired — let's switch to lighter exercises. And it rebuilds therapy plans automatically using reinforcement learning.",
  },
  {
    id: 'live-08b',
    text: "Here's the clinician dashboard. The recovery curve shows 8 sessions across 7 days. February 15th shows a sharp regression — the system flagged it automatically. One click exports the full dataset as HL7 FHIR R4, compatible with any NHS EHR.",
  },
  {
    id: 'live-09b',
    text: "MedGemma processes the raw biomarker data and generates a structured clinical summary. Patient John Smith: index finger range of motion up 30 percent, tremor index down 18 percent, fatigue threshold improved from 7 to 12 minutes. Running fully offline — no data leaves the device.",
  },
  {
    id: 'live-10b',
    text: "The roadmap takes this from MVP — six games, hand tracking, real-time adaptation — through voice AI, digital twin prediction, VR rehabilitation, and ultimately MHRA clinical device certification. This is not just an app. It's a new paradigm of AI-driven neurorehabilitation.",
  },
  {
    id: 'live-11',
    text: "Neuro-Recover is NHS-compatible, GDPR compliant, aligned to NICE NG236 guidelines, and deployable in any clinical environment — virtual wards, community rehab centres, or a patient's home — without specialist hardware or cloud infrastructure.",
  },
  {
    id: 'live-12',
    text: "Open source. TypeScript. Docker-ready. The first autonomous digital physiotherapist for the brain. Available now at github.com/kjelili/Stroke-Rehab.",
  },
];

function generateAudio(text, voiceId, outputPath) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
    });
    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${voiceId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY,
        'Accept': 'audio/mpeg',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let e = '';
        res.on('data', d => e += d);
        res.on('end', () => reject(new Error('ElevenLabs ' + res.statusCode + ': ' + e)));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        fs.writeFileSync(outputPath, Buffer.concat(chunks));
        console.log('OK ' + path.basename(outputPath));
        resolve();
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  if (API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('Set your key: $env:ELEVENLABS_API_KEY="sk_..."');
    process.exit(1);
  }
  const audioDir = path.join(__dirname, 'public', 'audio');
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

  console.log('Generating extended Live Demo voiceover (' + newSegments.length + ' segments)...');
  for (const seg of newSegments) {
    const outPath = path.join(audioDir, seg.id + '.mp3');
    if (fs.existsSync(outPath)) {
      console.log('Skip ' + seg.id + ' (exists)');
      continue;
    }
    await generateAudio(seg.text, ADAM, outPath);
    await new Promise(r => setTimeout(r, 600));
  }
  console.log('\nDone. Now copy game-demo.mp4 to public/ and run: npm start');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
