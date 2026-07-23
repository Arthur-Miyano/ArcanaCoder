/**
 * 题库审计 worker：在子进程中加载 pyodide，批量执行 Python 代码片段。
 * 用法: node scripts/audit_worker.mjs <jobs.json> [perJobTimeoutMs]
 * jobs.json: [{ idx, code, stdin }]
 * 输出: 每行一个 JSON { idx, out, err }（JSONL，逐条 flush）
 *
 * 防死循环：pyodide.setInterruptBuffer + worker_thread 看门狗，
 * 超时向执行线程发 KeyboardInterrupt，单个任务卡死不会拖垮整个 worker。
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Worker } from 'node:worker_threads'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jobs = JSON.parse(readFileSync(process.argv[2], 'utf-8'))
const PER_JOB_TIMEOUT = parseInt(process.argv[3] ?? '8000', 10)

const { loadPyodide } = await import('pyodide')
const pyodide = await loadPyodide({
  indexURL: path.join(root, 'node_modules', 'pyodide'),
})

const sab = new SharedArrayBuffer(4)
const iv = new Int32Array(sab)
pyodide.setInterruptBuffer(iv)

pyodide.runPython(`
import io, sys, json, traceback, contextlib, ast

async def __audit_run(code, stdin_text):
    out = io.StringIO()
    err = ''
    old_stdin = sys.stdin
    sys.stdin = io.StringIO(stdin_text)
    g = {'__name__': '__main__'}
    try:
        with contextlib.redirect_stdout(out):
            # PyCF_ALLOW_TOP_LEVEL_AWAIT: 支持顶层 await（游戏 runPythonAsync 同样支持）
            co = compile(code, '<question>', 'exec', flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
            result = eval(co, g)
            if result is not None:
                await result
    except KeyboardInterrupt:
        err = 'KeyboardInterrupt: 执行超时（疑似死循环）'
    except BaseException:
        err = traceback.format_exc(limit=2)
    finally:
        sys.stdin = old_stdin
    return json.dumps({'out': out.getvalue(), 'err': err})
`)

for (const job of jobs) {
  let result
  iv[0] = 0
  const watchdog = new Worker(
    `const { workerData } = require('worker_threads')
     const iv = new Int32Array(workerData.sab)
     Atomics.wait(iv, 0, 0, workerData.ms)
     Atomics.store(iv, 0, 2)`,
    { eval: true, workerData: { sab, ms: PER_JOB_TIMEOUT } },
  )
  try {
    pyodide.globals.set('__c', job.code)
    pyodide.globals.set('__i', job.stdin ?? '')
    const raw = await pyodide.runPythonAsync('__audit_run(__c, __i)')
    result = { idx: job.idx, ...JSON.parse(raw) }
  } catch (e) {
    const msg = String(e)
    result = {
      idx: job.idx,
      out: '',
      err: msg.includes('KeyboardInterrupt')
        ? 'KeyboardInterrupt: 执行超时（疑似死循环）'
        : `JS-level error: ${msg.slice(0, 300)}`,
    }
  } finally {
    iv[0] = 0
    await watchdog.terminate()
  }
  process.stdout.write(JSON.stringify(result) + '\n')
}
