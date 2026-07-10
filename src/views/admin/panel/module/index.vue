<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="text-lg font-semibold">模块管理</div>
            <ElText type="info"
              >系统安装状态与租户授权相互独立，所有操作以 Server 校验为准。</ElText
            >
          </div>
          <ElSpace wrap>
            <ElInput
              v-model="keyword"
              clearable
              placeholder="搜索模块名称或标识"
              style="width: 240px"
            />
            <ElButton
              v-permission="'saimulti:admin:module:discover'"
              :loading="activeAction === 'discover:*'"
              @click="discoverAll"
            >
              <template #icon><ArtSvgIcon icon="ri:radar-line" /></template>
              重新发现
            </ElButton>
            <ElButton :loading="loading" @click="loadCatalog">
              <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
              刷新
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <ElAlert v-if="error" class="mb-4" type="error" :closable="false" show-icon :title="error" />
      <ArtTable
        rowKey="module_key"
        :loading="loading"
        :data="filteredItems"
        :columns="columns"
        empty-text="未发现本地模块清单"
      >
        <template #module="{ row }">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <span class="font-semibold">{{ row.name }}</span>
              <ElTag v-if="row.is_builtin" size="small" effect="plain">内置</ElTag>
              <ElTag v-if="row.license_required" size="small" type="warning" effect="plain">
                需授权
              </ElTag>
            </div>
            <ElText type="info" size="small">{{ row.module_key }}</ElText>
            <ElText truncated style="max-width: 360px">{{ row.description }}</ElText>
          </div>
        </template>
        <template #platforms="{ row }">
          <ElSpace wrap>
            <ElTag v-for="platform in row.platforms" :key="platform" size="small" effect="plain">
              {{ platform }}
            </ElTag>
          </ElSpace>
        </template>
        <template #version="{ row }">
          <div class="flex flex-col">
            <span>{{ row.system?.version || '-' }}</span>
            <ElText type="info" size="small"
              >清单 {{ row.system?.available_version || row.version }}</ElText
            >
          </div>
        </template>
        <template #status="{ row }">
          <ElTag :type="statusTagType(row.system?.status)" effect="light">
            {{ statusLabel(row.system?.status) }}
          </ElTag>
          <ElTooltip v-if="row.system?.failure_message" :content="row.system.failure_message">
            <ArtSvgIcon class="ml-2 text-red-500" icon="ri:error-warning-line" />
          </ElTooltip>
        </template>
        <template #operation="{ row }">
          <ElSpace wrap>
            <ElButton
              v-permission="'saimulti:admin:module:read'"
              size="small"
              @click="openDetail(row)"
            >
              详情
            </ElButton>
            <ElButton
              v-if="
                !row.system || row.system.status === 'UNINSTALLED' || row.system.status === 'FAILED'
              "
              v-permission="'saimulti:admin:module:discover'"
              size="small"
              :loading="isActionLoading(row, 'discover')"
              @click="runLifecycle(row, 'discover', '发现')"
            >
              发现
            </ElButton>
            <ElButton
              v-if="row.system?.status === 'DISCOVERED'"
              v-permission="'saimulti:admin:module:install'"
              size="small"
              type="primary"
              :loading="isActionLoading(row, 'install')"
              @click="runLifecycle(row, 'install', '安装')"
            >
              安装
            </ElButton>
            <ElButton
              v-if="canUpgrade(row)"
              v-permission="'saimulti:admin:module:upgrade'"
              size="small"
              type="warning"
              :loading="isActionLoading(row, 'upgrade')"
              @click="runLifecycle(row, 'upgrade', '升级')"
            >
              升级
            </ElButton>
            <ElButton
              v-if="row.system?.status === 'INSTALLED' || row.system?.status === 'DISABLED'"
              v-permission="'saimulti:admin:module:enable'"
              size="small"
              type="success"
              :loading="isActionLoading(row, 'enable')"
              @click="runLifecycle(row, 'enable', '启用')"
            >
              启用
            </ElButton>
            <ElButton
              v-if="row.system?.status === 'ENABLED'"
              v-permission="'saimulti:admin:module:disable'"
              size="small"
              type="warning"
              :loading="isActionLoading(row, 'disable')"
              @click="runLifecycle(row, 'disable', '禁用')"
            >
              禁用
            </ElButton>
            <ElButton
              v-if="canUninstall(row)"
              v-permission="'saimulti:admin:module:uninstall'"
              size="small"
              type="danger"
              :loading="isActionLoading(row, 'uninstall')"
              @click="runLifecycle(row, 'uninstall', '卸载')"
            >
              卸载
            </ElButton>
            <ElButton
              v-if="row.system?.status === 'ENABLED' && canGrantLicense"
              size="small"
              @click="openLicense(row, 'grant')"
            >
              租户授权
            </ElButton>
            <ElButton
              v-if="row.system?.status === 'ENABLED' && canRevokeLicense"
              size="small"
              type="danger"
              plain
              @click="openLicense(row, 'revoke')"
            >
              撤销授权
            </ElButton>
          </ElSpace>
        </template>
      </ArtTable>
    </ElCard>

    <DetailDialog v-model="detailVisible" :module-key="selectedModule?.module_key" />
    <LicenseDialog
      v-model="licenseVisible"
      :mode="licenseMode"
      :module-key="selectedModule?.module_key"
      :module-name="selectedModule?.name"
      @success="loadCatalog"
    />
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import moduleApi, {
    type ModuleCatalogItem,
    type SystemModuleStatus
  } from '@/api/admin/panel/module'
  import { refreshDynamicRoutes, router } from '@/router'
  import { checkAuth } from '@/utils/tool'
  import DetailDialog from './modules/detail-dialog.vue'
  import LicenseDialog from './modules/license-dialog.vue'

  type LifecycleAction = 'discover' | 'install' | 'upgrade' | 'enable' | 'disable' | 'uninstall'

  const loading = ref(false)
  const error = ref('')
  const items = ref<ModuleCatalogItem[]>([])
  const keyword = ref('')
  const activeAction = ref('')
  const selectedModule = ref<ModuleCatalogItem | null>(null)
  const detailVisible = ref(false)
  const licenseVisible = ref(false)
  const licenseMode = ref<'grant' | 'revoke'>('grant')
  const canGrantLicense = computed(() =>
    ['saimulti:admin:module:license:grant', 'saimulti:admin:organization:index'].every(checkAuth)
  )
  const canRevokeLicense = computed(() =>
    ['saimulti:admin:module:license:revoke', 'saimulti:admin:organization:index'].every(checkAuth)
  )
  const columns = [
    { prop: 'module', label: '模块', minWidth: 320, useSlot: true },
    { prop: 'platforms', label: '支持平台', minWidth: 220, useSlot: true },
    { prop: 'version', label: '版本', width: 150, useSlot: true },
    { prop: 'status', label: '系统状态', width: 140, useSlot: true },
    { prop: 'operation', label: '操作', minWidth: 520, fixed: 'right' as const, useSlot: true }
  ]

  const filteredItems = computed(() => {
    const value = keyword.value.trim().toLowerCase()
    if (!value) return items.value
    return items.value.filter(
      (item) => item.name.toLowerCase().includes(value) || item.module_key.includes(value)
    )
  })

  const statusLabels: Record<SystemModuleStatus, string> = {
    DISCOVERED: '已发现',
    INSTALLED: '已安装',
    ENABLED: '已启用',
    DISABLED: '已禁用',
    UPGRADING: '升级中',
    FAILED: '失败',
    UNINSTALLED: '已卸载'
  }

  const statusLabel = (status?: SystemModuleStatus) => (status ? statusLabels[status] : '未发现')
  const statusTagType = (status?: SystemModuleStatus) => {
    if (status === 'ENABLED') return 'success'
    if (status === 'FAILED') return 'danger'
    if (status === 'DISABLED' || status === 'UNINSTALLED') return 'info'
    if (status === 'UPGRADING') return 'warning'
    return 'primary'
  }

  const loadCatalog = async () => {
    loading.value = true
    error.value = ''
    try {
      const response = await moduleApi.catalog()
      if (!response || !Array.isArray(response.items)) throw new Error('模块目录响应格式无效')
      items.value = response.items
    } catch (value) {
      items.value = []
      error.value = value instanceof Error ? value.message : '模块目录加载失败'
    } finally {
      loading.value = false
    }
  }

  const discoverAll = async () => {
    activeAction.value = 'discover:*'
    try {
      await moduleApi.discover()
      ElMessage.success('模块目录发现完成')
      await loadCatalog()
    } finally {
      activeAction.value = ''
    }
  }

  const isActionLoading = (row: ModuleCatalogItem, action: LifecycleAction) =>
    activeAction.value === `${action}:${row.module_key}`

  const runLifecycle = async (row: ModuleCatalogItem, action: LifecycleAction, label: string) => {
    if (action !== 'discover') {
      await ElMessageBox.confirm(
        action === 'uninstall'
          ? `确认卸载模块“${row.name}”吗？模块注册和功能将移除，业务数据默认保留。`
          : `确认${label}模块“${row.name}”吗？`,
        `${label}模块`,
        { type: action === 'uninstall' || action === 'disable' ? 'warning' : 'info' }
      )
    }
    activeAction.value = `${action}:${row.module_key}`
    try {
      if (action === 'uninstall') await moduleApi.uninstall(row.module_key, true)
      else await moduleApi[action](row.module_key)
      if (action === 'discover') {
        await loadCatalog()
      } else {
        await Promise.all([loadCatalog(), refreshDynamicRoutes(router)])
      }
      ElMessage.success(`${label}成功`)
    } finally {
      activeAction.value = ''
    }
  }

  const canUpgrade = (row: ModuleCatalogItem) => {
    const status = row.system?.status
    return Boolean(
      status &&
        ['INSTALLED', 'ENABLED', 'DISABLED'].includes(status) &&
        row.system?.upgrade_available === true
    )
  }

  const canUninstall = (row: ModuleCatalogItem) =>
    Boolean(row.system && ['INSTALLED', 'DISABLED', 'FAILED'].includes(row.system.status))

  const openDetail = (row: ModuleCatalogItem) => {
    selectedModule.value = row
    detailVisible.value = true
  }

  const openLicense = (row: ModuleCatalogItem, mode: 'grant' | 'revoke') => {
    selectedModule.value = row
    licenseMode.value = mode
    licenseVisible.value = true
  }

  onMounted(loadCatalog)
</script>
