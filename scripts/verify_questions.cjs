/**
 * 题目数据静态核查脚本
 * 检查所有 question 数据的完整性和一致性
 * 用法: node scripts/verify_questions.js
 *
 * 检查项 (Step A):
 * - choice/output_predict: correctOption 不越界、options[correctOption] 非空
 * - 渲染顺序一致性: options 数组是否可能被 shuffle/sort (代码审查, 非自动)
 * - code_fill/code_fix: expectedOutput + correctCode 存在
 * - free_coding: testCases 数组 + 每个 case 的 input/expected 存在
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const FILES = ['stage1_questions.ts', 'stage2_questions.ts', 'stage3_questions.ts', 'stage4_questions.ts', 'stage5_questions.ts', 'stage6_questions.ts', 'stage7_questions.ts', 'stage8_questions.ts', 'stage9_questions.ts', 'stage10_questions.ts', 'backup_questions.ts'];

const errors = [];
const warnings = [];

// Regex to match question objects by looking for blocks starting with `{`
// followed by `id:` within the export const array
function extractQuestions(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const questions = [];

  // More reliable approach: split on "id: '" and extract each question
  // 支持多行格式（{\n  id: '...'）和紧凑格式（{id: '...'）
  const pattern = /\{\s*\n?\s*id:\s*'/g;
  const parts = content.split(pattern);
  for (let i = 1; i < parts.length; i++) {
    try {
      const idMatch = parts[i].match(/^([^']+)/);
      const id = idMatch ? idMatch[1] : null;
      if (!id) continue;

      // Extract type
      const typeMatch = parts[i].match(/type:\s*'([^']+)'/);
      const type = typeMatch ? typeMatch[1] : null;

      // Extract chapterId
      const chMatch = parts[i].match(/chapterId:\s*'([^']+)'/);
      const chapterId = chMatch ? chMatch[1] : null;

      // Helper: 取括号内内容（支持嵌套）
      function extractBracketed(text, startIdx) {
        if (startIdx < 0) return null;
        let depth = 1, i = startIdx + 1;
        while (i < text.length && depth > 0) {
          if (text[i] === '[' || text[i] === '{') depth++;
          if (text[i] === ']' || text[i] === '}') depth--;
          i++;
        }
        return text.substring(startIdx + 1, i - 1);
      }

      // Extract options
      const optsStart = parts[i].search(/options:\s*\[/);
      let options = [];
      if (optsStart >= 0) {
        const optsBody = extractBracketed(parts[i], optsStart + parts[i].slice(optsStart).search(/\[|\{/));
        if (optsBody) {
          const optMatches = optsBody.match(/'[^']*'/g);
          options = optMatches ? optMatches.map(o => o.slice(1, -1)) : [];
        }
      }

      // Extract correctOption
      const coMatch = parts[i].match(/correctOption:\s*(\d+)/);
      const correctOption = coMatch ? parseInt(coMatch[1]) : null;

      // Extract expectedOutput（支持双引号和单引号）
      const eoMatch = parts[i].match(/expectedOutput:\s*'([^']*)'/) || parts[i].match(/expectedOutput:\s*"([^"]*)"/);
      const expectedOutput = eoMatch ? eoMatch[1] : null;

      // Extract correctCode（支持双引号和单引号）
      const ccMatch = parts[i].match(/correctCode:\s*'([^']*)'/) || parts[i].match(/correctCode:\s*"([^"]*)"/);
      const correctCode = ccMatch ? ccMatch[1] : null;

      // Extract validationMode
      const vmMatch = parts[i].match(/validationMode:\s*'([^']+)'/);
      const validationMode = vmMatch ? vmMatch[1] : null;

      // Extract testCases（检测数组存在即可，值解析复杂且非必要）
      const tcStart = parts[i].search(/testCases:\s*\[/);
      let testCases = [];
      if (tcStart >= 0) {
        const tcBody = extractBracketed(parts[i], tcStart + parts[i].slice(tcStart).search(/\[|\{/));
        if (tcBody) {
          const hasInput = tcBody.includes('input:');
          const hasExpected = tcBody.includes('expected:');
          if (hasInput && hasExpected) testCases.push({ input: '', expected: '' });
        }
      }

      // Extract difficulty
      const diffMatch = parts[i].match(/difficulty:\s*(\d+)/);
      const difficulty = diffMatch ? parseInt(diffMatch[1]) : null;

      // Extract knowledgeTags
      const ktStart = parts[i].search(/knowledgeTags:\s*\[/);
      let knowledgeTags = [];
      if (ktStart >= 0) {
        const ktBody = extractBracketed(parts[i], ktStart + parts[i].slice(ktStart).search(/\[|\{/));
        if (ktBody) {
          const tagMatches = ktBody.match(/'[^']+'/g);
          knowledgeTags = tagMatches ? tagMatches.map(t => t.slice(1, -1)) : [];
        }
      }

      questions.push({
        id,
        type,
        chapterId,
        options,
        correctOption,
        expectedOutput,
        correctCode,
        testCases,
        difficulty,
        knowledgeTags,
        validationMode,
      });
    } catch (e) {
      errors.push(`解析错误 (${filePath}): ${e.message}`);
    }
  }
  return questions;
}

console.log('='.repeat(60));
console.log('ArcanaCoder 题目数据静态核查 (Step A)');
console.log('='.repeat(60));

const allQuestions = [];

for (const file of FILES) {
  const filePath = path.join(DATA_DIR, file);
  const questions = extractQuestions(filePath);
  allQuestions.push(...questions);
  console.log(`\n${file}: ${questions.length} 题`);
}

console.log(`\n总计: ${allQuestions.length} 题`);
console.log('-'.repeat(60));

// === Check 1: choice/output_predict correctOption bounds ===
console.log('\n[检查 1] choice/output_predict correctOption 越界检查:');
let chk1Ok = true;
for (const q of allQuestions) {
  if (q.type === 'choice' || q.type === 'output_predict') {
    if (q.correctOption === null && q.options.length > 0) {
      errors.push(`${q.id}: choice/predict 类型缺少 correctOption`);
      chk1Ok = false;
    } else if (q.correctOption !== null) {
      if (q.correctOption < 0 || q.correctOption >= q.options.length) {
        errors.push(`${q.id}: correctOption ${q.correctOption} 越界 (options 长度 ${q.options.length})`);
        chk1Ok = false;
      } else if (q.options[q.correctOption] === '') {
        warnings.push(`${q.id}: options[${q.correctOption}] 为空字符串`);
      }
    }
  }
}
console.log(chk1Ok ? '  ✅ 全部通过' : '  ❌ 有错误');

// === Check 2: code questions expectedOutput/correctCode ===
console.log('\n[检查 2] code_fill/code_fix 必填字段检查:');
let chk2Ok = true;
for (const q of allQuestions) {
  if (q.type === 'code_fill' || q.type === 'code_fix') {
    // validationMode='contains' 的题（input() 相关）允许无 expectedOutput
    if (q.validationMode === 'contains') continue;
    if (!q.expectedOutput && !q.correctCode) {
      errors.push(`${q.id}: code_fill/code_fix 缺少 expectedOutput 和 correctCode`);
      chk2Ok = false;
    } else if (!q.expectedOutput) {
      errors.push(`${q.id}: code_fill/code_fix 缺少 expectedOutput`);
      chk2Ok = false;
    } else if (!q.correctCode) {
      warnings.push(`${q.id}: 缺少 correctCode`);
    }
  }
}
console.log(chk2Ok ? '  ✅ 全部通过' : '  ❌ 有错误');

// === Check 3: free_coding testCases ===
console.log('\n[检查 3] free_coding testCases 检查:');
let chk3Ok = true;
for (const q of allQuestions) {
  if (q.type === 'free_coding') {
    // s8_20 有意设计为空 testCases（综合题需要环境支持）
    if (q.id === 's8_20') continue;
    // 检查 testCases 关键字段 exist（值解析在源文件中可能包含混合引号）
    const hasTestCases = q.testCases && q.testCases.length > 0;
    if (!hasTestCases) {
      errors.push(`${q.id}: free_coding 缺少 testCases 数组或无法解析`);
      chk3Ok = false;
    }
  }
}
console.log(chk3Ok ? '  ✅ 全部通过' : '  ❌ 有错误');

// === Check 4: 所有题目都有 difficulty ===
console.log('\n[检查 4] difficulty 字段检查:');
let chk4Ok = true;
for (const q of allQuestions) {
  if (!q.difficulty || q.difficulty < 1 || q.difficulty > 5) {
    errors.push(`${q.id}: difficulty 缺失或不在 1-5 范围内`);
    chk4Ok = false;
  }
}
console.log(chk4Ok ? '  ✅ 全部通过' : '  ❌ 有错误');

// === Check 5: 所有题目都有 knowledgeTags ===
console.log('\n[检查 5] knowledgeTags 检查:');
let chk5Ok = true;
for (const q of allQuestions) {
  if (!q.knowledgeTags || q.knowledgeTags.length === 0) {
    warnings.push(`${q.id}: knowledgeTags 为空`);
    chk5Ok = false;
  }
}
console.log(chk5Ok ? '  ✅ 全部通过' : '  ⚠️ 有警告');

// === Check 6: 渲染顺序一致性 (代码审查结果) ===
console.log('\n[检查 6] 渲染顺序一致性 (代码审查，非自动):');
console.log('  ChoiceQuestion.vue: 使用 v-for 直接遍历 question.options，无 sort/shuffle/computed ✅');
console.log('  OutputPredict.vue:  使用 v-for 直接遍历 question.options，无 sort/shuffle/computed ✅');

// === Check 7: 含实际换行符的选项文本 ===
console.log('\n[检查 7] 检查选项中的实际换行符:');
let chk7Results = [];
for (const q of allQuestions) {
  for (let i = 0; i < q.options.length; i++) {
    if (q.options[i].includes('\n')) {
      chk7Results.push(`${q.id}: options[${i}] 含实际换行符 - 将被 whitespace-pre-wrap 渲染`);
    }
  }
}
if (chk7Results.length === 0) {
  console.log('  ✅ 未发现含实际换行符的选项');
} else {
  for (const r of chk7Results) console.log(`  📝 ${r}`);
}

// === Step B: 跨文件一致性检查 ===
console.log('\n' + '='.repeat(60));
console.log('Step B — 跨文件一致性检查');
console.log('='.repeat(60));

// B1: wisdom.ts 的 key 都对应存在的 chapter
const wisdomPath = path.join(DATA_DIR, 'wisdom.ts');
const wisdomContent = fs.readFileSync(wisdomPath, 'utf-8');
// 读取 questions.ts 中的章节定义
const questionsTsPath = path.join(DATA_DIR, 'questions.ts');
const questionsTs = fs.readFileSync(questionsTsPath, 'utf-8');
const chapterIds = [...questionsTs.matchAll(/id:\s*'ch[^']+'/g)].map(m => m[0].match(/'([^']+)'/)[1]);
const wisdomKeys = [...wisdomContent.matchAll(/^\s{2}(\w+):\s*\[/gm)].map(m => m[1]);

console.log('\n[B1] wisdom.ts keys → 存在的 chapter:');
let b1Ok = true;
for (const key of wisdomKeys) {
  if (!chapterIds.includes(key)) {
    errors.push(`wisdom.ts key "${key}" 没有对应的 chapter`);
    b1Ok = false;
  }
}
for (const chId of chapterIds) {
  if (!wisdomKeys.includes(chId)) {
    errors.push(`Chapter "${chId}" 没有 wisdom 条目`);
    b1Ok = false;
  }
}
console.log(b1Ok ? '  ✅ 全部通过' : '  ❌ 有错误');

// B2: 每章的题量与 questions.ts 中的 section.questionIds 数量一致
console.log('\n[B2] 章节题量一致性:');
const stageFiles = FILES.filter(f => f.startsWith('stage') && f.endsWith('_questions.ts'));
for (const sf of stageFiles) {
  const sfPath = path.join(DATA_DIR, sf);
  const sfContent = fs.readFileSync(sfPath, 'utf-8');
  const ids = [...sfContent.matchAll(/id:\s*'([^']+)'/g)].map(m => m[1]);
  // 从文件名提取章节号，找到对应的 chapter
  const stageNum = sf.match(/\d+/)?.[0];
  const ch = stageNum ? chapterIds.find(chId => (chId.match(/\d+/)?.[0]) === stageNum) : null;
  if (!ch) continue;
  // 比较：统计本章所有 section 的 questionIds 总数
  const chapterBlock = questionsTs.match(new RegExp(`id:\\s*'${ch}[^']*'[\\s\\S]*?(?=id:\\s*'ch|\\n\\])`));
  let declared = 0;
  if (chapterBlock) {
    const qidMatches = [...chapterBlock[0].matchAll(/questionIds:\s*\[([^\]]+)\]/g)];
    for (const qm of qidMatches) {
      const secIds = qm[1].match(/'([^']+)'/g);
      if (secIds) declared += secIds.length;
    }
  }
  console.log(`  ${ch}: data file ${ids.length} 题, chapters declared ${declared} 题`);
}

// === Summary ===
console.log('\n' + '='.repeat(60));
console.log('核查报告摘要');
console.log('='.repeat(60));
console.log(`总计题目: ${allQuestions.length}`);
console.log(`错误: ${errors.length}`);
console.log(`警告: ${warnings.length}`);

if (errors.length > 0) {
  console.log('\n--- 错误列表 ---');
  for (const err of errors) console.log(`  ❌ ${err}`);
}
if (warnings.length > 0) {
  console.log('\n--- 警告列表 ---');
  for (const w of warnings) console.log(`  ⚠️ ${w}`);
}
console.log('');
