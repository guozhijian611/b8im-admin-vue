import request from '@/utils/http'

const prefix = '/saimulti/admin/moments'

export default {
  list(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({ url: `${prefix}/index`, params })
  },
  read(id: number | string) {
    return request.get<Api.Common.ApiData>({ url: `${prefix}/read`, params: { id } })
  },
  delete(params: { ids: Array<number | string>; organization: number | string }) {
    return request.del<any>({ url: `${prefix}/destroy`, data: params })
  }
}
