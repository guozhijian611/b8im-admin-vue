import request from '@/utils/http'

const prefix = '/saimulti/admin/file-media'

export default {
  quotaList(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({ url: `${prefix}/quotaIndex`, params })
  },
  quotaRead(organization: number | string) {
    return request.get<Api.Common.ApiData>({ url: `${prefix}/quotaRead`, params: { organization } })
  },
  quotaUpdate(data: Record<string, any>) {
    return request.put<Api.Common.ApiData>({ url: `${prefix}/quotaUpdate`, data })
  },
  itemList(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({ url: `${prefix}/itemIndex`, params })
  },
  folderList(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({ url: `${prefix}/folderIndex`, params })
  }
}
