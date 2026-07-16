<template>
  <div class="art-card h-105 p-5 box-border mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>运行状态</h4>
        <p>{{ checkedAt || '加载中…' }}</p>
      </div>
      <ElTag :type="overallHealthy ? 'success' : 'warning'" effect="light">
        {{ overallHealthy ? '健康' : '需关注' }}
      </ElTag>
    </div>

    <ElSkeleton :loading="loading" animated>
      <div class="mt-4 space-y-3">
        <div
          v-for="item in items"
          :key="item.label"
          class="flex items-center justify-between rounded-xl border border-g-200 bg-g-100 px-4 py-3"
        >
          <div class="flex items-center gap-2">
            <ArtSvgIcon :icon="item.icon" class="text-lg text-theme" />
            <span class="text-sm text-g-800">{{ item.label }}</span>
          </div>
          <ElTag :type="item.ok ? 'success' : 'danger'" size="small" effect="plain">
            {{ item.value }}
          </ElTag>
        </div>
      </div>
      <ElAlert
        v-if="error"
        class="mt-4"
        type="error"
        :closable="false"
        show-icon
        :title="error"
      />
    </ElSkeleton>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import imOpsApi, { type AdminImOverview } from '@/api/admin/im/operations'

  interface HealthItem {
    label: string
    icon: string
    value: string
    ok: boolean
  }

  const loading = ref(true)
  const error = ref('')
  const overallHealthy = ref(false)
  const checkedAt = ref('')
  const items = ref<HealthItem[]>([])

  onMounted(async () => {
    try {
      const overview = (await imOpsApi.overview()) as AdminImOverview
      overallHealthy.value = overview.status === 'healthy'
      checkedAt.value = overview.checked_at
        ? `检查时间 ${overview.checked_at}`
        : '实时检查'
      items.value = [
        {
          label: '数据库',
          icon: 'ri:database-2-line',
          value: overview.database?.status === 'up' ? '正常' : '异常',
          ok: overview.database?.status === 'up'
        },
        {
          label: 'Redis',
          icon: 'ri:flashlight-line',
          value: overview.redis?.status === 'up' ? '正常' : '异常',
          ok: overview.redis?.status === 'up'
        },
        {
          label: 'IM 表结构',
          icon: 'ri:table-line',
          value:
            overview.im_schema?.status === 'ready'
              ? '就绪'
              : overview.im_schema?.status === 'missing'
                ? `缺表 ${overview.im_schema.missing?.length ?? 0}`
                : '不可用',
          ok: overview.im_schema?.status === 'ready'
        },
        {
          label: '对象存储',
          icon: 'ri:hard-drive-3-line',
          value: overview.storage?.configured
            ? overview.storage.label || overview.storage.mode || '已配置'
            : '未配置',
          ok: overview.storage?.status === 'ready'
        }
      ]
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : '无法加载运行状态'
      overallHealthy.value = false
    } finally {
      loading.value = false
    }
  })
</script>
