import request from '@/utils/http'

export type ModuleAssignmentMode = 'inherit' | 'enabled' | 'disabled'

export interface OrganizationModuleCapability {
  module_key: string
  name: string
  description: string
  category: string
  version: string
  platforms: string[]
  depends_on: Array<{ module_key: string; constraint: string }>
  assignment_mode: ModuleAssignmentMode
  package_enabled: boolean
  status: string
  effective: boolean
  expire_at: string | null
  remark: string
}

export interface OrganizationModuleCapabilitiesResponse {
  organization: number
  organization_name: string
  group_id: number
  items: OrganizationModuleCapability[]
}

/**
 * 机构信息表 API接口
 */
export default {
  /**
   * 获取数据列表
   * @param params 搜索参数
   * @returns 数据列表
   */
  list(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({
      url: '/saimulti/admin/organization/index',
      params
    })
  },

  /**
   * 读取数据
   * @param id 数据ID
   * @returns 数据详情
   */
  read(id: number | string) {
    return request.get<Api.Common.ApiData>({
      url: '/saimulti/admin/organization/read?id=' + id
    })
  },

  /**
   * 创建数据
   * @param params 数据参数
   * @returns 执行结果
   */
  save(params: Record<string, any>) {
    return request.post<any>({
      url: '/saimulti/admin/organization/save',
      data: params
    })
  },

  /**
   * 更新数据
   * @param params 数据参数
   * @returns 执行结果
   */
  update(params: Record<string, any>) {
    return request.put<any>({
      url: '/saimulti/admin/organization/update',
      data: params
    })
  },

  /**
   * 删除数据
   * @param id 数据ID
   * @returns 执行结果
   */
  delete(params: Record<string, any>) {
    return request.del<any>({
      url: '/saimulti/admin/organization/destroy',
      data: params
    })
  },

  /**
   * 初始化机构
   * @param id 数据ID
   * @returns 执行结果
   */
  initTenant(params: Record<string, any>) {
    return request.post<any>({
      url: '/saimulti/admin/organization/initTenant',
      data: params
    })
  },

  moduleCapabilities(id: number | string) {
    return request.get<OrganizationModuleCapabilitiesResponse>({
      url: '/saimulti/admin/organization/moduleCapabilities',
      params: { id }
    })
  },

  updateModuleCapabilities(params: {
    id: number
    assignments: Array<{
      module_key: string
      mode: ModuleAssignmentMode
      expire_at: string | null
      remark: string
    }>
  }) {
    return request.post<OrganizationModuleCapabilitiesResponse>({
      url: '/saimulti/admin/organization/updateModuleCapabilities',
      data: params
    })
  }
}
