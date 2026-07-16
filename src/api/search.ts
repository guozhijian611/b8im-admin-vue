import request from '@/utils/http'

const prefix = '/saimulti/admin/search'

export default {
  indexList(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({ url: `${prefix}/indexList`, params })
  },
  indexRead(organization: number | string) {
    return request.get<Api.Common.ApiData>({ url: `${prefix}/indexRead`, params: { organization } })
  },
  rebuild(data: { organization: number | string }) {
    return request.post<Api.Common.ApiData>({ url: `${prefix}/rebuild`, data })
  },
  jobList(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({ url: `${prefix}/jobIndex`, params })
  },
  docUpsert(data: Record<string, any>) {
    return request.post<Api.Common.ApiData>({ url: `${prefix}/docUpsert`, data })
  }
}
