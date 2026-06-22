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
  ch2_lists: [
    {
      title: '列表创建',
      metaphor: '列表就像魔法背包，可以按顺序放很多东西。用方括号 [] 创建。',
      code: 'fruits = ["apple", "banana", "cherry"]\nprint(fruits)',
      expectedOutput: "['apple', 'banana', 'cherry']",
      tip: '列表元素用逗号分隔，索引从 0 开始',
    },
    {
      title: '列表索引',
      metaphor: '索引就像给背包里的物品编号，从 0 开始。负数索引从末尾倒数。',
      code: 'nums = [10, 20, 30, 40]\nprint(nums[0], nums[-1])',
      expectedOutput: '10 40',
      tip: '用 [0] 取第一个，[-1] 取最后一个',
    },
    {
      title: '追加元素',
      metaphor: 'append 就像在背包最外层再塞一个东西。',
      code: 'colors = ["red", "blue"]\ncolors.append("green")\nprint(colors)',
      expectedOutput: "['red', 'blue', 'green']",
      tip: 'append() 在末尾添加，列表长度加 1',
    },
    {
      title: 'for 循环遍历',
      metaphor: 'for 循环就像一件一件地查看背包里的每件物品。',
      code: 'nums = [1, 2, 3]\nfor n in nums:\n    print(n)',
      expectedOutput: '1\n2\n3',
      tip: 'for 变量 in 列表: 依次取出每个元素',
    },
    {
      title: '列表与函数',
      metaphor: '把列表传给函数，就像把背包交给工匠检查。',
      code: 'def sum_list(lst):\n    total = 0\n    for n in lst:\n        total += n\n    return total\n\nprint(sum_list([1, 2, 3]))',
      expectedOutput: '6',
      tip: 'return 返回值，然后可以用 print 打印结果',
    },
  ],
}

export function getWisdomPoints(chapterId: string): WisdomPoint[] {
  return chapterWisdom[chapterId] ?? []
}
