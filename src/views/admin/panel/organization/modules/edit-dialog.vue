<template>
  <el-dialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增机构' : '编辑机构'"
    width="980px"
    align-center
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="150px">
      <el-row :gutter="20">
        <el-col :span="24"
          ><el-divider content-position="left">公开入口与部署信任域</el-divider></el-col
        >
        <el-col :span="12">
          <el-form-item label="企业码" prop="enterprise_code">
            <el-input v-model="formData.enterprise_code" placeholder="例如 acme_cn" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部署标识" prop="deployment_id">
            <el-input v-model="formData.deployment_id" placeholder="例如 saas_cn_01" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="绑定域名" prop="domain">
            <el-input v-model="formData.domain" placeholder="im.example.com（可选）" />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="dialogType !== 'add'">
          <el-form-item label="公开配置版本">
            <el-input :model-value="formData.config_version" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-alert
            type="info"
            :closable="false"
            show-icon
            title="机构保存后，请前往“接入线路策略”发布该机构的 API、IM、上传和 Web 线路。机构资料不再直接保存服务 URL。"
          />
        </el-col>

        <el-col :span="24"><el-divider content-position="left">品牌与备案</el-divider></el-col>
        <el-col :span="12">
          <el-form-item label="站点标题" prop="title">
            <el-input v-model="formData.title" placeholder="请输入站点标题" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="机构名称" prop="organization_name">
            <el-input v-model="formData.organization_name" placeholder="请输入机构名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="站点Logo" prop="logo">
            <sa-image-upload v-model="formData.logo" :limit="1" :multiple="false" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Favicon" prop="favicon">
            <sa-image-upload v-model="formData.favicon" :limit="1" :multiple="false" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="ICP 备案号" prop="icp">
            <el-input v-model="formData.icp" placeholder="可选" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="公安备案号" prop="public_security_record_no">
            <el-input v-model="formData.public_security_record_no" placeholder="可选" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="公安备案链接" prop="public_security_record_url">
            <el-input v-model="formData.public_security_record_url" placeholder="https://..." />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="版权信息" prop="copyright">
            <el-input v-model="formData.copyright" placeholder="可选" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Android 下载地址" prop="android_download_url">
            <el-input v-model="formData.android_download_url" placeholder="https://..." />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="iOS 下载地址" prop="ios_download_url">
            <el-input v-model="formData.ios_download_url" placeholder="https://..." />
          </el-form-item>
        </el-col>

        <el-col :span="24"><el-divider content-position="left">机构信息</el-divider></el-col>
        <el-col :span="12">
          <el-form-item label="所属套餐" prop="group_id">
            <el-radio-group v-model="formData.group_id">
              <el-radio v-for="item in optionData.treeData" :key="item.id" :label="item.id">{{
                item.group_name
              }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="地区" prop="region">
            <sa-area v-model="formData.region" :level="3" placeholder="请输入地区" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="地址" prop="address">
            <el-input v-model="formData.address" placeholder="请输入地址" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人" prop="contact_name">
            <el-input v-model="formData.contact_name" placeholder="请输入联系人" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="contact_phone">
            <el-input v-model="formData.contact_phone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系邮箱" prop="contact_email">
            <el-input v-model="formData.contact_email" placeholder="请输入联系邮箱" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
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

        <el-col :span="24"><el-divider content-position="left">登录前协议</el-divider></el-col>
        <el-col :span="12">
          <el-form-item label="用户协议标题" prop="user_agreement_title">
            <el-input v-model="formData.user_agreement_title" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="隐私政策标题" prop="privacy_policy_title">
            <el-input v-model="formData.privacy_policy_title" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户协议内容" prop="user_agreement_content">
            <el-input v-model="formData.user_agreement_content" type="textarea" :rows="8" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="隐私政策内容" prop="privacy_policy_content">
            <el-input v-model="formData.privacy_policy_content" type="textarea" :rows="8" />
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

  const networkUrlValidator = (schemes: string[], required = false) => {
    return (_rule: unknown, value: string, callback: (error?: Error) => void) => {
      const input = value?.trim()
      if (!input) {
        callback(required ? new Error('该服务地址必须填写') : undefined)
        return
      }
      try {
        const url = new URL(input)
        if (!url.hostname || !schemes.includes(url.protocol.replace(':', ''))) {
          callback(new Error(`仅支持 ${schemes.join(' / ')} 网络地址`))
          return
        }
        callback()
      } catch {
        callback(new Error('请输入完整的网络地址'))
      }
    }
  }

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
    group_id: [{ required: true, message: '所属套餐必需填写', trigger: 'blur' }],
    organization_name: [{ required: true, message: '机构名称必需填写', trigger: 'blur' }],
    enterprise_code: [
      { required: true, message: '企业码必须填写', trigger: 'blur' },
      {
        pattern: /^[a-z0-9][a-z0-9_-]{1,63}$/,
        message: '仅支持小写字母、数字、下划线和短横线',
        trigger: 'blur'
      }
    ],
    deployment_id: [
      { required: true, message: '部署标识必须填写', trigger: 'blur' },
      { pattern: /^[a-z0-9][a-z0-9_-]{1,63}$/, message: '部署标识格式无效', trigger: 'blur' }
    ],
    public_security_record_url: [
      { validator: networkUrlValidator(['https', 'http']), trigger: 'blur' }
    ],
    android_download_url: [{ validator: networkUrlValidator(['https', 'http']), trigger: 'blur' }],
    ios_download_url: [{ validator: networkUrlValidator(['https', 'http']), trigger: 'blur' }]
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
    enterprise_code: '',
    deployment_id: 'b8im-local',
    config_version: 1,
    favicon: '',
    icp: '',
    public_security_record_no: '',
    public_security_record_url: '',
    copyright: '',
    android_download_url: '',
    ios_download_url: '',
    user_agreement_title: '用户协议',
    user_agreement_content: '',
    privacy_policy_title: '隐私政策',
    privacy_policy_content: '',
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
