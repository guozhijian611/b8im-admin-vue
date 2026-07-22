import request from '@/utils/http'

export interface StorageQuota {
  organization: number
  quota_key: 'storage_bytes'
  quota_value: string
  used_value: string
  held_value: string
  occupancy_value: string
  remaining_value: string | null
  unlimited: boolean
  used_file_count: number
  held_file_count: number
  usage_ratio: number | null
  version: number
  update_time: string | null
}

export interface StorageQuotaListParams {
  page?: number
  limit?: number
  organization?: number | string
}

export interface StorageQuotaUpdatePayload {
  organization: number
  quota_value: string
  version: number
}

const prefix = '/saimulti/admin/storage-quota'

export default {
  index(params: StorageQuotaListParams) {
    return request.get<Api.Common.ApiPage<StorageQuota>>({ url: `${prefix}/index`, params })
  },
  read(organization: number) {
    return request.get<StorageQuota>({ url: `${prefix}/read`, params: { organization } })
  },
  update(data: StorageQuotaUpdatePayload) {
    const payload: StorageQuotaUpdatePayload = {
      organization: data.organization,
      quota_value: data.quota_value,
      version: data.version
    }
    return request.put<StorageQuota>({ url: `${prefix}/update`, data: payload })
  }
}
