const fs = require('fs');
let c = fs.readFileSync('scripts/verify_questions.cjs', 'utf-8');

// Replace whitespace-sensitive indexOf with regex search
c = c.replace("parts[i].indexOf('options: [')", "parts[i].search(/options:\\s*\\[/)");
c = c.replace("parts[i].indexOf('testCases: [')", "parts[i].search(/testCases:\\s*\\[/)");
c = c.replace("parts[i].indexOf('knowledgeTags: [')", "parts[i].search(/knowledgeTags:\\s*\\[/)");

// Fix start offsets to find the actual [ position
c = c.replace('optsStart + 9', 'optsStart + 1 + parts[i].slice(optsStart).search(/\\[|\\{/)');
c = c.replace('tcStart + 11', 'tcStart + 1 + parts[i].slice(tcStart).search(/\\[|\\{/)');
c = c.replace('ktStart + 15', 'ktStart + 1 + parts[i].slice(ktStart).search(/\\[|\\{/)');

fs.writeFileSync('scripts/verify_questions.cjs', c, 'utf-8');
console.log('Fixed verify script whitespace sensitivity');
