import type { PyodideInterface } from 'pyodide'

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.27.4/full/'

let pyodideInstance: PyodideInterface | null = null
let ready = false
let stdoutBuffer: string[] = []
let timeoutId: ReturnType<typeof setTimeout> | null = null

type ProgressCallback = (progress: number) => void
type LoadPyodideFn = (options?: any) => Promise<PyodideInterface>

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

  await loadScript(`${PYODIDE_CDN}pyodide.js`)

  onProgress?.(30)

  const loadPyodideFn = (window as any).loadPyodide as LoadPyodideFn
  if (!loadPyodideFn) {
    throw new Error('Pyodide 加载函数不可用')
  }

  pyodideInstance = await loadPyodideFn({
    indexURL: PYODIDE_CDN,
  })

  onProgress?.(60)

  pyodideInstance.setStdout({
    batched: (text: string) => {
      stdoutBuffer.push(text)
    },
  })

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

export function getPyodide(): PyodideInterface | null {
  return pyodideInstance
}

export async function runPython(
  code: string,
  timeoutMs = 10_000,
): Promise<{ output: string; error: string | null }> {
  if (!pyodideInstance || !ready) {
    return { output: '', error: 'Pyodide 尚未加载完成' }
  }

  stdoutBuffer = []

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error('代码执行超时（超过 10 秒）')),
      timeoutMs,
    )
  })

  try {
    await Promise.race([
      pyodideInstance.runPythonAsync(code),
      timeoutPromise,
    ])

    const output = stdoutBuffer.join('\n')
    return { output, error: null }
  } catch (err: any) {
    let errorMsg: string
    if (err instanceof pyodideInstance.ffi.PythonError) {
      errorMsg = err.message
    } else {
      errorMsg = String(err.message ?? err)
    }
    return { output: '', error: errorMsg }
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

export function clearStdout(): void {
  stdoutBuffer = []
}
