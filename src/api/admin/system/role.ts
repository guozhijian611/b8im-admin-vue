import request from '@/utils/http'

/**
 * 角色API
 */
export default {
  /**
   * 获取数据列表
   * @param params 搜索参数
   * @returns 数据列表
   */
  list(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({
      url: 'saimulti/system/coreRole/index',
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
      url: 'saimulti/system/coreRole/read?id=' + id
    })
  },

  /**
   * 创建数据
   * @param params 数据参数
   * @returns 执行结果
   */
  save(params: Record<string, any>) {
    return request.post<any>({
      url: 'saimulti/system/coreRole/save',
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
      url: 'saimulti/system/coreRole/update',
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
      url: 'saimulti/system/coreRole/destroy',
      data: params
    })
  },

  /**
   * 获取数据列表
   * @param params 搜索参数
   * @returns 数据列表
   */
  menuByRole(params: Record<string, any>) {
    return request.get<Api.Common.ApiData>({
      url: 'saimulti/system/coreRole/getMenuByRole',
      params
    })
  },

  /**
   * 可操作角色
   * @returns 数据列表
   */
  accessRole() {
    return request.get<Api.Common.ApiData[]>({
      url: 'saimulti/system/coreRole/accessRole'
    })
  },

  /**
   * 保存菜单权限
   * @param params
   * @returns
   */
  menuPermission(params: Record<string, any>) {
    return request.post<any>({
      url: 'saimulti/system/coreRole/menuPermission',
      data: params
    })
  },

  /**
   * 获取部门数据列表
   * @param params 搜索参数
   * @returns 数据列表
   */
  deptByRole(params: Record<string, any>) {
    return request.get<Api.Common.ApiData[]>({
      url: 'saimulti/system/coreRole/getDeptByRole',
      params
    })
  },

  /**
   * 保存数据权限
   * @param params
   * @returns
   */
  dataPermission(params: Record<string, any>) {
    return request.post<any>({
      url: 'saimulti/system/coreRole/dataPermission',
      data: params
    })
  }
}
