const fs = require('fs');
let c = fs.readFileSync('src/data/stage5_questions.ts', 'utf-8');

// Add explanation field before hint: for each question that doesn't have it
// The pattern is: a line starting with "    hint:" (4 spaces) where the previous 
// significant field was validationMode (not explanation)

const lines = c.split('\n');
const result = [];
let pendingExplanation = null;

for (const line of lines) {
  const trimmed = line.trim();
  
  if (trimmed.startsWith('hint:') && line.startsWith('    ')) {
    // Check the last pushed line - if it wasn't explanation, add one
    const lastPushed = result[result.length - 1] || '';
    if (!lastPushed.trim().startsWith('explanation:')) {
      // Find narrativeExplanation from earlier in this question block
      let narrativeExpl = '';
      for (let j = result.length - 1; j >= Math.max(0, result.length - 30); j--) {
        if (result[j].trim().startsWith('narrativeExplanation:')) {
          narrativeExpl = result[j].trim().replace(/^narrativeExplanation:\s*'/, '').replace(/'$/, '');
          break;
        }
      }
      const explanation = narrativeExpl || '请参考说明。';
      result.push(`    explanation: '${explanation}',`);
    }
  }
  
  result.push(line);
}

fs.writeFileSync('src/data/stage5_questions.ts', result.join('\n'), 'utf-8');
console.log('Fixed. Lines:', result.length);
