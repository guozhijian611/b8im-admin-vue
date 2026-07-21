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
        rowKey="organization"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #quota="{ row }">
          <ElTag v-if="row.unlimited" type="success">无限</ElTag>
          <span v-else :title="`${row.quota_value} B`">
            {{ formatQuotaByteCount(row.quota_value, row.unlimited) }}
          </span>
        </template>
        <template #used="{ row }">
          <span :title="`${row.used_value} B`">{{ formatByteCount(row.used_value) }}</span>
          <div class="cell-secondary">{{ row.used_file_count }} 个已确认文件</div>
        </template>
        <template #held="{ row }">
          <span :title="`${row.held_value} B`">{{ formatByteCount(row.held_value) }}</span>
          <div class="cell-secondary">{{ row.held_file_count }} 个占用中文件</div>
        </template>
        <template #occupancy="{ row }">
          <span :title="`${row.occupancy_value} B`">{{
            formatByteCount(row.occupancy_value)
          }}</span>
        </template>
        <template #remaining="{ row }">
          <ElTag v-if="row.remaining_value === null" type="success">无限</ElTag>
          <span v-else :title="`${row.remaining_value} B`">
            {{ formatByteCount(row.remaining_value) }}
          </span>
        </template>
        <template #ratio="{ row }">{{ formatUsageRatio(row.usage_ratio) }}</template>
        <template #operation="{ row }">
          <ElButton
            v-permission="'saimulti:admin:storage_quota:update'"
            size="small"
            @click="showEdit(row)"
          >
            调整容量
          </ElButton>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      title="调整机构存储容量"
      width="540px"
      align-center
      :close-on-click-modal="false"
      @close="invalidateDetailRequest"
    >
      <ElForm
        ref="formRef"
        v-loading="detailLoading"
        :model="form"
        :rules="rules"
        label-width="150px"
      >
        <ElFormItem label="机构">{{ form.organization }}</ElFormItem>
        <ElFormItem label="当前占用">
          <span :title="`${form.occupancy_value} B`">{{
            formatByteCount(form.occupancy_value)
          }}</span>
        </ElFormItem>
        <ElFormItem label="容量上限（字节）" prop="quota_value">
          <ElInput v-model="form.quota_value" inputmode="numeric" autocomplete="off" />
          <div class="form-tip">0 表示无限；当前输入：{{ quotaInputPreview }}</div>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="closeDialog">取消</ElButton>
        <ElButton type="primary" :loading="saving" :disabled="detailLoading" @click="submit">
          保存
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { useTable } from '@/hooks/useTable'
  import api from '@/api/storage-quota'
  import type { StorageQuota } from '@/api/storage-quota'
  import { createLatestRequestFence } from '@/utils/latestRequestFence'
  import {
    formatByteCount,
    formatQuotaByteCount,
    formatUsageRatio,
    parseByteCount,
    parsePositiveServerInteger,
    PHP_INT_MAX_DECIMAL
  } from '@/utils/storageQuota'

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
      apiFn: api.index,
      columnsFactory: () => [
        { prop: 'organization', label: '机构', width: 100 },
        { prop: 'quota', label: '容量上限', minWidth: 130, useSlot: true },
        { prop: 'used', label: '已确认用量', minWidth: 150, useSlot: true },
        { prop: 'held', label: '占用中', minWidth: 150, useSlot: true },
        { prop: 'occupancy', label: '总占用', minWidth: 120, useSlot: true },
        { prop: 'remaining', label: '剩余', minWidth: 120, useSlot: true },
        { prop: 'ratio', label: '使用率', width: 100, useSlot: true },
        { prop: 'update_time', label: '更新时间', minWidth: 170 },
        { prop: 'operation', label: '操作', width: 120, useSlot: true, fixed: 'right' }
      ]
    }
  })

  const doSearch = () => {
    const organization =
      searchForm.organization === ''
        ? undefined
        : parsePositiveServerInteger(searchForm.organization)
    if (organization === null) {
      ElMessage.warning(`机构ID必须是 1 至 ${PHP_INT_MAX_DECIMAL} 的规范十进制整数`)
      return
    }
    Object.assign(searchParams, {
      organization
    })
    getData()
  }

  const dialogVisible = ref(false)
  const detailLoading = ref(false)
  const saving = ref(false)
  const formRef = ref<FormInstance>()
  const detailRequestFence = createLatestRequestFence()
  const form = reactive({
    organization: 0,
    quota_value: '',
    occupancy_value: '0',
    version: 0
  })
  const quotaInputPreview = computed(() =>
    form.quota_value === '0' ? '无限' : formatByteCount(form.quota_value)
  )
  const rules = reactive<FormRules>({
    quota_value: [
      {
        validator: (_rule, value: string, callback) => {
          const quota = parseByteCount(value)
          const occupancy = parseByteCount(form.occupancy_value)
          if (quota === null) {
            callback(new Error(`请输入 0 至 ${PHP_INT_MAX_DECIMAL} 的规范十进制整数`))
            return
          }
          if (occupancy === null) {
            callback(new Error('当前占用数据无效，请刷新后重试'))
            return
          }
          if (quota !== 0n && quota < occupancy) {
            callback(new Error('容量上限不能低于当前总占用'))
            return
          }
          callback()
        },
        trigger: 'blur'
      }
    ]
  })

  const fillForm = (quota: StorageQuota) => {
    Object.assign(form, {
      organization: quota.organization,
      quota_value: quota.quota_value,
      occupancy_value: quota.occupancy_value,
      version: quota.version
    })
  }

  const showEdit = async (row: StorageQuota) => {
    const generation = detailRequestFence.begin()
    detailLoading.value = true
    Object.assign(form, {
      organization: row.organization,
      quota_value: '',
      occupancy_value: '0',
      version: 0
    })
    dialogVisible.value = true
    try {
      const quota = await api.read(row.organization)
      if (!detailRequestFence.isCurrent(generation) || !dialogVisible.value) return
      fillForm(quota)
    } catch {
      if (detailRequestFence.isCurrent(generation)) {
        dialogVisible.value = false
      }
    } finally {
      if (detailRequestFence.isCurrent(generation)) {
        detailLoading.value = false
      }
    }
  }

  const invalidateDetailRequest = () => {
    detailRequestFence.cancel()
    detailLoading.value = false
  }

  const closeDialog = () => {
    invalidateDetailRequest()
    dialogVisible.value = false
  }

  const submit = async () => {
    if (!formRef.value || detailLoading.value) return
    await formRef.value.validate()

    saving.value = true
    try {
      await api.update({
        organization: form.organization,
        quota_value: form.quota_value,
        version: form.version
      })
      ElMessage.success('存储容量已更新')
      dialogVisible.value = false
      refreshData()
    } finally {
      saving.value = false
    }
  }

  onBeforeUnmount(invalidateDetailRequest)
</script>

<style scoped>
  .cell-secondary,
  .form-tip {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 20px;
  }
</style>
