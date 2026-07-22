import { describe, it, expect } from 'vitest'
import { detectCommonErrors } from '../utils/commonErrors'

describe('commonErrors.detectCommonErrors', () => {
  it('detects case mismatch', () => {
    const errors = detectCommonErrors('hello world', 'Hello World')
    const caseErr = errors.find((e) => e.name === 'CASE_MISMATCH')
    expect(caseErr).toBeDefined()
    expect(caseErr!.confidence).toBeGreaterThan(0.9)
  })

  it('detects whitespace mismatch', () => {
    const errors = detectCommonErrors('a  b', 'a b')
    const wsErr = errors.find((e) => e.name === 'WHITESPACE_MISMATCH')
    expect(wsErr).toBeDefined()
  })

  it('detects str+int concatenation in code', () => {
    const errors = detectCommonErrors('', '', '"value" + 5')
    const concatErr = errors.find((e) => e.name === 'STR_INT_CONCAT')
    expect(concatErr).toBeDefined()
  })

  it('no errors when exact match', () => {
    const errors = detectCommonErrors('Hello', 'Hello')
    expect(errors.length).toBe(0)
  })

  it('does not detect typo when no expected vars', () => {
    const errors = detectCommonErrors('', '', 'area')
    const typoErr = errors.find((e) => e.name === 'VARIABLE_TYPO')
    // No expected vars to compare against, so no typo
    expect(typoErr).toBeUndefined()
  })

  it('detects variable typo via levenshtein distance', () => {
    // userCode uses 'arer' but expected output references 'area'
    const errors = detectCommonErrors('test', 'area', 'arer = "test"\nprint(arer)')
    const typoErr = errors.find((e) => e.name === 'VARIABLE_TYPO')
    expect(typoErr).toBeDefined()
    expect(typoErr!.message).toContain('arer')
    expect(typoErr!.message).toContain('area')
    expect(typoErr!.confidence).toBeGreaterThan(0)
  })

  it('returns no errors for correct code', () => {
    const errors = detectCommonErrors('42', '42', 'result = 42\nprint(result)')
    expect(errors.length).toBe(0)
  })
})
