import { describe, expect, it } from 'vitest'
import {
  formatByteCount,
  formatQuotaByteCount,
  formatUsageRatio,
  isCanonicalByteCount,
  parseByteCount,
  parsePositiveServerInteger,
  PHP_INT_MAX_DECIMAL
} from './storageQuota'

describe('storage quota byte helpers', () => {
  it('parses values above Number.MAX_SAFE_INTEGER without precision loss', () => {
    const value = '9007199254740993'

    expect(isCanonicalByteCount(value)).toBe(true)
    expect(parseByteCount(value)).toBe(9007199254740993n)
    expect(parseByteCount(value)?.toString()).toBe(value)
  })

  it('rejects non-canonical decimal strings', () => {
    for (const value of ['', '-1', '+1', '01', '1.0', '1e3', ' 1']) {
      expect(isCanonicalByteCount(value)).toBe(false)
      expect(parseByteCount(value)).toBeNull()
    }
  })

  it('enforces PHP_INT_MAX for byte counts and positive organization filters', () => {
    expect(parseByteCount(PHP_INT_MAX_DECIMAL)).toBe(9223372036854775807n)
    expect(parseByteCount('9223372036854775808')).toBeNull()
    expect(formatByteCount('9223372036854775808')).toBe('—')

    expect(parsePositiveServerInteger(PHP_INT_MAX_DECIMAL)).toBe(PHP_INT_MAX_DECIMAL)
    for (const value of ['0', '01', '-1', '+1', '9223372036854775808']) {
      expect(parsePositiveServerInteger(value)).toBeNull()
    }
  })

  it('formats bytes using integer arithmetic and preserves unlimited semantics', () => {
    expect(formatByteCount('0')).toBe('0 B')
    expect(formatByteCount('1536')).toBe('1.5 KB')
    expect(formatByteCount('9007199254740993')).toBe('8 PB')
    expect(formatByteCount('invalid')).toBe('—')
    expect(formatQuotaByteCount('0', true)).toBe('无限')
    expect(formatQuotaByteCount('1024', false)).toBe('1 KB')
  })

  it('formats nullable usage ratios safely', () => {
    expect(formatUsageRatio(null)).toBe('—')
    expect(formatUsageRatio(Number.NaN)).toBe('—')
    expect(formatUsageRatio(0.125)).toBe('12.50%')
    expect(formatUsageRatio(1)).toBe('100%')
  })
})
