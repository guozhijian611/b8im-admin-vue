import request from '@/utils/http'

export type SystemModuleStatus =
  | 'DISCOVERED'
  | 'INSTALLED'
  | 'ENABLED'
  | 'DISABLED'
  | 'UPGRADING'
  | 'FAILED'
  | 'UNINSTALLED'

export interface ModuleConfigSchemaItem {
  key: string
  name: string
  description?: string
  type:
    | 'string'
    | 'integer'
    | 'number'
    | 'boolean'
    | 'select'
    | 'multiselect'
    | 'json'
    | 'secret'
    | 'url'
  scope: 'system' | 'tenant'
  required: boolean
  sensitive: boolean
  default?: unknown
  options?: Array<{ label: string; value: string | number | boolean }>
}

export interface ModuleSystemRecord {
  status: SystemModuleStatus
  version: string
  available_version: string
  upgrade_available: boolean
  failure_message: string
  installed_at: string | null
  enabled_at: string | null
}

export interface ModuleCatalogItem {
  module_key: string
  name: string
  version: string
  description: string
  category: string
  module_type: string
  is_builtin: boolean
  license_required: boolean
  min_system_version: string
  platforms: string[]
  depends_on: Array<{ module_key: string; constraint: string }>
  conflicts_with: Array<{ module_key: string; constraint: string }>
  permissions: Array<Record<string, unknown>>
  menus: Array<Record<string, unknown>>
  routes: Array<Record<string, unknown>>
  config: ModuleConfigSchemaItem[]
  migrations: Array<Record<string, unknown>>
  capabilities: Record<string, string[]>
  hooks: Record<string, unknown>
  system: ModuleSystemRecord | null
}

export interface ModuleCatalogResponse {
  items: ModuleCatalogItem[]
}

const moduleKeyBody = (moduleKey: string) => ({ module_key: moduleKey })

export default {
  catalog() {
    return request.get<ModuleCatalogResponse>({ url: '/saimulti/admin/module/catalog' })
  },
  read(moduleKey: string) {
    return request.get<ModuleCatalogItem>({
      url: '/saimulti/admin/module/read',
      params: { module_key: moduleKey }
    })
  },
  discover(moduleKey?: string) {
    return request.post<any>({
      url: '/saimulti/admin/module/discover',
      data: moduleKey ? moduleKeyBody(moduleKey) : {}
    })
  },
  install(moduleKey: string) {
    return request.post<any>({
      url: '/saimulti/admin/module/install',
      data: moduleKeyBody(moduleKey)
    })
  },
  upgrade(moduleKey: string) {
    return request.post<any>({
      url: '/saimulti/admin/module/upgrade',
      data: moduleKeyBody(moduleKey)
    })
  },
  enable(moduleKey: string) {
    return request.post<any>({
      url: '/saimulti/admin/module/enable',
      data: moduleKeyBody(moduleKey)
    })
  },
  disable(moduleKey: string) {
    return request.post<any>({
      url: '/saimulti/admin/module/disable',
      data: moduleKeyBody(moduleKey)
    })
  },
  uninstall(moduleKey: string, preserveData = true) {
    return request.post<any>({
      url: '/saimulti/admin/module/uninstall',
      data: { module_key: moduleKey, preserve_data: preserveData }
    })
  },
  grantLicense(params: {
    organization: number
    module_key: string
    expire_at: string | null
    remark: string
  }) {
    return request.post<any>({
      url: '/saimulti/admin/module/license/grant',
      data: params
    })
  },
  revokeLicense(params: { organization: number; module_key: string }) {
    return request.post<any>({
      url: '/saimulti/admin/module/license/revoke',
      data: params
    })
  }
}
