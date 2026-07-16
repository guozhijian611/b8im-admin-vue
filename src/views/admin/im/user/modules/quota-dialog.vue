<template>
  <ElDialog
    v-model="visible"
    title="配置 IM 用户席位"
    width="620px"
    align-center
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElAlert
      class="mb-5"
      type="info"
      :closable="false"
      show-icon
      title="席位由服务端按机构校验；新增用户和恢复正常状态均不能超过已配置席位。"
    />
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="110px">
      <ElFormItem label="所属机构" prop="organization">
        <ElSelect
          v-model="formData.organization"
          filterable
          :loading="organizationLoading"
          placeholder="请选择机构"
          style="width: 100%"
          @change="handleOrganizationChange"
        >
          <ElOption
            v-for="item in organizations"
            :key="item.id"
            :label="`${item.organization_name}（${item.id}）`"
            :value="item.id"
          />
        </ElSelect>
      </ElFormItem>
      <ElSkeleton v-if="quotaLoading" class="mb-4" :rows="3" animated />
      <template v-else-if="quota">
        <ElDescriptions class="mb-5" :column="3" border>
          <ElDescriptionsItem label="配置状态">
            <ElTag :type="quota.configured ? 'success' : 'warning'">
              {{ quota.configured ? '已配置' : '未配置' }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="已用席位">{{ quota.used_value }}</ElDescriptionsItem>
          <ElDescriptionsItem label="剩余席位">{{ quota.remaining_value }}</ElDescriptionsItem>
        </ElDescriptions>
        <ElFormItem label="席位总数" prop="quota_value">
          <ElInputNumber
            v-model="formData.quota_value"
            :min="quota.used_value"
            :max="2147483647"
            :precision="0"
            controls-position="right"
            style="width: 100%"
          />
          <div class="mt-1 text-xs text-g-600">不能低于当前已启用用户数 {{ quota.used_value }}</div>
        </ElFormItem>
      </template>
      <ElEmpty v-else description="请选择机构以读取席位使用情况" :image-size="72" />
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton
        v-permission="'saimulti:admin:im:user:quota:update'"
        type="primary"
        :loading="submitting"
        :disabled="!quota || quotaLoading"
        @click="handleSubmit"
      >
        保存席位配置
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import api, { type AdminImUserQuota } from '@/api/admin/im/user'
  import type { OrganizationOption } from './types'

  const props = withDefaults(
    defineProps<{
      modelValue: boolean
      organization?: number | null
      organizations: OrganizationOption[]
      organizationLoading?: boolean
    }>(),
    { modelValue: false, organization: null, organizationLoading: false }
  )
  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }>()
  const formRef = ref<FormInstance>()
  const quota = ref<AdminImUserQuota | null>(null)
  const quotaLoading = ref(false)
  const submitting = ref(false)
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  const formData = reactive({
    organization: null as number | null,
    quota_value: 0
  })
  const rules: FormRules = {
    organization: [{ required: true, message: '请选择所属机构', trigger: 'change' }],
    quota_value: [
      { required: true, message: '请输入席位总数', trigger: 'change' },
      { type: 'number', min: 0, message: '席位总数不能小于 0', trigger: 'change' }
    ]
  }

  watch(
    () => props.modelValue,
    async (open) => {
      if (!open) return
      quota.value = null
      Object.assign(formData, { organization: props.organization, quota_value: 0 })
      await nextTick()
      formRef.value?.clearValidate()
      if (formData.organization) await loadQuota(formData.organization)
    }
  )

  const loadQuota = async (organization: number) => {
    const requestedOrganization = Number(organization)
    quotaLoading.value = true
    try {
      const result = await api.quota(requestedOrganization)
      if (Number(formData.organization) !== requestedOrganization) return
      quota.value = result
      formData.quota_value = result.quota_value
    } catch {
      if (Number(formData.organization) === requestedOrganization) quota.value = null
    } finally {
      quotaLoading.value = false
    }
  }

  const handleOrganizationChange = (organization: number) => {
    quota.value = null
    void loadQuota(organization)
  }

  const handleSubmit = async () => {
    if (!formRef.value || !quota.value || !formData.organization) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    submitting.value = true
    try {
      quota.value = await api.updateQuota(formData.organization, formData.quota_value)
      formData.quota_value = quota.value.quota_value
      ElMessage.success('IM 用户席位配置已保存')
      emit('success')
    } catch {
      // HTTP 层统一展示接口错误。
    } finally {
      submitting.value = false
    }
  }

  const handleClose = () => {
    visible.value = false
    quota.value = null
    formRef.value?.resetFields()
  }
</script>
