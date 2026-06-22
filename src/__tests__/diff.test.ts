import { describe, it, expect } from 'vitest'
import { compareOutput } from '../utils/diff'

describe('diff.compareOutput', () => {
  it('exact match', () => {
    const r = compareOutput('Hello World', 'Hello World')
    expect(r.matchType).toBe('exact')
  })

  it('case mismatch', () => {
    const r = compareOutput('hello world', 'Hello World')
    expect(r.matchType).toBe('case')
    expect(r.points.length).toBeGreaterThan(0)
  })

  it('whitespace difference', () => {
    const r = compareOutput('Hello World', 'Hello  World')
    expect(r.matchType).toBe('whitespace')
  })

  it('trailing whitespace', () => {
    const r = compareOutput('Hello ', 'Hello')
    expect(r.matchType).toBe('whitespace')
  })

  it('format: 78.5 vs 78.50 (float comparison)', () => {
    const r = compareOutput('78.5', '78.50')
    expect(r.matchType).toBe('format')
  })

  it('format: Chinese comma vs ASCII comma', () => {
    const r = compareOutput('面积:78.5', '面积：78.5')
    expect(r.matchType).toBe('format')
  })

  it('format: extra space around numbers', () => {
    const r = compareOutput('面积是 78.5', '面积是78.5')
    expect(r.matchType).toBe('format')
  })

  it('logic: different text same numbers', () => {
    const r = compareOutput('面积78.5', '周长78.5')
    expect(r.matchType).toBe('logic')
    expect(r.points.length).toBeGreaterThan(0)
  })

  it('logic: different numbers', () => {
    const r = compareOutput('78.5', '78.6')
    expect(r.matchType).toBe('logic')
  })

  it('multiline: trailing newline', () => {
    const r = compareOutput('Hello\n', 'Hello')
    expect(r.matchType).toBe('whitespace')
  })

  it('empty strings match', () => {
    const r = compareOutput('', '')
    expect(r.matchType).toBe('exact')
  })

  it('empty vs non-empty', () => {
    const r = compareOutput('', 'Hello')
    expect(r.matchType).toBe('logic')
  })

  it('None vs none (case)', () => {
    const r = compareOutput('none', 'None')
    expect(r.matchType).toBe('case')
  })
})
