import request from '@/utils/http'

export type ClientFamily = 'web' | 'app' | 'desktop'
export type RoutingMode = 'single' | 'primary_backup'

export interface RoutingEndpoints {
  api_server_url: string
  im_server_url: string
  upload_server_url: string
  web_server_url: string
}

export interface RoutingRouteInput {
  route_id: string
  name: string
  priority: number
  weight: number
  region: string
  carrier: string
  failure_domain: string
  endpoints: RoutingEndpoints
}

export interface RoutingPublishInput {
  organization: number
  deployment_id: string
  deployment_name: string
  route_pool_id: string
  route_pool_name: string
  mode: RoutingMode
  client_families: ClientFamily[]
  routes: RoutingRouteInput[]
}

export interface RoutingReadResult {
  organization: number
  deployment_id: string
  client_family: ClientFamily
  server_info: {
    route_pool_id: string
    route_pool_version: number
    routing_version: number
    policy: { mode: RoutingMode }
    routes: Array<{
      route_id: string
      name: string
      priority: number
      weight: number
      region: string
      carrier: string
      endpoints: RoutingEndpoints
    }>
  }
  routing_signature: { kid: string }
  publish_time: string
}

export default {
  read(organization: number, clientFamily: ClientFamily) {
    return request.get<RoutingReadResult>({
      url: '/saimulti/admin/routing/read',
      params: { organization, client_family: clientFamily },
      showErrorMessage: false
    })
  },
  publish(data: RoutingPublishInput) {
    return request.post<{
      route_pool_version: number
      published: Record<ClientFamily, { routing_version: number; signature_kid: string }>
      routing_public_key: string
    }>({ url: '/saimulti/admin/routing/publish', data, showErrorMessage: false })
  }
}
