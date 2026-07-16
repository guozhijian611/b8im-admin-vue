import request from '@/utils/http'

export type AdminImUserStatus = 1 | 2 | 3
export type AdminImUserGender = 0 | 1 | 2

export interface AdminImUser {
  id: number
  organization: number
  organization_name: string | null
  user_id: string
  im_short_no: string | null
  account: string
  nickname: string
  /** 私有附件 file_id，不是可直接访问的 URL。 */
  avatar: string | null
  mobile: string | null
  email: string | null
  gender: AdminImUserGender
  status: AdminImUserStatus
  remark: string | null
  signature: string
  login_time: string | null
  create_time: string | null
}

export interface AdminImUserListParams {
  page: number
  limit: number
  organization?: number
  keyword?: string
  status?: AdminImUserStatus
}

export interface AdminImUserSavePayload {
  organization: number
  account: string
  password: string
  password_confirm: string
  nickname: string
  im_short_no: string
  /** 私有附件 file_id，不是可直接访问的 URL。 */
  avatar: string
  mobile: string
  email: string
  gender: AdminImUserGender
  status: AdminImUserStatus
  remark: string
  signature: string
}

export type AdminImUserUpdatePayload = Pick<
  AdminImUserSavePayload,
  | 'account'
  | 'nickname'
  | 'im_short_no'
  | 'avatar'
  | 'mobile'
  | 'email'
  | 'gender'
  | 'remark'
  | 'signature'
> & { id: number }

export interface AdminImUserQuota {
  organization: number
  quota_key: 'im_user_seats'
  quota_value: number
  used_value: number
  remaining_value: number
  configured: boolean
}

const prefix = '/saimulti/admin/im/user'

export default {
  list(params: AdminImUserListParams) {
    return request.get<Api.Common.ApiPage<AdminImUser>>({ url: `${prefix}/index`, params })
  },
  read(id: number) {
    return request.get<AdminImUser>({ url: `${prefix}/read`, params: { id } })
  },
  save(data: AdminImUserSavePayload) {
    return request.post<AdminImUser>({ url: `${prefix}/save`, data })
  },
  update(data: AdminImUserUpdatePayload) {
    return request.put<AdminImUser>({ url: `${prefix}/update`, data })
  },
  updateStatus(id: number, status: AdminImUserStatus) {
    return request.post<AdminImUser>({ url: `${prefix}/status`, data: { id, status } })
  },
  resetPassword(id: number, password: string, passwordConfirm: string) {
    return request.post<{ id: number; revoked_session_count: number }>({
      url: `${prefix}/reset`,
      data: { id, password, password_confirm: passwordConfirm }
    })
  },
  quota(organization: number) {
    return request.get<AdminImUserQuota>({ url: `${prefix}/quota`, params: { organization } })
  },
  updateQuota(organization: number, quotaValue: number) {
    return request.put<AdminImUserQuota>({
      url: `${prefix}/quota`,
      data: { organization, quota_value: quotaValue }
    })
  }
}
