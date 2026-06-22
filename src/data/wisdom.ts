import type { WisdomPoint } from '@/types'

export const chapterWisdom: Record<string, WisdomPoint[]> = {
  ch1_variables: [
    {
      title: '变量赋值',
      metaphor: '变量就像魔法容器，可以存放各种东西。用 = 给变量赋值。',
      code: 'name = "贤者"\nage = 18\nprint(name)',
      expectedOutput: '贤者',
      tip: '左边是变量名，右边是值',
    },
    {
      title: '字符串',
      metaphor: '字符串是用引号包裹的文字，就像封印在卷轴上的咒语。',
      code: 'greeting = "你好，世界"\nprint(greeting)',
      expectedOutput: '你好，世界',
      tip: '单引号和双引号都可以，但要成对使用',
    },
    {
      title: 'f-string',
      metaphor: 'f-string 可以在字符串中插入变量，就像把魔法能量注入卷轴。',
      code: 'name = "贤者"\nprint(f"你好，{name}")',
      expectedOutput: '你好，贤者',
      tip: '在引号前加 f，变量用 {} 包裹',
    },
    {
      title: '导入模块',
      metaphor: 'import 就像打开魔法图书馆的大门，借用里面的知识。',
      code: 'import math\nprint(math.pi)',
      expectedOutput: '3.141592653589793',
      tip: 'math.pi 是圆周率，约等于 3.14',
    },
    {
      title: '函数定义',
      metaphor: '函数就像魔法配方，输入材料，输出结果。',
      code: 'def greet(name):\n    return f"你好，{name}"\n\nprint(greet("世界"))',
      expectedOutput: '你好，世界',
      tip: 'def 定义函数，return 返回结果，缩进 4 个空格',
    },
  ],
}

export function getWisdomPoints(chapterId: string): WisdomPoint[] {
  return chapterWisdom[chapterId] ?? []
}
