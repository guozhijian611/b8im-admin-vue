import request from '@/utils/http'

const TRACE_API_PREFIX = '/saimulti/system/trace'

export interface TraceService {
  name: string
}

export interface TraceServicesResult {
  items: TraceService[]
  total: number
}

export interface TraceSearchParams {
  service?: string
  operation?: string
  trace_id?: string
  organization?: string
  message_id?: string
  min_duration_ms?: number
  error_only?: 1
  start_time?: number
  end_time?: number
  limit: number
}

export interface TraceSummary {
  trace_id: string
  root_service: string
  root_operation: string
  start_time_ms: number
  end_time_ms: number
  duration_ms: number
  span_count: number
  error_count: number
  services: string[]
  organization?: string | number | null
  message_id?: string | null
}

export interface TraceSearchResult {
  items: TraceSummary[]
  total: number
  limit: number
}

export interface TraceSpanLog {
  time_ms: number
  fields: Record<string, unknown>
}

export interface TraceSpan {
  span_id: string
  parent_span_id?: string | null
  service: string
  operation: string
  start_time_ms: number
  duration_ms: number
  error: boolean
  status: string
  tags: Record<string, unknown>
  logs: TraceSpanLog[]
}

export interface TraceDetail extends TraceSummary {
  spans: TraceSpan[]
}

export default {
  services() {
    return request.get<TraceServicesResult>({ url: `${TRACE_API_PREFIX}/services` })
  },
  search(params: TraceSearchParams) {
    return request.get<TraceSearchResult>({ url: `${TRACE_API_PREFIX}/search`, params })
  },
  read(traceId: string) {
    return request.get<TraceDetail>({
      url: `${TRACE_API_PREFIX}/read`,
      params: { trace_id: traceId }
    })
  }
}
