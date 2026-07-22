# ch9 内容设计：pytest、logging 与 ruff 规范

---

## 一、为什么学这些

| 知识点 | 为什么必须学 | 不学的后果 |
|--------|------------|-----------|
| pytest | 最主流的 Python 测试框架，写代码必写测试 | 无法验证代码正确性，靠肉眼 debug |
| logging | 替代 print 的日志系统，生产环境唯一可用的调试手段 | 生产环境出问题只能用 print，看不到历史 |
| ruff | 现代 Python 的标配 linter/formatter，统一团队风格 | 代码风格不一致，低质量 review |

---

## 二、知识结构（18 题，4 节 × 4-5 题）

```
第 9 关：pytest、logging 与 ruff 规范（18 题）
│
├── 第 1 节：pytest 基础（5 题）
│   assert、测试函数、fixture 概念
│   s9_01 choice      — assert 与测试函数（2★）
│   s9_02 choice      — 测试函数命名规则（1★）
│   s9_03 choice      — pytest 断言写法（2★）
│   s9_04 choice      — 测试失败信息（2★）
│   s9_05 choice      — fixture 概念（2★）——概念题，Pyodide 未验证 pytest 兼容性
│
├── 第 2 节：logging（5 题）
│   日志级别、基本配置、logger 使用
│   s9_06 choice      — 日志级别（1★）
│   s9_07 code_fill   — logging.basicConfig（2★）
│   s9_08 code_fill   — logger.info/warning（2★）
│   s9_09 choice      — 不同级别的输出（2★）
│   s9_10 choice      — 日志修复（2★）——改为 choice，Pyodide 的 logging 行为可能差异
│
├── 第 3 节：logging 进阶（4 题）
│   文件日志、格式化、logger 层次
│   s9_11 choice      — 日志格式（2★）
│   s9_12 choice      — 文件日志（2★）——文件操作在 Pyodide 中限制
│   s9_13 choice      — logger 命名规范（2★）
│   s9_14 choice      — 多处理器修复（2★）——概念题，文件处理器受限
│
└── 第 4 节：ruff 与代码规范（4 题）
    ruff 规则、命名规范、代码风格
    s9_15 choice      — ruff 是什么（1★）
    s9_16 choice      — 命名规范 PEP 8（2★）
    s9_17 choice      — 修复不符合 ruff 规则的代码（1★）
    s9_18 choice      — 代码风格（1★）
```

**注意**：pytest fixture 和 ruff 是概念题（Pyodide 无法运行 Rust 工具）。choice 占比 50%。

---

## 三、题型配比

| 节 | choice | code_fill | code_fix |
|----|--------|-----------|----------|
| 1 pytest | s9_01, s9_02, s9_03, s9_04, s9_05 | — | — |
| 2 logging | s9_06, s9_09, s9_10 | s9_07, s9_08 | — |
| 3 logging 进阶 | s9_11, s9_12, s9_13, s9_14 | — | — |
| 4 ruff | s9_15, s9_16, s9_17, s9_18 | — | — |
| **合计** | **16** | **2** | **0** |

choice 89% / code_fill 11%（符合高阶章节 choice ≥ 70% 要求）
