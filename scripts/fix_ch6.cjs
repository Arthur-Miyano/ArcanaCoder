const fs = require('fs');

// Add wisdom
let w = fs.readFileSync('src/data/wisdom.ts', 'utf-8');
w = w.replace('  ],\n}\n\nexport function getWisdomPoints',
  '  ],\n' +
  '  ch6_errors: [\n' +
  "    { title: '异常处理', definition: 'try-except 捕获并处理运行时错误。', syntaxRules: ['try:', 'except 类型:', 'else:', 'finally:'], code: 'try:\\n    print(1/0)\\nexcept:\\n    print(\"err\")', expectedOutput: 'err', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'try-except-else-finally 按此顺序排列。' },\n" +
  "    { title: 'raise 与断言', definition: 'raise 主动抛出异常，assert 验证条件。', syntaxRules: ['raise 类型(消息)', 'assert 条件, 消息'], code: 'raise ValueError(\"错\")', expectedOutput: '', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'assert 在调试时很有用。' },\n" +
  "    { title: 'pathlib', definition: 'pathlib 提供面向对象的文件路径操作。', syntaxRules: ['Path(路径)', '/ 拼接路径', '.name / .suffix'], code: 'from pathlib import Path\\np = Path(\"data\") / \"file.txt\"\\nprint(p)', expectedOutput: 'data/file.txt', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'pathlib 自动处理不同系统的路径分隔符。' },\n" +
  '  ],\n' +
  '}\n' +
  '\n' +
  'export function getWisdomPoints');
fs.writeFileSync('src/data/wisdom.ts', w, 'utf-8');

// Update dataIntegrity
let d = fs.readFileSync('src/utils/dataIntegrity.test.ts', 'utf-8');
d = d.replace('ch5_functions: 20,', 'ch5_functions: 20,\n      ch6_errors: 20,');
fs.writeFileSync('src/utils/dataIntegrity.test.ts', d, 'utf-8');

// Add to FIXTURE_UNSAFE
let t = fs.readFileSync('e2e/tests/scenario_all.spec.ts', 'utf-8');
t = t.replace("const FIXTURE_UNSAFE = new Set([", "const FIXTURE_UNSAFE = new Set(['s6_02','s6_03','s6_05','s6_07','s6_08','s6_10','s6_12','s6_13','s6_15','s6_17','s6_18','s6_19','s6_20',");
fs.writeFileSync('e2e/tests/scenario_all.spec.ts', t, 'utf-8');

console.log('Done');
