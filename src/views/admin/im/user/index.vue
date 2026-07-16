<template>
  <div class="art-full-height">
    <TableSearch
      v-model="searchForm"
      :organizations="organizations"
      :organization-loading="organizationLoading"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="flex flex-col flex-1 min-h-0 art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton
              v-permission="'saimulti:admin:im:user:save'"
              type="primary"
              @click="showDialog('add')"
              v-ripple
            >
              <template #icon><ArtSvgIcon icon="ri:add-fill" /></template>
              新增 IM 用户
            </ElButton>
            <ElButton
              v-permission="'saimulti:admin:im:user:quota:read'"
              @click="showQuota()"
              v-ripple
            >
              <template #icon><ArtSvgIcon icon="ri:pie-chart-2-line" /></template>
              配置机构席位
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        row-key="id"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #organization="{ row }">
          <div class="flex flex-col">
            <span>{{ row.organization_name || `机构 ${row.organization}` }}</span>
            <span class="text-xs text-g-600">ID: {{ row.organization }}</span>
          </div>
        </template>
        <template #identity="{ row }">
          <div class="flex items-center gap-3 min-w-0">
            <ElAvatar :size="38">
              {{ String(row.nickname || row.account || 'IM').slice(0, 1) }}
            </ElAvatar>
            <div class="flex flex-col min-w-0">
              <span class="font-medium truncate">{{ row.nickname }}</span>
              <span class="text-xs text-g-700 truncate">{{ row.account }}</span>
              <span class="text-xs text-g-500 truncate">{{ row.user_id }}</span>
            </div>
          </div>
        </template>
        <template #contact="{ row }">
          <div class="flex flex-col">
            <span>{{ row.mobile || '-' }}</span>
            <span class="text-xs text-g-600">{{ row.email || '-' }}</span>
          </div>
        </template>
        <template #gender="{ row }">
          {{ genderLabel(Number(row.gender)) }}
        </template>
        <template #status="{ row }">
          <ElTag :type="statusMeta(Number(row.status)).type">
            {{ statusMeta(Number(row.status)).label }}
          </ElTag>
        </template>
        <template #operation="{ row }">
          <div class="flex items-center gap-2">
            <ElButton
              v-if="canEditUser"
              v-permission="'saimulti:admin:im:user:update'"
              size="small"
              @click="showDialog('edit', row)"
            >
              编辑
            </ElButton>
            <ElDropdown v-permission="'saimulti:admin:im:user:status'" trigger="click">
              <ElButton size="small" :disabled="Boolean(activeAction)">
                状态<ArtSvgIcon class="ml-1" icon="ri:arrow-down-s-line" />
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem
                    v-for="option in statusOptions"
                    :key="option.value"
                    :disabled="Number(row.status) === option.value"
                    @click="handleStatusChange(row, option.value)"
                  >
                    {{ option.label }}
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
            <ElButton
              v-permission="'saimulti:admin:im:user:reset'"
              size="small"
              @click="showReset(row)"
            >
              重置密码
            </ElButton>
            <ElButton
              v-permission="'saimulti:admin:im:user:quota:read'"
              size="small"
              @click="showQuota(row.organization)"
            >
              席位
            </ElButton>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <EditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :data="dialogData"
      :organizations="organizations"
      :organization-loading="organizationLoading"
      @success="refreshData"
    />
    <ResetPasswordDialog v-model="resetVisible" :user="resetUser" @success="refreshData" />
    <QuotaDialog
      v-model="quotaVisible"
      :organization="quotaOrganization"
      :organizations="organizations"
      :organization-loading="organizationLoading"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useTable } from '@/hooks/useTable'
  import { useSaiAdmin } from '@/composables/useSaiAdmin'
  import organizationApi from '@/api/admin/panel/organization'
  import { checkAuth } from '@/utils/tool'
  import api, { type AdminImUser, type AdminImUserStatus } from '@/api/admin/im/user'
  import TableSearch from './modules/table-search.vue'
  import EditDialog from './modules/edit-dialog.vue'
  import ResetPasswordDialog from './modules/reset-password-dialog.vue'
  import QuotaDialog from './modules/quota-dialog.vue'
  import type { OrganizationOption } from './modules/types'

  defineOptions({ name: 'AdminImUser' })

  const organizations = ref<OrganizationOption[]>([])
  const organizationLoading = ref(false)
  const searchForm = ref({
    organization: undefined as number | undefined,
    keyword: '',
    status: undefined as AdminImUserStatus | undefined
  })
  const statusOptions: Array<{ label: string; value: AdminImUserStatus }> = [
    { label: '正常', value: 1 },
    { label: '停用', value: 2 },
    { label: '封禁', value: 3 }
  ]
  const { dialogType, dialogVisible, dialogData, showDialog } = useSaiAdmin()
  const resetVisible = ref(false)
  const resetUser = ref<AdminImUser | null>(null)
  const quotaVisible = ref(false)
  const quotaOrganization = ref<number | null>(null)
  const activeAction = ref('')
  const canEditUser = computed(() =>
    ['saimulti:admin:im:user:read', 'saimulti:admin:im:user:update'].every(checkAuth)
  )

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: api.list,
      apiParams: { ...searchForm.value },
      columnsFactory: () => [
        { prop: 'id', label: 'ID', width: 80 },
        { prop: 'organization', label: '所属机构', minWidth: 170, useSlot: true },
        { prop: 'identity', label: '用户资料', minWidth: 260, useSlot: true },
        { prop: 'im_short_no', label: 'IM 短号', width: 130 },
        { prop: 'contact', label: '联系方式', minWidth: 190, useSlot: true },
        { prop: 'gender', label: '性别', width: 80, useSlot: true },
        { prop: 'status', label: '状态', width: 90, useSlot: true },
        { prop: 'signature', label: '个性签名', minWidth: 180, showOverflowTooltip: true },
        { prop: 'remark', label: '备注', minWidth: 160, showOverflowTooltip: true },
        { prop: 'login_time', label: '最后登录', width: 180 },
        { prop: 'create_time', label: '创建时间', width: 180 },
        { prop: 'operation', label: '操作', width: 300, fixed: 'right', useSlot: true }
      ]
    }
  })

  const loadOrganizations = async () => {
    organizationLoading.value = true
    try {
      const response: unknown = await organizationApi.list({ saiType: 'all' })
      if (!Array.isArray(response)) throw new Error('机构列表响应格式无效')
      organizations.value = response.map((item) => ({
        id: Number(item.id),
        organization_name: String(item.organization_name)
      }))
    } catch {
      organizations.value = []
    } finally {
      organizationLoading.value = false
    }
  }

  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, {
      organization: params.organization || undefined,
      keyword: String(params.keyword || '').trim() || undefined,
      status: params.status || undefined
    })
    getData()
  }

  const statusMeta = (status: number) => {
    if (status === 1) return { label: '正常', type: 'success' as const }
    if (status === 2) return { label: '停用', type: 'info' as const }
    return { label: '封禁', type: 'danger' as const }
  }

  const genderLabel = (gender: number) => {
    if (gender === 1) return '男'
    if (gender === 2) return '女'
    return '未知'
  }

  const handleStatusChange = async (row: AdminImUser, status: AdminImUserStatus) => {
    if (Number(row.status) === status) return
    const target = statusMeta(status).label
    try {
      await ElMessageBox.confirm(
        `确定将 ${row.nickname}（${row.account}）设为“${target}”吗？`,
        '变更 IM 用户状态',
        {
          type: status === 1 ? 'warning' : 'error',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      )
      activeAction.value = `status-${row.id}`
      await api.updateStatus(row.id, status)
      ElMessage.success(`用户状态已更新为${target}`)
      await refreshData()
    } catch {
      // 取消确认或接口错误均无需追加提示。
    } finally {
      activeAction.value = ''
    }
  }

  const showReset = (row: AdminImUser) => {
    resetUser.value = row
    resetVisible.value = true
  }

  const showQuota = (organization?: number) => {
    quotaOrganization.value = organization || null
    quotaVisible.value = true
  }

  onMounted(() => {
    void loadOrganizations()
  })
</script>
