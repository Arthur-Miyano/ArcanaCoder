import { ref } from 'vue'
import { runPython } from '@/services/pyodide'

export interface PythonRunnerResult {
  output: string | null
  error: string | null
}

/**
 * 封装 Python 代码运行的 composable。
 *
 * 提供统一的状态管理：output、error、running，
 * 避免各组件中重复编写 try/catch 和 loading 状态。
 */
export function usePythonRunner() {
  const output = ref<string | null>(null)
  const error = ref<string | null>(null)
  const running = ref(false)

  async function run(code: string): Promise<PythonRunnerResult> {
    running.value = true
    error.value = null
    output.value = null

    try {
      const result = await runPython(code)
      error.value = result.error ?? null
      output.value = result.output ?? null
      return { output: output.value, error: error.value }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      error.value = message
      output.value = null
      return { output: null, error: message }
    } finally {
      running.value = false
    }
  }

  function reset() {
    output.value = null
    error.value = null
    running.value = false
  }

  return {
    output,
    error,
    running,
    run,
    reset,
  }
}
