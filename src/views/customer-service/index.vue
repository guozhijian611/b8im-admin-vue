<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElSelect
              v-model="searchForm.status"
              clearable
              placeholder="状态"
              style="width: 120px"
              @change="doSearch"
            >
              <ElOption label="排队中" value="queued" />
              <ElOption label="已分配" value="assigned" />
              <ElOption label="进行中" value="active" />
              <ElOption label="已关闭" value="closed" />
            </ElSelect>
            <ElInput
              v-model="searchForm.organization"
              clearable
              placeholder="机构ID"
              style="width: 120px"
              @keyup.enter="doSearch"
            />
            <ElButton type="primary" @click="doSearch">搜索</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>
      <ArtTable
        rowKey="id"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #status="{ row }">{{ statusLabel(row.status) }}</template>
        <template #customer="{ row }"
          >{{ row.customer_subject_type }}:{{ row.customer_subject_id }}</template
        >
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/useTable'
  import api from '@/api/customer-service'

  const searchForm = reactive({ status: undefined as string | undefined, organization: '' })
  const {
    columns,
    columnChecks,
    data,
    loading,
    getData,
    searchParams,
    pagination,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: api.conversationList,
      columnsFactory: () => [
        { prop: 'id', label: '编号', width: 90, align: 'center' },
        { prop: 'organization', label: '机构', width: 90 },
        { prop: 'conversation_no', label: '会话号', minWidth: 160 },
        { prop: 'customer', label: '客户', minWidth: 160, useSlot: true },
        { prop: 'status', label: '状态', width: 100, useSlot: true },
        { prop: 'channel', label: '渠道', width: 90 },
        { prop: 'subject', label: '主题', minWidth: 140, showOverflowTooltip: true },
        { prop: 'queued_at', label: '入队时间', width: 170 },
        { prop: 'create_time', label: '创建时间', width: 170 }
      ]
    }
  })

  const statusLabel = (s: string) =>
    ({ queued: '排队中', assigned: '已分配', active: '进行中', closed: '已关闭' })[s] || s

  const doSearch = () => {
    Object.assign(searchParams, {
      status: searchForm.status || undefined,
      organization: searchForm.organization || undefined
    })
    getData()
  }
</script>
