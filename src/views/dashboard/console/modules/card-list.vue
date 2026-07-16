<template>
  <ElRow :gutter="20" class="flex">
    <ElCol v-for="(item, index) in dataList" :key="index" :sm="12" :md="6" :lg="6">
      <div class="art-card relative flex flex-col justify-center h-35 px-5 mb-5 max-sm:mb-4">
        <span class="text-g-700 text-sm">{{ item.des }}</span>
        <ArtCountTo class="text-[26px] font-medium mt-2" :target="item.num" :duration="1300" />
        <div class="flex-c mt-1">
          <span class="text-xs text-g-600">{{ item.hint }}</span>
        </div>
        <div
          class="absolute top-0 bottom-0 right-5 m-auto size-12.5 rounded-xl flex-cc bg-theme/10"
        >
          <ArtSvgIcon :icon="item.icon" class="text-xl text-theme" />
        </div>
      </div>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import { onMounted, reactive } from 'vue'
  import organizationApi from '@/api/admin/panel/organization'
  import adminUserApi from '@/api/admin/system/user'
  import moduleApi from '@/api/admin/panel/module'
  import imOpsApi from '@/api/admin/im/operations'

  interface CardDataItem {
    des: string
    icon: string
    num: number
    hint: string
  }

  const dataList = reactive<CardDataItem[]>([
    {
      des: '机构（租户）',
      icon: 'ri:building-line',
      num: 0,
      hint: '平台开通机构数'
    },
    {
      des: '平台账号',
      icon: 'ri:user-settings-line',
      num: 0,
      hint: '总后台管理员'
    },
    {
      des: 'IM 用户',
      icon: 'ri:group-line',
      num: 0,
      hint: '全平台 IM 用户'
    },
    {
      des: '在线设备',
      icon: 'ri:smartphone-line',
      num: 0,
      hint: '当前在线设备数'
    }
  ])

  const pageTotal = (payload: unknown): number => {
    if (!payload || typeof payload !== 'object') return 0
    const row = payload as Record<string, unknown>
    if (typeof row.total === 'number') return row.total
    if (Array.isArray(row.data)) return row.data.length
    if (Array.isArray(payload)) return payload.length
    return 0
  }

  onMounted(async () => {
    const tasks = await Promise.allSettled([
      organizationApi.list({ page: 1, limit: 1 }),
      adminUserApi.list({ page: 1, limit: 1 }),
      moduleApi.catalog(),
      imOpsApi.overview()
    ])

    if (tasks[0].status === 'fulfilled') {
      dataList[0].num = pageTotal(tasks[0].value)
    }
    if (tasks[1].status === 'fulfilled') {
      dataList[1].num = pageTotal(tasks[1].value)
    }
    if (tasks[2].status === 'fulfilled') {
      const catalog = tasks[2].value as { items?: unknown[] }
      const modules = Array.isArray(catalog?.items) ? catalog.items.length : 0
      if (modules > 0) {
        dataList[0].hint = `机构数 · 模块 ${modules}`
      }
    }
    if (tasks[3].status === 'fulfilled') {
      const overview = tasks[3].value as {
        statistics?: {
          users?: { total?: number }
          devices?: { online?: number }
        }
      }
      dataList[2].num = Number(overview.statistics?.users?.total ?? 0)
      dataList[3].num = Number(overview.statistics?.devices?.online ?? 0)
    }
  })
</script>
