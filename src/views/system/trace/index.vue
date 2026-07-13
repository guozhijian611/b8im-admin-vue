<template>
  <div class="art-full-height trace-page">
    <ElCard shadow="never">
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 text-lg font-semibold">
              链路中心
              <ElTag type="primary" effect="plain">平台超级管理员</ElTag>
            </div>
            <ElText type="info">按服务、机构、消息或 Trace ID 快速定位全链路异常。</ElText>
          </div>
          <ElButton :loading="loading || serviceLoading" @click="refreshAll">
            <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
            刷新
          </ElButton>
        </div>
      </template>

      <ElAlert
        v-if="serviceError"
        class="mb-4"
        type="warning"
        :closable="false"
        show-icon
        :title="serviceError"
      />

      <ElForm :model="searchForm" label-position="top" @submit.prevent="handleSearch">
        <ElRow :gutter="16">
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="Trace ID">
              <ElInput v-model="searchForm.trace_id" clearable placeholder="输入完整 Trace ID" />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="入口服务" required>
              <ElSelect
                v-model="searchForm.service"
                clearable
                filterable
                placeholder="全部服务"
                :loading="serviceLoading"
                @change="handleServiceChange"
              >
                <ElOption
                  v-for="item in services"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="入口操作">
              <ElInput v-model="searchForm.operation" clearable placeholder="操作名称" />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="机构 organization">
              <ElInput v-model="searchForm.organization" clearable placeholder="机构编号" />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="消息 ID">
              <ElInput v-model="searchForm.message_id" clearable placeholder="message_id" />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="最小耗时">
              <ElInputNumber
                v-model="searchForm.min_duration_ms"
                :min="0"
                :step="100"
                :precision="0"
                controls-position="right"
                placeholder="毫秒"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="时间范围">
              <ElDatePicker
                v-model="searchForm.time_range"
                class="w-full"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="查询设置">
              <div class="flex w-full items-center gap-3">
                <ElCheckbox v-model="searchForm.error_only">仅异常</ElCheckbox>
                <ElSelect v-model="searchForm.limit" class="limit-select">
                  <ElOption :value="20" label="20 条" />
                  <ElOption :value="50" label="50 条" />
                  <ElOption :value="100" label="100 条" />
                </ElSelect>
              </div>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <div class="flex justify-end gap-2">
          <ElButton @click="resetSearch">重置</ElButton>
          <ElButton type="primary" native-type="submit" :loading="loading">
            <template #icon><ArtSvgIcon icon="ri:search-line" /></template>
            查询链路
          </ElButton>
        </div>
      </ElForm>
    </ElCard>

    <ElRow class="mt-4" :gutter="16">
      <ElCol v-for="card in overviewCards" :key="card.label" :xs="12" :sm="12" :lg="6">
        <ElCard class="overview-card" shadow="never">
          <div class="flex items-center justify-between">
            <ElText type="info">{{ card.label }}</ElText>
            <ArtSvgIcon :icon="card.icon" :class="card.iconClass" class="text-xl" />
          </div>
          <div class="mt-2 text-2xl font-semibold">{{ card.value }}</div>
          <ElText size="small" type="info">{{ card.detail }}</ElText>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElCard class="art-table-card mt-4" shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="font-semibold">链路列表</div>
          <ElText type="info"
            >共匹配 {{ searchResult.total }} 条，当前显示 {{ traces.length }} 条</ElText
          >
        </div>
      </template>

      <ElAlert
        v-if="listError"
        class="mb-4"
        type="error"
        :closable="false"
        show-icon
        :title="listError"
      />

      <ArtTable
        rowKey="trace_id"
        :loading="loading"
        :data="traces"
        :columns="columns"
        empty-text="暂无匹配的链路，请调整查询条件"
        @row-click="openTrace"
      >
        <template #traceId="{ row }">
          <ElTooltip :content="row.trace_id" placement="top">
            <ElText class="trace-id" type="primary">{{ shortId(row.trace_id) }}</ElText>
          </ElTooltip>
        </template>
        <template #service="{ row }">
          <div class="flex flex-col gap-1">
            <span class="font-medium">{{ row.root_service || '-' }}</span>
            <ElText size="small" type="info" truncated>{{ row.root_operation || '-' }}</ElText>
          </div>
        </template>
        <template #duration="{ row }">
          <ElTag :type="durationType(row.duration_ms)" effect="light">
            {{ formatDuration(row.duration_ms) }}
          </ElTag>
        </template>
        <template #errors="{ row }">
          <ElTag v-if="row.error_count > 0" type="danger" effect="light">
            {{ row.error_count }} 个异常
          </ElTag>
          <ElTag v-else type="success" effect="plain">正常</ElTag>
        </template>
        <template #business="{ row }">
          <div class="flex flex-col gap-1">
            <span>{{ row.organization ? `机构 ${row.organization}` : '-' }}</span>
            <ElText size="small" type="info" truncated>
              {{ row.message_id ? `消息 ${row.message_id}` : '无消息关联' }}
            </ElText>
          </div>
        </template>
        <template #operation="{ row }">
          <ElButton link type="primary" @click.stop="openTrace(row)">查看时间线</ElButton>
        </template>
      </ArtTable>
    </ElCard>

    <ElDrawer v-model="drawerVisible" size="76%" destroy-on-close>
      <template #header>
        <div>
          <div class="flex flex-wrap items-center gap-2 text-lg font-semibold">
            链路时间线
            <ElTag v-if="traceDetail" :type="traceDetail.error_count > 0 ? 'danger' : 'success'">
              {{ traceDetail.error_count > 0 ? '存在异常' : '全部正常' }}
            </ElTag>
          </div>
          <ElText v-if="traceDetail" type="info">{{ traceDetail.trace_id }}</ElText>
        </div>
      </template>

      <ElSkeleton :loading="detailLoading" animated :rows="8">
        <ElAlert v-if="detailError" type="error" :closable="false" show-icon :title="detailError" />

        <template v-else-if="traceDetail">
          <ElDescriptions :column="4" border>
            <ElDescriptionsItem label="入口服务">{{ traceDetail.root_service }}</ElDescriptionsItem>
            <ElDescriptionsItem label="入口操作">{{
              traceDetail.root_operation
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="开始时间">
              {{ formatTime(traceDetail.start_time_ms) }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="总耗时">
              {{ formatDuration(traceDetail.duration_ms) }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="Span 数">{{ traceDetail.span_count }}</ElDescriptionsItem>
            <ElDescriptionsItem label="异常数">{{ traceDetail.error_count }}</ElDescriptionsItem>
            <ElDescriptionsItem label="机构">
              {{ traceDetail.organization || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="消息 ID">
              {{ traceDetail.message_id || '-' }}
            </ElDescriptionsItem>
          </ElDescriptions>

          <div class="detail-layout mt-5">
            <section class="timeline-panel">
              <div class="mb-3 font-semibold">调用时间线</div>
              <ElEmpty v-if="orderedSpans.length === 0" description="该链路暂无 Span 数据" />
              <button
                v-for="item in orderedSpans"
                :key="item.span.span_id"
                type="button"
                class="span-row"
                :class="{
                  'is-selected': selectedSpan?.span_id === item.span.span_id,
                  'is-error': item.span.error
                }"
                @click="selectedSpan = item.span"
              >
                <div class="span-title" :style="{ paddingLeft: `${item.depth * 18}px` }">
                  <span class="status-dot"></span>
                  <div class="min-w-0">
                    <div class="truncate font-medium">{{ item.span.operation }}</div>
                    <div class="truncate text-xs text-g-500">{{ item.span.service }}</div>
                  </div>
                </div>
                <div class="span-waterfall">
                  <span
                    class="span-bar"
                    :class="item.span.error ? 'bar-error' : 'bar-normal'"
                    :style="{ left: `${item.left}%`, width: `${item.width}%` }"
                  ></span>
                </div>
                <div class="span-duration">{{ formatDuration(item.span.duration_ms) }}</div>
              </button>
            </section>

            <aside class="span-detail">
              <div class="mb-3 font-semibold">Span 详情</div>
              <ElEmpty v-if="!selectedSpan" description="点击左侧 Span 查看详情" />
              <template v-else>
                <ElDescriptions :column="1" border size="small">
                  <ElDescriptionsItem label="操作">{{ selectedSpan.operation }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="服务">{{ selectedSpan.service }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="Span ID">{{
                    selectedSpan.span_id
                  }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="父 Span ID">
                    {{ selectedSpan.parent_span_id || '根节点' }}
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="开始时间">
                    {{ formatTime(selectedSpan.start_time_ms) }}
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="耗时">
                    {{ formatDuration(selectedSpan.duration_ms) }}
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="状态">
                    <ElTag :type="selectedSpan.error ? 'danger' : 'success'" size="small">
                      {{ spanStatusLabel(selectedSpan) }}
                    </ElTag>
                  </ElDescriptionsItem>
                </ElDescriptions>

                <div class="mt-4 mb-2 font-medium">标签属性</div>
                <ElTable :data="attributeRows" size="small" border max-height="300">
                  <ElTableColumn prop="key" label="字段" min-width="130" />
                  <ElTableColumn prop="value" label="值" min-width="180" show-overflow-tooltip />
                </ElTable>

                <template v-if="selectedSpan.logs.length">
                  <div class="mt-4 mb-2 font-medium">Span 日志</div>
                  <ElTimeline>
                    <ElTimelineItem
                      v-for="(log, index) in selectedSpan.logs"
                      :key="`${log.time_ms}:${index}`"
                      :timestamp="formatTime(log.time_ms)"
                    >
                      {{ formatAttribute(log.fields) }}
                    </ElTimelineItem>
                  </ElTimeline>
                </template>
              </template>
            </aside>
          </div>
        </template>
      </ElSkeleton>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import traceApi, {
    type TraceDetail,
    type TraceSearchParams,
    type TraceSearchResult,
    type TraceService,
    type TraceSpan,
    type TraceSummary
  } from '@/api/system/trace'

  interface SearchForm {
    service: string
    operation: string
    trace_id: string
    organization: string
    message_id: string
    min_duration_ms?: number
    error_only: boolean
    time_range: [Date, Date] | []
    limit: number
  }

  const initialSearchForm = (): SearchForm => ({
    service: '',
    operation: '',
    trace_id: '',
    organization: '',
    message_id: '',
    min_duration_ms: undefined,
    error_only: false,
    time_range: [],
    limit: 20
  })

  const emptySearchResult = (): TraceSearchResult => ({
    items: [],
    total: 0,
    limit: 20
  })

  const searchForm = reactive<SearchForm>(initialSearchForm())
  const services = ref<TraceService[]>([])
  const searchResult = ref<TraceSearchResult>(emptySearchResult())
  const loading = ref(false)
  const serviceLoading = ref(false)
  const serviceError = ref('')
  const listError = ref('')
  const drawerVisible = ref(false)
  const detailLoading = ref(false)
  const detailError = ref('')
  const traceDetail = ref<TraceDetail | null>(null)
  const selectedSpan = ref<TraceSpan | null>(null)

  const traces = computed(() => searchResult.value.items)
  const overviewCards = computed(() => {
    const items = traces.value
    const errorCount = items.filter((item) => item.error_count > 0).length
    const average = items.length
      ? items.reduce((sum, item) => sum + item.duration_ms, 0) / items.length
      : 0
    const slowest = items.reduce((max, item) => Math.max(max, item.duration_ms), 0)
    return [
      {
        label: '本次返回',
        value: `${items.length} 条`,
        detail: `共匹配 ${searchResult.value.total} 条`,
        icon: 'ri:route-line',
        iconClass: 'text-primary'
      },
      {
        label: '异常链路',
        value: `${errorCount} 条`,
        detail: errorCount > 0 ? '请优先排查' : '未发现异常',
        icon: 'ri:error-warning-line',
        iconClass: errorCount > 0 ? 'text-danger' : 'text-success'
      },
      {
        label: '平均耗时',
        value: formatDuration(average),
        detail: '当前返回结果',
        icon: 'ri:speed-up-line',
        iconClass: 'text-warning'
      },
      {
        label: '最慢链路',
        value: formatDuration(slowest),
        detail: '当前返回结果',
        icon: 'ri:timer-line',
        iconClass: slowest >= 1000 ? 'text-danger' : 'text-primary'
      }
    ]
  })

  const columns = [
    { prop: 'trace_id', label: 'Trace ID', width: 160, useSlot: true },
    { prop: 'root_service', label: '入口服务 / 操作', minWidth: 210, useSlot: true },
    {
      prop: 'start_time_ms',
      label: '开始时间',
      width: 180,
      formatter: (row: TraceSummary) => formatTime(row.start_time_ms)
    },
    { prop: 'duration_ms', label: '耗时', width: 110, useSlot: true },
    { prop: 'span_count', label: 'Span 数', width: 90, align: 'center' },
    { prop: 'error_count', label: '状态', width: 110, useSlot: true },
    { prop: 'business', label: '业务关联', minWidth: 180, useSlot: true },
    { prop: 'operation', label: '操作', width: 120, fixed: 'right' as const, useSlot: true }
  ]

  const orderedSpans = computed(() => {
    if (!traceDetail.value) return []
    const spans = [...traceDetail.value.spans].sort((a, b) => a.start_time_ms - b.start_time_ms)
    const traceStart = traceDetail.value.start_time_ms
    const total = Math.max(traceDetail.value.duration_ms, 0.01)
    const depthCache = new Map<string, number>()
    const byId = new Map(spans.map((span) => [span.span_id, span]))
    const getDepth = (span: TraceSpan): number => {
      if (depthCache.has(span.span_id)) return depthCache.get(span.span_id) || 0
      const parent = span.parent_span_id ? byId.get(span.parent_span_id) : undefined
      const depth = parent ? Math.min(getDepth(parent) + 1, 8) : 0
      depthCache.set(span.span_id, depth)
      return depth
    }
    return spans.map((span) => {
      const offset = Math.max(span.start_time_ms - traceStart, 0)
      return {
        span,
        depth: getDepth(span),
        left: Math.min((offset / total) * 100, 99),
        width: Math.max(Math.min((span.duration_ms / total) * 100, 100), 1)
      }
    })
  })

  const attributeRows = computed(() =>
    Object.entries(selectedSpan.value?.tags || {}).map(([key, value]) => ({
      key,
      value: formatAttribute(value)
    }))
  )

  onMounted(async () => {
    await loadServices()
    if (services.value.length > 0) {
      searchForm.service = services.value[0].name
      await handleSearch()
    }
  })

  async function loadServices() {
    serviceLoading.value = true
    serviceError.value = ''
    try {
      const result = await traceApi.services()
      services.value = result.items
    } catch (error) {
      serviceError.value =
        error instanceof Error ? error.message : '服务列表加载失败，仍可使用其他条件查询'
      services.value = []
    } finally {
      serviceLoading.value = false
    }
  }

  async function handleSearch() {
    if (!searchForm.service && !searchForm.trace_id.trim()) {
      listError.value = '请选择入口服务，或输入完整 Trace ID'
      return
    }
    loading.value = true
    listError.value = ''
    try {
      const params: TraceSearchParams = { limit: searchForm.limit }
      if (searchForm.service) params.service = searchForm.service
      if (searchForm.operation) params.operation = searchForm.operation
      if (searchForm.trace_id.trim()) params.trace_id = searchForm.trace_id.trim()
      if (searchForm.organization.trim()) params.organization = searchForm.organization.trim()
      if (searchForm.message_id.trim()) params.message_id = searchForm.message_id.trim()
      if (searchForm.min_duration_ms !== undefined) {
        params.min_duration_ms = searchForm.min_duration_ms
      }
      if (searchForm.error_only) params.error_only = 1
      if (searchForm.time_range.length === 2) {
        params.start_time = searchForm.time_range[0].getTime()
        params.end_time = searchForm.time_range[1].getTime()
      }
      searchResult.value = await traceApi.search(params)
    } catch (error) {
      listError.value = error instanceof Error ? error.message : '链路查询失败，请稍后重试'
      searchResult.value = emptySearchResult()
    } finally {
      loading.value = false
    }
  }

  function handleServiceChange() {
    searchForm.operation = ''
  }

  async function refreshAll() {
    await loadServices()
    if (!searchForm.service && services.value.length > 0) {
      searchForm.service = services.value[0].name
    }
    await handleSearch()
  }

  function resetSearch() {
    Object.assign(searchForm, initialSearchForm())
    if (services.value.length > 0) searchForm.service = services.value[0].name
    handleSearch()
  }

  async function openTrace(row: TraceSummary) {
    drawerVisible.value = true
    detailLoading.value = true
    detailError.value = ''
    traceDetail.value = null
    selectedSpan.value = null
    try {
      traceDetail.value = await traceApi.read(row.trace_id)
      selectedSpan.value = traceDetail.value.spans[0] || null
    } catch (error) {
      detailError.value = error instanceof Error ? error.message : '链路详情加载失败，请稍后重试'
    } finally {
      detailLoading.value = false
    }
  }

  function formatDuration(value: number) {
    if (!Number.isFinite(value) || value <= 0) return '0 ms'
    if (value < 1) return `${value.toFixed(2)} ms`
    if (value < 1000) return `${value.toFixed(value < 10 ? 1 : 0)} ms`
    return `${(value / 1000).toFixed(2)} s`
  }

  function formatTime(value: number) {
    if (!value) return '-'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-CN', { hour12: false })
  }

  function durationType(value: number) {
    if (value >= 3000) return 'danger'
    if (value >= 1000) return 'warning'
    return 'success'
  }

  function shortId(value: string) {
    return value.length > 16 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value
  }

  function spanStatusLabel(span: TraceSpan) {
    if (span.error) return `异常${span.status ? `（${span.status}）` : ''}`
    return span.status || '正常'
  }

  function formatAttribute(value: unknown) {
    if (typeof value === 'string') return value
    if (value === null || value === undefined) return '-'
    return JSON.stringify(value)
  }
</script>

<style scoped lang="scss">
  .trace-page {
    padding-bottom: 20px;
  }

  .limit-select {
    width: 100px;
    margin-left: auto;
  }

  .overview-card {
    height: 116px;
    margin-bottom: 12px;
  }

  .trace-id {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    cursor: pointer;
  }

  .detail-layout {
    display: grid;
    grid-template-columns: minmax(520px, 1.7fr) minmax(320px, 1fr);
    gap: 20px;
  }

  .timeline-panel,
  .span-detail {
    min-width: 0;
  }

  .span-detail {
    padding-left: 20px;
    border-left: 1px solid var(--el-border-color-lighter);
  }

  .span-row {
    display: grid;
    grid-template-columns: minmax(180px, 34%) 1fr 76px;
    gap: 12px;
    align-items: center;
    width: 100%;
    min-height: 54px;
    padding: 8px 10px;
    color: var(--el-text-color-primary);
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 1px solid transparent;
    border-bottom-color: var(--el-border-color-lighter);
    border-radius: 6px;

    &:hover,
    &.is-selected {
      background: var(--el-fill-color-light);
      border-color: var(--el-color-primary-light-7);
    }

    &.is-error .status-dot {
      background: var(--el-color-danger);
    }
  }

  .span-title {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .status-dot {
    flex: 0 0 auto;
    width: 8px;
    height: 8px;
    background: var(--el-color-success);
    border-radius: 50%;
  }

  .span-waterfall {
    position: relative;
    height: 20px;
    overflow: hidden;
    background-image: linear-gradient(
      to right,
      var(--el-border-color-lighter) 1px,
      transparent 1px
    );
    background-size: 25% 100%;
  }

  .span-bar {
    position: absolute;
    top: 5px;
    height: 10px;
    min-width: 3px;
    border-radius: 5px;
  }

  .bar-normal {
    background: var(--el-color-primary);
  }

  .bar-error {
    background: var(--el-color-danger);
  }

  .span-duration {
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  @media (max-width: 1100px) {
    .detail-layout {
      grid-template-columns: 1fr;
    }

    .span-detail {
      padding-top: 20px;
      padding-left: 0;
      border-top: 1px solid var(--el-border-color-lighter);
      border-left: 0;
    }
  }

  @media (max-width: 720px) {
    .span-row {
      grid-template-columns: 1fr 70px;
    }

    .span-waterfall {
      display: none;
    }
  }
</style>
