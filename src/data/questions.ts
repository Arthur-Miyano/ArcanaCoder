import type { Chapter, Question } from '@/types'

export const chapters: Chapter[] = [
  {
    id: 'ch1_variables',
    name: '第 1 关：变量与类型',
    description: 'Python 的基础——变量赋值与数据类型',
    questionIds: ['q1_choice', 'q2_fill', 'q3_fix', 'q4_predict', 'q5_free'],
    knowledge: [
      '变量就像魔法容器，可以存放各种数据。用 = 给变量赋值。',
      '字符串（str）是用引号包裹的文字，比如 "Hello" 或 "世界"。',
      'f-string 可以在字符串中插入变量值：f"你好，{name}" 会输出 你好，世界。',
      'import 语句导入模块（代码库）。比如 import math 之后就可以使用 math.pi。',
      '函数用 def 定义，return 返回值。缩进 4 个空格表示代码块。',
    ],
  },
]

export const questions: Question[] = [
  {
    id: 'q1_choice',
    type: 'choice',
    chapterId: 'ch1_variables',
    title: '字符串识别',
    description: '以下哪个是 Python 中的字符串（str）类型的值？',
    difficulty: 1,
    knowledgeTags: ['数据类型', '字符串'],
    options: ['123', '"123"', '123.0', 'True'],
    correctOption: 1,
    explanation: '在 Python 中，用单引号或双引号包裹的是字符串。123 是整数，123.0 是浮点数，True 是布尔值。',
  },
  {
    id: 'q2_fill',
    type: 'code_fill',
    chapterId: 'ch1_variables',
    title: '变量与 f-string',
    description: '将 "世界" 赋值给变量 name，然后使用 f-string 打印 "你好，世界"',
    difficulty: 1,
    knowledgeTags: ['变量', 'f-string', 'print'],
    initialCode: '# 将 "世界" 赋值给变量 name\n\n\n# 打印 "你好，世界"\n',
    correctCode: 'name = "世界"\nprint(f"你好，{name}")',
    explanation: '变量赋值用 =，f-string 用 f 前缀和 {} 占位。',
    hint: 'f-string 的语法：f"文本{变量}"',
  },
  {
    id: 'q3_fix',
    type: 'code_fix',
    chapterId: 'ch1_variables',
    title: '缩进修复',
    description: '以下代码有缩进错误。请修复它，使其能正确运行。',
    difficulty: 2,
    knowledgeTags: ['缩进', '函数'],
    initialCode: 'def say_hello():\nprint("Hello!")\n\nsay_hello()',
    correctCode: 'def say_hello():\n    print("Hello!")\n\nsay_hello()',
    explanation: 'Python 用缩进表示代码块，函数体必须缩进 4 个空格。',
    hint: '函数定义后的行需要缩进。',
  },
  {
    id: 'q4_predict',
    type: 'output_predict',
    chapterId: 'ch1_variables',
    title: '字符串乘法',
    description: '阅读以下代码，预测输出结果：',
    difficulty: 2,
    knowledgeTags: ['字符串操作', '类型', '乘法'],
    initialCode: 'x = "10"\ny = 5\nprint(x * y)',
    options: ['50', '15', '1010101010', 'TypeError'],
    correctOption: 2,
    expectedOutput: '1010101010',
    explanation: '字符串乘以整数 n 会将字符串重复 n 次。"10" * 5 即 "10" 重复 5 次得到 "1010101010"。',
    hint: '注意 x 是字符串 "10" 而不是数字 10。',
  },
  {
    id: 'q5_free',
    type: 'free_coding',
    chapterId: 'ch1_variables',
    title: '计算圆的面积',
    description: '编写一个函数 `circle_area(radius)`，接收半径 radius，返回圆的面积（使用 math.pi）。',
    difficulty: 3,
    knowledgeTags: ['函数', 'math 模块', '数值计算'],
    initialCode: 'import math\n\n# 在这里定义 circle_area 函数\n\ndef circle_area(radius):\n    pass\n',
    correctCode: 'import math\n\ndef circle_area(radius):\n    return math.pi * radius ** 2\n',
    testCases: [
      { input: '3', expected: '28.274333882308138' },
      { input: '5', expected: '78.53981633974483' },
    ],
    explanation: '正确答案：\n```python\nimport math\n\ndef circle_area(radius):\n    return math.pi * radius ** 2\n```\n\n圆的面积公式为 π × r²。import math 导入数学模块后可以用 math.pi 获取精确的圆周率。',
    hint: '用 radius ** 2 计算半径的平方，或者用 radius * radius。',
  },
]

export function getQuestionsByChapter(chapterId: string): Question[] {
  const chapter = chapters.find((c) => c.id === chapterId)
  if (!chapter) return []
  return chapter.questionIds
    .map((id) => questions.find((q) => q.id === id))
    .filter((q): q is Question => q !== undefined)
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id)
}
