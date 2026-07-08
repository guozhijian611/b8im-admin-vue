import request from '@/utils/http'

/**
 * 用户API
 */
export default {
  /**
   * 获取数据列表
   * @param params 搜索参数
   * @returns 数据列表
   */
  list(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({
      url: '/saimulti/admin/user/index',
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
      url: '/saimulti/admin/user/read?id=' + id
    })
  },

  /**
   * 创建数据
   * @param params 数据参数
   * @returns 执行结果
   */
  save(params: Record<string, any>) {
    return request.post<any>({
      url: '/saimulti/admin/user/save',
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
      url: '/saimulti/admin/user/update',
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
      url: '/saimulti/admin/user/destroy',
      data: params
    })
  },

  /**
   * 修改密码
   * @param params 数据参数
   * @returns 执行结果
   */
  changePassword(params: Record<string, any>) {
    return request.post<any>({
      url: '/saimulti/admin/user/reset',
      data: params
    })
  },

  /**
   * 清理缓存
   * @param params 数据参数
   * @returns
   */
  clearCache(params: Record<string, any>) {
    return request.post<any>({
      url: '/saimulti/admin/user/clearCache',
      data: params
    })
  }
}
