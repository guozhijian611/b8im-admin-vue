<template>
  <sa-search-bar
    ref="searchBarRef"
    v-model="formData"
    :label-width="'76px'"
    :show-expand="false"
    @reset="handleReset"
    @search="handleSearch"
  >
    <ElCol v-bind="setSpan(6)">
      <ElFormItem label="所属机构" prop="organization">
        <ElSelect
          v-model="formData.organization"
          clearable
          filterable
          :loading="organizationLoading"
          placeholder="全部机构"
        >
          <ElOption
            v-for="item in organizations"
            :key="item.id"
            :label="`${item.organization_name}（${item.id}）`"
            :value="item.id"
          />
        </ElSelect>
      </ElFormItem>
    </ElCol>
    <ElCol v-bind="setSpan(10)">
      <ElFormItem label="用户搜索" prop="keyword">
        <ElInput
          v-model="formData.keyword"
          clearable
          maxlength="100"
          placeholder="账号 / 昵称 / 用户 ID / IM 短号 / 手机 / 邮箱"
        />
      </ElFormItem>
    </ElCol>
    <ElCol v-bind="setSpan(6)">
      <ElFormItem label="用户状态" prop="status">
        <ElSelect v-model="formData.status" clearable placeholder="全部状态">
          <ElOption v-for="item in statusOptions" :key="item.value" v-bind="item" />
        </ElSelect>
      </ElFormItem>
    </ElCol>
  </sa-search-bar>
</template>

<script setup lang="ts">
  import type { OrganizationOption } from './types'

  interface Props {
    modelValue: Record<string, any>
    organizations: OrganizationOption[]
    organizationLoading?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    organizationLoading: false
  })
  const emit = defineEmits<{
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }>()
  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  const statusOptions = [
    { label: '正常', value: 1 },
    { label: '停用', value: 2 },
    { label: '封禁', value: 3 }
  ]

  const handleReset = () => {
    searchBarRef.value?.ref.resetFields()
    emit('reset')
  }

  const handleSearch = () => {
    emit('search', formData.value)
  }

  const setSpan = (span: number) => ({
    span,
    xs: 24,
    sm: 12,
    md: span >= 10 ? 12 : 8,
    lg: span,
    xl: span
  })
</script>
