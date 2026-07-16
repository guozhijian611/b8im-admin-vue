<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
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
          <ElTag>{{ row.status }}</ElTag>
        </template>
        <template #operation="{ row }">
          <ElButton
            v-permission="'saimulti:admin:search:job'"
            size="small"
            @click="doRebuild(row)"
          >
            重建
          </ElButton>
        </template>
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { useTable } from '@/hooks/useTable'
  import api from '@/api/search'

  const searchForm = reactive({ organization: '' })
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
      apiFn: api.indexList,
      columnsFactory: () => [
        { prop: 'organization', label: '机构', width: 90 },
        { prop: 'backend', label: '后端', width: 110 },
        { prop: 'status', label: '状态', width: 110, useSlot: true },
        { prop: 'doc_count', label: '文档数', width: 100 },
        { prop: 'last_built_at', label: '最近重建', minWidth: 160 },
        { prop: 'last_error', label: '错误', minWidth: 160 },
        { prop: 'operation', label: '操作', width: 100, useSlot: true, fixed: 'right' }
      ]
    }
  })

  const doSearch = () => {
    Object.assign(searchParams, {
      organization: searchForm.organization || undefined
    })
    getData()
  }

  const doRebuild = async (row: Record<string, any>) => {
    await api.rebuild({ organization: row.organization })
    ElMessage.success('重建完成')
    refreshData()
  }
</script>
