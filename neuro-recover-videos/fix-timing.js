// fix-timing.js
// Rewrites just the export section of LiveDemo.tsx with correct timing
// Run: node fix-timing.js

const fs = require('fs');

// Fix Root.tsx - set LiveDemo to 5400 frames (3 min)
let root = fs.readFileSync('src/Root.tsx', 'utf8');
root = root.replace(/durationInFrames=\{\d+\}(\s*\/\/ \d+ =)/, 'durationInFrames={5400}$1');
fs.writeFileSync('src/Root.tsx', root);
console.log('Root.tsx: LiveDemo set to 5400 frames (3 min)');

// Fix LiveDemo.tsx - replace entire export with correct timing
let live = fs.readFileSync('src/LiveDemo/LiveDemo.tsx', 'utf8');

// Find where the export starts
const exportMarker = '// ── Main export';
const exportIdx = live.lastIndexOf(exportMarker);
if (exportIdx === -1) {
  console.error('Could not find export section marker');
  process.exit(1);
}

// Keep everything before the export section
const before = live.slice(0, exportIdx);

// Write the corrected export with clean timing - 1 audio per scene, zero overlaps
// Timing plan (frame @ 30fps):
//   0   - 165  (5.5s)  S1 Title      live-01
//   165 - 390  (7.5s)  S2 Platform   live-02
//   390 - 1170 (26s)   S3 Gameplay   live-03b @ 390, live-04b @ 840
//   1170- 1590 (14s)   S4 CV Layer   live-05b
//   1590- 1980 (13s)   S5 Voice AI   live-06b
//   1980- 2370 (13s)   S6 AI Coach   live-07b
//   2370- 2850 (16s)   S7 Clinician  live-08b
//   2850- 3330 (16s)   S8 MedGemma   live-09b
//   3330- 3720 (13s)   S9 NHS        live-11
//   3720- 5400 (56s)   S10 Closing   live-12

const newExport = `// \u2500\u2500 Main export \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// One audio segment per scene. Scenes start exactly when audio starts. No overlaps.
// Total: 5400 frames = 3 minutes @ 30fps
export const LiveDemo: React.FC = () => (
  <AbsoluteFill>
    {/* Audio \u2014 locked to scene start frames */}
    <Sequence from={0}>    <Audio src={staticFile('audio/live-01.mp3')}  volume={1} /></Sequence>
    <Sequence from={165}>  <Audio src={staticFile('audio/live-02.mp3')}  volume={1} /></Sequence>
    <Sequence from={390}>  <Audio src={staticFile('audio/live-03b.mp3')} volume={1} /></Sequence>
    <Sequence from={840}>  <Audio src={staticFile('audio/live-04b.mp3')} volume={1} /></Sequence>
    <Sequence from={1170}> <Audio src={staticFile('audio/live-05b.mp3')} volume={1} /></Sequence>
    <Sequence from={1590}> <Audio src={staticFile('audio/live-06b.mp3')} volume={1} /></Sequence>
    <Sequence from={1980}> <Audio src={staticFile('audio/live-07b.mp3')} volume={1} /></Sequence>
    <Sequence from={2370}> <Audio src={staticFile('audio/live-08b.mp3')} volume={1} /></Sequence>
    <Sequence from={2850}> <Audio src={staticFile('audio/live-09b.mp3')} volume={1} /></Sequence>
    <Sequence from={3330}> <Audio src={staticFile('audio/live-11.mp3')}  volume={1} /></Sequence>
    <Sequence from={3720}> <Audio src={staticFile('audio/live-12.mp3')}  volume={1} /></Sequence>

    {/* Scenes \u2014 duration matches audio so slide holds until next one starts */}
    <Sequence from={0}    durationInFrames={165}>  <S1 /></Sequence>
    <Sequence from={165}  durationInFrames={225}>  <S2 /></Sequence>
    <Sequence from={390}  durationInFrames={780}>  <S3 /></Sequence>
    <Sequence from={1170} durationInFrames={420}>  <S4 /></Sequence>
    <Sequence from={1590} durationInFrames={390}>  <S5 /></Sequence>
    <Sequence from={1980} durationInFrames={390}>  <S6 /></Sequence>
    <Sequence from={2370} durationInFrames={480}>  <S7 /></Sequence>
    <Sequence from={2850} durationInFrames={480}>  <S8 /></Sequence>
    <Sequence from={3330} durationInFrames={390}>  <S9 /></Sequence>
    <Sequence from={3720} durationInFrames={1680}> <S10 /></Sequence>
  </AbsoluteFill>
);
`;

fs.writeFileSync('src/LiveDemo/LiveDemo.tsx', before + newExport);
console.log('LiveDemo.tsx: export section rewritten with clean timing');
console.log('');
console.log('Run: npx remotion studio --force-new');
