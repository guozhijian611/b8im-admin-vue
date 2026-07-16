<template>
  <div class="routing-page art-full-height">
    <ElCard class="routing-card" shadow="never">
      <template #header>
        <div>
          <div class="text-lg font-semibold">接入线路策略</div>
          <ElText type="info"
            >开发阶段只提供 single 和
            primary_backup；发布会生成不可变线路、线路池和机构快照版本。</ElText
          >
        </div>
      </template>

      <ElAlert
        class="mb-5"
        type="warning"
        :closable="false"
        show-icon
        title="线路 URL 是客户端信任根，仅允许平台管理员发布；租户端只读。"
      />

      <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
        <ElRow :gutter="20">
          <ElCol :xs="24" :md="6"
            ><ElFormItem label="机构编号" prop="organization"
              ><ElInputNumber v-model="form.organization" :min="1" class="w-full" /></ElFormItem
          ></ElCol>
          <ElCol :xs="24" :md="6"
            ><ElFormItem label="部署标识" prop="deployment_id"
              ><ElInput v-model="form.deployment_id" /></ElFormItem
          ></ElCol>
          <ElCol :xs="24" :md="6"
            ><ElFormItem label="线路池标识" prop="route_pool_id"
              ><ElInput v-model="form.route_pool_id" /></ElFormItem
          ></ElCol>
          <ElCol :xs="24" :md="6"
            ><ElFormItem label="策略" prop="mode"
              ><ElSelect v-model="form.mode" class="w-full" @change="syncRouteCount"
                ><ElOption label="单线路" value="single" /><ElOption
                  label="固定主备"
                  value="primary_backup" /></ElSelect></ElFormItem
          ></ElCol>
        </ElRow>
        <ElRow :gutter="20">
          <ElCol :xs="24" :md="12"
            ><ElFormItem label="部署名称"><ElInput v-model="form.deployment_name" /></ElFormItem
          ></ElCol>
          <ElCol :xs="24" :md="12"
            ><ElFormItem label="线路池名称"><ElInput v-model="form.route_pool_name" /></ElFormItem
          ></ElCol>
        </ElRow>
        <ElFormItem label="发布到客户端"
          ><ElCheckboxGroup v-model="form.client_families"
            ><ElCheckbox value="web">Web</ElCheckbox><ElCheckbox value="app">App</ElCheckbox
            ><ElCheckbox value="desktop">Desktop</ElCheckbox></ElCheckboxGroup
          ></ElFormItem
        >

        <ElDivider content-position="left">线路 Bundle</ElDivider>
        <ElCard v-for="(route, index) in form.routes" :key="index" class="mb-4" shadow="never">
          <template #header
            ><div class="flex items-center justify-between"
              ><strong>{{ index === 0 ? '主线路' : `备用线路 ${index}` }}</strong
              ><ElButton v-if="index > 1" type="danger" link @click="form.routes.splice(index, 1)"
                >删除</ElButton
              ></div
            ></template
          >
          <ElRow :gutter="16">
            <ElCol :xs="24" :md="6"
              ><ElFormItem label="route_id" :prop="`routes.${index}.route_id`" :rules="slugRule"
                ><ElInput v-model="route.route_id" /></ElFormItem
            ></ElCol>
            <ElCol :xs="24" :md="6"
              ><ElFormItem label="名称" :prop="`routes.${index}.name`" :rules="requiredRule"
                ><ElInput v-model="route.name" /></ElFormItem
            ></ElCol>
            <ElCol :xs="12" :md="3"
              ><ElFormItem label="优先级"
                ><ElInputNumber v-model="route.priority" :min="1" /></ElFormItem
            ></ElCol>
            <ElCol :xs="12" :md="3"
              ><ElFormItem label="权重"
                ><ElInputNumber v-model="route.weight" :min="1" /></ElFormItem
            ></ElCol>
            <ElCol :xs="12" :md="3"
              ><ElFormItem label="区域"><ElInput v-model="route.region" /></ElFormItem
            ></ElCol>
            <ElCol :xs="12" :md="3"
              ><ElFormItem label="故障域"><ElInput v-model="route.failure_domain" /></ElFormItem
            ></ElCol>
            <ElCol :xs="24" :md="12"
              ><ElFormItem
                label="API / 上传地址"
                :prop="`routes.${index}.endpoints.api_server_url`"
                :rules="requiredRule"
                ><ElInput v-model="route.endpoints.api_server_url" /><ElInput
                  v-model="route.endpoints.upload_server_url"
                  class="mt-2" /></ElFormItem
            ></ElCol>
            <ElCol :xs="24" :md="12"
              ><ElFormItem
                label="IM / Web 地址"
                :prop="`routes.${index}.endpoints.im_server_url`"
                :rules="requiredRule"
                ><ElInput v-model="route.endpoints.im_server_url" /><ElInput
                  v-model="route.endpoints.web_server_url"
                  class="mt-2" /></ElFormItem
            ></ElCol>
          </ElRow>
        </ElCard>

        <div class="flex flex-wrap gap-3">
          <ElButton
            v-if="form.mode === 'primary_backup'"
            @click="form.routes.push(newRoute(form.routes.length))"
            >增加备用线路</ElButton
          >
          <ElButton
            v-permission="'saimulti:admin:routing:read'"
            :loading="loading"
            @click="loadPublished()"
            >读取已发布 Web 配置</ElButton
          >
          <ElButton
            v-permission="'saimulti:admin:routing:publish'"
            type="primary"
            :loading="publishing"
            @click="publish"
            >发布线路配置</ElButton
          >
        </div>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import api, { type RoutingPublishInput, type RoutingRouteInput } from '@/api/admin/routing'

  defineOptions({ name: 'AdminRouting' })
  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const publishing = ref(false)
  const requiredRule = [{ required: true, message: '必须填写', trigger: 'blur' }]
  const slugRule = [
    ...requiredRule,
    {
      pattern: /^[a-z0-9][a-z0-9_-]{1,63}$/,
      message: '仅支持小写字母、数字、下划线和短横线',
      trigger: 'blur'
    }
  ]
  const isLocalDevelopment = import.meta.env.DEV
  const newRoute = (index: number): RoutingRouteInput => ({
    route_id: isLocalDevelopment
      ? index === 0
        ? 'local-primary'
        : `local-backup-${index}`
      : index === 0
        ? 'primary'
        : `backup-${index}`,
    name: isLocalDevelopment
      ? index === 0
        ? '本机主线路'
        : `本机备用线路 ${index}`
      : index === 0
        ? '主线路'
        : `备用线路 ${index}`,
    priority: 10 + index * 10,
    weight: 100,
    region: isLocalDevelopment ? 'local' : '',
    carrier: isLocalDevelopment ? 'loopback' : '',
    failure_domain: isLocalDevelopment
      ? index === 0
        ? 'port-primary'
        : `port-backup-${index}`
      : '',
    endpoints: {
      api_server_url: isLocalDevelopment ? `http://127.0.0.1:${18888 + index}` : '',
      im_server_url: isLocalDevelopment ? `ws://127.0.0.1:${18787 + index}` : '',
      upload_server_url: isLocalDevelopment ? `http://127.0.0.1:${18888 + index}` : '',
      web_server_url: isLocalDevelopment ? 'http://127.0.0.1:16988' : ''
    }
  })
  const form = reactive<RoutingPublishInput>({
    organization: 1,
    deployment_id: isLocalDevelopment ? 'b8im-local' : '',
    deployment_name: isLocalDevelopment ? '本机开发环境' : '',
    route_pool_id: isLocalDevelopment ? 'org-1-local-dev' : '',
    route_pool_name: isLocalDevelopment ? '本机双端口线路池' : '',
    mode: isLocalDevelopment ? 'primary_backup' : 'single',
    client_families: ['web', 'app', 'desktop'],
    routes: isLocalDevelopment ? [newRoute(0), newRoute(1)] : [newRoute(0)]
  })
  const rules: FormRules = {
    organization: requiredRule,
    deployment_id: slugRule,
    route_pool_id: slugRule,
    mode: requiredRule
  }
  const syncRouteCount = () => {
    if (form.mode === 'single') form.routes = [form.routes[0] ?? newRoute(0)]
    if (form.mode === 'primary_backup' && form.routes.length < 2) form.routes.push(newRoute(1))
  }
  const loadPublished = async (notify = true) => {
    loading.value = true
    try {
      const result = await api.read(form.organization, 'web')
      form.deployment_id = result.deployment_id
      form.deployment_name = result.deployment_id
      form.route_pool_id = result.server_info.route_pool_id
      form.route_pool_name = result.server_info.route_pool_id
      form.mode = result.server_info.policy.mode
      form.routes = result.server_info.routes.map((route) => ({
        route_id: route.route_id,
        name: route.name,
        priority: route.priority,
        weight: route.weight,
        region: route.region,
        carrier: route.carrier,
        failure_domain: '',
        endpoints: { ...route.endpoints }
      }))
      if (notify) ElMessage.success(`已读取 routing_version ${result.server_info.routing_version}`)
    } catch (error) {
      if (notify) ElMessage.error(error instanceof Error ? error.message : '读取失败')
    } finally {
      loading.value = false
    }
  }
  const publish = async () => {
    if (!(await formRef.value?.validate().catch(() => false))) return
    publishing.value = true
    try {
      const result = await api.publish({
        ...form,
        routes: form.routes.map((route) => ({ ...route, endpoints: { ...route.endpoints } }))
      })
      ElMessage.success(`发布成功，pool version ${result.route_pool_version}`)
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '发布失败')
    } finally {
      publishing.value = false
    }
  }

  onMounted(() => loadPublished(false))
</script>

<style scoped>
  .routing-page {
    overflow-y: auto;
  }

  .routing-card {
    flex-shrink: 0;
  }
</style>
