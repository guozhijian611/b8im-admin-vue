import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

/**
 * 获取验证码
 * @returns 响应
 */
export function fetchCaptcha() {
  return request.get<Api.Auth.CaptchaResponse>({
    url: '/saimulti/captcha'
  })
}

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/saimulti/admin/login',
    params
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/saimulti/admin/user'
  })
}

// 获取菜单列表
export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/saimulti/admin/menu'
  })
}

/**
 * 清理缓存
 * @returns
 */
export function fetchClearCache() {
  return request.get<any>({
    url: '/saimulti/admin/clearAllCache'
  })
}

/**
 * 获取字典数据
 * @returns 字典数组
 */
export function fetchGetDictList() {
  return request.get<Api.Auth.DictData>({
    url: '/saimulti/system/dictAll'
  })
}

/**
 * 上传图片
 * @param params
 * @returns
 */
export function uploadImage(params: any) {
  return request.post<any>({
    url: '/saimulti/system/uploadImage',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    params
  })
}

/**
 * 上传文件
 * @param params
 * @returns
 */
export function uploadFile(params: any) {
  return request.post<any>({
    url: '/saimulti/system/uploadFile',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    params
  })
}

/**
 * 切片上传
 * @param params
 * @returns
 */
export function chunkUpload(params: any) {
  return request.post<any>({
    url: '/saimulti/system/chunkUpload',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    params
  })
}

/**
 * 资源分类
 * @param params
 * @returns
 */
export function getResourceCategory(params: any) {
  return request.get<Api.Common.ApiData[]>({
    url: '/saimulti/system/getResourceCategory',
    params
  })
}

/**
 * 图片资源列表
 * @param params
 * @returns
 */
export function getResourceList(params: any) {
  return request.get<Api.Common.ApiPage>({
    url: '/saimulti/system/getResourceList',
    params
  })
}

export interface AreaCodeOption {
  label: string
  value: string | number
  level: number
  pcode: string | number | null
  leaf: boolean
}

/**
 * 获取地区级联数据
 */
export function fetchAreaCode(params: {
  pcode?: string | number
  code?: string | number
  level?: number
}) {
  return request.get<AreaCodeOption[]>({
    url: '/saimulti/system/areaCode',
    params
  })
}

/**
 * 修改资料
 * @param params 修改资料参数
 * @returns 响应
 */
export function updateUserInfo(params: Record<string, any>) {
  return request.post<any>({
    url: '/saimulti/admin/updateInfo',
    params
  })
}

/**
 * 修改密码
 * @param params 修改密码参数
 * @returns 响应
 */
export function modifyPassword(params: Record<string, any>) {
  return request.post<any>({
    url: '/saimulti/admin/modifyPassword',
    params
  })
}

/**
 * 获取登录日志
 * @returns 登录日志数组
 */
export function fetchGetLogin(params: Record<string, any>) {
  return request.get<Api.Common.ApiPage>({
    url: '/saimulti/admin/loginList',
    params
  })
}

/**
 * 获取操作日志
 * @returns 操作日志数组
 */
export function fetchGetOperate(params: Record<string, any>) {
  return request.get<Api.Common.ApiPage>({
    url: '/saimulti/admin/operList',
    params
  })
}
