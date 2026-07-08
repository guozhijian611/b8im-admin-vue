<template>
  <div class="art-full-height">
    <!-- 搜索栏 -->
    <TableSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="flex flex-col flex-1 min-h-0 art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton v-permission="'saimulti:admin:user:save'" @click="showDialog('add')" v-ripple>
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
              v-permission="'saimulti:admin:user:update'"
              type="secondary"
              @click="showDialog('edit', row)"
            />
            <SaButton
              v-permission="'saimulti:admin:user:destroy'"
              type="error"
              @click="deleteRow(row, api.delete, refreshData)"
            />
            <ElDropdown>
              <ArtIconButton
                icon="ri:more-2-fill"
                class="!size-8 bg-g-200 dark:bg-g-300/45 text-sm"
              />
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem>
                    <div
                      class="flex-c gap-2"
                      v-permission="'saimulti:admin:user:reset'"
                      @click="handlePassword(row)"
                    >
                      <ArtSvgIcon icon="ri:key-line" />
                      <span>修改密码</span>
                    </div>
                  </ElDropdownItem>
                  <ElDropdownItem>
                    <div
                      class="flex-c gap-2"
                      v-permission="'saimulti:admin:user:cache'"
                      @click="handleCache(row)"
                    >
                      <ArtSvgIcon icon="ri:eraser-line" />
                      <span>清理缓存</span>
                    </div>
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </div>
        </template>
      </ArtTable>
    </ElCard>
    <!-- 表单弹窗 -->
    <EditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :data="dialogData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/useTable'
  import { useSaiAdmin } from '@/composables/useSaiAdmin'
  import { ElMessageBox } from 'element-plus'
  import TableSearch from './modules/table-search.vue'
  import EditDialog from './modules/edit-dialog.vue'
  import api from '@/api/admin/panel/user'

  // 编辑框
  const { dialogType, dialogVisible, dialogData, showDialog, handleSelectionChange, deleteRow } =
    useSaiAdmin()

  // 搜索表单
  const searchForm = ref({
    username: undefined,
    phone: undefined,
    create_time: undefined,
    organization: undefined,
    status: ''
  })

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSortChange,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: api.list,
      apiParams: {
        ...searchForm.value
      },
      columnsFactory: () => [
        { prop: 'organ.organization_name', width: 150, label: '所属机构' },
        {
          prop: 'avatar',
          label: '账户资料',
          minWidth: 200,
          saiType: 'imageAndText',
          saiFirst: 'username',
          saiSecond: 'email'
        },
        { prop: 'user_type', label: '类型', width: 120, saiType: 'dict', saiDict: 'user_type' },
        { prop: 'nickname', label: '昵称', width: 170 },
        { prop: 'phone', label: '手机号', width: 170 },
        { prop: 'status', label: '状态', width: 80, saiType: 'dict', saiDict: 'data_status' },
        {
          prop: 'dashboard',
          label: '首页',
          width: 100,
          saiType: 'dict',
          saiDict: 'tenant_dashboard'
        },
        { prop: 'create_time', label: '注册时间', width: 170, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 140,
          fixed: 'right',
          useSlot: true
        }
      ]
    }
  })

  /**
   * 搜索
   * @param params
   */
  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
  }

  /**
   * 修改密码
   * @param row
   */
  const handlePassword = (row: any) => {
    ElMessageBox.prompt('请输入新密码', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^.{6,16}$/,
      inputErrorMessage: '密码长度在6到16之间',
      type: 'warning'
    }).then(({ value }) => {
      api.changePassword({ id: row.id, password: value }).then(() => {
        ElMessage.success('修改密码成功')
      })
    })
  }

  /**
   * 清理缓存
   * @param row
   */
  const handleCache = (row: any) => {
    ElMessageBox.confirm('确定要清理缓存吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      api.clearCache({ id: row.id }).then(() => {
        ElMessage.success('清理缓存成功')
      })
    })
  }
</script>
