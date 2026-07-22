const fs = require('fs');
const c = fs.readFileSync('src/data/questions.ts', 'utf-8');

// Find first id: line
const idx = c.indexOf("id: 'ch1_variables'");
console.log('Found at index:', idx);
console.log('Chars around it:');
for (let i = idx - 5; i < idx + 25; i++) {
  console.log(i, c.charCodeAt(i), JSON.stringify(c[i]));
}

// Test regex
const re1 = /id:\s*'/;
const m1 = c.match(re1);
console.log('\nRegex /id:\s*\'/ match:', m1 ? m1[0] + ' at ' + m1.index : 'NONE');

// Try with explicit space
const re2 = /id: '/;
const m2 = c.match(re2);
console.log('Regex /id: \'/\' match:', m2 ? m2[0] + ' at ' + m2.index : 'NONE');
