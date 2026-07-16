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
        <template #usage="{ row }">
          {{ formatBytes(row.used_storage_bytes) }} / {{ formatBytes(row.max_storage_bytes) }}
          ({{ Math.round(Number(row.usage_ratio || 0) * 100) }}%)
        </template>
        <template #status="{ row }">
          <ElTag :type="Number(row.status) === 1 ? 'success' : 'info'">
            {{ Number(row.status) === 1 ? '启用' : '停用' }}
          </ElTag>
        </template>
        <template #operation="{ row }">
          <ElButton
            v-permission="'saimulti:admin:file_media:update'"
            size="small"
            @click="showEdit(row)"
          >
            调整配额
          </ElButton>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog v-model="dialogVisible" title="调整配额" width="520px" align-center>
      <ElForm :model="form" label-width="140px">
        <ElFormItem label="机构">{{ form.organization }}</ElFormItem>
        <ElFormItem label="存储上限(字节)">
          <ElInput v-model="form.max_storage_bytes" />
        </ElFormItem>
        <ElFormItem label="单文件上限(字节)">
          <ElInput v-model="form.max_file_bytes" />
        </ElFormItem>
        <ElFormItem label="大文件">
          <ElSwitch v-model="form.large_file_enabled" :active-value="1" :inactive-value="0" />
        </ElFormItem>
        <ElFormItem label="预览">
          <ElSwitch v-model="form.preview_enabled" :active-value="1" :inactive-value="0" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSwitch v-model="form.status" :active-value="1" :inactive-value="0" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="saving" @click="submit">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { useTable } from '@/hooks/useTable'
  import api from '@/api/file-media'

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
      apiFn: api.quotaList,
      columnsFactory: () => [
        { prop: 'organization', label: '机构', width: 90 },
        { prop: 'usage', label: '用量', minWidth: 220, useSlot: true },
        { prop: 'used_file_count', label: '文件数', width: 90 },
        { prop: 'max_file_bytes', label: '单文件上限', minWidth: 140 },
        { prop: 'status', label: '状态', width: 90, useSlot: true },
        { prop: 'operation', label: '操作', width: 120, useSlot: true, fixed: 'right' }
      ]
    }
  })

  const doSearch = () => {
    Object.assign(searchParams, {
      organization: searchForm.organization || undefined
    })
    getData()
  }

  const formatBytes = (n: number) => {
    const v = Number(n || 0)
    if (v === 0) return '0'
    if (v < 1024) return `${v} B`
    if (v < 1024 ** 2) return `${(v / 1024).toFixed(1)} KB`
    if (v < 1024 ** 3) return `${(v / 1024 ** 2).toFixed(1)} MB`
    return `${(v / 1024 ** 3).toFixed(2)} GB`
  }

  const dialogVisible = ref(false)
  const saving = ref(false)
  const form = reactive({
    organization: 0,
    max_storage_bytes: '',
    max_file_bytes: '',
    large_file_enabled: 1,
    preview_enabled: 1,
    status: 1
  })

  const showEdit = (row: Record<string, any>) => {
    Object.assign(form, {
      organization: row.organization,
      max_storage_bytes: String(row.max_storage_bytes ?? ''),
      max_file_bytes: String(row.max_file_bytes ?? ''),
      large_file_enabled: Number(row.large_file_enabled ?? 1),
      preview_enabled: Number(row.preview_enabled ?? 1),
      status: Number(row.status ?? 1)
    })
    dialogVisible.value = true
  }

  const submit = async () => {
    saving.value = true
    try {
      await api.quotaUpdate({
        organization: form.organization,
        max_storage_bytes: Number(form.max_storage_bytes),
        max_file_bytes: Number(form.max_file_bytes),
        large_file_enabled: form.large_file_enabled,
        preview_enabled: form.preview_enabled,
        status: form.status
      })
      ElMessage.success('已保存')
      dialogVisible.value = false
      refreshData()
    } finally {
      saving.value = false
    }
  }
</script>
