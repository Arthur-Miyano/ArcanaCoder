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
  ch2_strings: [
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
      tip:         'for 变量 in 列表: 依次取出每个元素。循环体要缩进。',
    },
  ],
  ch3_lists: [
    {
      title: '列表：数据的列阵',
      definition:
        '列表（list）是 Python 中最常用的数据结构，用方括号 [] 创建，可以存储任意数量的元素。列表是有序的、可变的——可以随时增删改元素。它是 Python 处理批量数据的核心工具。',
      syntaxRules: [
        '用方括号创建：items = [1, 2, 3]',
        '索引从 0 开始：items[0] 是第一个元素',
        '支持负数索引：items[-1] 是最后一个元素',
        'list.append(x) 在末尾追加元素',
      ],
      code: 'books = ["历史", "地理", "星象"]\nbooks.append("草药")\nprint(books)',
      expectedOutput: "['历史', '地理', '星象', '草药']",
      designPhilosophy:
        'Python 的列表是"动态数组"，与 C 语言的数组不同。它不要求所有元素类型相同，长度可以动态变化。这种设计牺牲了极致的性能，换来了极大的灵活性——新手不需要理解内存分配就能处理数据。',
      commonErrors: [
        { code: 'books = [1, 2, 3]\nbooks[3] = 4', error: 'IndexError', explanation: '列表索引从 0 开始，books[3] 访问不存在的第四个元素。如果列表只有 3 个元素，最大索引是 2。' },
        { code: 'books = books.append(x)', error: '逻辑错误', explanation: 'append 不返回新列表，它直接修改原列表。books.append(x) 的返回值是 None。' },
      ],
      interactiveCode: '# 创建一个名为 fruits 的列表，包含三种水果\n# 然后追加一种，最后打印\nfruits = ["苹果", "香蕉"]\n',
      interactiveExpected: "['苹果', '香蕉']",
      tip: '列表是 Python 最常用的数据结构。记住：方括号、从 0 数、用 append 加。',
    },
    {
      title: '列表推导与排序',
      definition:
        '列表推导式（List Comprehension）是 Python 独有的语法，用一行代码从一个列表生成另一个列表。格式：[表达式 for 变量 in 列表]。配合 sort 和 sorted，可以高效地处理批量数据。',
      syntaxRules: [
        '基本推导：[x * 2 for x in nums] 将每个元素乘以 2',
        '条件推导：[x for x in nums if x > 0] 只保留正数',
        'sort() 原地排序，sorted() 返回新列表',
      ],
      code: 'nums = [3, 1, 4, 1, 5]\nprint([x * 10 for x in nums])',
      expectedOutput: '[30, 10, 40, 10, 50]',
      designPhilosophy:
        '列表推导式是 Python 对"声明式编程"的回应。不是告诉计算机"怎么做"（创建空列表、遍历、append），而是告诉它"要什么"——代码更短，意图更清晰。',
      commonErrors: [
        { code: 'sorted(nums) 后 nums 没变', error: '逻辑误解', explanation: 'sorted 返回新列表，不修改原列表。需要赋值：new_nums = sorted(nums)。' },
        { code: '[x * 2 for x in nums if x > 0] 中 if 位置', error: '语法', explanation: 'if 在 for 之后。格式：[表达式 for 变量 in 列表 if 条件]。' },
      ],
      interactiveCode: '# 用推导式生成 [0, 2, 4, 6, 8]\nnums = range(10)\n',
      interactiveExpected: '[0, 2, 4, 6, 8]',
      tip: '推导式格式：[做什么 for 什么 in 哪里 if 条件]。if 可省略。',
    },
    {
      title: '元组与集合',
      definition:
        '元组（tuple）是"不可变的列表"，用圆括号 () 创建。集合（set）是"不重复的元素集"，用花括号 {} 创建。元组用于保护数据不被修改，集合适用于去重和集合运算。',
      syntaxRules: [
        '元组：t = (1, 2, 3)，元素不可修改',
        '元组解包：a, b = (1, 2) 同时赋值给多个变量',
        '集合：s = {1, 2, 3}，自动去重',
        '集合运算：& 交集，| 并集，- 差集',
      ],
      code: 'a, b = (10, 20)\nfruits = {"苹果", "香蕉", "苹果"}\nprint(fruits)',
      expectedOutput: "{'苹果', '香蕉'}",
      designPhilosophy:
        'Python 同时提供元组和集合，体现了"不同场景用不同工具"的设计哲学。元组的不可变性让它可以作为字典的键。集合的去重和运算让数据清洗变得简单。',
      commonErrors: [
        { code: 't[0] = 5', error: 'TypeError', explanation: '元组不可变，不能修改元素。' },
        { code: 's = {} 是集合吗？', error: '混乱', explanation: '{} 是空字典。空集合用 set()。无冒号的花括号是集合。' },
      ],
      interactiveCode: '# 创建两个集合，计算交集\nset1 = {1, 2, 3}\nset2 = {2, 3, 4}\n',
      interactiveExpected: '{2, 3}',
      tip: '元组像封了蜡的文书——内容不能改。集合像熔炉——重复的会被熔掉。',
    },
    {
      title: '字典：键值对图谱',
      definition:
        '字典（dict）是 Python 的键值对数据结构，用花括号 {} 创建，键值之间用冒号分隔。JSON、API 响应都使用这种结构——它是现代编程的数据交换标准。',
      syntaxRules: [
        '创建：catalog = {"火": 50, "水": 30}',
        '查询：catalog["火"] 通过键获取值',
        '安全查询：catalog.get("土", 0) 键不存在时返回默认值',
        '遍历：.keys() 取键，.values() 取值，.items() 取键值对',
      ],
      code: 'catalog = {"火": 50, "水": 30}\nprint(catalog.get("风", 0))',
      expectedOutput: '0',
      designPhilosophy:
        '字典的底层是哈希表，查询速度接近 O(1)。这就是为什么 Python 的字典查找"快到感觉不到"。',
      commonErrors: [
        { code: 'catalog["不存在的键"]', error: 'KeyError', explanation: '用不存在的键直接访问字典会抛出 KeyError。用 get() 安全查询。' },
        { code: 'catalog["火"] == 80（想赋值但用了比较）', error: '逻辑错误', explanation: '赋值用 = 不是 ==。== 是比较运算符，不会修改字典。' },
      ],
      interactiveCode: '# 创建一个图鉴字典，查询条目\nmonsters = {"史莱姆": 10, "哥布林": 25}\n',
      interactiveExpected: '25',
      tip: '字典 = 查表。给一个名字（键），拿到一个值。用 get() 安全查询。',
    },
  ],
  ch4_control: [
    { title: '条件判断', definition: 'if/elif/else 根据条件真假执行不同分支。', syntaxRules: ['if 条件:', 'elif 条件:', 'else:'], code: 'if True:\n    print("通过")', expectedOutput: '通过', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'if-elif-else 从上到下匹配第一个真条件。' },
    { title: '逻辑运算', definition: 'and/or/not 组合多个条件。', syntaxRules: ['and 两边都真', 'or 一边真即可', 'not 取反'], code: 'print(True and False)', expectedOutput: 'False', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'and 和 or 有短路行为。' },
    { title: 'for 循环', definition: 'for 遍历可迭代对象中的每个元素。', syntaxRules: ['for 变量 in 列表:', 'range(n) 0 到 n-1'], code: 'for i in range(3):\n    print(i)', expectedOutput: '0\n1\n2', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'range(n) 从 0 开始，不包含 n。' },
    { title: 'while 循环', definition: 'while 条件为真时持续执行。', syntaxRules: ['while 条件:', 'break 退出', 'continue 跳过'], code: 'i = 3\nwhile i > 0:\n    print(i)\n    i -= 1', expectedOutput: '3\n2\n1', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'while 循环内记得更新条件变量。' },
  ],
  ch5_functions: [
    { title: '函数基础', definition: 'def 定义可复用的代码块。', syntaxRules: ['def 函数名(参数):', 'return 返回值'], code: 'def f(x): return x*2\nprint(f(3))', expectedOutput: '6', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: '先 def 定义，再调用。' },
    { title: '参数与作用域', definition: '参数有默认值，局部变量外部不可见。', syntaxRules: ['默认参数 def f(a=1):', 'global x'], code: 'def f(a=5): return a\nprint(f(3))', expectedOutput: '3', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: '函数内外同名变量互不影响。' },
    { title: 'lambda', definition: 'lambda 创建匿名函数。', syntaxRules: ['lambda 参数: 表达式', 'map/filter/sorted key'], code: 'print(list(map(lambda x:x*2, [1,2,3])))', expectedOutput: '[2, 4, 6]', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'lambda 适合简单操作。' },
    { title: '模块', definition: 'import 导入标准库模块。', syntaxRules: ['import 模块名', '模块名.函数名()'], code: 'import math\nprint(math.sqrt(9))', expectedOutput: '3.0', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'import 是使用 Python 生态的入口。' },
  ],
  ch6_errors: [
    { title: '异常处理', definition: 'try-except 捕获并处理运行时错误。', syntaxRules: ['try:', 'except 类型:', 'else:', 'finally:'], code: 'try:\n    print(1/0)\nexcept:\n    print("err")', expectedOutput: 'err', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'try-except-else-finally 按此顺序排列。' },
    { title: 'raise 与断言', definition: 'raise 主动抛出异常，assert 验证条件。', syntaxRules: ['raise 类型(消息)', 'assert 条件, 消息'], code: 'raise ValueError("错")', expectedOutput: '', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'assert 在调试时很有用。' },
    { title: 'pathlib', definition: 'pathlib 提供面向对象的文件路径操作。', syntaxRules: ['Path(路径)', '/ 拼接路径', '.name / .suffix'], code: 'from pathlib import Path\np = Path("data") / "file.txt"\nprint(p)', expectedOutput: 'data/file.txt', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'pathlib 自动处理不同系统的路径分隔符。' },
  ],
  ch7_oop: [
    { title: '类与对象', definition: 'class 定义蓝图，实例化创建对象。', syntaxRules: ['class 类名:', '__init__ 初始化', 'self 代表实例'], code: 'class Dog:\n    def __init__(self, n):\n        self.name = n\nd = Dog("旺财")', expectedOutput: '', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: '类名大写开头，self 是第一个参数。' },
    { title: '封装', definition: '私有属性 __attr + @property 安全访问。', syntaxRules: ['self.__attr', '@property', 'self._attr 约定私有'], code: 'class Bank:\n    def __init__(self):\n        self.__b = 0\n    @property\n    def balance(self):\n        return self.__b', expectedOutput: '', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: '__attr 名称改写为 _ClassName__attr。' },
    { title: '继承', definition: 'class 子类(父类): 继承属性和方法。', syntaxRules: ['class 子类(父类):', 'super().__init__()', '方法重写同名覆盖'], code: 'class Dog(Animal):\n    def speak(self):\n        super().speak()\n        print("汪汪")', expectedOutput: '', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'super() 调用父类方法。' },
    { title: '魔术方法', definition: '__str__/__len__ 让自定义类支持内置操作。', syntaxRules: ['__str__ return 字符串', '__len__ return 整数'], code: 'class Box:\n    def __str__(self):\n        return "Box"\nprint(Box())', expectedOutput: 'Box', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: '魔术方法让自定义类用起来像内置类型。' },
  ],
  ch8_annotations: [
    { title: '类型注解', definition: '变量: 类型 标注变量/函数的类型。运行时无影响。', syntaxRules: ['变量: 类型', '参数: 类型', '-> 返回类型'], code: 'def add(a: int, b: int) -> int:\n    return a + b', expectedOutput: '', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: '类型注解是给人和工具看的，Python 不强制。' },
    { title: '泛型与 Union', definition: 'List/Union/Optional 表达容器和可选类型。', syntaxRules: ['List[int]', 'Union[str,int]', 'Optional[str]'], code: 'from typing import List\nx: List[int] = [1,2,3]', expectedOutput: '', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: '泛型从 typing 导入，Python 3.9+ 可直接用 list[int]。' },
    { title: 'dataclass', definition: '@dataclass 自动生成 __init__/__repr__/__eq__。', syntaxRules: ['@dataclass', '属性: 类型', '属性: 类型 = 默认值'], code: '@dataclass\\nclass Point:\\n    x: int\\n    y: int', expectedOutput: '', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'dataclass 让你少写大量模板代码。' },
    { title: '上下文管理器', definition: 'with 语句 + __enter__/__exit__ 管理资源。', syntaxRules: ['with 表达式 as 变量:', '__enter__ 返回资源', '__exit__ 清理资源'], code: 'with open("f.txt") as f:\\n    print(f.read())', expectedOutput: '', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'with 确保资源自动释放，即使异常。' },
  ],
  ch9_testing: [
    { title: 'pytest', definition: 'pytest 用 assert 做测试，自动发现 test_ 函数。', syntaxRules: ['test_ 前缀', 'assert 条件', '@pytest.fixture'], code: 'def test_add():\\n    assert 1 + 1 == 2', expectedOutput: '', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'pytest 直接使用 Python 的 assert，无需特殊断言方法。' },
    { title: 'logging', definition: 'logging 替代 print 的生产级日志系统。', syntaxRules: ['basicConfig(level=...)', 'logger.info(msg)', 'getLogger(__name__)'], code: 'import logging\\nlogging.info("ok")', expectedOutput: '', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: '日志级别：DEBUG < INFO < WARNING < ERROR < CRITICAL。' },
    { title: 'ruff', definition: 'ruff 是 Rust 实现的超快 Python linter/formatter。', syntaxRules: ['ruff check', 'ruff check --fix', 'ruff format'], code: '# ruff 自动检查代码风格', expectedOutput: '', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'ruff 兼容 flake8 规则，速度 10-100 倍。' },
  ],
  ch10_async: [
    { title: 'async/await', definition: 'async def 定义协程，await 等待异步操作。', syntaxRules: ['async def 函数():', 'await 协程()', 'asyncio.run(main())'], code: 'async def f():\\n    await asyncio.sleep(1)\\n    return 42', expectedOutput: '', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'await 暂停当前协程但不阻塞事件循环。' },
    { title: '并发工具', definition: 'gather 并发运行多个协程，sleep 异步等待。', syntaxRules: ['asyncio.gather(a(), b())', 'asyncio.sleep(n)'], code: 'r = await asyncio.gather(fetch(1), fetch(2))', expectedOutput: '', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: 'gather 保持结果顺序与任务顺序一致。' },
    { title: 'uv 与打包', definition: 'uv 是 Rust 写的包管理器。包发布用 build + twine。', syntaxRules: ['uv pip install', 'python -m build', 'twine upload'], code: '# pyproject.toml 定义项目配置', expectedOutput: '', commonErrors: [], interactiveCode: '', interactiveExpected: '', tip: '语义化版本：MAJOR.MINOR.PATCH。' },
  ],
}

export function getWisdomPoints(chapterId: string): WisdomPoint[] {
  return chapterWisdom[chapterId] ?? []
}
