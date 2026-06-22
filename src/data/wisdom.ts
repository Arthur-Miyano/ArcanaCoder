import type { WisdomPoint } from '@/types'

export const chapterWisdom: Record<string, WisdomPoint[]> = {
  ch1_variables: [
    {
      title: '变量赋值',
      definition:
        '变量（Variable）是 Python 中用于存储数据的命名标签。执行 name = "贤者" 时，Python 先在内存中创建字符串对象 "贤者"，再将变量名 name 绑定到该对象。',
      syntaxRules: [
        '变量名 = 值：将右边的值赋给左边的变量名',
        '变量名只能包含字母、数字和下划线，不能以数字开头',
        'Python 是动态类型语言，变量不需要提前声明类型',
      ],
      code: 'name = "贤者"\nage = 18\nprint(name)',
      expectedOutput: '贤者',
      designPhilosophy:
        'Python 的变量本质是"标签"而非"盒子"。同一个变量可以在不同时间指向不同类型的对象——这是动态类型语言的核心特征，也是 Python 灵活性的来源。',
      commonErrors: [
        {
          code: '2nd_name = "世界"',
          error: 'SyntaxError',
          explanation: '变量名以数字开头。变量名只能以字母或下划线开头。',
        },
        {
          code: 'my-name = "世界"',
          error: 'SyntaxError',
          explanation: '变量名包含连字符。Python 中减号是运算符，不能出现在变量名中。',
        },
      ],
      interactiveCode: '# 请定义三个变量：姓名、年龄、城市\n# 然后用 print 显化它们\n\nname = "贤者"\nage = 18\nprint(name)',
      interactiveExpected: '贤者',
      tip: '左边是变量名，右边是值。= 是赋值运算符，不是数学等号。',
    },
    {
      title: '字符串',
      definition:
        '字符串（str）是 Python 中用于存储文本的不可变序列类型。用单引号 \'...\' 或双引号 "..." 包裹。Python 3 中字符串默认使用 Unicode 编码，支持中文等多语言文字。',
      syntaxRules: [
        '用单引号或双引号包裹文本：\'你好\' 或 "你好"',
        '字符串是"不可变"的——创建后不能修改其中的字符',
        '空字符串用 \'\' 或 "" 表示',
      ],
      code: 'greeting = "你好，世界"\nprint(greeting)',
      expectedOutput: '你好，世界',
      designPhilosophy:
        'Python 是少数同时支持单引号和双引号的语言之一。这让你可以在字符串中嵌入引号而不需要转义：print("他说\'好\'")。两种引号完全等价，选择哪种只是风格问题。',
      commonErrors: [
        {
          code: 'text = "他说："好""',
          error: 'SyntaxError',
          explanation: '引号嵌套错误。外层用双引号时，内层需要用单引号，或使用转义符 \\"。',
        },
        {
          code: "print('它说'不')",
          error: 'SyntaxError',
          explanation: '单引号内不能再直接使用单引号。可用双引号包裹外层，或转义内层引号。',
        },
      ],
      interactiveCode: '# 创建一个存储你名字的字符串变量\n# 然后用 print 输出\n\nname = "贤者"\nprint(name)',
      interactiveExpected: '贤者',
      tip: '单引号和双引号都可以，但要成对使用。字符串是不可变的。',
    },
    {
      title: 'f-string',
      definition:
        'f-string（格式化字符串字面量）是 Python 3.6+ 引入的字符串嵌入表达式语法。在字符串前加 f 或 F 前缀，用花括号 {} 嵌入变量或表达式，运行时替换为实际值。',
      syntaxRules: [
        '在引号前加 f 前缀：f"文本{变量}"',
        '花括号 {} 内可以放变量、表达式或函数调用',
        '复杂的表达式也可以写在 {} 中，如 {count * price}',
      ],
      code: 'name = "贤者"\nprint(f"你好，{name}")',
      expectedOutput: '你好，贤者',
      designPhilosophy:
        'f-string 是 Python 3.6 之后推荐的字符串格式化方式。相比 % 格式化（%s）和 .format() 方法，f-string 更直观、性能更好。这也是 Python 社区推荐的"显而易见的方式"。',
      commonErrors: [
        {
          code: 'name = "贤者"\nprint("你好，{name}")',
          error: '不会报错，但输出为"你好，{name}"',
          explanation: '忘记加 f 前缀。没有 f 的字符串中的 {} 只是普通字符，不会被替换。',
        },
      ],
      interactiveCode: '# 有两个变量 a 和 b\n# 用 f-string 将它们输出为 "a 和 b 是好朋友"\n\na = "猫"\nb = "狗"\nprint(f"{a}和{b}是好朋友")',
      interactiveExpected: '猫和狗是好朋友',
      tip: '在引号前加 f，变量用 {} 包裹。f-string 比字符串拼接更快、更清晰。',
    },
    {
      title: '导入模块',
      definition:
        'import 语句用于导入 Python 模块（Module）。模块是包含 Python 定义和语句的文件，Python 标准库提供了超过 200 个模块。导入后可通过 模块名.函数名() 的方式调用。',
      syntaxRules: [
        'import 模块名：导入整个模块，使用时需加前缀',
        'from 模块名 import 函数名：只导入特定函数',
        'as 关键字可给模块起别名：import math as m',
      ],
      code: 'import math\nprint(math.pi)',
      expectedOutput: '3.141592653589793',
      designPhilosophy:
        'Python 的标准库哲学是"电池内置"（Batteries Included）——你不需要安装任何额外工具就能处理文件、网络、数学等常见任务。import math 就是这种哲学的直接体现。',
      commonErrors: [
        {
          code: 'print(math.pi)',
          error: 'NameError: name \'math\' is not defined',
          explanation: '使用模块前必须先 import。没有导入的模块 Python 无法识别。',
        },
      ],
      interactiveCode: '# 导入 math 模块\n# 计算半径为 3 的圆的周长（2 * pi * r）\n\nimport math\nr = 3\nprint(2 * math.pi * r)',
      interactiveExpected: '18.84955592153876',
      tip: 'import 必须在使用模块之前。模块名.函数名() 是标准的调用方式。',
    },
    {
      title: '函数定义',
      definition:
        '函数（Function）是一段命名的、可复用的代码块。Python 使用 def 关键字声明函数，通过参数（parameter）接收输入，通过 return 语句返回结果。函数是 Python 中代码复用的基本单元。',
      syntaxRules: [
        'def 函数名(参数1, 参数2): — 函数定义以冒号结尾',
        '函数体必须缩进（推荐 4 个空格）— Python 不使用 {} 界定代码块',
        'return 语句将值传回调用处；没有 return 的函数默认返回 None',
      ],
      code: 'def greet(name):\n    return f"你好，{name}"\n\nprint(greet("世界"))',
      expectedOutput: '你好，世界',
      designPhilosophy:
        'Python 强制缩进——这是与 C/Java 最核心的语法差异之一。Python 的设计哲学认为"代码本身就是结构"，缩进不仅是风格问题，而是语法的一部分。这让所有 Python 代码的格式保持一致。',
      commonErrors: [
        {
          code: 'def greet(name):\nreturn "你好"',
          error: 'IndentationError',
          explanation: '函数体没有缩进。def 下一行必须向右缩进（通常 4 个空格）。',
        },
        {
          code: 'def greet(name):\n    return f"你好，{name}"\n\nprint(greet())',
          error: 'TypeError: greet() missing 1 required positional argument',
          explanation: '调用函数时没有传参数。函数定义时有 name 参数，调用时必须传入。',
        },
      ],
      interactiveCode: '# 修改下面的 greet 函数\n# 让它同时接收 name 和 age 两个参数\n# 输出："你好，世界，今年25岁"\n\ndef greet(name, age):\n    return f"你好，{name}，今年{age}岁"\n\nprint(greet("世界", 25))',
      interactiveExpected: '你好，世界，今年25岁',
      tip: 'def 定义函数，return 返回结果。缩进 4 个空格是 Python 的强制要求。',
    },
  ],
  ch2_lists: [
    {
      title: '列表创建',
      definition:
        '列表（list）是 Python 中用于存储有序集合的可变序列类型。用方括号 [] 创建，元素用逗号分隔。列表是 Python 最常用的数据结构之一。',
      syntaxRules: [
        '用 [] 创建列表：["apple", "banana", "cherry"]',
        '列表元素可以是任意类型，甚至可以混合类型',
        '列表是可变的——可以增删改其中的元素',
      ],
      code: 'fruits = ["apple", "banana", "cherry"]\nprint(fruits)',
      expectedOutput: "['apple', 'banana', 'cherry']",
      designPhilosophy:
        'Python 的列表可以包含不同类型的元素，这与 C 语言或 Java 的数组不同。这种灵活性源自 Python 的"一切皆对象"设计哲学——因为每个元素都是对象引用，所以类型不必统一。',
      commonErrors: [],
      interactiveCode: '# 创建一个包含 3 个你喜欢的编程语言的列表\n# 然后打印它\n\nlangs = ["Python", "JavaScript", "Rust"]\nprint(langs)',
      interactiveExpected: "['Python', 'JavaScript', 'Rust']",
      tip: '列表元素用逗号分隔，索引从 0 开始。',
    },
    {
      title: '列表索引',
      definition:
        '列表通过索引（Index）访问元素。索引从 0 开始，支持负数索引从末尾倒数。-1 表示最后一个元素，-2 表示倒数第二个，以此类推。',
      syntaxRules: [
        'list[0] — 第一个元素（索引从 0 开始）',
        'list[-1] — 最后一个元素（负数索引从末尾倒数）',
        '索引越界会抛出 IndexError',
      ],
      code: 'nums = [10, 20, 30, 40]\nprint(nums[0], nums[-1])',
      expectedOutput: '10 40',
      designPhilosophy:
        '负数索引是 Python 的特色语法之一。许多语言中访问最后一个元素需要 nums[len(nums)-1]，而 Python 的 nums[-1] 更符合直觉——"给我最后一个"。',
      commonErrors: [
        {
          code: 'nums = [10, 20, 30]\nprint(nums[3])',
          error: 'IndexError: list index out of range',
          explanation: '索引超出范围。3 个元素的列表索引最大为 2（从 0 开始）。',
        },
      ],
      interactiveCode: '# 输出列表的中间两个元素（索引为 1 和 2）\n\nitems = [100, 200, 300, 400]\nprint(items[1], items[2])',
      interactiveExpected: '200 300',
      tip: '用 [0] 取第一个，[-1] 取最后一个。',
    },
    {
      title: '追加元素',
      definition:
        'append() 是 list 类型的方法，用于在列表末尾添加一个元素。这是修改列表最常用的操作之一。append 是"原地修改"——它直接修改原列表，不返回新列表。',
      syntaxRules: [
        '列表.append(元素) — 在末尾添加一个元素',
        'append 是原地操作，直接修改原列表',
        'append 返回 None，不是新列表',
      ],
      code: 'colors = ["red", "blue"]\ncolors.append("green")\nprint(colors)',
      expectedOutput: "['red', 'blue', 'green']",
      designPhilosophy:
        'append 的原地修改行为是 Python 设计哲学中"显式优于隐式"的体现。Python 不会偷偷复制数据——当你 append 时，你知道正在修改哪个列表。',
      commonErrors: [
        {
          code: 'colors = ["red", "blue"]\ncolors = colors.append("green")\nprint(colors)',
          error: '输出 None',
          explanation: 'append 返回 None，不应该赋值给原变量。直接调用 colors.append() 即可。',
        },
      ],
      interactiveCode: '# 创建一个空列表\n# 然后用 append 添加 3 个元素\n\nitems = []\nitems.append("第一")\nitems.append("第二")\nitems.append("第三")\nprint(items)',
      interactiveExpected: "['第一', '第二', '第三']",
      tip: 'append() 在末尾添加，列表长度加 1。',
    },
    {
      title: 'for 循环遍历',
      definition:
        'for 循环是 Python 中遍历可迭代对象（如列表、字符串）的主要方式。for 变量 in 可迭代对象: 依次取出每个元素，执行循环体。',
      syntaxRules: [
        'for 变量 in 列表: — 遍历列表的每个元素',
        '循环体必须缩进，与 def 和 if 的缩进规则一致',
        '遍历过程中不要修改列表长度，可能导致意外行为',
      ],
      code: 'nums = [1, 2, 3]\nfor n in nums:\n    print(n)',
      expectedOutput: '1\n2\n3',
      designPhilosophy:
        'Python 的 for 循环本质上是"foreach"——它直接遍历元素，而不是通过索引。这与 C 语言的 for (int i = 0; i < n; i++) 不同，Python 的设计让代码更接近自然语言："对列表中的每个数字，打印它"。',
      commonErrors: [
        {
          code: 'nums = [1, 2, 3]\nfor n in nums:\nprint(n)',
          error: 'IndentationError',
          explanation: 'for 循环体没有缩进。和 def/if 一样，for 内部的代码块必须缩进。',
        },
      ],
      interactiveCode: '# 计算列表中所有数字的总和\n\nnumbers = [10, 20, 30, 40]\ntotal = 0\nfor n in numbers:\n    total += n\nprint(total)',
      interactiveExpected: '100',
      tip: 'for 变量 in 列表: 依次取出每个元素。循环体要缩进。',
    },
  ],
}

export function getWisdomPoints(chapterId: string): WisdomPoint[] {
  return chapterWisdom[chapterId] ?? []
}
