import { collapseWhitespace } from './diff'

export interface DetectedError {
  name: string
  message: string
  noxHint: string
  confidence: number // 0-1
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

export function detectCommonErrors(
  userOutput: string,
  expected: string,
  userCode?: string,
): DetectedError[] {
  const errors: DetectedError[] = []

  if (userOutput.toLowerCase() === expected.toLowerCase() && userOutput !== expected) {
    errors.push({
      name: 'CASE_MISMATCH',
      message: `大小写不匹配：你的输出 "${userOutput}" 与期望 "${expected}" 仅在大小写上有差异。`,
      noxHint: '你写的字符大小写和期望的不完全一致。Python 是大小写敏感的，\'hello\' 和 \'Hello\' 是两个不同的字符串。检查一下引号内的内容是否完全一致。',
      confidence: 0.95,
    })
  }

  const collapsedUser = collapseWhitespace(userOutput)
  const collapsedExpected = collapseWhitespace(expected)
  if (collapsedUser === collapsedExpected && userOutput !== expected) {
    errors.push({
      name: 'WHITESPACE_MISMATCH',
      message: `空白字符不匹配：你的输出 "${userOutput}" 与期望 "${expected}" 仅在空格/换行上有差异。`,
      noxHint: '你的输出多了一个空格或少了一个换行。print() 默认会在末尾加换行符，可以用 end=\'\' 控制。检查字符串中是否有多余的空格。',
      confidence: 0.9,
    })
  }

  if (userCode) {
    const strPlusInt = /["'][^"']*["']\s*\+\s*\d+|\d+\s*\+\s*["'][^"']*["']/
    if (strPlusInt.test(userCode)) {
      errors.push({
        name: 'STR_INT_CONCAT',
        message: '检测到字符串和数字直接相加。Python 不允许 str + int。',
        noxHint: '字符串和数字不能直接加。用 str(数字) 把数字转成字符串，或者用 f-string 更简洁。',
        confidence: 0.85,
      })
    }

    const codeVarMatches = userCode.match(/\b([a-zA-Z_]\w*)\b/g) ?? []
    const expectedVars = expected.match(/\b([a-zA-Z_]\w*)\b/g) ?? []
    for (const uv of codeVarMatches) {
      for (const ev of expectedVars) {
        if (uv !== ev && uv.length > 2 && ev.length > 2 && levenshtein(uv, ev) <= 2) {
          errors.push({
            name: 'VARIABLE_TYPO',
            message: `变量名疑似拼写错误："${uv}" 与 "${ev}" 只差 ${levenshtein(uv, ev)} 个字母。`,
            noxHint: `你是不是把 ${ev} 写成了 ${uv}？就差一个字母。变量名必须完全一致，Python 不会帮你自动纠错。`,
            confidence: 0.8,
          })
        }
      }
    }
  }

  return errors
}
