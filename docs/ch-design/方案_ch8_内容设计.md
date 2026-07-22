# ch8 内容设计：类型注解、dataclass 与上下文管理器

---

## 一、为什么学这些

| 知识点 | 为什么必须学 | 不学的后果 |
|--------|------------|-----------|
| 类型注解 | 现代 Python 项目的标配，IDE 类型提示和静态检查的基础 | 看不懂别人代码里的 `-> str`，无法使用 mypy/pyright |
| dataclass | 90% 的类只是存数据——dataclass 自动生成 `__init__`/`__repr__`/`__eq__` | 手写大量模板代码，容易出错 |
| 上下文管理器 | `with open()` 是最常用的 Python 模式——理解它才能自定义 | 不知道 `with` 为什么能自动关闭文件 |

**最终效果**：学习者能读懂带类型注解的代码，能用 dataclass 快速定义数据类，能理解 `with` 语句的工作原理。

---

## 二、知识结构（20 题，4 节 × 5 题）

```
第 8 关：类型注解、dataclass 与上下文管理器（20 题）
│
├── 第 1 节：类型注解基础（5 题）
│   变量注解、函数返回类型、类型提示的作用
│   s8_01 choice      — 类型注解语法（1★）
│   s8_02 code_fill   — 变量类型注解（2★）
│   s8_03 code_fill   — 函数返回类型（2★）
│   s8_04 code_fill   — 参数类型注解（2★）
│   s8_05 code_fix    — 修复注解（2★）
│
├── 第 2 节：类型进阶（5 题）
│   可选类型、List/Dict 泛型、联合类型
│   s8_06 choice      — Optional vs None（2★）
│   s8_07 code_fill   — List[int] 泛型（2★）
│   s8_08 code_fill   — Dict[str, int]（2★）
│   s8_09 code_fix    — 类型修复（3★）
│   s8_10 output_predict — 注解不影响运行（3★）
│
├── 第 3 节：dataclass（5 题）
│   @dataclass 装饰器、自动生成的方法
│   s8_11 choice      — dataclass 语法（1★）
│   s8_12 code_fill   — 定义 dataclass（2★）
│   s8_13 code_fill   — 默认值（2★）
│   s8_14 code_fix    — 修复 dataclass（3★）
│   s8_15 output_predict — __repr__ 自动生成（2★）
│
└── 第 4 节：上下文管理器（5 题）
    with 语句、\_\_enter\_\_/\_\_exit\_\_
    s8_16 choice      — with 语法（1★）
    s8_17 code_fill   — with open（2★）
    s8_18 code_fill   — 自定义上下文管理器（3★）
    s8_19 code_fix    — 上下文修复（3★）
    s8_20 free_coding — 综合：带类型注解的 dataclass（4★）
```

---

## 三、题型配比

| 节 | choice | code_fill | output_predict | code_fix | free_coding |
|----|--------|-----------|---------------|----------|-------------|
| 1 类型基础 | s8_01 | s8_02, s8_03, s8_04 | — | s8_05 | — |
| 2 类型进阶 | s8_06 | s8_07, s8_08 | s8_10 | s8_09 | — |
| 3 dataclass | s8_11 | s8_12, s8_13 | s8_15 | s8_14 | — |
| 4 上下文 | s8_16 | s8_17, s8_18 | — | s8_19 | s8_20 |
| **合计** | **4** | **10** | **2** | **3** | **1** |

---

继续数据生成？还是要讨论方案？
