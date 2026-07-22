# ch4 内容设计：条件判断与循环

> 制定：2026-06-24 | 更新：2026-06-24（审查反馈 10 条已写入）
> 区域归属：爬虫山脉（与 ch3 同区域）
> displayName：**爬虫山脉 · 控制流**（区分 ch3 的「数据结构卷宗」）← [#1]

---

## 一、为什么学这些

条件判断和循环是所有编程语言的核心控制结构。没有它们，程序只能从上到下顺序执行——有了它们，程序才能"做决策"和"重复执行"。

| 结构 | 为什么必须学 | 不学的后果 |
|------|------------|-----------|
| if/elif/else | 程序需要根据条件做不同的事情 | 所有代码只能按固定顺序跑，无法应对变化 |
| and/or/not | 组合多个条件做复杂判断 | 只能用嵌套 if，代码臃肿 |
| for 循环 | 遍历列表/字典/字符串中的每个元素 | 无法处理批量数据 |
| range() | 按次数执行固定循环 | 计数循环只能手写 while |
| while 循环 | 在条件满足时持续执行（不确定次数） | 无法处理"直到达成条件"的场景 |

**最终效果**：学习者能写出带条件判断的交互逻辑，能用循环处理批量数据，为后续函数和项目实战打下基础。

---

## 二、知识结构

```
第 4 章：条件判断与循环（22 题，4 节）
│
├── 第 1 节：条件判断基础（6 题）
│   if 语法、比较操作符、if-else、if-elif-else
│   s4_01 choice      — if 语法辨识（1★）
│   s4_02 code_fill   — 在 if 条件中应用比较操作符（2★）← [#9] 明确"在 if 中应用"
│   s4_03 code_fill   — if 条件执行（2★）
│   s4_04 code_fill   — if-else 分支（2★）
│   s4_05 code_fix    — 缩进 / 冒号修复（2★）
│   s4_06 output_predict — if-elif-else 路径预测（3★）
│
├── 第 2 节：逻辑运算与嵌套（5 题）
│   and/or/not、嵌套条件
│   s4_07 choice      — and/or/not 概念辨识（1★）← [#2] 从 2★ 降为 1★，作为 §2 warm-up
│   s4_08 code_fill   — and 组合条件（2★）
│   s4_09 code_fill   — or / not 判断（2★）
│   s4_10 code_fix    — 嵌套 if 修复（3★）
│   s4_11 output_predict — 短路求值预测（3★）← [#5] 从 choice 改为 output_predict
│
├── 第 3 节：for 循环（6 题）
│   for 语法、range()、遍历列表
│   s4_12 choice      — for 语法辨识（1★）
│   s4_13 code_fill   — for 遍历列表（2★）
│   s4_14 code_fill   — range() 基本使用（2★）
│   s4_15 code_fill   — range(start, end)（2★）
│   s4_16 output_predict — 循环输出预测（3★）
│   s4_17 code_fix    — 循环逻辑修复（3★）
│
└── 第 4 节：while 循环与综合（5 题）
    while 语法、break、continue、综合应用
    s4_18 choice      — while 语法辨识（1★）
    s4_19 code_fill   — while 条件循环（2★）
    s4_20 output_predict — break/continue 循环输出预测（3★）← [#4] 从 code_fill 改为 output_predict
    s4_21 code_fix    — 死循环修复（3★）
    s4_22 free_coding — 统计筛选系统（4★）
```

### 设计说明 ← [#10]

**与 ch3 文档格式对齐**：ch3 文档有完整的验证标准、数据规范速查、新增/调整题说明。本版补全了这些章节（§七、§八、§九）。

**题型调整记录**：

| 题目 | 原方案 | 调整后 | 原因 |
|------|--------|--------|------|
| s4_07 | 2★ choice | 1★ choice | [#2] §2 缺少 1★ warm-up，and/or/not 概念辨识本身适合 1★ |
| s4_11 | 3★ choice | 3★ output_predict | [#5] 短路求值是行为概念，choice 易退化为背规则 |
| s4_20 | 3★ code_fill | 3★ output_predict | [#4] break/continue 考察执行路径理解，output_predict 更直接 |

**displayName 区分** ← [#1]：ch4 与 ch3 同在「爬虫山脉」，ch3 使用 `displayName: '数据结构卷宗'`，ch4 使用 `displayName: '爬虫山脉 · 控制流'`。

### 叙事风格

延续爬虫山脉"整理图书馆卷宗"的主题：
- if 条件 = "判断卷宗是否符合分类标准"
- for 循环 = "遍历所有卷宗进行检查"
- while 循环 = "持续查找直到找到目标"
- 综合题 = "编目统计系统"

---

## 三、s4_22 详细设计：统计筛选系统（4★）

### 叙事场景

图书馆有一批卷宗需要编目。编写函数 `filter_books(books, min_shelves)`，筛选出书架数大于等于指定值的典籍，返回它们的书名列表和总书架数。

### 输入数据格式

```python
books = [
    {"title": "元素基础", "shelves": 3},
    {"title": "中级炼金", "shelves": 5},
    {"title": "草药图鉴", "shelves": 2},
]
```

### 任务要求

1. **筛选**：遍历 books，保留 `shelves >= min_shelves` 的条目
2. **转换**：返回 `{"titles": [书名1, 书名2, ...], "total": 总书架数}`
3. **安全**：空列表返回 `{"titles": [], "total": 0}`
4. **边界**：min_shelves 为 0 时全部通过
5. **顺序**：titles 列表顺序必须与输入 books 的顺序一致 ← [#8]

### 测试用例

| # | 输入 | 期望输出 | 覆盖场景 |
|---|------|---------|---------|
| 1 | `filter_books([{"title":"A","shelves":3},{"title":"B","shelves":5},{"title":"C","shelves":2}], 3)` | `{"titles": ["A", "B"], "total": 8}` | 正常筛选 |
| 2 | `filter_books([], 3)` | `{"titles": [], "total": 0}` | 空列表 |
| 3 | `filter_books([{"title":"A","shelves":1}], 5)` | `{"titles": [], "total": 0}` | 无匹配 |
| 4 | `filter_books([{"title":"X","shelves":0}], 0)` | `{"titles": ["X"], "total": 0}` | 边界：min=0 |
| 5 | `filter_books([{"title":"A","shelves":3},{"title":"B","shelves":3}], 3)` | `{"titles": ["A", "B"], "total": 6}` | 全部匹配 |
| 6 | `filter_books([{"title":"甲","shelves":5},{"title":"乙","shelves":4},{"title":"丙","shelves":5}], 4)` | `{"titles": ["甲", "乙", "丙"], "total": 14}` | ← [#8] 顺序稳定性：验证 titles 顺序与输入一致 |

---

## 四、题型配比

| 节 | choice | code_fill | output_predict | code_fix | free_coding | 合计 |
|----|--------|-----------|---------------|----------|-------------|------|
| 1 条件基础 | s4_01 | s4_02, s4_03, s4_04 | s4_06 | s4_05 | — | 6 |
| 2 逻辑运算 | s4_07 | s4_08, s4_09 | s4_11 | s4_10 | — | 5 |
| 3 for 循环 | s4_12 | s4_13, s4_14, s4_15 | s4_16 | s4_17 | — | 6 |
| 4 while+综合 | s4_18 | s4_19 | s4_20 | s4_21 | s4_22 | 5 |
| **合计** | **4** | **10** | **4** | **3** | **1** | **22** |

choice 18% / code_fill 45% / output_predict 18% / code_fix 14% / free_coding 5%

变化：s4_11（choice→output_predict）、s4_20（code_fill→output_predict）。每节都有 1 道 output_predict ← [#6]。

## 五、难度分布

| 难度 | 数量 | 占比 | 题目 |
|------|------|------|------|
| 1★ | 4 | 18% | s4_01, s4_07, s4_12, s4_18 |
| 2★ | 11 | 50% | s4_02, s4_03, s4_04, s4_05, s4_08, s4_09, s4_13, s4_14, s4_15, s4_19 |
| 3★ | 6 | 27% | s4_06, s4_10, s4_11, s4_16, s4_17, s4_20, s4_21 |
| 4★ | 1 | 4% | s4_22 |

变化：s4_07 2★→1★，s4_20 从 2★ 计入→从 output_predict 列的 3★ 重新评估。← [#2][#4]

### 每节难度分布

| 节 | 1★ | 2★ | 3★ | 4★ | 首题难度 |
|----|----|----|----|----|---------|
| §1 | 1 | 4 | 1 | 0 | 1★ ✅ |
| §2 | 1 | 3 | 1 | 0 | 1★ ✅ ← [#2] |
| §3 | 1 | 3 | 2 | 0 | 1★ ✅ |
| §4 | 1 | 1 | 2 | 1 | 1★ ✅ |

---

## 六、智慧之书条目（4 页）← [#7] 扩展为完整模板

### 页 1：条件判断 — if 之道

| 字段 | 内容 |
|------|------|
| 标题 | 条件判断：if 之道 |
| 专业定义 | `if` 语句根据条件表达式的布尔值决定是否执行某段代码，是程序"做决策"的基本方式 |
| 语法规则 | ① `if 条件:` 冒号后缩进的代码块仅在条件为 True 时执行；② `elif` 可串联多个条件，依次检查直到第一个 True；③ `else` 捕获所有未匹配的情况 |
| 法阵演示 | `score = 85; if score >= 90: print("优秀"); elif score >= 60: print("通过"); else: print("重修")` → 输出 `通过` |
| 设计哲学 | Python 用缩进定义代码块而非花括号，强制代码可读性。Guido 的设计理念：代码被阅读的次数远多于被编写的次数 |
| 常见错误 | ① `if x = 5:` — 赋值 = 和比较 == 混淆，SyntaxError；② 忘记冒号 `if x > 0` — SyntaxError；③ `elif` 写成 `else if` — Python 不支持 |
| 诺克斯提示 | "如果你写 if x = 5，Python 会一脸问号。你是在赋值还是在比较？比较用两个等号 ==" |
| 即时验证 | `# 修改 score 的值，观察输出变化\nscore = 75\nif score >= 90:\n    print("A")\nelif score >= 60:\n    print("B")\nelse:\n    print("C")` |

### 页 2：逻辑运算 — and/or/not

| 字段 | 内容 |
|------|------|
| 标题 | 逻辑运算：组合条件 |
| 专业定义 | `and`、`or`、`not` 是 Python 的布尔逻辑运算符，用于组合多个条件表达式 |
| 语法规则 | ① `A and B` — A 和 B 都为 True 才为 True；② `A or B` — A 或 B 任意一个为 True 即为 True；③ `not A` — 取反；④ **短路求值**：`and` 遇 False 立即停止，`or` 遇 True 立即停止 |
| 法阵演示 | `x = 5; print(x > 0 and x < 10)` → `True`；`print(3 and 0 or 5)` → `5`（短路求值：3 为 Truthy，继续到 0 为 Falsy，再继续到 5 为 Truthy） |
| 设计哲学 | 短路求值不是 bug 是特性——它可以用来写简洁的默认值逻辑（`name = input_name or "匿名"`） |
| 常见错误 | ① `if x > 0 and < 10:` — 语法错误，必须写 `x > 0 and x < 10`；② 混淆 `and`/`or` 优先级 — `not` > `and` > `or`；③ 对非布尔值使用 and/or 后不理解返回值（返回对象本身而非 True/False） |
| 诺克斯提示 | "and 遇到第一个假货就收手了，or 遇到第一个真货就满足了。这叫短路，不是电路坏了。" |
| 即时验证 | `# 修改 a, b 的值，观察短路行为\na = 3\nb = 0\nprint(a and b)  # b 是 0→Falsy\nprint(a or b)   # a 是 3→Truthy，短路\nprint(not a)    # 非零为 True，取反为 False` |

### 页 3：for 循环 — 遍历之法

| 字段 | 内容 |
|------|------|
| 标题 | for 循环：遍历之法 |
| 专业定义 | `for` 循环逐个取出可迭代对象（列表、字符串、range 等）中的元素，对每个元素执行一次循环体 |
| 语法规则 | ① `for 变量 in 可迭代对象:` — 变量依次接收每个元素；② `range(n)` 生成 0 到 n-1 的整数序列；③ `range(start, end, step)` 可指定起止和步长；④ 循环内可用 `break` 提前退出，`continue` 跳过本轮 |
| 法阵演示 | `books = ["元素基础", "中级炼金", "草药图鉴"]; for b in books: print(f"整理：{b}")` → 三行输出 |
| 设计哲学 | Python 的 for 循环是对迭代器协议的统一抽象——不关心"第几个"而是关心"下一个"，比 C 风格的 `for(i=0;i<n;i++)` 更安全 |
| 常见错误 | ① 遍历列表时修改列表（增删元素）导致跳过元素或 IndexError；② `for i in range(len(list))` 写成 `for i in list` 后试图用 i 做索引；③ 忘记 range 的结束值不包含在内（`range(1,5)` → 1,2,3,4） |
| 诺克斯提示 | "range(1, 5) 给的是 1, 2, 3, 4——不包括 5。Python 数数从 0 开始，数范围也习惯'含头不含尾'。" |
| 即时验证 | `# 修改 range 的参数，观察输出\nfor i in range(1, 6):\n    if i % 2 == 0:\n        print(f"{i} 是偶数")\n    else:\n        print(f"{i} 是奇数")` |

### 页 4：while 循环 — 守卫与突破

| 字段 | 内容 |
|------|------|
| 标题 | while 循环：守卫与突破 |
| 专业定义 | `while` 循环在条件为 True 时持续执行循环体，适合"不知道要执行多少次，只知道什么时候停"的场景 |
| 语法规则 | ① `while 条件:` — 每次循环前检查条件，False 时退出；② `break` — 立即退出整个循环；③ `continue` — 跳过本轮剩余代码，回到条件检查；④ 务必确保条件最终会变为 False，否则死循环 |
| 法阵演示 | `count = 0; while count < 3: print(f"第{count+1}次"); count += 1` → 输出三次 |
| 设计哲学 | while 循环是"条件守卫"模式——你不知道要巡几次逻，只知道某些条件满足时继续巡。与 for 的"已知遍历范围"互补 |
| 常见错误 | ① 忘记更新条件变量 → 死循环；② `while True:` 中忘记 `break` → 死循环；③ 把 `while` 当 `if` 用——`while x > 0: x -= 1` 会执行多次 |
| 诺克斯提示 | "while 像一个忠诚的守卫，只要条件还成立，它就一直在门口站着。你要确保有人来换班——要么条件变成 False，要么用 break 喊停。" |
| 即时验证 | `# 修改 n 和 if 条件，观察 break/continue 的效果\nn = 0\nwhile n < 10:\n    n += 1\n    if n % 3 == 0:\n        continue  # 跳过 3 的倍数\n    if n > 7:\n        break     # 到 8 就停\n    print(n)` |

---

## 七、各题数据规范速查 ← [#3] 新增

> 生成 `stage4_questions.ts` 时逐题对照。所有字段来自《题目设计规范》附录 A。

### §1 条件判断基础

| ID | 题型 | ★ | validationMode | 核心 knowledgeTag | hint 方向 | commonErrors 方向 |
|----|------|---|---------------|-------------------|-----------|------------------|
| s4_01 | choice | 1 | — | `if语句` | if 语法：冒号+缩进 | — |
| s4_02 | code_fill | 2 | exact | `比较操作符`, `if语句` | 在 if 条件中使用比较操作符 ←[#9] | 赋值=与比较==混淆 |
| s4_03 | code_fill | 2 | exact | `if语句` | 条件为 True 时执行缩进块 | 缩进不一致 |
| s4_04 | code_fill | 2 | exact | `if-else` | else 分支的写法 | 忘记 else 后的冒号 |
| s4_05 | code_fix | 2 | exact | `if语法` | 冒号缺失或缩进错误 | 冒号、缩进、Tab/空格混用 |
| s4_06 | output_predict | 3 | — | `if-elif-else` | 追踪 if-elif-else 的执行路径 | — |

### §2 逻辑运算与嵌套

| ID | 题型 | ★ | validationMode | 核心 knowledgeTag | hint 方向 | commonErrors 方向 |
|----|------|---|---------------|-------------------|-----------|------------------|
| s4_07 | choice | 1 | — | `逻辑运算`, `and`, `or`, `not` | and/or/not 的基本语义 | — |
| s4_08 | code_fill | 2 | exact | `and`, `逻辑运算` | 用 and 组合两个条件 | 写 `x > 0 and < 10` 的语法错误 |
| s4_09 | code_fill | 2 | exact | `or`, `not`, `逻辑运算` | or 用于多选一，not 用于取反 | or/and 优先级混淆 |
| s4_10 | code_fix | 3 | exact | `嵌套if` | 嵌套 if 的缩进层级 | 嵌套层级错误、else 归属不清 |
| s4_11 | output_predict | 3 | — | `短路求值`, `逻辑运算` | 推导 `A and B or C` 的结果 | — |

### §3 for 循环

| ID | 题型 | ★ | validationMode | 核心 knowledgeTag | hint 方向 | commonErrors 方向 |
|----|------|---|---------------|-------------------|-----------|------------------|
| s4_12 | choice | 1 | — | `for循环` | for 循环的基本语法 | — |
| s4_13 | code_fill | 2 | exact | `for循环`, `列表遍历` | 用 for 遍历列表元素 | 用索引而非直接遍历元素 |
| s4_14 | code_fill | 2 | exact | `range()` | range(n) 生成 0 到 n-1 | range 结束值不包含在内 |
| s4_15 | code_fill | 2 | exact | `range()` | range(start, end) 的用法 | start/end 混淆 |
| s4_16 | output_predict | 3 | — | `for循环`, `range()` | 追踪循环的输出序列 | — |
| s4_17 | code_fix | 3 | exact | `for循环`, `循环逻辑` | 循环体中逻辑错误 | off-by-one、索引错误 |

### §4 while 循环与综合

| ID | 题型 | ★ | validationMode | 核心 knowledgeTag | hint 方向 | commonErrors 方向 |
|----|------|---|---------------|-------------------|-----------|------------------|
| s4_18 | choice | 1 | — | `while循环` | while 循环的基本语法 | — |
| s4_19 | code_fill | 2 | exact | `while循环` | 用 while 条件控制循环次数 | 忘记更新条件变量 |
| s4_20 | output_predict | 3 | — | `break`, `continue` | 追踪含 break/continue 的循环输出 | — |
| s4_21 | code_fix | 3 | exact | `while循环`, `死循环` | 修复导致死循环的条件或缺失的更新 | 条件永不变为 False、忘记递增 |
| s4_22 | free_coding | 4 | testcase | `for循环`, `条件判断`, `列表操作` | 遍历+筛选+聚合 | 见 §三 测试用例 |

---

## 八、验证标准 ← [#3] 新增

生成 `stage4_questions.ts` 后逐项验证：

### 8.1 类型与编译
- [ ] `npx vue-tsc --noEmit` 0 error
- [ ] 所有题目 `id` 格式为 `s4_XX`
- [ ] 所有题目 `chapterId: 'ch4_conditions'`（等 questions.ts 注册后确认）

### 8.2 答题流
- [ ] 22 道题全部能在 QuizPanel 中正常加载
- [ ] choice/output_predict：4 选项正确渲染
- [ ] code_fill/fix：CodeMirror 初始代码正确显示
- [ ] 正确答案 → 魔力共鸣反馈
- [ ] 错误答案 → 面板显示 diff/error
- [ ] 每道题的 validationMode 行为符合预期
- [ ] 4 节线性解锁：完成 §1→解锁 §2→...→完成全部→ch5 解锁

### 8.3 判题
- [ ] 空格变体（首尾空格、多余空格）→ exact 模式下 FAIL
- [ ] 大小写变体（输出大小写不同）→ exact 模式下 FAIL
- [ ] 等价实现（不同但正确的代码）→ 能正确判定 PASS 或 FAIL
- [ ] 错误代码 → FAIL + 有意义的错误消息

### 8.4 变体（code_fill/fix 每道题至少验证 3 种变体）
- [ ] 完全正确代码 → PASS
- [ ] 语法错误代码 → FAIL + Python 错误翻译
- [ ] 逻辑正确但输出格式不对 → FAIL + diff

### 8.5 E2E
- [ ] `scenario_ch4.spec.ts` 能跑通完整 4 节流程
- [ ] s4_22 free_coding 的 6 个 testCases 在 E2E 中自动验证

### 8.6 数据完整性
- [ ] 22 个 ID 全局唯一（不与 ch1/ch2/ch3/backup 重复）
- [ ] 所有 knowledgeTags 都能在 backup_questions.ts 中找到匹配的备用题
- [ ] 所有 3 层 hint（hint/hintRoleplay/hintDirect）非空
- [ ] 所有 commonErrors 的 pattern 能在实际错误代码中匹配到

### 8.7 智慧之书
- [ ] wisdom.ts 中 ch4 的 4 个条目都能正常显示
- [ ] 法阵演示代码可运行并显示正确输出
- [ ] 即时验证沙盒可编辑并运行

---

## 九、新增/调整题速查 ← [#10] 新增

| 题目 | 变更 | 原因 |
|------|------|------|
| s4_07 | 2★→1★ | [#2] §2 缺少 1★ warm-up |
| s4_11 | choice→output_predict | [#5] 短路求值适合行为级考察 |
| s4_20 | code_fill→output_predict | [#4] break/continue 考察执行路径理解 |
| s4_22 | 测试用例 5→6 个 | [#8] 增加顺序稳定性验证 |
| s4_02 | 描述加"在 if 条件中应用"限定 | [#9] 区分 ch1 已学的比较操作符 |

---

*制定：2026-06-24 | 更新：2026-06-24（审查反馈 10 条全部写入）*
*下一步：确认后生成 `stage4_questions.ts`*