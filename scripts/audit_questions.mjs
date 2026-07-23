/**
 * 题库深度审计脚本
 * 用法: node scripts/audit_questions.mjs [--workers N] [--timeout ms]
 *
 * 1. 结构校验：id 唯一、correctOption 范围、options 重复/空串、explanation、knowledgeTags、章节引用
 * 2. 语义校验：用 pyodide 实际执行 initialCode / correctCode
 *    - output_predict: 执行 initialCode，对比 options[correctOption]（选项文本先做展示惯例归一化）
 *    - code_fill/code_fix: 按游戏判题逻辑（gradeCode: trim + exact/contains）校验 correctCode 与 initialCode
 *    - free_coding: 按游戏判题逻辑（gradeFreeCoding: correctCode + "\nprint(" + input + ")"）跑 testCases
 * 3. 近似重复检测：description / correctCode 完全相同的不同题目
 * 4. 输出 docs/reviews/题库审计报告.md + 控制台摘要
 *
 * 只读脚本，不修改 src/ 下任何文件。
 */
import { execFile } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import esbuild from 'esbuild'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const argVal = (name, dflt) => {
  const i = argv.indexOf(name)
  return i >= 0 ? argv[i + 1] : dflt
}
const WORKERS = Math.max(1, Math.min(8, parseInt(argVal('--workers', '6'), 10) || 6))
const WORKER_TIMEOUT = parseInt(argVal('--timeout', String(12 * 60 * 1000)), 10)

// ---------- Step 0: 用 esbuild 打包题库数据（数据文件是 TS + @/ 别名） ----------
const tmpDir = path.join(root, 'scripts', '.audit_tmp')
rmSync(tmpDir, { recursive: true, force: true })
mkdirSync(tmpDir, { recursive: true })

const bundleFile = path.join(tmpDir, 'bundle.mjs')
await esbuild.build({
  stdin: {
    contents: `
      export { questions, chapters } from './src/data/questions'
      export { backupQuestions } from './src/data/backup_questions'
      export { compareOutput } from './src/utils/diff'
    `,
    resolveDir: root,
    loader: 'ts',
  },
  alias: { '@': path.join(root, 'src') },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: bundleFile,
  logLevel: 'silent',
})
const { questions, chapters, backupQuestions, compareOutput } = await import(pathToFileURL(bundleFile).href)

const errors = []   // { id, msg }
const warnings = [] // { id, msg }
const infos = []    // { id, msg }
const E = (id, msg) => errors.push({ id, msg })
const W = (id, msg) => warnings.push({ id, msg })
const I = (id, msg) => infos.push({ id, msg })

const all = [
  ...questions.map((q) => ({ q, src: 'stage' })),
  ...backupQuestions.map((q) => ({ q, src: 'backup' })),
]
console.log(`加载题目: stage ${questions.length} 题, backup ${backupQuestions.length} 题, 共 ${all.length} 题`)
console.log(`章节数: ${chapters.length}`)

// ---------- 结构校验 ----------
// 1) id 唯一
const idMap = new Map()
for (const { q, src } of all) {
  if (idMap.has(q.id)) E(q.id, `id 重复（${idMap.get(q.id)} 与 ${src} 题库）`)
  else idMap.set(q.id, src)
}

// 2) choice / output_predict 选项
const emptyOptPending = [] // 空字符串选项，留待语义阶段判定
for (const { q } of all) {
  if (q.type !== 'choice' && q.type !== 'output_predict') continue
  if (!Array.isArray(q.options) || q.options.length === 0) {
    E(q.id, `${q.type} 缺少 options`)
    continue
  }
  if (q.correctOption === undefined || q.correctOption === null) {
    E(q.id, `${q.type} 缺少 correctOption`)
  } else if (q.correctOption < 0 || q.correctOption >= q.options.length) {
    E(q.id, `correctOption=${q.correctOption} 越界（options 长度 ${q.options.length}）`)
  }
  const seen = new Set()
  q.options.forEach((opt, i) => {
    const t = (opt ?? '').trim()
    if (t === '') {
      emptyOptPending.push({ q, index: i })
    } else if (seen.has(t)) {
      W(q.id, `options[${i}] 与其他选项重复："${t.slice(0, 40)}"`)
    }
    seen.add(t)
  })
}

// 3) explanation / knowledgeTags / difficulty
for (const { q } of all) {
  if (!q.explanation) E(q.id, '缺少 explanation')
  else if (q.explanation.trim().length <= 10) W(q.id, `explanation 过短（${q.explanation.trim().length} 字符）`)
  if (!Array.isArray(q.knowledgeTags) || q.knowledgeTags.length === 0) W(q.id, 'knowledgeTags 为空')
  if (!q.difficulty || q.difficulty < 1 || q.difficulty > 5) W(q.id, `difficulty 异常：${q.difficulty}`)
}

// 4) 章节 questionIds 引用
const stageIds = new Set(questions.map((q) => q.id))
const referenced = new Set()
for (const ch of chapters) {
  for (const sec of ch.sections) {
    for (const qid of sec.questionIds) {
      if (!stageIds.has(qid)) E(qid, `章节 ${ch.id}/${sec.id} 引用了不存在的题目 id`)
      else referenced.add(qid)
    }
  }
}
for (const q of questions) {
  if (!referenced.has(q.id)) I(q.id, '题目未被任何章节 section 引用')
}

// ---------- 近似重复检测（description 太短的是通用模板，跳过） ----------
const byDesc = new Map()
const byCode = new Map()
for (const { q, src } of all) {
  const d = (q.description ?? '').trim()
  if (d.length >= 15) {
    const prev = byDesc.get(d)
    if (prev) {
      const cross = prev.src !== src || src === 'backup'
      ;(cross ? I : W)(q.id, `description 与 ${prev.id}（${prev.src}）完全相同${cross ? '（跨题库，可能为备份设计）' : ''}`)
    } else byDesc.set(d, { id: q.id, src })
  }
  const c = (q.correctCode ?? '').trim()
  if (c) {
    const prev = byCode.get(c)
    if (prev) {
      const cross = prev.src !== src || src === 'backup'
      ;(cross ? I : W)(q.id, `correctCode 与 ${prev.id}（${prev.src}）完全相同${cross ? '（跨题库，可能为备份设计）' : ''}`)
    } else byCode.set(c, { id: q.id, src })
  }
}

// ---------- 判题语义（与 src/utils/grade.ts 对齐） ----------
// gradeCode: trim 后 exact(===) 或 contains(includes)
const gameCompare = (output, expected, mode) => {
  const u = (output ?? '').trim()
  const e = (expected ?? '').trim()
  return mode === 'contains' ? u.includes(e) : u === e
}
// output_predict 选项文本的展示惯例归一化：字面 \n、整行加引号
const PASS_TYPES = new Set(['exact', 'case', 'whitespace', 'format'])
const looseMatch = (actual, expected) => PASS_TYPES.has(compareOutput(actual, expected).matchType)
function optionVariants(text) {
  const unescape = (s) => s.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
  const unquote = (s) => s.split('\n').map((line) => {
    const t = line.trim()
    const m = t.match(/^"([\s\S]*)"$|^'([\s\S]*)'$/)
    return m ? (m[1] ?? m[2] ?? '') : line
  }).join('\n')
  const set = new Set()
  for (const base of [text, unescape(text)]) {
    set.add(base)
    set.add(unquote(base))
  }
  return [...set]
}
const ERR_OPTION_RE = /报错|错误|异常|Error|SyntaxError|Traceback/
const isAsyncEnvErr = (err) => err.includes('running event loop')
const isEofInput = (err, code) => err.includes('EOFError') && /\binput\s*\(/.test(code)
const errTail = (err) => err.trim().split('\n').pop()

// ---------- 语义校验：构造执行任务 ----------
const jobs = []
const jobIdx = new Map() // key -> idx
const addJob = (code, stdin = '') => {
  const key = code + '' + stdin
  if (jobIdx.has(key)) return jobIdx.get(key)
  const idx = jobs.length
  jobs.push({ idx, code, stdin })
  jobIdx.set(key, idx)
  return idx
}

const plans = []
for (const { q, src } of all) {
  if (q.type === 'output_predict') {
    if (!q.initialCode) { W(q.id, 'output_predict 缺少 initialCode，无法执行校验'); continue }
    plans.push({ q, src, kind: 'predict', run: addJob(q.initialCode) })
  } else if (q.type === 'code_fill' || q.type === 'code_fix') {
    if (!q.correctCode) { W(q.id, `${q.type} 缺少 correctCode，无法执行校验`); continue }
    const plan = { q, src, kind: q.type, correct: addJob(q.correctCode) }
    if (q.initialCode !== undefined && q.initialCode !== null) plan.initial = addJob(q.initialCode)
    plan.identical = (q.correctCode ?? '').trim() === (q.initialCode ?? '').trim()
    if (plan.identical) {
      W(q.id, `${q.type}: correctCode 与 initialCode 完全相同（演示型题目？玩家无需修改即可通过）`)
    }
    if (q.validationMode === 'contains' && !(q.expectedOutput ?? '').trim()) {
      W(q.id, 'validationMode=contains 且 expectedOutput 为空：任何不报错的代码都能通过，判题约束弱')
    }
    plans.push(plan)
  } else if (q.type === 'free_coding') {
    if (!q.correctCode) { W(q.id, 'free_coding 缺少 correctCode，跳过执行校验'); continue }
    const tcs = Array.isArray(q.testCases) ? q.testCases : []
    if (tcs.length === 0) {
      if (q.id === 's8_20') I(q.id, 'free_coding 无 testCases（已知有意设计）')
      else W(q.id, 'free_coding 缺少 testCases')
      continue
    }
    // 游戏判题 harness: fullCode = correctCode + "\nprint(" + test.input + ")"
    plans.push({
      q, src, kind: 'free_coding',
      cases: tcs.map((tc, i) => ({
        i,
        expr: tc.input,
        expected: tc.expected,
        run: addJob(`${q.correctCode}\nprint(${tc.input})`),
      })),
    })
  }
}
console.log(`语义执行任务: ${jobs.length} 个（去重后），分 ${WORKERS} 个 worker 并发执行`)

// ---------- 分片并启动 worker ----------
const chunks = Array.from({ length: WORKERS }, () => [])
jobs.forEach((j, i) => chunks[i % WORKERS].push(j))
const results = new Map()

const runWorker = (chunk, wid) => new Promise((resolve) => {
  if (chunk.length === 0) return resolve()
  const file = path.join(tmpDir, `jobs_${wid}.json`)
  writeFileSync(file, JSON.stringify(chunk))
  execFile(
    process.execPath,
    [path.join(root, 'scripts', 'audit_worker.mjs'), file],
    { timeout: WORKER_TIMEOUT, maxBuffer: 64 * 1024 * 1024, killSignal: 'SIGKILL' },
    (err, stdout) => {
      let done = 0
      for (const line of stdout.split('\n')) {
        if (!line.trim()) continue
        try {
          const r = JSON.parse(line)
          results.set(r.idx, r)
          done++
        } catch { /* ignore */ }
      }
      if (done < chunk.length) {
        W('(audit)', `worker ${wid} 超时/异常退出，${chunk.length - done} 个执行任务未完成（已跳过）`)
      }
      console.log(`  worker ${wid}: ${done}/${chunk.length} 完成`)
      resolve()
    },
  )
})

const t0 = Date.now()
await Promise.all(chunks.map((c, i) => runWorker(c, i)))
console.log(`执行完成: ${results.size}/${jobs.length}，耗时 ${((Date.now() - t0) / 1000).toFixed(1)}s`)

// ---------- 语义结果评估 ----------
const getOut = (idx) => results.get(idx)

for (const plan of plans) {
  const { q, src } = plan
  const stageTag = src === 'stage' ? '' : '（backup 题库）'

  if (plan.kind === 'predict') {
    const r = getOut(plan.run)
    if (!r) { W(q.id, '执行超时，未校验'); continue }
    const opt = (q.options ?? [])[q.correctOption] ?? ''
    if (r.err) {
      if (ERR_OPTION_RE.test(opt)) {
        I(q.id, `initialCode 按预期报错，正确选项为「${opt.slice(0, 30)}」`)
      } else if (isAsyncEnvErr(r.err)) {
        W(q.id, `initialCode 含 asyncio.run()，审计环境（pyodide 事件循环限制）无法执行，答案未实际验证；游戏中该题型不执行代码、不影响判定`)
      } else {
        E(q.id, `initialCode 执行报错，但正确选项 "${opt.slice(0, 40)}" 不是报错类。错误：${errTail(r.err)}`)
      }
      continue
    }
    // 归一化后匹配正确选项 → 通过
    const correctVariants = optionVariants(opt)
    if (correctVariants.some((v) => looseMatch(r.out, v))) {
      if (!looseMatch(r.out, opt)) I(q.id, `选项文本使用展示惯例（引号/字面 \\n），归一化后与实际输出一致`)
      continue
    }
    // 检查是否匹配其他选项 → 答案标错
    let alt = -1
    for (let i = 0; i < (q.options ?? []).length; i++) {
      if (i === q.correctOption) continue
      if (optionVariants(q.options[i]).some((v) => looseMatch(r.out, v))) { alt = i; break }
    }
    if (alt >= 0) {
      E(q.id, `答案疑似标错：实际输出 ${JSON.stringify(r.out)} 匹配 options[${alt}]="${q.options[alt]}"，而非 options[${q.correctOption}]="${opt}"`)
    } else if (ERR_OPTION_RE.test(opt)) {
      E(q.id, `initialCode 正常执行（输出 ${JSON.stringify(r.out)}），但正确选项声称「报错」`)
    } else {
      E(q.id, `实际输出 ${JSON.stringify(r.out)} 与所有选项均不匹配（标记正确项为 "${opt.slice(0, 40)}"）`)
    }
    continue
  }

  if (plan.kind === 'code_fill' || plan.kind === 'code_fix') {
    const rc = getOut(plan.correct)
    if (!rc) { W(q.id, 'correctCode 执行超时，未校验'); continue }
    const expected = q.expectedOutput
    const hasExpected = expected !== undefined && expected !== null && expected !== ''

    if (rc.err) {
      if (isEofInput(rc.err, q.correctCode)) {
        const msg = `correctCode 调用 input()，游戏运行环境（pyodide 无 stdin）会 EOFError，玩家无法通过判题`
        if (src === 'stage') E(q.id, msg)
        else W(q.id, msg + stageTag)
      } else if (isAsyncEnvErr(rc.err)) {
        W(q.id, 'correctCode 含 asyncio.run()，审计环境无法执行验证（pyodide 事件循环限制）')
      } else {
        E(q.id, `correctCode 执行报错（游戏判题会判错）：${errTail(rc.err)}`)
      }
    } else if (hasExpected && !gameCompare(rc.out, expected, q.validationMode)) {
      E(q.id, `correctCode 输出 ${JSON.stringify(rc.out)} 与 expectedOutput ${JSON.stringify(expected)} 不符（游戏判题语义）`)
    }

    if (plan.initial !== undefined) {
      const ri = getOut(plan.initial)
      if (ri && !ri.err) {
        // 游戏判题: 有 expectedOutput 比对之；否则比对 correctCode 输出
        const pass = hasExpected
          ? gameCompare(ri.out, expected, q.validationMode)
          : !rc.err && gameCompare(ri.out, rc.out, q.validationMode)
        if (pass) {
          const weakContains = q.validationMode === 'contains' && !(expected ?? '').trim()
          if (!plan.identical && !weakContains) {
            E(q.id, `initialCode 不修改即可通过判题（输出已满足要求），题目无效`)
          } else if (!plan.identical && weakContains) {
            I(q.id, 'initialCode 不修改即可通过（contains 空串判题的必然结果，见对应警告）')
          }
          // identical 的情况已在静态阶段按演示题警告
        } else {
          I(q.id, `initialCode 可执行但按游戏判题不能通过（符合题目设计）`)
        }
      }
    }
    continue
  }

  if (plan.kind === 'free_coding') {
    let fail = 0
    for (const c of plan.cases) {
      const r = getOut(c.run)
      if (!r) { W(q.id, `testCases[${c.i}] 执行超时，未校验`); continue }
      if (r.err) {
        E(q.id, `correctCode 在 testCases[${c.i}]（print(${c.expr.slice(0, 50)})）执行报错：${errTail(r.err)}`)
        fail++
      } else if (r.out.trim() !== c.expected) {
        E(q.id, `correctCode 在 testCases[${c.i}] 输出 ${JSON.stringify(r.out.trim())} 与期望 ${JSON.stringify(c.expected)} 不符`)
        fail++
      }
    }
    if (fail === 0) I(q.id, `correctCode 通过全部 ${plan.cases.length} 个 testCases（游戏判题 harness）`)
  }
}

// 空字符串选项的语义判定
for (const { q, index } of emptyOptPending) {
  const plan = plans.find((p) => p.q === q && p.kind === 'predict')
  const r = plan ? getOut(plan.run) : null
  if (r && !r.err && r.out.trim() === '' && q.correctOption === index) {
    I(q.id, `options[${index}] 为空字符串，语义合理（程序无输出）`)
  } else {
    W(q.id, `options[${index}] 为空字符串，需人工确认语义`)
  }
}

// ---------- 汇总输出 ----------
console.log('\n' + '='.repeat(60))
console.log('审计结果')
console.log('='.repeat(60))
console.log(`错误: ${errors.length}  警告: ${warnings.length}  信息: ${infos.length}`)
const dump = (title, list, mark) => {
  if (!list.length) return
  console.log(`\n--- ${title} ---`)
  for (const { id, msg } of list) console.log(`  ${mark} ${id}: ${msg}`)
}
dump('错误', errors, '❌')
dump('警告', warnings, '⚠️')

// ---------- 写报告 ----------
const byType = {}
for (const { q } of all) byType[q.type] = (byType[q.type] ?? 0) + 1
const lines = []
lines.push('# 题库审计报告')
lines.push('')
lines.push(`- 生成时间: ${new Date().toISOString()}`)
lines.push(`- 题目总数: ${all.length}（stage ${questions.length} + backup ${backupQuestions.length}）`)
lines.push(`- 类型分布: ${Object.entries(byType).map(([k, v]) => `${k} ${v}`).join(', ')}`)
lines.push(`- 语义执行: ${results.size}/${jobs.length} 个执行任务完成（pyodide ${WORKERS} worker 并发）`)
lines.push(`- **错误 ${errors.length} / 警告 ${warnings.length} / 信息 ${infos.length}**`)
lines.push('')
const section = (title, list, empty) => {
  lines.push(`## ${title}（${list.length}）`)
  lines.push('')
  if (!list.length) lines.push(empty)
  for (const { id, msg } of list) lines.push(`- \`${id}\` — ${msg}`)
  lines.push('')
}
section('错误（答案标错 / 执行不符 / 结构完整性问题）', errors, '无 ✅')
section('警告（小瑕疵，建议人工确认）', warnings, '无 ✅')
section('信息（统计与说明）', infos, '无')
lines.push('## 审计方法')
lines.push('')
lines.push('- 数据加载: esbuild 打包 `src/data/questions.ts` + `backup_questions.ts` + `src/utils/diff.ts`（只读，不修改源码）')
lines.push('- 判题语义与游戏一致（`src/utils/grade.ts`）:')
lines.push('  - code_fill/code_fix: trim 后 exact(===) / contains(includes) 对比 expectedOutput；无 expectedOutput 时对比 correctCode 输出')
lines.push('  - free_coding: 执行 `correctCode + "\\nprint(" + testCase.input + ")"`，trim 后精确对比 expected')
lines.push('  - output_predict: 游戏只做选项索引判定；审计额外执行 initialCode 验证正确选项是否与实际输出一致（选项文本先做引号/字面 \\n 展示惯例归一化）')
lines.push('- 执行环境: pyodide（node_modules/pyodide 本地加载），隔离 globals + StringIO stdin/stdout；asyncio.run 受 pyodide 事件循环限制无法验证，已单独标注')
lines.push('')

const reportPath = path.join(root, 'docs', 'reviews', '题库审计报告.md')
mkdirSync(path.dirname(reportPath), { recursive: true })
writeFileSync(reportPath, lines.join('\n'), 'utf-8')
console.log(`\n报告已写入: ${path.relative(root, reportPath)}`)

rmSync(tmpDir, { recursive: true, force: true })
process.exit(errors.length > 0 ? 1 : 0)
