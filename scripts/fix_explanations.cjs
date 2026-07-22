const fs = require('fs');
let c = fs.readFileSync('src/data/stage5_questions.ts', 'utf-8');
// Replace shorthand explanations that are missing
// Pattern: a line with 'hint:' but no 'explanation:' before it in the same question block
const lines = c.split('\n');
const result = [];
let needExplanation = false;
let explText = '';

for (const line of lines) {
  const trimmed = line.trim();
  
  if (trimmed.startsWith('id:')) {
    needExplanation = false;
  }
  if (trimmed.startsWith('narrativeExplanation:')) {
    explText = trimmed.replace('narrativeExplanation:', '').trim().replace(/^'/, '').replace(/'$/, '');
  }
  if (trimmed.startsWith('explanation:')) {
    needExplanation = false;
  }
  // Before 'hint:' that's directly in the object (4 spaces indent), add explanation
  if (trimmed.startsWith('hint:') && line.startsWith('    ') && !result.some(l => l.trim().startsWith('explanation:') && l.startsWith('    '))) {
    // Check if we already added explanation
    const prevLines = result.slice(-10).filter(l => l.trim().startsWith('explanation:'));
    if (prevLines.length === 0) {
      const expl = explText || '（请参考说明）';
      result.push(`    explanation: '${expl}',`);
    }
  }
  
  result.push(line);
}

fs.writeFileSync('src/data/stage5_questions.ts', result.join('\n'), 'utf-8');
console.log('Fixed');
