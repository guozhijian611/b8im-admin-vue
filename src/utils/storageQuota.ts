const CANONICAL_UNSIGNED_DECIMAL = /^(0|[1-9]\d*)$/
const CANONICAL_POSITIVE_DECIMAL = /^[1-9]\d*$/
const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] as const
const UNIT_BASE = 1024n
export const PHP_INT_MAX_DECIMAL = '9223372036854775807'

function fitsPhpInteger(value: string): boolean {
  return (
    value.length < PHP_INT_MAX_DECIMAL.length ||
    (value.length === PHP_INT_MAX_DECIMAL.length && value <= PHP_INT_MAX_DECIMAL)
  )
}

export function isCanonicalByteCount(value: string): boolean {
  return CANONICAL_UNSIGNED_DECIMAL.test(value) && fitsPhpInteger(value)
}

export function parsePositiveServerInteger(value: string): string | null {
  if (!CANONICAL_POSITIVE_DECIMAL.test(value) || !fitsPhpInteger(value)) {
    return null
  }
  return value
}

export function parseByteCount(value: string): bigint | null {
  if (!isCanonicalByteCount(value)) {
    return null
  }
  return BigInt(value)
}

export function formatByteCount(value: string): string {
  const bytes = parseByteCount(value)
  if (bytes === null) {
    return '—'
  }

  let unitIndex = 0
  let unitSize = 1n
  while (unitIndex < BYTE_UNITS.length - 1 && bytes >= unitSize * UNIT_BASE) {
    unitIndex += 1
    unitSize *= UNIT_BASE
  }

  if (unitIndex === 0) {
    return `${bytes.toString()} B`
  }

  const whole = bytes / unitSize
  const hundredths = ((bytes % unitSize) * 100n) / unitSize
  const decimal = hundredths.toString().padStart(2, '0').replace(/0+$/, '')
  return `${whole.toString()}${decimal ? `.${decimal}` : ''} ${BYTE_UNITS[unitIndex]}`
}

export function formatQuotaByteCount(value: string, unlimited: boolean): string {
  return unlimited ? '无限' : formatByteCount(value)
}

export function formatUsageRatio(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return '—'
  }
  return `${(value * 100).toFixed(2).replace(/\.00$/, '')}%`
}
