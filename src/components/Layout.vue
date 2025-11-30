<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h3>管理后台</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        router
        :collapse="false"
      >
        <el-menu-item index="/profile">
          <el-icon><User /></el-icon>
          <span>个人信息</span>
        </el-menu-item>
        <el-menu-item index="/gateway">
          <el-icon><Connection /></el-icon>
          <span>网关管理</span>
        </el-menu-item>
        <el-menu-item index="/ai">
          <el-icon><ChatLineRound /></el-icon>
          <span>智能助手</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container class="main-container">
      <el-header class="header">
        <div class="header-left">
          <h2>个人助理管理后台</h2>
        </div>
        <div class="header-right">
          <span class="username">{{ authStore.userInfo?.username || '用户' }}</span>
          <el-button type="danger" size="small" @click="handleLogout">
            退出登录
          </el-button>
        </div>
      </el-header>
      <el-main class="content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Connection, ChatLineRound } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)

const handleLogout = () => {
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  color: #fff;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3a4a;
  border-bottom: 1px solid #1f2d3d;
}

.logo h3 {
  margin: 0;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.sidebar-menu {
  border: none;
  background-color: #304156;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.sidebar-menu :deep(.el-menu-item) {
  color: #bfcbd9;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: #263445;
  color: #409eff;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #409eff;
  color: #fff;
}

.main-container {
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.username {
  color: #606266;
  font-size: 14px;
}

.content {
  background-color: #f0f2f5;
  padding: 8px;
  overflow-y: auto;
  height: calc(100vh - 60px);
  box-sizing: border-box;
}
</style>

