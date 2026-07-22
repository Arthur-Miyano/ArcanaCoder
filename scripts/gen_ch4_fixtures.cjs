const fs = require('fs');
const sections = {
  s4_condition: ['s4_01','s4_02','s4_03','s4_04','s4_05','s4_06'],
  s4_logic: ['s4_07','s4_08','s4_09','s4_10','s4_11'],
  s4_for: ['s4_12','s4_13','s4_14','s4_15','s4_16','s4_17'],
  s4_while: ['s4_18','s4_19','s4_20','s4_21','s4_22'],
};
const types = {s4_01:'choice',s4_02:'code_fill',s4_03:'code_fill',s4_04:'code_fill',s4_05:'code_fix',s4_06:'output_predict',s4_07:'choice',s4_08:'code_fill',s4_09:'code_fill',s4_10:'code_fix',s4_11:'output_predict',s4_12:'choice',s4_13:'code_fill',s4_14:'code_fill',s4_15:'code_fill',s4_16:'output_predict',s4_17:'code_fix',s4_18:'choice',s4_19:'code_fill',s4_20:'code_fix',s4_21:'code_fix',s4_22:'free_coding'};
const idx = {s4_01:0,s4_06:1,s4_07:0,s4_11:0,s4_12:0,s4_16:2,s4_18:0};
const codes = {
  s4_02: 'scrolls = 5\nif scrolls > 0:\n    print("\u6709\u5377\u5B97")',
  s4_03: 'is_raining = True\nif is_raining:\n    print("\u5E26\u4F1E\u51FA\u95E8")',
  s4_04: 'score = 75\nif score >= 60:\n    print("\u901A\u8FC7")\nelse:\n    print("\u672A\u901A\u8FC7")',
  s4_05: 'x = 10\nif x > 5:\n    print("\u5927")\nelse:\n    print("\u5C0F")',
  s4_08: 'shelves, floor = 5, 2\nif shelves >= 3 and floor <= 2:\n    print("\u4E0A\u67B6")',
  s4_09: 'is_raining, has_meeting = False, True\nif is_raining or has_meeting:\n    print("\u5E26\u4F1E")',
  s4_10: 'x = 15\nif x > 0:\n    if x < 20:\n        print("\u4E2D\u95F4\u503C")',
  s4_13: 'books = ["\u5386\u53F2", "\u5730\u7406", "\u661F\u8C61"]\nfor b in books:\n    print(b)',
  s4_14: 'for i in range(5):\n    print(i)',
  s4_15: 'for i in range(2, 6):\n    print(i)',
  s4_17: 'total = 0\nfor i in range(1, 6):\n    total = total + i * i\nprint(total)',
  s4_19: 'count = 3\nwhile count > 0:\n    print(count)\n    count = count - 1',
  s4_20: 'i = 0\nwhile i < 5:\n    if i == 3:\n        break\n    print(i)\n    i = i + 1',
  s4_21: 'i = 0\nwhile i < 5:\n    print(i)\n    i = i + 1',
};
for (const [secId, ids] of Object.entries(sections)) {
  const fixtures = ids.map(id => ({
    id, type: types[id], chapterId: 'ch4_control',
    correctIndex: idx[id] !== undefined ? idx[id] : undefined,
    correctCode: codes[id] || null,
    validationMode: 'exact', sectionId: secId,
  }));
  fs.writeFileSync('e2e/fixtures/' + secId + '.json', JSON.stringify(fixtures, null, 2));
  console.log(secId + '.json: ' + fixtures.length);
}
