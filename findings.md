# Findings & Decisions

## Requirements
- Vue 3 + Vite + TypeScript 前端
- Pyodide 在浏览器内运行 Python
- 5 种题型：choice / code_fill / code_fix / output_predict / free_coding
- 有关卡选择界面
- Pyodide 加载显示进度条
- 自由编程判题用 testCases 精确对比输出
- IndexedDB 持久化（idb 库）
- Phase 1 完成即部署 GitHub Pages

## Research Findings
- Pyodide v0.26+ 支持通过 CDN 加载，提供 loadPyodide({ indexURL }) 接口
- Pyodide 的 registerJsModule 可以注入回调函数用于捕获 print 输出
- idb 库对 IndexedDB 封装简洁，支持类型安全的 Schema 定义
- CodeMirror 6 通过 vue-codemirror 包集成，支持 python 语法高亮
- Tailwind CSS v3 通过 PostCSS 插件集成到 Vite 项目

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| 自由编程判题用 testCases | 精确对比输出，比关键词匹配严格 |
| 经验公式：每题固定经验，答错 1/3 | 鼓励尝试 |
| Pyodide CDN 而非 npm 包 | WASM 不宜打包，CDN 有缓存优势 |
| 不用 vue-router | Phase 1 页面数少，viewState 足够 |

## Issues Encountered
| Issue | Resolution |
|-------|------------|

## Resources
- Pyodide docs: https://pyodide.org/en/stable/usage/loading-custom-python-code.html
- vue-codemirror: https://github.com/surmon-china/vue-codemirror
- idb: https://github.com/jakearchibald/idb
- Tailwind CSS Vite: https://tailwindcss.com/docs/guides/vite

