export interface DiffResult {
  matchType: 'exact' | 'case' | 'whitespace' | 'mismatch'
  userOutput: string
  expectedOutput: string
  diffIndex: number | null
  diffChar: string | null
  expectedChar: string | null
}

export function compareOutput(userOutput: string, expected: string): DiffResult {
  if (userOutput === expected) {
    return {
      matchType: 'exact',
      userOutput,
      expectedOutput: expected,
      diffIndex: null,
      diffChar: null,
      expectedChar: null,
    }
  }

  if (userOutput.toLowerCase() === expected.toLowerCase()) {
    const diffIndex = findFirstDiff(userOutput, expected)
    return {
      matchType: 'case',
      userOutput,
      expectedOutput: expected,
      diffIndex,
      diffChar: diffIndex !== null ? userOutput[diffIndex] : null,
      expectedChar: diffIndex !== null ? expected[diffIndex] : null,
    }
  }

  if (userOutput.trim() === expected.trim()) {
    return {
      matchType: 'whitespace',
      userOutput,
      expectedOutput: expected,
      diffIndex: null,
      diffChar: null,
      expectedChar: null,
    }
  }

  const diffIndex = findFirstDiff(userOutput, expected)
  return {
    matchType: 'mismatch',
    userOutput,
    expectedOutput: expected,
    diffIndex,
    diffChar: diffIndex !== null && diffIndex < userOutput.length ? userOutput[diffIndex] : null,
    expectedChar: diffIndex !== null && diffIndex < expected.length ? expected[diffIndex] : null,
  }
}

function findFirstDiff(a: string, b: string): number | null {
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) return i
  }
  return null
}

export function formatDiffMessage(diff: DiffResult): string {
  if (diff.matchType === 'exact') return ''
  if (diff.matchType === 'case') {
    return `大小写不匹配：你的输出为 "${diff.userOutput}"，期望为 "${diff.expectedOutput}"。`
  }
  if (diff.matchType === 'whitespace') {
    return `空白字符不匹配：你的输出为 "${diff.userOutput}"，期望为 "${diff.expectedOutput}"。`
  }
  return `输出不匹配：你的输出为 "${diff.userOutput}"，期望为 "${diff.expectedOutput}"。`
}
