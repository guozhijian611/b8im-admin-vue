<template>
  <ElDialog
    v-model="visible"
    :title="isAdd ? '新增 IM 用户' : '编辑 IM 用户'"
    width="820px"
    align-center
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElSkeleton v-if="loading" :rows="8" animated />
    <ElForm v-else ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElAlert
        v-if="!isAdd"
        class="mb-5"
        type="info"
        :closable="false"
        show-icon
        :title="`${formData.organization_name}（机构 ${formData.organization}） · 用户 ID ${formData.user_id}`"
      />
      <ElRow :gutter="20">
        <ElCol v-if="isAdd" :span="12">
          <ElFormItem label="所属机构" prop="organization">
            <ElSelect
              v-model="formData.organization"
              filterable
              :loading="organizationLoading"
              placeholder="请选择机构"
              style="width: 100%"
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
        <ElCol :span="12">
          <ElFormItem label="登录账号" prop="account">
            <ElInput v-model="formData.account" maxlength="64" placeholder="字母、数字、_ 或 -" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="用户昵称" prop="nickname">
            <ElInput v-model="formData.nickname" maxlength="64" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="IM 短号" prop="im_short_no">
            <ElInput v-model="formData.im_short_no" maxlength="32" placeholder="仅字母和数字" />
          </ElFormItem>
        </ElCol>
        <ElCol v-if="isAdd" :span="12">
          <ElFormItem label="登录密码" prop="password">
            <ElInput v-model="formData.password" type="password" maxlength="72" show-password />
          </ElFormItem>
        </ElCol>
        <ElCol v-if="isAdd" :span="12">
          <ElFormItem label="确认密码" prop="password_confirm">
            <ElInput
              v-model="formData.password_confirm"
              type="password"
              maxlength="72"
              show-password
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="手机号" prop="mobile">
            <ElInput v-model="formData.mobile" maxlength="32" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="邮箱" prop="email">
            <ElInput v-model="formData.email" maxlength="120" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="性别" prop="gender">
            <ElRadioGroup v-model="formData.gender">
              <ElRadio :value="0">未知</ElRadio>
              <ElRadio :value="1">男</ElRadio>
              <ElRadio :value="2">女</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
        <ElCol v-if="isAdd" :span="12">
          <ElFormItem label="初始状态" prop="status">
            <ElRadioGroup v-model="formData.status">
              <ElRadio :value="1">正常</ElRadio>
              <ElRadio :value="2">停用</ElRadio>
              <ElRadio :value="3">封禁</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="头像文件 ID" prop="avatar">
            <ElInput
              v-model="formData.avatar"
              maxlength="255"
              placeholder="请输入私有附件 file_id"
            />
            <div class="mt-1 text-xs text-g-600">该字段保存私有附件 file_id，不是图片 URL。</div>
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="个性签名" prop="signature">
            <ElInput
              v-model="formData.signature"
              type="textarea"
              :rows="2"
              maxlength="255"
              show-word-limit
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="备注" prop="remark">
            <ElInput
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              maxlength="255"
              show-word-limit
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="submitting" :disabled="loading" @click="handleSubmit">
        保存
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import api, {
    type AdminImUserGender,
    type AdminImUserSavePayload,
    type AdminImUserStatus,
    type AdminImUserUpdatePayload
  } from '@/api/admin/im/user'
  import type { OrganizationOption } from './types'

  interface Props {
    modelValue: boolean
    dialogType: string
    data?: Record<string, any>
    organizations: OrganizationOption[]
    organizationLoading?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    data: undefined,
    organizationLoading: false
  })
  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }>()
  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const submitting = ref(false)
  const isAdd = computed(() => props.dialogType === 'add')
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  const initialFormData = {
    id: null as number | null,
    organization: null as number | null,
    organization_name: '',
    user_id: '',
    account: '',
    password: '',
    password_confirm: '',
    nickname: '',
    im_short_no: '',
    avatar: '',
    mobile: '',
    email: '',
    gender: 0 as AdminImUserGender,
    status: 1 as AdminImUserStatus,
    remark: '',
    signature: ''
  }
  const formData = reactive({ ...initialFormData })
  const validatePasswordConfirm = (
    _rule: unknown,
    value: string,
    callback: (error?: Error) => void
  ) => {
    callback(value === formData.password ? undefined : new Error('两次输入的密码不一致'))
  }
  const rules: FormRules = {
    organization: [{ required: true, message: '请选择所属机构', trigger: 'change' }],
    account: [
      { required: true, message: '请输入登录账号', trigger: 'blur' },
      { min: 2, max: 64, message: '账号长度为 2 至 64 个字符', trigger: 'blur' },
      { pattern: /^[A-Za-z0-9_-]+$/, message: '账号只能包含字母、数字、_ 和 -', trigger: 'blur' }
    ],
    nickname: [
      { required: true, message: '请输入用户昵称', trigger: 'blur' },
      { min: 1, max: 64, message: '昵称最多 64 个字符', trigger: 'blur' }
    ],
    im_short_no: [
      { pattern: /^[A-Za-z0-9]*$/, message: 'IM 短号只能包含字母和数字', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入登录密码', trigger: 'blur' },
      { min: 8, max: 72, message: '密码长度为 8 至 72 个字符', trigger: 'blur' }
    ],
    password_confirm: [
      { required: true, message: '请再次输入密码', trigger: 'blur' },
      { validator: validatePasswordConfirm, trigger: 'blur' }
    ],
    email: [{ type: 'email', message: '请输入有效邮箱', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    status: [{ required: true, message: '请选择初始状态', trigger: 'change' }]
  }

  watch(
    () => props.modelValue,
    (open) => {
      if (open) void initPage()
    }
  )

  const initPage = async () => {
    Object.assign(formData, initialFormData)
    await nextTick()
    formRef.value?.clearValidate()
    if (isAdd.value || !props.data?.id) return

    loading.value = true
    try {
      const detail = await api.read(Number(props.data.id))
      Object.assign(formData, {
        id: detail.id,
        organization: detail.organization,
        organization_name: detail.organization_name || `机构 ${detail.organization}`,
        user_id: detail.user_id,
        account: detail.account,
        nickname: detail.nickname,
        im_short_no: detail.im_short_no || '',
        avatar: detail.avatar || '',
        mobile: detail.mobile || '',
        email: detail.email || '',
        gender: Number(detail.gender) as AdminImUserGender,
        status: Number(detail.status) as AdminImUserStatus,
        remark: detail.remark || '',
        signature: detail.signature || ''
      })
    } finally {
      loading.value = false
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    submitting.value = true
    try {
      const common = {
        account: formData.account.trim(),
        nickname: formData.nickname.trim(),
        im_short_no: formData.im_short_no.trim(),
        avatar: formData.avatar,
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        gender: formData.gender,
        remark: formData.remark.trim(),
        signature: formData.signature.trim()
      }
      if (isAdd.value) {
        const payload: AdminImUserSavePayload = {
          ...common,
          organization: Number(formData.organization),
          password: formData.password,
          password_confirm: formData.password_confirm,
          status: formData.status
        }
        await api.save(payload)
        ElMessage.success('IM 用户创建成功')
      } else {
        const payload: AdminImUserUpdatePayload = {
          ...common,
          id: Number(formData.id)
        }
        await api.update(payload)
        ElMessage.success('IM 用户更新成功')
      }
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
