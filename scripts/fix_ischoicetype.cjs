const fs = require('fs');
let c = fs.readFileSync('src/composables/useQuiz.ts', 'utf-8');

// Remove the export modifier from inside the function
c = c.replace('  function isChoiceType(q: Question): boolean {', '  function isChoiceType(q: Question): boolean {');
// Already no export, so just need to add export outside

// Find the import section and add export after it
c = c.replace(
  "import { gradeCode, gradeFreeCoding, gradeChoice } from './grade'",
  "import { gradeCode, gradeFreeCoding, gradeChoice } from './grade'\n\nexport function isChoiceType(q: Question): boolean {\n  return q.type === 'choice' || q.type === 'output_predict'\n}"
);

fs.writeFileSync('src/composables/useQuiz.ts', c, 'utf-8');
console.log('Done');
