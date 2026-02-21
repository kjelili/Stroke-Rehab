const fs = require('fs');
let c = fs.readFileSync('src/LiveDemo/LiveDemo.tsx', 'utf8');

// Find and show the problematic line
const lines = c.split('\n');
lines.forEach((line, i) => {
  if (line.includes('scale(') && line.includes('ls)') && line.includes('transform')) {
    console.log('Found at line', i+1, ':', line.trim());
  }
});

// Fix: replace the broken template literal with string concatenation
// The bug is: scale(${ls)} -- closing ) is inside the template expression
const fixed = c.replace(/transform:`scale\(\${ls\)}`/g, "transform:'scale('+ls+')'");

if (fixed !== c) {
  fs.writeFileSync('src/LiveDemo/LiveDemo.tsx', fixed);
  console.log('SUCCESS: Fixed LiveDemo.tsx');
} else {
  // Try alternate approach - find and replace line by line
  const fixedLines = lines.map((line, i) => {
    if (line.includes('transform:') && line.includes('ls') && line.includes('scale')) {
      const newLine = line.replace(/transform:`[^`]*`/, "transform:'scale('+ls+')'");
      if (newLine !== line) {
        console.log('Fixed line', i+1);
        return newLine;
      }
    }
    return line;
  });
  fs.writeFileSync('src/LiveDemo/LiveDemo.tsx', fixedLines.join('\n'));
  console.log('Applied line-by-line fix');
}
