<template>
  <ElDialog
    v-model="visible"
    title="重置 IM 用户密码"
    width="520px"
    align-center
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElAlert
      class="mb-5"
      type="warning"
      :closable="false"
      show-icon
      title="密码重置后，该用户现有登录会话会被撤销，需要使用新密码重新登录。"
    />
    <ElDescriptions v-if="user" class="mb-5" :column="1" border>
      <ElDescriptionsItem label="用户"
        >{{ user.nickname }}（{{ user.account }}）</ElDescriptionsItem
      >
      <ElDescriptionsItem label="机构">
        {{ user.organization_name || `机构 ${user.organization}` }}
      </ElDescriptionsItem>
    </ElDescriptions>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="新密码" prop="password">
        <ElInput v-model="formData.password" type="password" maxlength="72" show-password />
      </ElFormItem>
      <ElFormItem label="确认密码" prop="password_confirm">
        <ElInput v-model="formData.password_confirm" type="password" maxlength="72" show-password />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="danger" :loading="submitting" @click="handleSubmit">确认重置</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import api, { type AdminImUser } from '@/api/admin/im/user'

  const props = withDefaults(
    defineProps<{
      modelValue: boolean
      user?: AdminImUser | null
    }>(),
    { modelValue: false, user: null }
  )
  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }>()
  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  const formData = reactive({ password: '', password_confirm: '' })
  const validatePasswordConfirm = (
    _rule: unknown,
    value: string,
    callback: (error?: Error) => void
  ) => {
    callback(value === formData.password ? undefined : new Error('两次输入的密码不一致'))
  }
  const rules: FormRules = {
    password: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 8, max: 72, message: '密码长度为 8 至 72 个字符', trigger: 'blur' }
    ],
    password_confirm: [
      { required: true, message: '请再次输入新密码', trigger: 'blur' },
      { validator: validatePasswordConfirm, trigger: 'blur' }
    ]
  }

  watch(
    () => props.modelValue,
    async (open) => {
      if (!open) return
      Object.assign(formData, { password: '', password_confirm: '' })
      await nextTick()
      formRef.value?.clearValidate()
    }
  )

  const handleSubmit = async () => {
    if (!formRef.value || !props.user) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    submitting.value = true
    try {
      const result = await api.resetPassword(
        props.user.id,
        formData.password,
        formData.password_confirm
      )
      ElMessage.success(`密码已重置，已撤销 ${result.revoked_session_count} 个登录会话`)
      emit('success')
      handleClose()
    } catch {
      // HTTP 层统一展示接口错误。
    } finally {
      submitting.value = false
    }
  }

  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }
</script>
