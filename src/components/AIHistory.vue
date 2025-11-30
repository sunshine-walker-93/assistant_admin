<template>
  <div class="history-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>对话历史</span>
          <div>
            <el-button size="small" :icon="Delete" @click="clearHistory" :disabled="historyList.length === 0">
              清空
            </el-button>
            <el-button size="small" :icon="Refresh" @click="loadHistory">
              刷新
            </el-button>
          </div>
        </div>
      </template>
      <div class="history-list" v-loading="loading">
        <el-empty v-if="historyList.length === 0" description="暂无对话历史" />
        <div v-else class="history-items">
          <div
            v-for="(item, index) in historyList"
            :key="index"
            :class="['history-item', { 'history-item-active': selectedIndex === index }]"
            @click="selectHistory(index)"
          >
            <div class="history-item-header">
              <span class="history-agent">{{ item.agent_name || '未知 Agent' }}</span>
              <span class="history-time">{{ formatTime(item.timestamp) }}</span>
            </div>
            <div class="history-preview">
              <div class="history-message">
                <strong>Q:</strong> {{ item.user_message }}
              </div>
              <div class="history-response">
                <strong>A:</strong> {{ truncateText(item.response, 50) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Delete } from '@element-plus/icons-vue'

export interface HistoryItem {
  timestamp: number
  agent_name: string
  user_message: string
  response: string
  session_id?: string
}

const props = defineProps<{
  history: HistoryItem[]
}>()

const emit = defineEmits<{
  (e: 'history-selected', item: HistoryItem): void
  (e: 'history-cleared'): void
}>()

const historyList = ref<HistoryItem[]>([])
const selectedIndex = ref<number | null>(null)
const loading = ref(false)

const loadHistory = () => {
  historyList.value = [...props.history]
}

const selectHistory = (index: number) => {
  selectedIndex.value = index
  const item = historyList.value[index]
  if (item) {
    emit('history-selected', item)
  }
}

const clearHistory = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有对话历史吗？', '确认清空', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    historyList.value = []
    selectedIndex.value = null
    emit('history-cleared')
    ElMessage.success('已清空对话历史')
  } catch (error) {
    // 用户取消
  }
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`
  } else {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.history-container {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.history-list {
  min-height: 200px;
  max-height: 600px;
  overflow-y: auto;
}

.history-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fff;
}

.history-item:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.history-item-active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-agent {
  font-weight: 600;
  color: #409eff;
  font-size: 14px;
}

.history-time {
  font-size: 12px;
  color: #909399;
}

.history-preview {
  font-size: 13px;
  color: #606266;
}

.history-message {
  margin-bottom: 4px;
}

.history-response {
  color: #909399;
}

.history-message strong,
.history-response strong {
  color: #303133;
  margin-right: 4px;
}
</style>

