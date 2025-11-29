<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
              <div class="card-header-actions">
                <el-button type="primary" size="small" @click="handleEditProfile">
                  {{ isEditing ? '取消' : '编辑' }}
                </el-button>
                <el-button type="primary" size="small" @click="showChangePassword = !showChangePassword">
                  {{ showChangePassword ? '收起密码' : '编辑密码' }}
                </el-button>
              </div>
            </div>
          </template>
          <el-form
            :model="profileForm"
            :rules="profileRules"
            ref="profileFormRef"
            label-width="100px"
            v-if="isEditing"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="profileForm.username" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" type="email" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveProfile" :loading="saving">
                保存
              </el-button>
            </el-form-item>
          </el-form>
          <el-descriptions :column="2" border v-else>
            <el-descriptions-item label="用户名">
              {{ authStore.userInfo?.username || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              {{ authStore.userInfo?.email || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="用户ID">
              {{ authStore.userInfo?.id || '-' }}
            </el-descriptions-item>
          </el-descriptions>
          
          <!-- 密码修改表单 -->
          <el-form
            :model="passwordForm"
            :rules="passwordRules"
            ref="passwordFormRef"
            label-width="100px"
            v-if="showChangePassword"
            style="margin-top: 20px"
          >
            <el-form-item label="当前密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                show-password
                placeholder="请输入当前密码"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
                placeholder="请输入新密码"
              />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
                placeholder="请再次输入新密码"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleChangePassword" :loading="changingPassword">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore, type UserInfo } from '../stores/auth'
import { getUser, updateUser } from '../services/auth.service'
import { setUserInfo, getUserInfo } from '../utils/storage'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

// 个人信息编辑
const isEditing = ref(false)
const saving = ref(false)
const profileFormRef = ref<FormInstance>()
const profileForm = reactive({
  username: authStore.userInfo?.username || '',
  email: authStore.userInfo?.email || ''
})

const profileRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为 3-20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const handleEditProfile = () => {
  if (isEditing.value) {
    // 取消编辑，恢复原始值
    profileForm.username = authStore.userInfo?.username || ''
    profileForm.email = authStore.userInfo?.email || ''
    isEditing.value = false
  } else {
    // 开始编辑
    profileForm.username = authStore.userInfo?.username || ''
    profileForm.email = authStore.userInfo?.email || ''
    isEditing.value = true
  }
}

const handleSaveProfile = async () => {
  if (!profileFormRef.value || !authStore.userInfo) return
  
  try {
    await profileFormRef.value.validate()
    saving.value = true
    
    // 调用API更新用户信息
    const response = await updateUser({
      id: authStore.userInfo.id,
      username: profileForm.username,
      email: profileForm.email
    })
    
    // 更新store中的用户信息
    if (authStore.userInfo) {
      authStore.userInfo.username = response.user.username
      authStore.userInfo.email = response.user.email
      // 同步更新本地缓存
      setUserInfo(authStore.userInfo)
    }
    
    ElMessage.success('个人信息更新成功')
    isEditing.value = false
  } catch (error: any) {
    if (error !== false) { // 表单验证失败时 error 为 false
      ElMessage.error(error.message || '更新失败，请重试')
    }
  } finally {
    saving.value = false
  }
}

// 修改密码
const showChangePassword = ref(false)
const changingPassword = ref(false)
const passwordFormRef = ref<FormInstance>()
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value || !authStore.userInfo) return
  
  try {
    await passwordFormRef.value.validate()
    changingPassword.value = true
    
    // 调用API修改密码
    await updateUser({
      id: authStore.userInfo.id,
      password: passwordForm.newPassword
    })
    
    ElMessage.success('密码修改成功，请重新登录')
    
    // 清空表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordFormRef.value.resetFields()
    // 收起密码修改表单
    showChangePassword.value = false
    
    // 修改密码后自动退出登录
    setTimeout(() => {
      authStore.logout()
      router.push('/login')
    }, 1500)
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '密码修改失败，请重试')
    }
  } finally {
    changingPassword.value = false
  }
}

// 加载用户信息
const loadUserInfo = async () => {
  // 如果已登录但没有用户信息，尝试从本地缓存恢复
  if (authStore.isAuthenticated && !authStore.userInfo) {
    const cachedUserInfo = getUserInfo<UserInfo>()
    if (cachedUserInfo) {
      authStore.userInfo = cachedUserInfo
    } else {
      console.warn('用户信息丢失，请重新登录')
      return
    }
  }
  
  // 如果未登录，不需要加载
  if (!authStore.isAuthenticated) {
    return
  }
  
  // 如果没有用户ID，无法从后端加载
  if (!authStore.userInfo?.id) {
    console.warn('用户ID缺失，无法加载用户信息')
    return
  }
  
  try {
    loading.value = true
    const response = await getUser(authStore.userInfo.id)
    // 更新store中的用户信息
    if (authStore.userInfo) {
      authStore.userInfo.username = response.user.username
      authStore.userInfo.email = response.user.email
      // 同步更新本地缓存
      setUserInfo(authStore.userInfo)
    } else {
      // 如果 store 中还没有用户信息，直接设置
      authStore.userInfo = response.user
      setUserInfo(response.user)
    }
  } catch (error: any) {
    // 加载失败不影响页面显示，只记录错误
    console.error('加载用户信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载最新用户信息
onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.profile-container {
  width: 100%;
  padding: 0 12px 24px;
  box-sizing: border-box;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-header-actions {
  display: flex;
  gap: 10px;
}

:deep(.el-descriptions) {
  background-color: #fff;
}
</style>

