<template>
  <div class="home-container">
    <el-card>
      <template #header>
        <div class="header-content">
          <h2>个人助理管理后台</h2>
          <el-button type="danger" @click="handleLogout">退出登录</el-button>
        </div>
      </template>
      <div class="welcome-content">
        <h3>欢迎, {{ authStore.userInfo?.username || '用户' }}!</h3>
        <p>邮箱: {{ authStore.userInfo?.email || '-' }}</p>
        <p>这是个人助理管理后台的主页，更多功能正在开发中...</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.home-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0;
}

.welcome-content {
  padding: 20px 0;
}

.welcome-content h3 {
  margin-bottom: 10px;
  color: #333;
}

.welcome-content p {
  margin: 10px 0;
  color: #666;
}
</style>

