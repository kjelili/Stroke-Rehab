// cut-clips.js
// Run from: neuro-recover-videos\
// Command:  node cut-clips.js
//
// Cuts the 5 video clips from a.mp4 and b.mp4
// Also copies screenshots from uploads if found

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ── Check ffmpeg is available ─────────────────────────────────────────────────
try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
} catch (e) {
  console.error('❌ ffmpeg not found.');
  console.error('   Install it from https://ffmpeg.org/download.html');
  console.error('   Or via winget: winget install ffmpeg');
  process.exit(1);
}

// ── Find source videos ────────────────────────────────────────────────────────
const candidates = [
  process.env.USERPROFILE + '\\Downloads\\a.mp4',
  process.env.USERPROFILE + '\\Downloads\\b.mp4',
  'a.mp4',
  'b.mp4',
  '..\\a.mp4',
  '..\\b.mp4',
];

function find(name) {
  // Check Downloads and project root
  const checks = [
    path.join(process.env.USERPROFILE, 'Downloads', name),
    path.join(__dirname, name),
    path.join(__dirname, '..', name),
  ];
  return checks.find(p => fs.existsSync(p)) || null;
}

const aPath = find('a.mp4');
const bPath = find('b.mp4');

if (!aPath) {
  console.error('❌ Cannot find a.mp4');
  console.error('   Put a.mp4 in your Downloads folder or in the neuro-recover-videos folder');
  process.exit(1);
}
if (!bPath) {
  console.error('❌ Cannot find b.mp4');
  console.error('   Put b.mp4 in your Downloads folder or in the neuro-recover-videos folder');
  process.exit(1);
}

console.log('✅ Found a.mp4:', aPath);
console.log('✅ Found b.mp4:', bPath);
console.log('');

// ── Clip definitions ──────────────────────────────────────────────────────────
// Timed from frame analysis of your recordings
const clips = [
  { out: 'clip-dashboard.mp4',  src: aPath, ss: 0,   t: 9  },
  { out: 'clip-progress.mp4',   src: aPath, ss: 56,  t: 18 },
  { out: 'clip-piano.mp4',      src: aPath, ss: 97,  t: 35 },
  { out: 'clip-fingertap.mp4',  src: aPath, ss: 155, t: 30 },
  { out: 'clip-bubbles.mp4',    src: aPath, ss: 237, t: 22 },
];

// ── Cut each clip ─────────────────────────────────────────────────────────────
for (const clip of clips) {
  const dest = path.join('public', clip.out);
  if (fs.existsSync(dest)) {
    console.log('⏭  Already exists, skipping:', clip.out);
    continue;
  }
  console.log(`✂️  Cutting ${clip.out} (${clip.t}s from ${clip.ss}s)...`);
  try {
    execSync(
      `ffmpeg -i "${clip.src}" -ss ${clip.ss} -t ${clip.t} ` +
      `-vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" ` +
      `-c:v libx264 -crf 20 -preset fast -an "${dest}" -y`,
      { stdio: 'inherit' }
    );
    console.log('   ✅ Done:', dest);
  } catch (e) {
    console.error('   ❌ Failed:', clip.out, e.message);
  }
}

// ── Copy screenshots ──────────────────────────────────────────────────────────
console.log('\nLooking for screenshots to copy...');
const screenshots = [
  { src: 'bubble_popper.jpg',    dest: 'ss-bubbles.jpg'    },
  { src: 'clinician_review.jpg', dest: 'ss-clinician.jpg'  },
  { src: 'dashboard.jpg',        dest: 'ss-dashboard.jpg'  },
  { src: 'games.jpg',            dest: 'ss-games.jpg'      },
  { src: 'how_it_works.jpg',     dest: 'ss-how.jpg'        },
  { src: 'landing_page.jpg',     dest: 'ss-landing.jpg'    },
  { src: 'Piano.jpg',            dest: 'ss-piano-ui.jpg'   },
  { src: 'progress.jpg',         dest: 'ss-progress.jpg'   },
  { src: 'reach_and_hold.jpg',   dest: 'ss-reach.jpg'      },
];

const downloadsDir = path.join(process.env.USERPROFILE, 'Downloads');
for (const s of screenshots) {
  const destPath = path.join('public', s.dest);
  if (fs.existsSync(destPath)) {
    console.log('⏭  Already exists:', s.dest);
    continue;
  }
  const srcPath = path.join(downloadsDir, s.src);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log('✅ Copied:', s.dest);
  } else {
    console.log('⚠️  Not found in Downloads:', s.src, '(skip)');
  }
}

// ── Final check ───────────────────────────────────────────────────────────────
console.log('\n─────────────────────────────────────');
const allClips = clips.map(c => path.join('public', c.out));
const missing = allClips.filter(p => !fs.existsSync(p));
if (missing.length === 0) {
  console.log('🎬 All clips ready!');
  console.log('   Run: npx remotion studio --force-new');
  console.log('   Then select AdvertDemo in the sidebar.');
} else {
  console.log('⚠️  Still missing:');
  missing.forEach(p => console.log('  -', p));
}
