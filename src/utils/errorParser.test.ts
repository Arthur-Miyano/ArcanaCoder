import { describe, it, expect } from 'vitest'
import { parsePythonError, getNoxExplanation } from '../utils/errorParser'

describe('errorParser.parsePythonError', () => {
  it('NameError', () => {
    const e = parsePythonError('NameError: name \'x\' is not defined')
    expect(e.chineseType).toBe('变量未定义')
    expect(e.type).toBe('NameError')
    expect(e.lineNumber).toBeNull()
  })

  it('SyntaxError with line number', () => {
    const e = parsePythonError('  File "tmp.py", line 3\n    return "hi"\n         ^\nSyntaxError: invalid syntax')
    expect(e.chineseType).toBe('语法错误')
    expect(e.lineNumber).toBe(3)
  })

  it('TypeError', () => {
    const e = parsePythonError('TypeError: can only concatenate str (not "int") to str')
    expect(e.chineseType).toBe('类型错误')
  })

  it('IndexError', () => {
    const e = parsePythonError('IndexError: list index out of range')
    expect(e.chineseType).toBe('索引越界')
  })

  it('IndentationError', () => {
    const e = parsePythonError('IndentationError: unexpected indent')
    expect(e.chineseType).toBe('缩进错误')
  })
})

describe('errorParser.getNoxExplanation', () => {
  it('returns explanation for known error type', () => {
    const msg = getNoxExplanation('NameError')
    expect(msg.length).toBeGreaterThan(10)
    expect(msg).toContain('变量名')
  })

  it('returns fallback for unknown error type', () => {
    const msg = getNoxExplanation('WeirdError')
    expect(msg.length).toBeGreaterThan(10)
  })
})
