<template>
  <el-dialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增机构信息表' : '编辑机构信息表'"
    width="800px"
    align-center
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="站点标题" prop="title">
            <el-input v-model="formData.title" placeholder="请输入站点标题" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="站点Logo" prop="logo">
            <sa-image-upload v-model="formData.logo" :limit="1" :multiple="false" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="所属分组" prop="group_id">
            <el-radio-group v-model="formData.group_id">
              <el-radio v-for="item in optionData.treeData" :key="item.id" :label="item.id">{{
                item.group_name
              }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="域名" prop="domain">
            <el-input v-model="formData.domain" placeholder="请输入域名" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="机构名称" prop="organization_name">
            <el-input v-model="formData.organization_name" placeholder="请输入机构名称" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="地区" prop="region">
            <sa-area v-model="formData.region" :level="3" placeholder="请输入地区" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="地址" prop="address">
            <el-input v-model="formData.address" placeholder="请输入地址" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="联系人" prop="contact_name">
            <el-input v-model="formData.contact_name" placeholder="请输入联系人" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="联系电话" prop="contact_phone">
            <el-input v-model="formData.contact_phone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="联系邮箱" prop="contact_email">
            <el-input v-model="formData.contact_email" placeholder="请输入联系邮箱" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="状态" prop="status">
            <sa-radio v-model="formData.status" dict="data_status" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import commonApi from '@/api/common'
  import api from '@/api/admin/panel/organization'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  interface Props {
    modelValue: boolean
    dialogType: string
    data?: Record<string, any>
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    data: undefined
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const optionData = reactive({
    treeData: <any[]>[]
  })

  /**
   * 弹窗显示状态双向绑定
   */
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  /**
   * 表单验证规则
   */
  const rules = reactive<FormRules>({
    title: [{ required: true, message: '站点标题必需填写', trigger: 'blur' }],
    logo: [{ required: true, message: '站点Logo必需填写', trigger: 'blur' }],
    group_id: [{ required: true, message: '所属分组必需填写', trigger: 'blur' }],
    organization_name: [{ required: true, message: '机构名称必需填写', trigger: 'blur' }]
  })

  /**
   * 初始数据
   */
  const initialFormData = {
    title: '',
    logo: '',
    region: [] as Array<string | number>,
    group_id: undefined,
    domain: '',
    organization_name: '',
    province: '',
    city: '',
    area: '',
    address: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    status: 1,
    id: null,
    remark: ''
  }

  /**
   * 表单数据
   */
  const formData = reactive({ ...initialFormData })

  /**
   * 监听弹窗打开，初始化表单数据
   */
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) {
        initPage()
      }
    }
  )

  /**
   * 初始化页面数据
   */
  const initPage = async () => {
    // 先重置为初始值
    Object.assign(formData, initialFormData)
    const resp_group_id = await commonApi.get('/saimulti/admin/group/index?saiType=all')
    optionData.treeData = resp_group_id
    // 如果有数据，则填充数据
    if (props.data) {
      await nextTick()
      initForm()
      if (
        !Array.isArray(props.data.region) &&
        (props.data.province || props.data.city || props.data.area)
      ) {
        formData.region = [props.data.province, props.data.city, props.data.area].filter(Boolean)
      }
    }
  }

  /**
   * 初始化表单数据
   */
  const initForm = () => {
    if (props.data) {
      for (const key in formData) {
        if (props.data[key] != null && props.data[key] != undefined) {
          ;(formData as any)[key] = props.data[key]
        }
      }
    }
  }

  /**
   * 关闭弹窗并重置表单
   */
  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
      if (props.dialogType === 'add') {
        await api.save(formData)
        ElMessage.success('新增成功')
      } else {
        await api.update(formData)
        ElMessage.success('修改成功')
      }
      emit('success')
      handleClose()
    } catch (error) {
      console.log('表单验证失败:', error)
    }
  }
</script>
