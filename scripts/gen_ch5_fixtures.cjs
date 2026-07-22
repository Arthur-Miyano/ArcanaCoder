const fs = require('fs');
const sections = {
  s5_basics: ['s5_01','s5_02','s5_03','s5_04','s5_05'],
  s5_params: ['s5_06','s5_07','s5_08','s5_09','s5_10'],
  s5_apply: ['s5_11','s5_12','s5_13','s5_14','s5_15'],
  s5_modules: ['s5_16','s5_17','s5_18','s5_19','s5_20'],
};
const types = {s5_01:'choice',s5_02:'code_fill',s5_03:'code_fill',s5_04:'code_fill',s5_05:'code_fix',s5_06:'choice',s5_07:'code_fill',s5_08:'code_fill',s5_09:'output_predict',s5_10:'code_fix',s5_11:'choice',s5_12:'code_fill',s5_13:'code_fill',s5_14:'code_fill',s5_15:'output_predict',s5_16:'choice',s5_17:'code_fill',s5_18:'code_fill',s5_19:'code_fix',s5_20:'free_coding'};
const idx = {s5_01:0,s5_06:0,s5_09:1,s5_11:0,s5_15:0,s5_16:0};
const codes = {
  s5_02: 'def greet():\n    print("\u4F60\u597D")\ngreet()',
  s5_03: 'def greet(name):\n    print(f"\u4F60\u597D\uFF0C{name}\uFF01")\ngreet("\u8D24\u8005")',
  s5_04: 'def add(a, b):\n    return a + b\nprint(add(3, 4))',
  s5_05: 'def square(x):\n    return x * x\nprint(square(5))',
  s5_07: 'def split(n):\n    return n // 2, n % 2\na, b = split(5)\nprint(a, b)',
  s5_08: 'x = 10\ndef show():\n    x = 5\n    print("\u5185\u90E8:", x)\n\nshow()\nprint("\u5916\u90E8:", x)',
  s5_10: 'count = 0\ndef increment():\n    global count\n    count = count + 1\n\nincrement()\nprint(count)',
  s5_12: 'nums = [1, 2, 3, 4]\nprint(list(map(lambda x: x * x, nums)))',
  s5_13: 'nums = [1, 2, 3, 4, 5, 6]\nprint(list(filter(lambda x: x % 2 == 0, nums)))',
  s5_14: 'books = [{"title": "A", "shelves": 5}, {"title": "B", "shelves": 2}, {"title": "C", "shelves": 8}]\nprint([b["title"] for b in sorted(books, key=lambda b: b["shelves"])])',
  s5_17: 'import math\nprint(math.sqrt(16))',
  s5_19: 'import math\nprint(math.sqrt(25))',
};
for (const [secId, ids] of Object.entries(sections)) {
  const fixtures = ids.map(id => ({
    id, type: types[id], chapterId: 'ch5_functions',
    correctIndex: idx[id] !== undefined ? idx[id] : undefined,
    correctCode: codes[id] || null,
    validationMode: id === 's5_18' ? 'contains' : 'exact',
    sectionId: secId,
  }));
  fs.writeFileSync('e2e/fixtures/' + secId + '.json', JSON.stringify(fixtures, null, 2));
  console.log(secId + '.json: ' + fixtures.length);
}
