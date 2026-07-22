const fs = require('fs');
const sections = { s6_basics: ['s6_01','s6_02','s6_03','s6_04','s6_05'], s6_adv: ['s6_06','s6_07','s6_08','s6_09','s6_10'], s6_raise: ['s6_11','s6_12','s6_13','s6_14','s6_15'], s6_pathlib: ['s6_16','s6_17','s6_18','s6_19','s6_20'] };
const types = {s6_01:'choice',s6_02:'code_fill',s6_03:'code_fill',s6_04:'output_predict',s6_05:'code_fix',s6_06:'choice',s6_07:'code_fill',s6_08:'code_fill',s6_09:'output_predict',s6_10:'code_fix',s6_11:'choice',s6_12:'code_fill',s6_13:'code_fill',s6_14:'output_predict',s6_15:'code_fix',s6_16:'choice',s6_17:'code_fill',s6_18:'code_fill',s6_19:'code_fix',s6_20:'free_coding'};
const idx = {s6_01:0,s6_04:0,s6_06:0,s6_09:0,s6_11:0,s6_14:0,s6_16:0};
const codes = {};
codes.s6_02 = 'x = 10\ny = 0\ntry:\n    print(x / y)\nexcept ZeroDivisionError:\n    print("\u4E0D\u80FD\u9664\u96F6")';
codes.s6_03 = 'try:\n    x = int("abc")\nexcept:\n    print("\u51FA\u9519\u4E86")';
codes.s6_05 = 'try:\n    print(1/0)\nexcept:\n    print("err")';
codes.s6_07 = 'a, b = 10, 2\ntry:\n    r = a / b\nexcept ZeroDivisionError:\n    print("\u4E0D\u80FD\u9664\u96F6")\nelse:\n    print("\u8BA1\u7B97\u6210\u529F")';
codes.s6_08 = 'try:\n    print("\u64CD\u4F5C")\nfinally:\n    print("\u6E05\u7406\u5B8C\u6210")';
codes.s6_10 = 'try:\n    x = 1 / 1\nexcept:\n    print("\u9519\u8BEF")\nelse:\n    print("\u6210\u529F")\nfinally:\n    print("\u7ED3\u675F")';
codes.s6_12 = 'def set_age(n):\n    if n < 0:\n        raise ValueError("\u5E74\u9F84\u4E0D\u80FD\u4E3A\u8D1F")\n    print(f"\u5E74\u9F84: {n}")\n\nset_age(5)';
codes.s6_13 = 'def div(a, b):\n    try:\n        return a / b\n    except:\n        raise\n\nprint(div(10, 0))';
codes.s6_15 = 'x = -1\nassert x > 0, "x \u5FC5\u987B\u5927\u4E8E 0"\nprint("\u6B63\u786E")';
codes.s6_17 = 'from pathlib import Path\nbase = Path("data")\np = base / "sub" / "file.txt"\nprint(p)';
codes.s6_18 = 'from pathlib import Path\np = Path("data/report.txt")\nprint(p.name, p.suffix)';
codes.s6_19 = 'from pathlib import Path\nfolder = "data"\nfile = "report.txt"\npath = Path(folder) / file\nprint(path)';
for (const [secId, ids] of Object.entries(sections)) {
  const fixtures = ids.map(id => ({ id, type: types[id], chapterId: 'ch6_errors', correctIndex: idx[id] !== undefined ? idx[id] : undefined, correctCode: codes[id] || null, validationMode: 'exact', sectionId: secId }));
  fs.writeFileSync('e2e/fixtures/'+secId+'.json', JSON.stringify(fixtures, null, 2));
  console.log(secId+'.json');
}
