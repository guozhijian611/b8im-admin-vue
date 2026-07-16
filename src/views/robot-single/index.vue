<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElInput
              v-model="searchForm.keyword"
              clearable
              placeholder="编码/名称"
              style="width: 180px"
              @keyup.enter="doSearch"
            />
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
        <template #status="{ row }">
          <ElTag :type="Number(row.status) === 1 ? 'success' : 'info'">
            {{ Number(row.status) === 1 ? '启用' : '停用' }}
          </ElTag>
        </template>
        <template #operation="{ row }">
          <ElButton
            v-permission="'saimulti:admin:robot_single:read'"
            size="small"
            @click="showDetail(row)"
          >
            详情
          </ElButton>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog v-model="detailVisible" title="机器人详情" width="640px" align-center>
      <ElDescriptions v-if="detail" :column="1" border>
        <ElDescriptionsItem label="编号">{{ detail.id }}</ElDescriptionsItem>
        <ElDescriptionsItem label="机构">{{ detail.organization }}</ElDescriptionsItem>
        <ElDescriptionsItem label="编码">{{ detail.code }}</ElDescriptionsItem>
        <ElDescriptionsItem label="名称">{{ detail.name }}</ElDescriptionsItem>
        <ElDescriptionsItem label="欢迎语">{{ detail.welcome_text }}</ElDescriptionsItem>
        <ElDescriptionsItem label="兜底回复">{{ detail.fallback_text }}</ElDescriptionsItem>
        <ElDescriptionsItem label="描述">{{ detail.description }}</ElDescriptionsItem>
      </ElDescriptions>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/useTable'
  import api from '@/api/robot-single'

  const searchForm = reactive({
    keyword: '',
    organization: ''
  })

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
      apiFn: api.list,
      columnsFactory: () => [
        { prop: 'id', label: '编号', width: 90, align: 'center' },
        { prop: 'organization', label: '机构', width: 90 },
        { prop: 'code', label: '编码', minWidth: 120 },
        { prop: 'name', label: '名称', minWidth: 140 },
        { prop: 'status', label: '状态', width: 90, useSlot: true },
        { prop: 'create_time', label: '创建时间', minWidth: 160 },
        { prop: 'operation', label: '操作', width: 100, useSlot: true, fixed: 'right' }
      ]
    }
  })

  const doSearch = () => {
    Object.assign(searchParams, {
      keyword: searchForm.keyword || undefined,
      organization: searchForm.organization || undefined
    })
    getData()
  }

  const detailVisible = ref(false)
  const detail = ref<Record<string, any> | null>(null)
  const showDetail = async (row: Record<string, any>) => {
    detail.value = (await api.read(row.id)) as any
    detailVisible.value = true
  }
</script>
