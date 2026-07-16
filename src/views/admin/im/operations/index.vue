<template>
  <div class="art-full-height">
    <ElCard class="mb-4" shadow="never">
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 text-lg font-semibold">
              IM 运维中心
              <ElTag :type="overview?.status === 'healthy' ? 'success' : 'warning'" effect="light">
                {{ overview?.status === 'healthy' ? '运行正常' : '需要关注' }}
              </ElTag>
            </div>
            <ElText type="info">
              数据均来自当前 MySQL、Redis 与 SaiAdmin 存储配置，管理操作会写入审计日志。
            </ElText>
          </div>
          <ElButton :loading="overviewLoading || listLoading" @click="refreshAll">
            <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
            刷新
          </ElButton>
        </div>
      </template>

      <ElAlert
        v-if="overviewError"
        class="mb-4"
        type="error"
        :closable="false"
        show-icon
        :title="overviewError"
      />

      <ElSkeleton :loading="overviewLoading && !overview" animated>
        <ElRow :gutter="16">
          <ElCol v-for="card in statisticCards" :key="card.label" :xs="12" :sm="12" :lg="6">
            <div class="metric-card">
              <div class="flex items-center justify-between">
                <ElText type="info">{{ card.label }}</ElText>
                <ArtSvgIcon :icon="card.icon" class="text-xl text-primary" />
              </div>
              <div class="mt-2 text-2xl font-semibold">{{ card.value }}</div>
              <ElText size="small" type="info">{{ card.detail }}</ElText>
            </div>
          </ElCol>
        </ElRow>

        <ElRow class="mt-4" :gutter="16">
          <ElCol v-for="item in runtimeCards" :key="item.label" :xs="24" :sm="12" :lg="6">
            <div class="runtime-card">
              <div class="flex items-center justify-between gap-2">
                <span class="font-medium">{{ item.label }}</span>
                <ElTag :type="item.ready ? 'success' : 'warning'" size="small" effect="plain">
                  {{ item.value }}
                </ElTag>
              </div>
              <ElText class="mt-2 block" size="small" type="info">{{ item.detail }}</ElText>
            </div>
          </ElCol>
        </ElRow>
      </ElSkeleton>
    </ElCard>

    <ElCard class="art-table-card" shadow="never">
      <ElTabs v-model="activeTab" @tab-change="handleTabChange">
        <ElTabPane label="设备" name="devices" />
        <ElTabPane label="会话" name="sessions" />
        <ElTabPane label="登录审计" name="audits" />
        <ElTabPane label="租户 IM 策略" name="policy" />
      </ElTabs>

      <PolicyPanel v-if="activeTab === 'policy'" />

      <template v-else>
        <div class="mb-4 flex flex-wrap items-center gap-3">
          <ElInput
            v-model="filters.keyword"
            clearable
            placeholder="搜索用户、账号、设备或 IP"
            style="width: 280px"
            @keyup.enter="search"
          />
          <ElInput
            v-model="filters.organization"
            clearable
            placeholder="机构编号"
            style="width: 140px"
            @keyup.enter="search"
          />
          <ElSelect
            v-if="activeTab !== 'audits'"
            v-model="filters.status"
            clearable
            placeholder="状态"
            style="width: 140px"
          >
            <ElOption label="正常" value="1" />
            <ElOption label="停用 / 已撤销" value="2" />
          </ElSelect>
          <ElSelect
            v-if="activeTab === 'devices'"
            v-model="filters.online_state"
            clearable
            placeholder="在线状态"
            style="width: 140px"
          >
            <ElOption label="在线" value="1" />
            <ElOption label="离线" value="2" />
          </ElSelect>
          <ElSelect
            v-if="activeTab === 'audits'"
            v-model="filters.login_result"
            clearable
            placeholder="登录结果"
            style="width: 140px"
          >
            <ElOption label="成功" value="success" />
            <ElOption label="失败" value="failed" />
            <ElOption label="踢下线" value="kicked" />
            <ElOption label="主动退出" value="logout" />
            <ElOption label="不活跃" value="inactive" />
          </ElSelect>
          <ElButton type="primary" @click="search">查询</ElButton>
          <ElButton @click="resetFilters">重置</ElButton>
        </div>

        <ElAlert
          v-if="listError"
          class="mb-4"
          type="error"
          :closable="false"
          show-icon
          :title="listError"
        />

        <ArtTable
          rowKey="id"
          :loading="listLoading"
          :data="pageData.data"
          :columns="columns"
          empty-text="暂无数据"
        >
          <template #identity="{ row }">
            <div class="flex flex-col gap-1">
              <span class="font-medium">{{ row.nickname || row.account || row.user_id }}</span>
              <ElText size="small" type="info">{{ row.account || '-' }} · {{ row.user_id }}</ElText>
            </div>
          </template>
          <template #organization="{ row }">
            <div class="flex flex-col">
              <span>{{ row.organization_name || `机构 ${row.organization}` }}</span>
              <ElText size="small" type="info">ID {{ row.organization }}</ElText>
            </div>
          </template>
          <template #status="{ row }">
            <ElTag :type="statusType(row.status)" size="small" effect="light">
              {{ statusLabel(row.status) }}
            </ElTag>
          </template>
          <template #online="{ row }">
            <ElTag :type="row.current_online_state === 1 ? 'success' : 'info'" size="small">
              {{ row.current_online_state === 1 ? '在线' : '离线' }}
            </ElTag>
          </template>
          <template #loginResult="{ row }">
            <ElTag :type="loginResultType(row.login_result)" size="small" effect="plain">
              {{ loginResultLabel(row.login_result) }}
            </ElTag>
            <ElText v-if="row.failure_code" class="ml-2" size="small" type="danger">
              {{ row.failure_code }}
            </ElText>
          </template>
          <template #operation="{ row }">
            <ElSpace v-if="activeTab === 'devices'" wrap>
              <ElButton
                v-if="row.status === 1"
                v-permission="'saimulti:admin:im:device:status'"
                size="small"
                type="danger"
                plain
                :loading="activeAction === `device:${row.id}`"
                @click="changeDeviceStatus(row, 2)"
              >
                停用
              </ElButton>
              <ElButton
                v-else
                v-permission="'saimulti:admin:im:device:status'"
                size="small"
                type="success"
                plain
                :loading="activeAction === `device:${row.id}`"
                @click="changeDeviceStatus(row, 1)"
              >
                启用
              </ElButton>
            </ElSpace>
            <ElButton
              v-else-if="activeTab === 'sessions' && row.status === 1"
              v-permission="'saimulti:admin:im:session:revoke'"
              size="small"
              type="danger"
              plain
              :loading="activeAction === `session:${row.id}`"
              @click="revokeSession(row)"
            >
              撤销会话
            </ElButton>
            <span v-else>-</span>
          </template>
        </ArtTable>

        <div class="mt-4 flex justify-end">
          <ElPagination
            v-model:current-page="pageData.current_page"
            v-model:page-size="pageData.per_page"
            :total="pageData.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="loadList"
            @size-change="handleSizeChange"
          />
        </div>
      </template>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import imOperationsApi, {
    type AdminImDevice,
    type AdminImListParams,
    type AdminImOverview,
    type AdminImSession,
    type PageResult
  } from '@/api/admin/im/operations'
  import PolicyPanel from './modules/policy-panel.vue'

  type TabName = 'devices' | 'sessions' | 'audits' | 'policy'
  type TableRow = Record<string, any>

  defineOptions({ name: 'AdminImOperations' })

  const activeTab = ref<TabName>('devices')
  const overview = ref<AdminImOverview | null>(null)
  const overviewLoading = ref(false)
  const overviewError = ref('')
  const listLoading = ref(false)
  const listError = ref('')
  const activeAction = ref('')
  const filters = reactive({
    keyword: '',
    organization: '',
    status: '',
    online_state: '',
    login_result: ''
  })
  const pageData = reactive<PageResult<TableRow>>({
    current_page: 1,
    data: [],
    per_page: 20,
    total: 0
  })

  const statisticCards = computed(() => [
    {
      label: 'IM 用户',
      value: overview.value?.statistics.users.total ?? 0,
      detail: `正常 ${overview.value?.statistics.users.active ?? 0} · 停用 ${overview.value?.statistics.users.disabled ?? 0}`,
      icon: 'ri:user-3-line'
    },
    {
      label: '在线设备',
      value: overview.value?.statistics.devices.online ?? 0,
      detail: `设备总数 ${overview.value?.statistics.devices.total ?? 0}`,
      icon: 'ri:device-line'
    },
    {
      label: '活性会话',
      value: overview.value?.statistics.sessions.active ?? 0,
      detail: `已撤销 ${overview.value?.statistics.sessions.revoked ?? 0} · 已过期 ${overview.value?.statistics.sessions.expired ?? 0}`,
      icon: 'ri:key-2-line'
    },
    {
      label: 'Outbox 待处理',
      value: overview.value?.statistics.outbox.pending ?? 0,
      detail: `发布中 ${overview.value?.statistics.outbox.publishing ?? 0} · 失败 ${overview.value?.statistics.outbox.failed ?? 0}`,
      icon: 'ri:inbox-archive-line'
    }
  ])

  const runtimeCards = computed(() => {
    const current = overview.value
    return [
      {
        label: 'MySQL',
        value: current?.database.status === 'up' ? '正常' : '异常',
        ready: current?.database.status === 'up',
        detail: '控制面与 IM 业务表使用同一数据库'
      },
      {
        label: 'Redis',
        value: current?.redis.status === 'up' ? '正常' : '异常',
        ready: current?.redis.status === 'up',
        detail: `会话活性缓存上界 ${current?.redis.max_stale_seconds ?? 30} 秒`
      },
      {
        label: 'IM Schema',
        value: current?.im_schema.status === 'ready' ? '就绪' : '未就绪',
        ready: current?.im_schema.status === 'ready',
        detail: current?.im_schema.missing.length
          ? `缺少：${current.im_schema.missing.join('、')}`
          : '核心用户、设备、会话、审计与 Outbox 表'
      },
      {
        label: '文件存储',
        value: current?.storage.configured ? '已配置' : '不完整',
        ready: current?.storage.status === 'ready',
        detail: current
          ? `${current.storage.label}${current.storage.missing.length ? ` · 缺少 ${current.storage.missing.join('、')}` : ''}`
          : '读取中'
      }
    ]
  })

  const columns = computed(() => {
    const organization = {
      prop: 'organization',
      label: '机构',
      minWidth: 160,
      useSlot: true
    }
    const identity = { prop: 'identity', label: '用户', minWidth: 210, useSlot: true }
    if (activeTab.value === 'devices') {
      return [
        { prop: 'id', label: 'ID', width: 80 },
        organization,
        identity,
        { prop: 'device_name', label: '设备', minWidth: 150 },
        { prop: 'client_family', label: '客户端', width: 100 },
        { prop: 'os', label: '系统', width: 100 },
        { prop: 'current_ip', label: '当前 IP', width: 140 },
        { prop: 'current_online_state', label: '在线', width: 90, useSlot: true },
        { prop: 'status', label: '状态', width: 100, useSlot: true },
        { prop: 'last_seen_at', label: '最后活跃', width: 180 },
        { prop: 'operation', label: '操作', width: 100, fixed: 'right' as const, useSlot: true }
      ]
    }
    if (activeTab.value === 'sessions') {
      return [
        { prop: 'id', label: 'ID', width: 80 },
        organization,
        identity,
        { prop: 'device_id', label: '设备 ID', minWidth: 160 },
        { prop: 'session_ref', label: '会话引用', width: 150 },
        { prop: 'status', label: '状态', width: 100, useSlot: true },
        { prop: 'expire_at', label: '失效时间', width: 180 },
        { prop: 'revoked_at', label: '撤销时间', width: 180 },
        { prop: 'operation', label: '操作', width: 120, fixed: 'right' as const, useSlot: true }
      ]
    }
    return [
      { prop: 'id', label: 'ID', width: 80 },
      organization,
      identity,
      { prop: 'device_name', label: '设备', minWidth: 140 },
      { prop: 'login_ip', label: '登录 IP', width: 140 },
      { prop: 'login_ip_geo', label: 'IP 归属地', minWidth: 160 },
      { prop: 'login_result', label: '结果', width: 150, useSlot: true },
      { prop: 'audit_scope', label: '事件', width: 110 },
      { prop: 'login_at', label: '发生时间', width: 180 }
    ]
  })

  const loadOverview = async () => {
    overviewLoading.value = true
    overviewError.value = ''
    try {
      overview.value = await imOperationsApi.overview()
    } catch (error) {
      overviewError.value = error instanceof Error ? error.message : 'IM 运行总览加载失败'
    } finally {
      overviewLoading.value = false
    }
  }

  const listParams = (): AdminImListParams => ({
    page: pageData.current_page,
    limit: pageData.per_page,
    organization: filters.organization || undefined,
    keyword: filters.keyword.trim() || undefined,
    status: activeTab.value === 'audits' ? undefined : filters.status || undefined,
    online_state: activeTab.value === 'devices' ? filters.online_state || undefined : undefined,
    login_result: activeTab.value === 'audits' ? filters.login_result || undefined : undefined
  })

  const loadList = async () => {
    listLoading.value = true
    listError.value = ''
    try {
      const params = listParams()
      const response =
        activeTab.value === 'devices'
          ? await imOperationsApi.devices(params)
          : activeTab.value === 'sessions'
            ? await imOperationsApi.sessions(params)
            : await imOperationsApi.loginAudits(params)
      Object.assign(pageData, response)
    } catch (error) {
      pageData.data = []
      pageData.total = 0
      listError.value = error instanceof Error ? error.message : '列表加载失败'
    } finally {
      listLoading.value = false
    }
  }

  const refreshAll = () =>
    activeTab.value === 'policy' ? loadOverview() : Promise.all([loadOverview(), loadList()])

  const search = () => {
    pageData.current_page = 1
    loadList()
  }

  const resetFilters = () => {
    Object.assign(filters, {
      keyword: '',
      organization: '',
      status: '',
      online_state: '',
      login_result: ''
    })
    search()
  }

  const handleTabChange = () => {
    if (activeTab.value === 'policy') return
    pageData.current_page = 1
    pageData.data = []
    filters.status = ''
    filters.online_state = ''
    filters.login_result = ''
    loadList()
  }

  const handleSizeChange = () => {
    pageData.current_page = 1
    loadList()
  }

  const changeDeviceStatus = async (row: AdminImDevice, status: 1 | 2) => {
    const label = status === 1 ? '启用' : '停用'
    await ElMessageBox.confirm(
      status === 2
        ? `确认停用设备“${row.device_name || row.device_id}”吗？该设备的活性会话将同时撤销。`
        : `确认启用设备“${row.device_name || row.device_id}”吗？`,
      `${label} IM 设备`,
      { type: status === 2 ? 'warning' : 'info' }
    )
    activeAction.value = `device:${row.id}`
    try {
      const result = await imOperationsApi.setDeviceStatus(row.id, status)
      showOperationResult(`${label}成功`, result.cache_invalidation, result.realtime_event)
      await refreshAll()
    } finally {
      activeAction.value = ''
    }
  }

  const revokeSession = async (row: AdminImSession) => {
    await ElMessageBox.confirm(
      `确认撤销会话 ${row.session_ref} 吗？对应客户端将需要重新登录。`,
      '撤销 IM 会话',
      { type: 'warning' }
    )
    activeAction.value = `session:${row.id}`
    try {
      const result = await imOperationsApi.revokeSession(row.id)
      showOperationResult('会话已撤销', result.cache_invalidation, result.realtime_event)
      await refreshAll()
    } finally {
      activeAction.value = ''
    }
  }

  const showOperationResult = (
    message: string,
    cache: { status: string; max_stale_seconds: number },
    realtimeEvent: { status: string }
  ) => {
    if (realtimeEvent.status === 'failed_bounded_fallback') {
      ElMessage.warning(`${message}；实时下线事件发布失败，已撤销 MySQL 会话并启用有界重验。`)
      return
    }
    if (cache.status === 'mysql_authoritative_bounded_fallback') {
      ElMessage.warning(
        `${message}；Redis 失效失败，MySQL 已生效，最多 ${cache.max_stale_seconds} 秒重验。`
      )
      return
    }
    ElMessage.success(message)
  }

  const statusLabel = (status: number) =>
    ({ 1: '正常', 2: '停用 / 已撤销', 3: '已封禁' })[status] || '未知'
  const statusType = (status: number) => {
    if (status === 1) return 'success'
    if (status === 3) return 'danger'
    return 'info'
  }
  const loginResultLabel = (result: string) =>
    ({ success: '成功', failed: '失败', kicked: '踢下线', logout: '主动退出', inactive: '不活跃' })[
      result
    ] || result
  const loginResultType = (result: string) => {
    if (result === 'success') return 'success'
    if (result === 'failed') return 'danger'
    if (result === 'kicked') return 'warning'
    return 'info'
  }

  onMounted(refreshAll)
</script>

<style scoped>
  .metric-card,
  .runtime-card {
    height: 100%;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
    background: var(--el-fill-color-blank);
  }
</style>
