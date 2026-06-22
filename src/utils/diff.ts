export interface DiffPoint {
  index: number
  userChar: string
  expectedChar: string
}

export interface DiffResult {
  matchType: 'exact' | 'case' | 'whitespace' | 'format' | 'logic'
  userOutput: string
  expectedOutput: string
  points: DiffPoint[]
  detail: string
}

function extractNumbers(s: string): number[] {
  const matches = s.match(/\d+(\.\d+)?/g)
  if (!matches) return []
  return matches.map(Number)
}

function removeNumbers(s: string): string {
  return s.replace(/\d+(\.\d+)?/g, '').trim()
}

function normalizePunctuation(s: string): string {
  return s.replace(/[\uFF01-\uFF5E]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xFEE0),
  )
}

export function compareOutput(userOutput: string, expected: string): DiffResult {
  if (userOutput === expected) {
    return { matchType: 'exact', userOutput, expectedOutput: expected, points: [], detail: '' }
  }

  if (userOutput.toLowerCase() === expected.toLowerCase()) {
    return {
      matchType: 'case',
      userOutput,
      expectedOutput: expected,
      points: findAllDiffs(userOutput, expected),
      detail: '大小写不匹配',
    }
  }

  if (userOutput.trim() === expected.trim()) {
    return {
      matchType: 'whitespace',
      userOutput,
      expectedOutput: expected,
      points: findAllDiffs(userOutput, expected),
      detail: '空白字符不匹配',
    }
  }

  const userNums = extractNumbers(userOutput)
  const expectedNums = extractNumbers(expected)

  if (userNums.length === expectedNums.length &&
      userNums.every((n, i) => Math.abs(n - expectedNums[i]) < 1e-9)) {
    const userText = normalizePunctuation(removeNumbers(userOutput))
    const expectedText = normalizePunctuation(removeNumbers(expected))
    if (userText === expectedText) {
      return {
        matchType: 'format',
        userOutput,
        expectedOutput: expected,
        points: findAllDiffs(userOutput, expected),
        detail: '数值完全正确，仅格式/标点/空格有差异',
      }
    }
    return {
      matchType: 'logic',
      userOutput,
      expectedOutput: expected,
      points: findAllDiffs(userOutput, expected),
      detail: '数值正确，但输出内容（如文字描述）不符',
    }
  }

  return {
    matchType: 'logic',
    userOutput,
    expectedOutput: expected,
    points: findAllDiffs(userOutput, expected),
    detail: '数值结果不一致，请检查计算逻辑',
  }
}

export function formatDiffReport(diff: DiffResult): string {
  if (diff.matchType === 'exact') return ''

  const lines: string[] = [diff.detail, `你的输出：${diff.userOutput}`, `期望输出：${diff.expectedOutput}`]

  for (const p of diff.points) {
    lines.push(`  第${p.index + 1}个字符："${p.userChar || '(空)'}" → 应为"${p.expectedChar || '(空)'}"`)
  }

  return lines.join('\n')
}

function findAllDiffs(a: string, b: string): DiffPoint[] {
  const points: DiffPoint[] = []
  const maxLen = Math.max(a.length, b.length)
  for (let i = 0; i < maxLen; i++) {
    const ca = a[i] ?? ''
    const cb = b[i] ?? ''
    if (ca !== cb) {
      points.push({ index: i, userChar: ca, expectedChar: cb })
    }
  }
  return points
}
