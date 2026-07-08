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
      url: '/saimulti/system/admin/index',
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
      url: '/saimulti/system/admin/read?id=' + id
    })
  },

  /**
   * 创建数据
   * @param params 数据参数
   * @returns 执行结果
   */
  save(params: Record<string, any>) {
    return request.post<any>({
      url: '/saimulti/system/admin/save',
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
      url: '/saimulti/system/admin/update',
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
      url: '/saimulti/system/admin/destroy',
      data: params
    })
  },

  /**
   * 设置首页
   * @param params 数据参数
   * @returns 执行结果
   */
  setHomePage(params: Record<string, any>) {
    return request.post<any>({
      url: '/saimulti/system/admin/setHomePage',
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
      url: '/saimulti/system/admin/reset',
      data: params
    })
  },

  /**
   * 清理缓存
   * @param params
   * @returns
   */
  clearCache(params: Record<string, any>) {
    return request.post<any>({
      url: '/saimulti/system/admin/clearCache',
      data: params
    })
  }
}
