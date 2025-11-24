<template>
  <div class="gateway-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>网关管理</span>
        </div>
      </template>
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- Backend管理 -->
        <el-tab-pane label="后端服务" name="backend">
          <div class="tab-header">
            <el-button type="primary" @click="handleAddBackend" :icon="Plus">
              添加后端服务
            </el-button>
            <el-button @click="loadBackends" :loading="loading" :icon="Refresh">
              刷新
            </el-button>
          </div>
          <el-table
            :data="backendList"
            stripe
            style="width: 100%"
            v-loading="loading"
            empty-text="暂无数据"
          >
            <el-table-column prop="name" label="服务名称" width="200" />
            <el-table-column prop="addr" label="服务地址" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" link @click="handleEditBackend(row)">
                  编辑
                </el-button>
                <el-button type="danger" size="small" link @click="handleDeleteBackend(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- Route管理 -->
        <el-tab-pane label="路由配置" name="route">
          <div class="tab-header">
            <el-button type="primary" @click="handleAddRoute" :icon="Plus">
              添加路由
            </el-button>
            <el-button @click="loadRoutes" :loading="loading" :icon="Refresh">
              刷新
            </el-button>
          </div>
          <el-table
            :data="routeList"
            stripe
            style="width: 100%"
            v-loading="loading"
            empty-text="暂无数据"
          >
            <el-table-column prop="http_method" label="HTTP方法" width="120" />
            <el-table-column prop="http_pattern" label="HTTP路径" min-width="200" />
            <el-table-column prop="backend_name" label="后端服务" width="150" />
            <el-table-column prop="backend_service" label="gRPC服务" min-width="200" />
            <el-table-column prop="backend_method" label="gRPC方法" width="150" />
            <el-table-column prop="timeout_ms" label="超时(ms)" width="120">
              <template #default="{ row }">
                {{ row.timeout_ms || 5000 }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" link @click="handleEditRoute(row)">
                  编辑
                </el-button>
                <el-button type="danger" size="small" link @click="handleDeleteRoute(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- Backend对话框 -->
    <el-dialog
      v-model="backendDialogVisible"
      :title="backendDialogTitle"
      width="500px"
      @close="handleCloseBackendDialog"
    >
      <el-form
        :model="backendForm"
        :rules="backendRules"
        ref="backendFormRef"
        label-width="100px"
      >
        <el-form-item label="服务名称" prop="name">
          <el-input
            v-model="backendForm.name"
            placeholder="请输入服务名称"
            :disabled="isEditingBackend"
          />
          <div class="form-tip" v-if="isEditingBackend">服务名称不可修改</div>
        </el-form-item>
        <el-form-item label="服务地址" prop="addr">
          <el-input
            v-model="backendForm.addr"
            placeholder="格式: host:port，如 127.0.0.1:50051"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="backendDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveBackend" :loading="saving">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- Route对话框 -->
    <el-dialog
      v-model="routeDialogVisible"
      :title="routeDialogTitle"
      width="600px"
      @close="handleCloseRouteDialog"
    >
      <el-form
        :model="routeForm"
        :rules="routeRules"
        ref="routeFormRef"
        label-width="120px"
      >
        <el-form-item label="HTTP方法" prop="http_method">
          <el-select v-model="routeForm.http_method" placeholder="请选择HTTP方法" style="width: 100%">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
            <el-option label="PATCH" value="PATCH" />
          </el-select>
        </el-form-item>
        <el-form-item label="HTTP路径" prop="http_pattern">
          <el-input
            v-model="routeForm.http_pattern"
            placeholder="如 /v1/user/login"
          />
        </el-form-item>
        <el-form-item label="后端服务" prop="backend_name">
          <el-select
            v-model="routeForm.backend_name"
            placeholder="请选择后端服务"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="backend in backendList"
              :key="backend.name"
              :label="`${backend.name} (${backend.addr})`"
              :value="backend.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="gRPC服务" prop="backend_service">
          <el-input
            v-model="routeForm.backend_service"
            placeholder="如 user.v1.UserService"
          />
        </el-form-item>
        <el-form-item label="gRPC方法" prop="backend_method">
          <el-input
            v-model="routeForm.backend_method"
            placeholder="如 Login"
          />
        </el-form-item>
        <el-form-item label="超时时间(ms)" prop="timeout_ms">
          <el-input-number
            v-model="routeForm.timeout_ms"
            :min="100"
            :max="60000"
            :step="100"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="routeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRoute" :loading="saving">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import {
  getBackends,
  createBackend,
  updateBackend,
  deleteBackend,
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  type Backend,
  type Route
} from '../services/gateway.service'

const activeTab = ref('backend')
const loading = ref(false)
const saving = ref(false)

// Backend相关
const backendList = ref<Backend[]>([])
const backendDialogVisible = ref(false)
const backendFormRef = ref<FormInstance>()
const isEditingBackend = ref(false)
const currentBackend = ref<Backend | null>(null)

const backendDialogTitle = computed(() => {
  return isEditingBackend.value ? '编辑后端服务' : '添加后端服务'
})

const backendForm = reactive<Backend>({
  name: '',
  addr: ''
})

const backendRules: FormRules = {
  name: [
    { required: true, message: '请输入服务名称', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: '服务名称只能包含字母、数字、下划线和连字符', trigger: 'blur' }
  ],
  addr: [
    { required: true, message: '请输入服务地址', trigger: 'blur' },
    {
      pattern: /^[\w.-]+:\d+$/,
      message: '地址格式错误，应为 host:port，如 127.0.0.1:50051',
      trigger: 'blur'
    }
  ]
}

// Route相关
const routeList = ref<Route[]>([])
const routeDialogVisible = ref(false)
const routeFormRef = ref<FormInstance>()
const isEditingRoute = ref(false)
const currentRoute = ref<Route | null>(null)

const routeDialogTitle = computed(() => {
  return isEditingRoute.value ? '编辑路由' : '添加路由'
})

const routeForm = reactive<{
  id?: number
  http_method: string
  http_pattern: string
  backend_name: string
  backend_service: string
  backend_method: string
  timeout_ms?: number
}>({
  id: undefined,
  http_method: 'POST',
  http_pattern: '',
  backend_name: '',
  backend_service: '',
  backend_method: '',
  timeout_ms: 5000
})

const routeRules: FormRules = {
  http_method: [
    { required: true, message: '请选择HTTP方法', trigger: 'change' }
  ],
  http_pattern: [
    { required: true, message: '请输入HTTP路径', trigger: 'blur' },
    { pattern: /^\/.*/, message: 'HTTP路径必须以 / 开头', trigger: 'blur' }
  ],
  backend_name: [
    { required: true, message: '请选择后端服务', trigger: 'change' }
  ],
  backend_service: [
    { required: true, message: '请输入gRPC服务名', trigger: 'blur' }
  ],
  backend_method: [
    { required: true, message: '请输入gRPC方法名', trigger: 'blur' }
  ],
  timeout_ms: [
    { required: true, message: '请输入超时时间', trigger: 'blur' },
    { type: 'number', min: 100, max: 60000, message: '超时时间应在 100-60000 毫秒之间', trigger: 'blur' }
  ]
}

// 加载数据
const loadBackends = async () => {
  try {
    loading.value = true
    backendList.value = await getBackends()
  } catch (error: any) {
    ElMessage.error(error.message || '加载后端服务列表失败')
  } finally {
    loading.value = false
  }
}

const loadRoutes = async () => {
  try {
    loading.value = true
    routeList.value = await getRoutes()
  } catch (error: any) {
    ElMessage.error(error.message || '加载路由列表失败')
  } finally {
    loading.value = false
  }
}

// Backend操作
const handleAddBackend = () => {
  isEditingBackend.value = false
  currentBackend.value = null
  backendForm.name = ''
  backendForm.addr = ''
  backendDialogVisible.value = true
}

const handleEditBackend = (backend: Backend) => {
  isEditingBackend.value = true
  currentBackend.value = backend
  backendForm.name = backend.name
  backendForm.addr = backend.addr
  backendDialogVisible.value = true
}

const handleSaveBackend = async () => {
  if (!backendFormRef.value) return

  try {
    await backendFormRef.value.validate()
    saving.value = true

    if (isEditingBackend.value) {
      // 更新
      await updateBackend(backendForm.name, { addr: backendForm.addr })
      ElMessage.success('后端服务更新成功')
    } else {
      // 新增
      await createBackend({
        name: backendForm.name,
        addr: backendForm.addr
      })
      ElMessage.success('后端服务添加成功')
    }

    backendDialogVisible.value = false
    await loadBackends()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '操作失败，请重试')
    }
  } finally {
    saving.value = false
  }
}

const handleDeleteBackend = async (backend: Backend) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除后端服务 "${backend.name}" 吗？删除后相关的路由配置可能会失效。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteBackend(backend.name)
    ElMessage.success('删除成功')
    await loadBackends()
    // 如果当前在路由标签页，重新加载路由列表以更新后端服务选择器
    if (activeTab.value === 'route') {
      await loadRoutes()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败，请重试')
    }
  }
}

const handleCloseBackendDialog = () => {
  backendFormRef.value?.resetFields()
}

// Route操作
const handleAddRoute = () => {
  isEditingRoute.value = false
  currentRoute.value = null
  routeForm.id = undefined
  routeForm.http_method = 'POST'
  routeForm.http_pattern = ''
  routeForm.backend_name = ''
  routeForm.backend_service = ''
  routeForm.backend_method = ''
  routeForm.timeout_ms = 5000
  routeDialogVisible.value = true
}

const handleEditRoute = (route: Route) => {
  isEditingRoute.value = true
  currentRoute.value = route
  routeForm.id = route.id
  routeForm.http_method = route.http_method
  routeForm.http_pattern = route.http_pattern
  routeForm.backend_name = route.backend_name
  routeForm.backend_service = route.backend_service
  routeForm.backend_method = route.backend_method
  routeForm.timeout_ms = route.timeout_ms || 5000
  routeDialogVisible.value = true
}

const handleSaveRoute = async () => {
  if (!routeFormRef.value) return

  try {
    await routeFormRef.value.validate()
    saving.value = true

    // 检查后端服务是否存在
    const backendExists = backendList.value.some(b => b.name === routeForm.backend_name)
    if (!backendExists) {
      ElMessage.error('所选的后端服务不存在，请先添加后端服务')
      saving.value = false
      return
    }

    if (isEditingRoute.value && routeForm.id) {
      // 更新路由
      await updateRoute(routeForm.id, {
        http_method: routeForm.http_method,
        http_pattern: routeForm.http_pattern,
        backend_name: routeForm.backend_name,
        backend_service: routeForm.backend_service,
        backend_method: routeForm.backend_method,
        timeout_ms: routeForm.timeout_ms || 5000
      })
      ElMessage.success('路由更新成功')
    } else {
      // 新增路由
      await createRoute({
        http_method: routeForm.http_method,
        http_pattern: routeForm.http_pattern,
        backend_name: routeForm.backend_name,
        backend_service: routeForm.backend_service,
        backend_method: routeForm.backend_method,
        timeout_ms: routeForm.timeout_ms || 5000
      })
      ElMessage.success('路由添加成功')
    }

    routeDialogVisible.value = false
    await loadRoutes()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '操作失败，请重试')
    }
  } finally {
    saving.value = false
  }
}

const handleDeleteRoute = async (route: Route) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除路由 "${route.http_method} ${route.http_pattern}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteRoute(route.id)
    ElMessage.success('删除成功')
    await loadRoutes()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败，请重试')
    }
  }
}

const handleCloseRouteDialog = () => {
  routeFormRef.value?.resetFields()
}

// 标签页切换
const handleTabChange = (tabName: string) => {
  if (tabName === 'backend') {
    loadBackends()
  } else if (tabName === 'route') {
    loadRoutes()
    // 如果后端服务列表为空，先加载后端服务列表（用于路由表单的下拉选择）
    if (backendList.value.length === 0) {
      loadBackends()
    }
  }
}

// 初始化
onMounted(() => {
  loadBackends()
})
</script>

<style scoped>
.gateway-container {
  height: 100%;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.tab-header {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

:deep(.el-table) {
  background-color: #fff;
}
</style>
