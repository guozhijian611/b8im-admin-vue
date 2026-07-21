import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get, put } = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }))

vi.mock('@/utils/http', () => ({
  default: { get, put }
}))

import storageQuotaApi from './storage-quota'

describe('storage quota API contract', () => {
  beforeEach(() => {
    get.mockReset()
    put.mockReset()
  })

  it('uses the core storage quota endpoints', () => {
    const params = { page: 2, limit: 20, organization: '7' }

    storageQuotaApi.index(params)
    storageQuotaApi.read(7)

    expect(get).toHaveBeenNthCalledWith(1, {
      url: '/saimulti/admin/storage-quota/index',
      params
    })
    expect(get).toHaveBeenNthCalledWith(2, {
      url: '/saimulti/admin/storage-quota/read',
      params: { organization: 7 }
    })
  })

  it('sends only organization, quota_value and version on update', () => {
    storageQuotaApi.update({
      organization: 7,
      quota_value: '9007199254740993',
      version: 12,
      max_file_bytes: '2147483648',
      status: 1
    } as never)

    expect(put).toHaveBeenCalledWith({
      url: '/saimulti/admin/storage-quota/update',
      data: {
        organization: 7,
        quota_value: '9007199254740993',
        version: 12
      }
    })
  })
})
