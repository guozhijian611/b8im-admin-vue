<template>
  <ElDialog
    v-model="visible"
    :title="`${organizationName || '机构'} · 模块能力`"
    width="1120px"
    align-center
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElAlert
      class="mb-4"
      type="info"
      :closable="false"
      show-icon
      title="继承套餐会随套餐配置自动同步；单独启用或单独停用会覆盖当前机构的套餐默认值。"
    />
    <ElInput
      v-model="keyword"
      class="mb-4"
      clearable
      placeholder="搜索模块名称或标识"
      prefix-icon="Search"
    />
    <ElTable v-loading="loading" :data="filteredItems" max-height="62vh" border>
      <ElTableColumn label="模块" min-width="220">
        <template #default="{ row }">
          <div class="font-medium">{{ row.name }}</div>
          <ElText type="info" size="small">{{ row.module_key }} · {{ row.version }}</ElText>
          <div v-if="row.description" class="mt-1 text-xs text-gray-500">
            {{ row.description }}
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn label="套餐默认" width="110" align="center">
        <template #default="{ row }">
          <ElTag :type="row.package_enabled ? 'success' : 'info'">
            {{ row.package_enabled ? '已包含' : '未包含' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn label="配置方式" width="150">
        <template #default="{ row }">
          <ElSelect v-model="row.assignment_mode" @change="handleModeChange(row)">
            <ElOption label="继承套餐" value="inherit" />
            <ElOption label="单独启用" value="enabled" />
            <ElOption label="单独停用" value="disabled" />
          </ElSelect>
        </template>
      </ElTableColumn>
      <ElTableColumn label="当前结果" width="105" align="center">
        <template #default="{ row }">
          <ElTag :type="row.effective ? 'success' : 'danger'">
            {{ row.effective ? '可用' : '不可用' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn label="到期时间" width="205">
        <template #default="{ row }">
          <ElDatePicker
            v-model="row.expire_at"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="长期有效"
            :disabled="row.assignment_mode !== 'enabled'"
            style="width: 100%"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn label="备注" min-width="170">
        <template #default="{ row }">
          <ElInput
            v-model="row.remark"
            maxlength="255"
            placeholder="可选"
            :disabled="row.assignment_mode === 'inherit'"
          />
        </template>
      </ElTableColumn>
    </ElTable>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">保存配置</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import organizationApi, {
    type ModuleAssignmentMode,
    type OrganizationModuleCapability
  } from '@/api/admin/panel/organization'

  interface Props {
    modelValue: boolean
    data?: Record<string, any>
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    data: undefined
  })
  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }>()

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  const loading = ref(false)
  const submitting = ref(false)
  const keyword = ref('')
  const organizationName = ref('')
  const items = ref<OrganizationModuleCapability[]>([])
  const filteredItems = computed(() => {
    const value = keyword.value.trim().toLowerCase()
    if (!value) return items.value
    return items.value.filter(
      (item) =>
        item.name.toLowerCase().includes(value) || item.module_key.toLowerCase().includes(value)
    )
  })

  watch(
    () => props.modelValue,
    (open) => {
      if (open) void initPage()
    }
  )

  const initPage = async () => {
    const id = Number(props.data?.id || 0)
    if (!id) return
    loading.value = true
    keyword.value = ''
    try {
      const response = await organizationApi.moduleCapabilities(id)
      organizationName.value = response.organization_name
      items.value = response.items.map((item) => ({ ...item }))
    } finally {
      loading.value = false
    }
  }

  const handleModeChange = (row: OrganizationModuleCapability) => {
    const mode = row.assignment_mode as ModuleAssignmentMode
    if (mode !== 'enabled') row.expire_at = null
    if (mode === 'inherit') row.remark = ''
  }

  const handleSubmit = async () => {
    const id = Number(props.data?.id || 0)
    if (!id) return
    submitting.value = true
    try {
      await organizationApi.updateModuleCapabilities({
        id,
        assignments: items.value.map((item) => ({
          module_key: item.module_key,
          mode: item.assignment_mode,
          expire_at: item.expire_at || null,
          remark: item.remark?.trim() || ''
        }))
      })
      ElMessage.success('机构模块能力已更新')
      emit('success')
      handleClose()
    } finally {
      submitting.value = false
    }
  }

  const handleClose = () => {
    visible.value = false
    items.value = []
  }
</script>
