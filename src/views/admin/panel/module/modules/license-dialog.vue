<template>
  <ElDialog
    v-model="visible"
    :title="mode === 'grant' ? '授予租户模块' : '撤销租户模块'"
    width="580px"
    align-center
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElAlert
      class="mb-5"
      :type="mode === 'grant' ? 'info' : 'warning'"
      :closable="false"
      show-icon
      :title="`${mode === 'grant' ? '授权' : '撤销'}模块：${moduleName || moduleKey}`"
    />
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="110px">
      <ElFormItem label="目标机构" prop="organization">
        <ElSelect
          v-model="formData.organization"
          filterable
          placeholder="请选择机构"
          :loading="organizationLoading"
          style="width: 100%"
        >
          <ElOption
            v-for="item in organizations"
            :key="item.id"
            :label="`${item.organization_name || item.title}（${item.id}）`"
            :value="Number(item.id)"
          />
        </ElSelect>
      </ElFormItem>
      <template v-if="mode === 'grant'">
        <ElFormItem label="到期时间" prop="expire_at">
          <ElDatePicker
            v-model="formData.expire_at"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="不填写表示长期有效"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="授权备注" prop="remark">
          <ElInput
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            maxlength="255"
            show-word-limit
          />
        </ElFormItem>
      </template>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton
        :type="mode === 'grant' ? 'primary' : 'danger'"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ mode === 'grant' ? '确认授权' : '确认撤销' }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import moduleApi from '@/api/admin/panel/module'
  import organizationApi from '@/api/admin/panel/organization'

  interface Props {
    modelValue: boolean
    mode: 'grant' | 'revoke'
    moduleKey?: string
    moduleName?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    moduleKey: '',
    moduleName: ''
  })
  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }>()
  const formRef = ref<FormInstance>()
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  const organizations = ref<Array<Record<string, any>>>([])
  const organizationLoading = ref(false)
  const submitting = ref(false)
  const initialFormData = {
    organization: null as number | null,
    expire_at: null as string | null,
    remark: ''
  }
  const formData = reactive({ ...initialFormData })
  const rules = reactive<FormRules>({
    organization: [{ required: true, message: '请选择目标机构', trigger: 'change' }]
  })

  watch(
    () => props.modelValue,
    (open) => {
      if (open) void initPage()
    }
  )

  const initPage = async () => {
    Object.assign(formData, initialFormData)
    organizationLoading.value = true
    try {
      const response: unknown = await organizationApi.list({ saiType: 'all' })
      if (!Array.isArray(response)) throw new Error('机构列表响应格式无效')
      organizations.value = response
    } catch {
      organizations.value = []
    } finally {
      organizationLoading.value = false
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value || !props.moduleKey) return
    await formRef.value.validate()
    submitting.value = true
    try {
      if (props.mode === 'grant') {
        await moduleApi.grantLicense({
          organization: Number(formData.organization),
          module_key: props.moduleKey,
          expire_at: formData.expire_at || null,
          remark: formData.remark.trim()
        })
        ElMessage.success('租户模块授权成功')
      } else {
        await moduleApi.revokeLicense({
          organization: Number(formData.organization),
          module_key: props.moduleKey
        })
        ElMessage.success('租户模块授权已撤销')
      }
      emit('success')
      handleClose()
    } finally {
      submitting.value = false
    }
  }

  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }
</script>
