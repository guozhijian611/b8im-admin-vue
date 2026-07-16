<template>
  <div class="art-card p-5 mb-5 max-sm:mb-4 min-h-80">
    <div class="art-card-header">
      <div class="title">
        <h4>商业模块</h4>
        <p>已安装模块与状态</p>
      </div>
      <ElButton text type="primary" @click="goModules">
        管理
        <ArtSvgIcon icon="ri:arrow-right-s-line" class="ml-1" />
      </ElButton>
    </div>

    <ElSkeleton :loading="loading" animated>
      <div v-if="modules.length === 0 && !error" class="mt-8">
        <ElEmpty description="暂无模块数据" :image-size="80" />
      </div>
      <div v-else class="mt-3 max-h-64 overflow-auto space-y-2">
        <div
          v-for="item in modules"
          :key="item.key"
          class="flex items-center justify-between rounded-lg border border-g-200 px-3 py-2.5"
        >
          <div class="min-w-0">
            <div class="text-sm font-medium text-g-900 truncate">{{ item.name }}</div>
            <div class="text-xs text-g-600 truncate">{{ item.key }} · v{{ item.version }}</div>
          </div>
          <ElTag size="small" :type="item.enabled ? 'success' : 'info'" effect="plain">
            {{ item.enabled ? '可用' : '停用' }}
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
  import { useRouter } from 'vue-router'
  import moduleApi from '@/api/admin/panel/module'

  interface ModuleRow {
    key: string
    name: string
    version: string
    enabled: boolean
  }

  const router = useRouter()
  const loading = ref(true)
  const error = ref('')
  const modules = ref<ModuleRow[]>([])

  const goModules = () => {
    router.push('/panel/module')
  }

  onMounted(async () => {
    try {
      const payload = await moduleApi.catalog()
      const items = Array.isArray(payload?.items) ? payload.items : []
      modules.value = items.map((item) => {
        const key = String(item.module_key || '')
        const name = String(item.name || key || '未命名模块')
        const version = String(item.system?.version || item.version || '-')
        const status = item.system?.status
        return { key: key || name, name, version, enabled: status === 'ENABLED' }
      })
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : '无法加载模块列表'
    } finally {
      loading.value = false
    }
  })
</script>
