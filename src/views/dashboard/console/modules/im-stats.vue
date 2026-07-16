<template>
  <div class="art-card h-105 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>IM 核心指标</h4>
        <p>用户 / 设备 / 会话 / 消息投递</p>
      </div>
      <ElButton text type="primary" @click="goOps">
        运维中心
        <ArtSvgIcon icon="ri:arrow-right-s-line" class="ml-1" />
      </ElButton>
    </div>

    <ElSkeleton :loading="loading" animated>
      <div class="mt-4 grid grid-cols-2 gap-3">
        <div
          v-for="metric in metrics"
          :key="metric.label"
          class="rounded-xl border border-g-200 bg-g-100 px-4 py-3"
        >
          <p class="text-xs text-g-600">{{ metric.label }}</p>
          <p class="mt-2 text-2xl font-semibold text-g-900">{{ metric.value }}</p>
          <p class="mt-1 text-xs text-g-600">{{ metric.detail }}</p>
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
  import { useRouter } from 'vue-router'
  import imOpsApi, { type AdminImOverview } from '@/api/admin/im/operations'

  interface MetricItem {
    label: string
    value: string
    detail: string
  }

  const router = useRouter()
  const loading = ref(true)
  const error = ref('')
  const metrics = ref<MetricItem[]>([])

  const goOps = () => {
    router.push('/panel/im-operations')
  }

  onMounted(async () => {
    try {
      const overview = (await imOpsApi.overview()) as AdminImOverview
      const s = overview.statistics
      metrics.value = [
        {
          label: 'IM 用户',
          value: String(s?.users?.total ?? 0),
          detail: `活跃 ${s?.users?.active ?? 0} · 禁用 ${s?.users?.disabled ?? 0} · 封禁 ${s?.users?.banned ?? 0}`
        },
        {
          label: '设备',
          value: String(s?.devices?.total ?? 0),
          detail: `在线 ${s?.devices?.online ?? 0} · 禁用 ${s?.devices?.disabled ?? 0}`
        },
        {
          label: '会话',
          value: String(s?.sessions?.total ?? 0),
          detail: `有效 ${s?.sessions?.active ?? 0} · 撤销 ${s?.sessions?.revoked ?? 0}`
        },
        {
          label: '投递 Outbox',
          value: String(s?.outbox?.pending ?? 0),
          detail: `失败 ${s?.outbox?.failed ?? 0} · 已发布 ${s?.outbox?.published ?? 0}`
        }
      ]
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : '无法加载 IM 指标'
    } finally {
      loading.value = false
    }
  })
</script>
