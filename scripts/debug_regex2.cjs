const fs = require('fs');
const c = fs.readFileSync('src/data/questions.ts', 'utf-8');

// Test the exact regex from verify script
const re = /id:\s*'ch[^']+'/g;
const matches = [...c.matchAll(re)];
console.log('Match count:', matches.length);
if (matches.length > 0) {
  matches.forEach((m, i) => console.log(i, m[0]));
} else {
  // Test component parts
  const re1 = /id:\s*'/g;
  const m1 = [...c.matchAll(re1)];
  console.log('Matches for /id:\\s*\'/g:', m1.length);
  
  const re2 = /'ch/g;
  const m2 = [...c.matchAll(re2)];
  console.log('Matches for /\'ch/g:', m2.length);
  
  // Show sample
  const idx = c.indexOf("id: 'ch1_variables'");
  const line = c.substring(idx - 5, idx + 25);
  console.log('Sample text:', JSON.stringify(line));
}
