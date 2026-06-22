import type { Chapter, Question } from '@/types'
import { stage1Questions } from './stage1_questions'
import { backupQuestions as bk } from './backup_questions'

export const backupQuestions = bk

export const chapters: Chapter[] = [
  {
    id: 'ch1_variables',
    name: '第 1 关：变量与类型',
    description: 'Python 的基础——变量赋值与数据类型',
    sections: [
      {
        id: 's1_vars',
        name: '变量赋值',
        questionIds: ['s1_01', 's1_02', 's1_03', 's1_04', 's1_05'],
      },
      {
        id: 's1_types',
        name: '类型系统',
        questionIds: ['s1_06', 's1_07', 's1_08', 's1_09'],
        unlockAfter: 's1_vars',
      },
      {
        id: 's1_ops',
        name: '运算符与格式化',
        questionIds: ['s1_10', 's1_11', 's1_12', 's1_13', 's1_14', 's1_15', 's1_16', 's1_17', 's1_18', 's1_19'],
        unlockAfter: 's1_types',
      },
      {
        id: 's1_strings',
        name: '字符串与输出',
        questionIds: ['s1_20', 's1_21', 's1_22', 's1_23', 's1_24', 's1_25', 's1_26', 's1_27', 's1_28'],
        unlockAfter: 's1_ops',
      },
    ],
  },
  {
    id: 'ch2_lists',
    name: '第 2 关：列表与循环',
    description: '列表操作与 for 循环遍历',
    sections: [
      {
        id: 's2_lists',
        name: '列表基础',
        questionIds: ['q6_choice', 'q7_fill', 'q8_fix', 'q9_predict', 'q10_free'],
      },
    ],
  },
]

export const questions: Question[] = [
  ...stage1Questions,
  ...backupQuestions,
  // 第 2 关旧题保留
  {
    id: 'q6_choice',
    type: 'choice',
    chapterId: 'ch2_lists',
    title: '列表的定义',
    description: '以下哪个是 Python 中的列表（list）？',
    difficulty: 1,
    knowledgeTags: ['列表', '数据类型'],
    options: ['("a", "b")', '["a", "b"]', '{"a", "b"}', '"a", "b"'],
    correctOption: 1,
    explanation: '列表用方括号 [] 定义。() 是元组，{} 是集合，都不是列表。',
  },
  {
    id: 'q7_fill',
    type: 'code_fill',
    chapterId: 'ch2_lists',
    title: '列表追加元素',
    description: '创建一个列表 fruits，包含 "apple" 和 "banana"，然后用 append 追加 "cherry"。',
    difficulty: 1,
    knowledgeTags: ['列表', 'append'],
    initialCode: '# 创建 fruits 列表\n\n\n# 追加 "cherry"\n',
    correctCode: 'fruits = ["apple", "banana"]\nfruits.append("cherry")\nprint(fruits)',
    explanation: '用 [] 创建列表，用 append() 在末尾追加元素。',
    hint: 'append 是列表的方法，用点号调用：列表.append(元素)',
  },
  {
    id: 'q8_fix',
    type: 'code_fix',
    chapterId: 'ch2_lists',
    title: '列表索引修正',
    description: '以下代码想输出列表最后一个元素，但有错误。请修复它。',
    difficulty: 2,
    knowledgeTags: ['列表', '索引'],
    initialCode: 'fruits = ["apple", "banana", "cherry"]\nprint(fruits[3])',
    correctCode: 'fruits = ["apple", "banana", "cherry"]\nprint(fruits[-1])',
    explanation: '列表索引从 0 开始，所以最后一个元素是索引 2 或 -1。用 fruits[-1] 取最后一个元素。',
    hint: 'Python 支持负数索引，-1 表示最后一个元素。',
  },
  {
    id: 'q9_predict',
    type: 'output_predict',
    chapterId: 'ch2_lists',
    title: '列表循环',
    description: '阅读以下代码，预测输出结果：',
    difficulty: 2,
    knowledgeTags: ['列表', 'for 循环'],
    initialCode: 'nums = [1, 2, 3]\ntotal = 0\nfor n in nums:\n    total += n\nprint(total)',
    options: ['123', '6', '[1, 2, 3]', '3'],
    correctOption: 1,
    expectedOutput: '6',
    explanation: 'for 循环遍历列表每个元素，total += n 累加每个值，1+2+3 = 6。',
    hint: 'total += n 等价于 total = total + n。',
  },
  {
    id: 'q10_free',
    type: 'free_coding',
    chapterId: 'ch2_lists',
    title: '列表最大值',
    description: '编写函数 `find_max(lst)`，接收一个数字列表，返回其中的最大值。不能使用 max()。',
    difficulty: 3,
    knowledgeTags: ['列表', '函数', '循环'],
    initialCode: '# 定义 find_max 函数\n\ndef find_max(lst):\n    pass\n',
    correctCode: 'def find_max(lst):\n    max_val = lst[0]\n    for n in lst:\n        if n > max_val:\n            max_val = n\n    return max_val\n',
    testCases: [
      { input: 'find_max([3, 7, 2, 9, 1])', expected: '9' },
      { input: 'find_max([-5, -2, -8])', expected: '-2' },
    ],
    explanation: '正确答案：\n```python\ndef find_max(lst):\n    max_val = lst[0]\n    for n in lst:\n        if n > max_val:\n            max_val = n\n    return max_val\n```\n\n遍历列表，记录遇到的最大值。',
    hint: '用 lst[0] 初始化最大值，然后遍历比较。',
  },
]

export function getQuestionsByChapter(chapterId: string): Question[] {
  const ch = chapters.find((c) => c.id === chapterId)
  if (!ch) return []
  return ch.sections.flatMap((sec) =>
    sec.questionIds
      .map((id) => questions.find((q) => q.id === id))
      .filter(<T>(q: T): q is T & Question => q !== undefined),
  )
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id)
}
