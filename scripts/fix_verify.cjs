const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

// Read questions.ts
const qts = fs.readFileSync(path.join(DATA_DIR, 'questions.ts'), 'utf-8');

// Extract chapter blocks (from `id: 'ch'` to before the next `id: 'ch'` or `]`)
const chBlocks = [];
let currentBlock = '';
let inChapter = false;
for (const line of qts.split('\n')) {
  if (line.match(/id:\s*'ch/)) {
    if (inChapter && currentBlock) chBlocks.push(currentBlock);
    currentBlock = line + '\n';
    inChapter = true;
  } else if (inChapter) {
    if (line.trim() === ']') {
      currentBlock += line;
      chBlocks.push(currentBlock);
      currentBlock = '';
      inChapter = false;
    } else {
      currentBlock += line + '\n';
    }
  }
}

// For each chapter, find its sections and count questions
const chapterCounts = [];
for (const block of chBlocks) {
  const chIdMatch = block.match(/id:\s*'([^']+)'/);
  if (!chIdMatch) continue;
  const chId = chIdMatch[1];
  const questionIds = [];
  const qidMatches = block.match(/questionIds:\s*\[([^\]]+)\]/g);
  if (qidMatches) {
    for (const m of qidMatches) {
      const ids = m.match(/'([^']+)'/g);
      if (ids) questionIds.push(...ids.map(i => i.slice(1, -1)));
    }
  }
  if (chId.startsWith('ch')) {
    chapterCounts.push({ chId: chId, declared: questionIds.length, ids: questionIds });
  }
}

// Read data files
const stageFiles = fs.readdirSync(DATA_DIR).filter(f => f.match(/^stage\d+_questions\.ts$/));
const dataCounts = {};
for (const sf of stageFiles) {
  const content = fs.readFileSync(path.join(DATA_DIR, sf), 'utf-8');
  const ids = [...content.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]);
  dataCounts[sf] = ids.length;
}

// Compare
console.log('\n[B2] 章节题量一致性:');
let allOk = true;
for (const ch of chapterCounts) {
  const stageNum = ch.chId.match(/\d+/)?.[0];
  const expectedFile = `stage${stageNum}_questions.ts`;
  const actual = dataCounts[expectedFile];
  if (actual !== undefined && actual !== ch.declared) {
    console.log(`  ❌ ${ch.chId}: data file ${actual} 题, chapters declared ${ch.declared} 题`);
    allOk = false;
  } else if (actual !== undefined) {
    console.log(`  ✅ ${ch.chId}: ${actual} 题`);
  }
}
if (allOk) console.log('  ✅ 全部通过');
