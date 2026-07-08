import request from '@/utils/http'

/**
 * 菜单API
 */
export default {
  /**
   * 获取数据列表
   * @param params 搜索参数
   * @returns 数据列表
   */
  list(params: Record<string, any>) {
    return request.get<Api.Common.ApiData[]>({
      url: '/saimulti/system/coreMenu/index',
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
      url: '/saimulti/system/coreMenu/read?id=' + id
    })
  },

  /**
   * 创建数据
   * @param params 数据参数
   * @returns 执行结果
   */
  save(params: Record<string, any>) {
    return request.post<any>({
      url: '/saimulti/system/coreMenu/save',
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
      url: '/saimulti/system/coreMenu/update',
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
      url: '/saimulti/system/coreMenu/destroy',
      data: params
    })
  },

  /**
   * 可操作角色
   * @returns 数据列表
   */
  accessMenu(params: Record<string, any>) {
    return request.get<Api.Common.ApiData[]>({
      url: '/saimulti/system/coreMenu/accessMenu',
      params
    })
  }
}
