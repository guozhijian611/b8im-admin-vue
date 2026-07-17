<template>
  <div class="art-full-height">
    <!-- 搜索面板 -->
    <TableSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton
              v-permission="'saimulti:admin:organization:save'"
              @click="showDialog('add')"
              v-ripple
            >
              <template #icon>
                <ArtSvgIcon icon="ri:add-fill" />
              </template>
              新增
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        ref="tableRef"
        rowKey="id"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @sort-change="handleSortChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <!-- 操作列 -->
        <template #operation="{ row }">
          <div class="flex gap-2">
            <SaButton
              v-if="row.is_init !== 1"
              v-permission="'saimulti:admin:organization:init'"
              type="success"
              icon="ri:play-line"
              tool-tip="初始化"
              @click="initTenant(row, api.initTenant, refreshData)"
            />
            <SaButton
              v-permission="'saimulti:admin:organization:update'"
              type="primary"
              icon="ri:apps-2-add-line"
              tool-tip="模块能力"
              @click="showModuleDialog('edit', row)"
            />
            <SaButton
              v-permission="'saimulti:admin:organization:update'"
              type="secondary"
              @click="showDialog('edit', row)"
            />
            <SaButton
              v-permission="'saimulti:admin:organization:destroy'"
              type="error"
              @click="deleteRow(row, api.delete, refreshData)"
            />
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 编辑弹窗 -->
    <EditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :data="dialogData"
      @success="refreshData"
    />
    <ModuleCapabilitiesDialog
      v-model="moduleDialogVisible"
      :data="moduleDialogData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { ElMessageBox } from 'element-plus'
  import { useTable } from '@/hooks/useTable'
  import { useSaiAdmin } from '@/composables/useSaiAdmin'
  import api from '@/api/admin/panel/organization'
  import TableSearch from './modules/table-search.vue'
  import EditDialog from './modules/edit-dialog.vue'
  import ModuleCapabilitiesDialog from './modules/module-capabilities-dialog.vue'

  // 搜索表单
  const searchForm = ref({
    group_id: undefined,
    organization_name: undefined,
    create_time: []
  })

  // 搜索处理
  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
  }

  // 表格配置
  const {
    columns,
    columnChecks,
    data,
    loading,
    getData,
    searchParams,
    pagination,
    resetSearchParams,
    handleSortChange,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: api.list,
      columnsFactory: () => [
        { prop: 'id', label: '编号' },
        { prop: 'groupInfo.group_name', label: '所属套餐' },
        { prop: 'title', label: '站点标题' },
        { prop: 'logo', label: '站点Logo', saiType: 'image' },
        { prop: 'enterprise_code', label: '企业码', width: 140 },
        { prop: 'deployment_id', label: '部署标识', width: 140 },
        { prop: 'domain', label: '域名' },
        { prop: 'organization_name', label: '机构名称' },
        { prop: 'status', label: '状态', saiType: 'dict', saiDict: 'data_status' },
        { prop: 'is_init', label: '是否初始化', saiType: 'dict', saiDict: 'yes_or_no' },
        { prop: 'operation', label: '操作', width: 180, fixed: 'right', useSlot: true }
      ]
    }
  })

  // 删除数据
  const initTenant = (
    row: Record<string, any>,
    apiFn: (params: any) => Promise<any>,
    callback?: () => void
  ): void => {
    ElMessageBox.confirm(`确定要初始化该机构吗？`, '初始化机构', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      apiFn({ id: [row.id] }).then(() => {
        ElMessage.success('初始化成功')
        if (callback) callback()
      })
    })
  }

  // 编辑配置
  const { dialogType, dialogVisible, dialogData, showDialog, deleteRow } = useSaiAdmin()
  const {
    dialogVisible: moduleDialogVisible,
    dialogData: moduleDialogData,
    showDialog: showModuleDialog
  } = useSaiAdmin()
</script>
