import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('@/utils/http', () => ({
  default: { get }
}))

import traceApi from './trace'

describe('trace API route prefix', () => {
  beforeEach(() => {
    get.mockReset()
  })

  it('uses the unified /saimulti prefix for services, search and read', () => {
    const searchParams = { limit: 20, error_only: 1 as const }

    traceApi.services()
    traceApi.search(searchParams)
    traceApi.read('0123456789abcdef0123456789abcdef')

    expect(get).toHaveBeenNthCalledWith(1, {
      url: '/saimulti/system/trace/services'
    })
    expect(get).toHaveBeenNthCalledWith(2, {
      url: '/saimulti/system/trace/search',
      params: searchParams
    })
    expect(get).toHaveBeenNthCalledWith(3, {
      url: '/saimulti/system/trace/read',
      params: { trace_id: '0123456789abcdef0123456789abcdef' }
    })
  })
})
