import request from '@/utils/http'

/**
 * 机构分组表 API接口
 */
export default {
  /**
   * 获取数据列表
   * @param params 搜索参数
   * @returns 数据列表
   */
  list(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({
      url: '/saimulti/admin/group/index',
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
      url: '/saimulti/admin/group/read?id=' + id
    })
  },

  /**
   * 创建数据
   * @param params 数据参数
   * @returns 执行结果
   */
  save(params: Record<string, any>) {
    return request.post<any>({
      url: '/saimulti/admin/group/save',
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
      url: '/saimulti/admin/group/update',
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
      url: '/saimulti/admin/group/destroy',
      data: params
    })
  },

  /**
   * 通过分组获取菜单
   * @param id 数据ID
   * @returns
   */
  getMenuByGroup(params: Record<string, any>) {
    return request.get<any>({
      url: '/saimulti/admin/group/getMenuByGroup',
      params
    })
  },

  /**
   * 更新分组菜单
   * @id id 数据ID
   * @param id 数据ID
   * @returns
   */
  updateMenuGroup(params: Record<string, any>) {
    return request.post<any>({
      url: '/saimulti/admin/group/updateMenuGroup',
      method: 'post',
      data: params
    })
  }
}
