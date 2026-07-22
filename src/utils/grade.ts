import type { Question, TestCase } from '@/types'
import { compareOutput } from './diff'

export interface GradeResult {
  correct: boolean
  errorDetail?: string
  userOutput?: string
}

type RunPythonFn = (code: string) => Promise<{ output: string; error: string | null }>

function compareOutputs(userOut: string, expected: string, mode: string | undefined): { correct: boolean } {
  const trimmedUser = userOut.trim()
  const trimmedExpected = expected.trim()
  if (mode === 'contains') {
    return { correct: trimmedUser.includes(trimmedExpected) }
  }
  return { correct: trimmedUser === trimmedExpected }
}

export async function gradeCode(
  question: Question,
  userCode: string,
  runPython: RunPythonFn,
): Promise<GradeResult> {
  const { output, error } = await runPython(userCode)
  if (error) return { correct: false, errorDetail: error, userOutput: output }

  if (question.expectedOutput !== undefined) {
    return {
      ...compareOutputs(output, question.expectedOutput, question.validationMode),
      userOutput: output,
    }
  }

  if (question.correctCode) {
    const { output: expectedOut } = await runPython(question.correctCode)
    return {
      ...compareOutputs(output, expectedOut, question.validationMode),
      userOutput: output,
    }
  }

  return { correct: !error, userOutput: output }
}

export async function gradeFreeCoding(
  userCode: string,
  testCases: TestCase[],
  runPython: RunPythonFn,
): Promise<GradeResult> {
  for (const test of testCases) {
    const fullCode = `${userCode}\nprint(${test.input})`
    const { output, error } = await runPython(fullCode)
    if (error) return { correct: false, errorDetail: `测试输入 ${test.input} 失败：${error}` }
    if (output.trim() !== test.expected) {
      return {
        correct: false,
        errorDetail: `输入 ${test.input}：期望 ${test.expected}，实际 ${output.trim()}`,
        userOutput: output,
      }
    }
  }
  return { correct: true }
}

export function gradeChoice(
  question: Question,
  userAnswer: number | null,
): GradeResult {
  if (userAnswer === null || userAnswer === undefined) {
    return { correct: false, errorDetail: '未选择答案' }
  }
  return { correct: userAnswer === question.correctOption }
}
