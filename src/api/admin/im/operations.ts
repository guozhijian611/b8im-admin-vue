import request from '@/utils/http'

export interface PageResult<T> {
  current_page: number
  data: T[]
  per_page: number
  total: number
}

export interface AdminImOverview {
  status: 'healthy' | 'degraded'
  database: { status: 'up' | 'down' }
  redis: { status: 'up' | 'down'; max_stale_seconds: number }
  im_schema: { status: 'ready' | 'missing' | 'unavailable'; missing: string[] }
  storage: {
    status: 'ready' | 'incomplete' | 'unavailable'
    mode: string
    label: string
    configured: boolean
    missing: string[]
  }
  statistics: {
    users: { total: number; active: number; disabled: number; banned: number }
    devices: { total: number; online: number; disabled: number }
    sessions: { total: number; active: number; revoked: number; expired: number }
    outbox: {
      total: number
      pending: number
      publishing: number
      published: number
      failed: number
    }
  }
  checked_at: string
}

export interface AdminImUser {
  id: number
  organization: number
  organization_name: string | null
  user_id: string
  im_short_no: string | null
  account: string
  nickname: string
  mobile: string | null
  email: string | null
  is_system: number
  status: number
  login_time: string | null
  create_time: string | null
}

export interface AdminImDevice {
  id: number
  organization: number
  organization_name: string | null
  user_id: string
  account: string | null
  nickname: string | null
  device_id: string
  client_family: string
  os: string
  device_name: string | null
  app_version: string | null
  current_ip: string | null
  last_login_ip: string | null
  last_login_at: string | null
  last_seen_at: string | null
  current_online_state: number
  status: number
}

export interface AdminImSession {
  id: number
  organization: number
  organization_name: string | null
  user_id: string
  account: string | null
  nickname: string | null
  device_id: string
  client_id: string
  session_ref: string
  status: number
  expire_at: string
  revoked_at: string | null
  create_time: string | null
}

export interface AdminImLoginAudit {
  id: number
  organization: number
  organization_name: string | null
  user_id: string
  account: string | null
  nickname: string | null
  device_id: string | null
  client_family: string | null
  os: string | null
  device_name: string | null
  login_ip: string | null
  login_ip_geo: string | null
  login_at: string
  logout_at: string | null
  login_result: 'success' | 'failed' | 'kicked' | 'logout' | 'inactive'
  audit_scope: string
  current_online_state: number
  failure_code: string | null
}

export interface AdminImListParams {
  page: number
  limit: number
  organization?: string
  keyword?: string
  status?: string
  online_state?: string
  login_result?: string
}

export interface CacheInvalidationResult {
  status: 'not_required' | 'invalidated' | 'mysql_authoritative_bounded_fallback'
  failed: number
  max_stale_seconds: number
}

export interface RealtimeEventResult {
  status: 'not_required' | 'published' | 'failed_bounded_fallback'
}

export default {
  overview() {
    return request.get<AdminImOverview>({ url: '/saimulti/admin/im/operations/overview' })
  },
  users(params: AdminImListParams) {
    return request.get<PageResult<AdminImUser>>({
      url: '/saimulti/admin/im/operations/users',
      params
    })
  },
  devices(params: AdminImListParams) {
    return request.get<PageResult<AdminImDevice>>({
      url: '/saimulti/admin/im/operations/devices',
      params
    })
  },
  sessions(params: AdminImListParams) {
    return request.get<PageResult<AdminImSession>>({
      url: '/saimulti/admin/im/operations/sessions',
      params
    })
  },
  loginAudits(params: AdminImListParams) {
    return request.get<PageResult<AdminImLoginAudit>>({
      url: '/saimulti/admin/im/operations/loginAudits',
      params
    })
  },
  setDeviceStatus(id: number, status: 1 | 2) {
    return request.post<{
      cache_invalidation: CacheInvalidationResult
      realtime_event: RealtimeEventResult
    }>({
      url: '/saimulti/admin/im/operations/deviceStatus',
      data: { id, status }
    })
  },
  revokeSession(id: number) {
    return request.post<{
      cache_invalidation: CacheInvalidationResult
      realtime_event: RealtimeEventResult
    }>({
      url: '/saimulti/admin/im/operations/revokeSession',
      data: { id }
    })
  }
}
