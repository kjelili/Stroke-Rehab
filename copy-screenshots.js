// copy-screenshots.js
// Run from: neuro-recover-videos\
// The screenshots were uploaded to this chat and need to be in public\ with the right names

const fs = require('fs');
const path = require('path');

const mappings = [
  { src: 'bubble_popper.jpg',    dest: 'ss-bubbles.jpg'   },
  { src: 'clinician_review.jpg', dest: 'ss-clinician.jpg' },
  { src: 'dashboard.jpg',        dest: 'ss-dashboard.jpg' },
  { src: 'games.jpg',            dest: 'ss-games.jpg'     },
  { src: 'how_it_works.jpg',     dest: 'ss-how.jpg'       },
  { src: 'landing_page.jpg',     dest: 'ss-landing.jpg'   },
  { src: 'Piano.jpg',            dest: 'ss-piano-ui.jpg'  },
  { src: 'progress.jpg',         dest: 'ss-progress.jpg'  },
  { src: 'reach_and_hold.jpg',   dest: 'ss-reach.jpg'     },
];

// Search locations — public\ and Downloads
const searchDirs = [
  path.join(__dirname, 'public'),
  path.join(process.env.USERPROFILE, 'Downloads'),
  __dirname,
];

let allGood = true;

for (const m of mappings) {
  const dest = path.join('public', m.dest);

  // Already done
  if (fs.existsSync(dest)) {
    console.log('⏭  Already exists:', m.dest);
    continue;
  }

  // Find source
  let found = null;
  for (const dir of searchDirs) {
    const candidate = path.join(dir, m.src);
    if (fs.existsSync(candidate)) { found = candidate; break; }
  }

  if (found) {
    fs.copyFileSync(found, dest);
    console.log('✅ Copied:', m.src, '→', m.dest);
  } else {
    console.log('⚠️  Not found:', m.src);
    allGood = false;
  }
}

console.log('\n─────────────────────────────────');
if (allGood) {
  console.log('✅ All screenshots ready!');
  console.log('🎬 Run: npx remotion studio --force-new');
} else {
  console.log('Some screenshots missing — but the video will still work.');
  console.log('Missing ones will just show as broken images in those scenes.');
  console.log('🎬 Run anyway: npx remotion studio --force-new');
}
