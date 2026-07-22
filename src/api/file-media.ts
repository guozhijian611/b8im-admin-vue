import request from '@/utils/http'

export type FileMediaPolicyFlag = 0 | 1

export interface FileMediaPolicy {
  max_file_bytes: string
  large_file_enabled: FileMediaPolicyFlag
  preview_enabled: FileMediaPolicyFlag
  status: FileMediaPolicyFlag
}

export interface FileMediaPolicyRow extends FileMediaPolicy {
  organization: number
}

export interface FileMediaPolicyListParams {
  page?: number
  limit?: number
  organization?: number | string
  status?: FileMediaPolicyFlag
}

export interface FileMediaPolicyUpdatePayload extends FileMediaPolicy {
  organization: number
}

const prefix = '/saimulti/admin/file-media'

export default {
  policyIndex(params: FileMediaPolicyListParams) {
    return request.get<Api.Common.ApiPage<FileMediaPolicyRow>>({
      url: `${prefix}/policyIndex`,
      params
    })
  },
  policyRead(organization: number) {
    return request.get<FileMediaPolicy>({
      url: `${prefix}/policyRead`,
      params: { organization }
    })
  },
  policyUpdate(data: FileMediaPolicyUpdatePayload) {
    const payload: FileMediaPolicyUpdatePayload = {
      organization: data.organization,
      max_file_bytes: data.max_file_bytes,
      large_file_enabled: data.large_file_enabled,
      preview_enabled: data.preview_enabled,
      status: data.status
    }

    return request.put<FileMediaPolicy>({ url: `${prefix}/policyUpdate`, data: payload })
  }
}
