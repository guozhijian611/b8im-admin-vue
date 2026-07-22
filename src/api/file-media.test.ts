import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get, put } = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }))

vi.mock('@/utils/http', () => ({
  default: { get, put }
}))

import fileMediaApi from './file-media'
import type { FileMediaPolicy } from './file-media'

const policyResponse: FileMediaPolicy = {
  max_file_bytes: '2147483648',
  large_file_enabled: 1,
  preview_enabled: 0,
  status: 1
}

describe('file media policy API contract', () => {
  beforeEach(() => {
    get.mockReset()
    put.mockReset()
  })

  it('uses policy-only endpoints', () => {
    const params = { page: 1, limit: 10, organization: 9 }

    fileMediaApi.policyIndex(params)
    fileMediaApi.policyRead(9)

    expect(get).toHaveBeenNthCalledWith(1, {
      url: '/saimulti/admin/file-media/policyIndex',
      params
    })
    expect(get).toHaveBeenNthCalledWith(2, {
      url: '/saimulti/admin/file-media/policyRead',
      params: { organization: 9 }
    })
  })

  it('keeps organization out of the four-field policy response contract', () => {
    expect(policyResponse).toEqual({
      max_file_bytes: '2147483648',
      large_file_enabled: 1,
      preview_enabled: 0,
      status: 1
    })
    expect(policyResponse).not.toHaveProperty('organization')
  })

  it('never mixes central quota fields into a policy update', () => {
    fileMediaApi.policyUpdate({
      organization: 9,
      max_file_bytes: '2147483648',
      large_file_enabled: 1,
      preview_enabled: 0,
      status: 1,
      quota_value: '9007199254740993',
      used_value: '1024'
    } as never)

    expect(put).toHaveBeenCalledWith({
      url: '/saimulti/admin/file-media/policyUpdate',
      data: {
        organization: 9,
        max_file_bytes: '2147483648',
        large_file_enabled: 1,
        preview_enabled: 0,
        status: 1
      }
    })
  })
})
