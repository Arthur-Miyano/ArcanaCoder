export interface CodeHint {
  type: 'variable' | 'return'
  message: string
}

export function validateCode(userCode: string, question: {
  knowledgeTags?: string[]
  correctCode?: string
}): CodeHint[] {
  const hints: CodeHint[] = []

  if (!question.correctCode) return hints

  const tagSet = new Set(question.knowledgeTags ?? [])

  const needsReturn = tagSet.has('函数') || /\breturn\b/.test(question.correctCode)
  if (needsReturn && !/\breturn\b/.test(userCode)) {
    hints.push({ type: 'return', message: '提示：函数需要 return 返回值' })
  }

  const expectedVars = extractKeyVariables(question.correctCode)
  for (const v of expectedVars) {
    const re = new RegExp(`\\b${v}\\b`)
    if (!re.test(userCode)) {
      hints.push({ type: 'variable', message: `提示：建议使用 ${v} 变量存储计算结果` })
    }
  }

  return hints
}

function extractKeyVariables(code: string): string[] {
  const assignMatch = code.match(/(\w+)\s*=\s*[^=]/)
  if (!assignMatch || assignMatch[0].trim().startsWith('def ')) return []
  return [assignMatch[1]]
}
