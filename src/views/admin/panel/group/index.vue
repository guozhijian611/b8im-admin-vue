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
              v-permission="'saimulti:admin:group:save'"
              @click="showDialog('add')"
              v-ripple
            >
              <template #icon>
                <ArtSvgIcon icon="ri:add-fill" />
              </template>
              新增
            </ElButton>
            <ElButton
              v-permission="'saimulti:admin:group:destroy'"
              :disabled="selectedRows.length === 0"
              @click="deleteSelectedRows(api.delete, refreshData)"
              v-ripple
            >
              <template #icon>
                <ArtSvgIcon icon="ri:delete-bin-5-line" />
              </template>
              删除
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
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <!-- 操作列 -->
        <template #operation="{ row }">
          <div class="flex gap-2">
            <SaButton
              v-permission="'saimulti:admin:group:menu'"
              icon="ri:menu-add-line"
              type="secondary"
              @click="showPermissionDialog('edit', row)"
            />
            <SaButton
              v-permission="'saimulti:admin:group:update'"
              icon="ri:apps-2-add-line"
              type="primary"
              tool-tip="模块能力"
              @click="showModuleDialog('edit', row)"
            />
            <SaButton
              v-permission="'saimulti:admin:group:update'"
              type="secondary"
              @click="showDialog('edit', row)"
            />
            <SaButton
              v-permission="'saimulti:admin:group:destroy'"
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

    <!-- 菜单权限弹窗 -->
    <PermissionDialog
      v-model="permissionDialogVisible"
      :dialog-type="permissionDialogType"
      :data="permissionDialogData"
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
  import { useTable } from '@/hooks/useTable'
  import { useSaiAdmin } from '@/composables/useSaiAdmin'
  import api from '@/api/admin/panel/group'
  import TableSearch from './modules/table-search.vue'
  import EditDialog from './modules/edit-dialog.vue'
  import PermissionDialog from './modules/permission-dialog.vue'
  import ModuleCapabilitiesDialog from './modules/module-capabilities-dialog.vue'

  // 搜索表单
  const searchForm = ref({
    group_name: undefined
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
        { type: 'selection' },
        { prop: 'group_name', label: '套餐名称' },
        { prop: 'sort', label: '排序' },
        { prop: 'status', label: '状态', saiType: 'dict', saiDict: 'data_status' },
        { prop: 'operation', label: '操作', width: 190, fixed: 'right', useSlot: true }
      ]
    }
  })

  // 编辑配置
  const {
    dialogType,
    dialogVisible,
    dialogData,
    showDialog,
    deleteRow,
    deleteSelectedRows,
    handleSelectionChange,
    selectedRows
  } = useSaiAdmin()

  // 权限配置
  const {
    dialogType: permissionDialogType,
    dialogVisible: permissionDialogVisible,
    dialogData: permissionDialogData,
    showDialog: showPermissionDialog
  } = useSaiAdmin()

  const {
    dialogVisible: moduleDialogVisible,
    dialogData: moduleDialogData,
    showDialog: showModuleDialog
  } = useSaiAdmin()
</script>
