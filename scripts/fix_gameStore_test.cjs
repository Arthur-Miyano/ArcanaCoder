const fs = require('fs');
const { execSync } = require('child_process');
const c = execSync('git show HEAD:src/__tests__/gameStore.test.ts', { encoding: 'utf-8' });

const lines = c.split('\n');
const result = [];
for (const line of lines) {
  let l = line;
  if (l.match(/^\s*it\(/)) {
    // 已经是 async 的跳过
    if (!l.includes('async (')) {
      l = l.replace(/\(\)\s*=>\s*{/, 'async () => {');
    }
  }
  if (!l.includes('await ') && (l.includes('store.submitAnswer') || l.includes('store.completeSection') || l.includes('store.resetProgress'))) {
    l = l.replace(/store\.(submitAnswer|completeSection|resetProgress)/g, 'await store.$1');
  }
  result.push(l);
}

fs.writeFileSync('src/utils/gameStore.test.ts', result.join('\n'), 'utf-8');
console.log('Written. Lines:', result.length);
