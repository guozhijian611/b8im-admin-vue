import request from '@/utils/http'

const prefix = '/saimulti/admin/customer-service'

export default {
  conversationList(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({ url: `${prefix}/conversation/index`, params })
  },
  conversationRead(id: number | string) {
    return request.get<Api.Common.ApiData>({ url: `${prefix}/conversation/read`, params: { id } })
  }
}
