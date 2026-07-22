import { describe, it, expect } from 'vitest'
import type { Question, TestCase } from '@/types'
import { gradeChoice, gradeCode, gradeFreeCoding } from './grade'

type RFn = (code: string) => Promise<{ output: string; error: string | null }>

const mockPy = (output: string): RFn => async () => ({ output, error: null })
const mockErr = (error: string): RFn => async () => ({ output: '', error })
let callCount = 0
const mockSeq = (results: { output?: string; error?: string }[]): RFn => async () => {
  const r = results[callCount % results.length]
  callCount++
  return { output: r.output ?? '', error: r.error ?? null }
}

function makeQ(overrides: Partial<Question>): Question {
  return {
    id: 'test_q', type: 'code_fill', chapterId: 'ch1_variables',
    title: 'test', description: 'test', difficulty: 1,
    knowledgeTags: ['test'], explanation: 'test',
    ...overrides,
  }
}

const noopPy: RFn = async () => ({ output: '', error: null })

describe('gradeChoice', () => {
  it('正确选项 → correct', () => {
    expect(gradeChoice(makeQ({ correctOption: 2 }), 2).correct).toBe(true)
  })
  it('错误选项 → 不 correct', () => {
    expect(gradeChoice(makeQ({ correctOption: 2 }), 0).correct).toBe(false)
  })
  it('null 答案 → 不 correct + errorDetail', () => {
    const r = gradeChoice(makeQ({}), null)
    expect(r.correct).toBe(false)
    expect(r.errorDetail).toBe('未选择答案')
  })
})

describe('gradeCode', () => {
  it('exact 匹配 → correct', async () => {
    const q = makeQ({ expectedOutput: 'Hello', validationMode: 'exact' })
    const r = await gradeCode(q, 'print("Hello")', mockPy('Hello'))
    expect(r.correct).toBe(true)
  })

  it('输出不匹配 → 不 correct', async () => {
    const q = makeQ({ expectedOutput: 'Hello', validationMode: 'exact' })
    const r = await gradeCode(q, 'print("World")', mockPy('World'))
    expect(r.correct).toBe(false)
  })

  it('contains 模式 → 包含即正确', async () => {
    const q = makeQ({ expectedOutput: 'Hello', validationMode: 'contains' })
    const r = await gradeCode(q, 'print("Hello World")', mockPy('Hello World'))
    expect(r.correct).toBe(true)
  })

  it('语法错误 → 不 correct + errorDetail', async () => {
    const q = makeQ({ expectedOutput: 'Hello', validationMode: 'exact' })
    const r = await gradeCode(q, 'invalid syntax', mockErr('SyntaxError: invalid syntax'))
    expect(r.correct).toBe(false)
    expect(r.errorDetail).toContain('SyntaxError')
  })

  it('空白差异（trim 后匹配）→ correct', async () => {
    const q = makeQ({ expectedOutput: 'Hello', validationMode: 'exact' })
    const r = await gradeCode(q, 'print(" Hello ")', mockPy(' Hello '))
    expect(r.correct).toBe(true)  // trim 后 'Hello' === 'Hello'
  })

  it('无 expectedOutput 时用 correctCode 输出对比', async () => {
    const q = makeQ({ correctCode: 'print("Hi")', expectedOutput: undefined as unknown as string })
    const r = await gradeCode(q, 'print("Hi")', mockPy('Hi'))
    expect(r.correct).toBe(true)
  })
})

describe('gradeFreeCoding', () => {
  const tc: TestCase[] = [
    { input: 'add(1, 2)', expected: '3' },
    { input: 'add(4, 5)', expected: '9' },
  ]

  it('所有 testCases 通过 → correct', async () => {
    callCount = 0
    const r = await gradeFreeCoding('def add(a,b): return a+b', tc, mockSeq([{ output: '3' }, { output: '9' }]))
    expect(r.correct).toBe(true)
  })

  it('第一个 case 失败 → 不 correct', async () => {
    callCount = 0
    const r = await gradeFreeCoding('def add(a,b): return a-b', tc, mockSeq([{ output: '-1' }, { output: '-1' }]))
    expect(r.correct).toBe(false)
    expect(r.errorDetail).toContain('add(1, 2)')
  })

  it('空 testCases → 直接 correct', async () => {
    const r = await gradeFreeCoding('x = 1', [], noopPy)
    expect(r.correct).toBe(true)
  })

  it('Pyodide 执行错误 → 不 correct + errorDetail', async () => {
    const r = await gradeFreeCoding('invalid', tc, mockErr('NameError: x undefined'))
    expect(r.correct).toBe(false)
    expect(r.errorDetail).toContain('NameError')
  })
})
