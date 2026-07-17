<template>
  <ElDialog
    v-model="visible"
    :title="`${groupName || '套餐'} · 模块能力`"
    width="900px"
    align-center
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElAlert
      class="mb-4"
      type="warning"
      :closable="false"
      show-icon
      title="保存后会同步到该套餐下所有仍在继承套餐的机构；机构的单独配置不会被覆盖。"
    />
    <ElInput
      v-model="keyword"
      class="mb-4"
      clearable
      placeholder="搜索模块名称或标识"
      prefix-icon="Search"
    />
    <ElTable v-loading="loading" :data="filteredItems" max-height="62vh" border>
      <ElTableColumn label="启用" width="80" align="center">
        <template #default="{ row }">
          <ElCheckbox v-model="row.enabled" />
        </template>
      </ElTableColumn>
      <ElTableColumn label="模块" min-width="260">
        <template #default="{ row }">
          <div class="font-medium">{{ row.name }}</div>
          <ElText type="info" size="small">{{ row.module_key }} · {{ row.version }}</ElText>
          <div v-if="row.description" class="mt-1 text-xs text-gray-500">
            {{ row.description }}
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn label="依赖模块" min-width="220">
        <template #default="{ row }">
          <ElSpace v-if="row.depends_on.length" wrap>
            <ElTag v-for="dependency in row.depends_on" :key="dependency.module_key" size="small">
              {{ dependency.module_key }}
            </ElTag>
          </ElSpace>
          <ElText v-else type="info">无</ElText>
        </template>
      </ElTableColumn>
      <ElTableColumn label="支持端" min-width="180">
        <template #default="{ row }">
          <ElSpace wrap>
            <ElTag v-for="platform in row.platforms" :key="platform" type="info" size="small">
              {{ platform }}
            </ElTag>
          </ElSpace>
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
  import groupApi, { type GroupModuleCapability } from '@/api/admin/panel/group'

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
  const groupName = ref('')
  const items = ref<GroupModuleCapability[]>([])
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
      const response = await groupApi.moduleCapabilities(id)
      groupName.value = response.group_name
      items.value = response.items.map((item) => ({ ...item }))
    } finally {
      loading.value = false
    }
  }

  const handleSubmit = async () => {
    const id = Number(props.data?.id || 0)
    if (!id) return
    submitting.value = true
    try {
      await groupApi.updateModuleCapabilities({
        id,
        module_keys: items.value.filter((item) => item.enabled).map((item) => item.module_key)
      })
      ElMessage.success('套餐模块能力已更新')
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
