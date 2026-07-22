import type { PyodideInterface } from 'pyodide'

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.27.4/full/'

const PYODIDE_BASE = import.meta.env.DEV ? '/ArcanaCoder/pyodide/' : PYODIDE_CDN

let pyodideInstance: PyodideInterface | null = null
let ready = false

type ProgressCallback = (progress: number) => void
type LoadPyodideFn = (options?: Record<string, unknown>) => Promise<PyodideInterface>

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`加载 Pyodide 脚本失败: ${src}`))
    document.head.appendChild(script)
  })
}

export async function initPyodide(
  onProgress?: ProgressCallback,
): Promise<PyodideInterface> {
  if (ready && pyodideInstance) return pyodideInstance

  onProgress?.(5)

  await loadScript(`${PYODIDE_BASE}pyodide.js`)

  onProgress?.(30)

  const loadPyodideFn = (window as any).loadPyodide as LoadPyodideFn
  if (!loadPyodideFn) {
    throw new Error('Pyodide 加载函数不可用')
  }

  pyodideInstance = await loadPyodideFn({
    indexURL: PYODIDE_BASE,
  })

  onProgress?.(60)

  pyodideInstance.setStdout({ batched: () => {} })

  onProgress?.(80)

  await pyodideInstance.loadPackage(['micropip'])

  onProgress?.(95)

  ready = true
  onProgress?.(100)
  return pyodideInstance
}

export function isReady(): boolean {
  return ready
}

export async function runPython(
  code: string,
  timeoutMs = 10_000,
): Promise<{ output: string; error: string | null }> {
  if (!pyodideInstance || !ready) {
    return { output: '', error: 'Pyodide 尚未加载完成' }
  }

  const localBuffer: string[] = []
  pyodideInstance.setStdout({
    batched: (text: string) => { localBuffer.push(text) },
  })

  let localTimeoutId: ReturnType<typeof setTimeout> | null = null
  const timeoutPromise = new Promise<never>((_, reject) => {
    localTimeoutId = setTimeout(
      () => reject(new Error(`代码执行超时（超过 ${timeoutMs / 1000} 秒）`)),
      timeoutMs,
    )
  })

  try {
    await Promise.race([
      pyodideInstance.runPythonAsync(code),
      timeoutPromise,
    ])

    const output = localBuffer.join('\n')
    return { output, error: null }
  } catch (err: unknown) {
    let errorMsg: string
    if (err instanceof pyodideInstance.ffi.PythonError) {
      errorMsg = err.message
    } else if (err instanceof Error) {
      errorMsg = err.message
    } else {
      errorMsg = String(err)
    }
    return { output: '', error: errorMsg }
  } finally {
    if (localTimeoutId) clearTimeout(localTimeoutId)
  }
}
