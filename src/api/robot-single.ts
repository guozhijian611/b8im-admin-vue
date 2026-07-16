import request from '@/utils/http'

const prefix = '/saimulti/admin/robot-single'

export default {
  list(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({ url: `${prefix}/index`, params })
  },
  read(id: number | string) {
    return request.get<Api.Common.ApiData>({ url: `${prefix}/read`, params: { id } })
  },
  ruleList(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({ url: `${prefix}/ruleIndex`, params })
  },
  kbList(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({ url: `${prefix}/kbIndex`, params })
  }
}
