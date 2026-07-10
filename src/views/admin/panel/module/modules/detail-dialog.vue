<template>
  <ElDialog
    v-model="visible"
    title="模块详情"
    width="920px"
    align-center
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="loading" class="min-h-60">
      <ElAlert v-if="error" type="error" :closable="false" show-icon :title="error" />
      <template v-else-if="detail">
        <ElDescriptions :column="3" border>
          <ElDescriptionsItem label="模块名称">{{ detail.name }}</ElDescriptionsItem>
          <ElDescriptionsItem label="模块标识">{{ detail.module_key }}</ElDescriptionsItem>
          <ElDescriptionsItem label="清单版本">{{ detail.version }}</ElDescriptionsItem>
          <ElDescriptionsItem label="模块类别">{{ detail.category }}</ElDescriptionsItem>
          <ElDescriptionsItem label="模块类型">{{ detail.module_type }}</ElDescriptionsItem>
          <ElDescriptionsItem label="最低系统版本">
            {{ detail.min_system_version }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="系统状态">
            {{ detail.system?.status || '未发现' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="已安装版本">
            {{ detail.system?.version || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="可用版本">
            {{ detail.system?.available_version || detail.version }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="支持平台" :span="3">
            <ElSpace wrap>
              <ElTag v-for="platform in detail.platforms" :key="platform" effect="plain">
                {{ platform }}
              </ElTag>
            </ElSpace>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="说明" :span="3">
            {{ detail.description }}
          </ElDescriptionsItem>
          <ElDescriptionsItem v-if="detail.system?.failure_message" label="失败原因" :span="3">
            <ElText type="danger">{{ detail.system.failure_message }}</ElText>
          </ElDescriptionsItem>
        </ElDescriptions>

        <ElTabs class="mt-5">
          <ElTabPane label="依赖与冲突">
            <ElTable :data="detail.depends_on" border empty-text="无依赖">
              <ElTableColumn prop="module_key" label="依赖模块" min-width="180" />
              <ElTableColumn prop="constraint" label="版本约束" min-width="180" />
            </ElTable>
            <ElDivider>冲突模块</ElDivider>
            <ElTable :data="detail.conflicts_with" border empty-text="无冲突">
              <ElTableColumn prop="module_key" label="冲突模块" min-width="180" />
              <ElTableColumn prop="constraint" label="版本约束" min-width="180" />
            </ElTable>
          </ElTabPane>
          <ElTabPane label="权限">
            <ElTable :data="detail.permissions" border empty-text="未声明权限">
              <ElTableColumn prop="name" label="名称" min-width="160" />
              <ElTableColumn prop="slug" label="权限标识" min-width="260" />
              <ElTableColumn prop="scope" label="作用域" width="110" />
              <ElTableColumn prop="description" label="说明" min-width="220" />
            </ElTable>
          </ElTabPane>
          <ElTabPane label="租户配置">
            <ElTable :data="detail.config" border empty-text="未声明配置">
              <ElTableColumn prop="name" label="名称" min-width="150" />
              <ElTableColumn prop="key" label="配置键" min-width="180" />
              <ElTableColumn prop="type" label="类型" width="120" />
              <ElTableColumn prop="scope" label="作用域" width="110" />
              <ElTableColumn prop="description" label="说明" min-width="220" />
            </ElTable>
          </ElTabPane>
          <ElTabPane label="路由与迁移">
            <ElTable :data="detail.routes" border empty-text="未声明路由">
              <ElTableColumn prop="name" label="名称" min-width="160" />
              <ElTableColumn prop="platform" label="平台" width="100" />
              <ElTableColumn prop="path" label="路径" min-width="260" />
              <ElTableColumn prop="permission" label="权限" min-width="240" />
            </ElTable>
            <ElDivider>数据库迁移</ElDivider>
            <ElTable :data="detail.migrations" border empty-text="未声明迁移">
              <ElTableColumn prop="id" label="迁移标识" min-width="240" />
              <ElTableColumn prop="version" label="版本" width="110" />
              <ElTableColumn prop="path" label="路径" min-width="300" />
            </ElTable>
          </ElTabPane>
        </ElTabs>
      </template>
    </div>
    <template #footer>
      <ElButton @click="handleClose">关闭</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import moduleApi, { type ModuleCatalogItem } from '@/api/admin/panel/module'

  interface Props {
    modelValue: boolean
    moduleKey?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    moduleKey: ''
  })
  const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  const detail = ref<ModuleCatalogItem | null>(null)
  const loading = ref(false)
  const error = ref('')

  watch(
    () => props.modelValue,
    (open) => {
      if (open) void loadDetail()
    }
  )

  const loadDetail = async () => {
    detail.value = null
    error.value = ''
    if (!props.moduleKey) {
      error.value = '模块标识不能为空'
      return
    }
    loading.value = true
    try {
      detail.value = await moduleApi.read(props.moduleKey)
    } catch (value) {
      error.value = value instanceof Error ? value.message : '模块详情加载失败'
    } finally {
      loading.value = false
    }
  }

  const handleClose = () => {
    visible.value = false
    detail.value = null
    error.value = ''
  }
</script>
