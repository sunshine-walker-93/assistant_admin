<template>
  <div class="ai-container">
    <el-row :gutter="16" class="ai-layout">
      <!-- 左侧：Agent 列表和对话历史 -->
      <el-col :span="6" class="ai-sidebar">
        <div class="sidebar-section">
          <AIAgentList
            :selected-agent="selectedAgentName"
            @agent-selected="handleAgentSelected"
          />
        </div>
        <div class="sidebar-section" style="margin-top: 16px">
          <AIHistory
            :history="chatHistory"
            @history-selected="handleHistorySelected"
            @history-cleared="handleHistoryCleared"
          />
        </div>
      </el-col>

      <!-- 右侧：聊天界面 -->
      <el-col :span="18" class="ai-main">
        <AIChat
          :available-agents="availableAgents"
          :selected-agent="selectedAgent"
          @message-sent="handleMessageSent"
          @response-received="handleResponseReceived"
          @agent-changed="handleAgentChanged"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import AIAgentList from '../components/AIAgentList.vue'
import AIHistory, { type HistoryItem } from '../components/AIHistory.vue'
import AIChat from '../components/AIChat.vue'
import { listAgents, type AgentInfo } from '../services/ai.service'

const availableAgents = ref<AgentInfo[]>([])
const selectedAgent = ref<AgentInfo | null>(null)
const selectedAgentName = ref<string>('')
const chatHistory = ref<HistoryItem[]>([])

// 加载 Agent 列表
const loadAgents = async () => {
  try {
    const response = await listAgents()
    availableAgents.value = response.agents || []
    
    // 默认选择第一个活跃的 Agent
    if (availableAgents.value.length > 0 && !selectedAgent.value) {
      const activeAgent = availableAgents.value.find((a) => a.is_active)
      if (activeAgent) {
        selectedAgent.value = activeAgent
        selectedAgentName.value = activeAgent.name
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载 Agent 列表失败')
  }
}

// Agent 选择处理
const handleAgentSelected = (agent: AgentInfo) => {
  selectedAgent.value = agent
  selectedAgentName.value = agent.name
  ElMessage.success(`已切换到 Agent: ${agent.name}`)
}

const handleAgentChanged = (agentName: string) => {
  const agent = availableAgents.value.find((a) => a.name === agentName)
  if (agent) {
    selectedAgent.value = agent
    selectedAgentName.value = agentName
  }
}

// 临时存储用户消息，用于与响应配对
const pendingUserMessage = ref<string>('')

// 消息处理
const handleMessageSent = (message: any) => {
  // 保存用户消息，等待响应
  pendingUserMessage.value = message.content
}

const handleResponseReceived = (message: any) => {
  // 添加到历史记录
  const historyItem: HistoryItem = {
    timestamp: message.timestamp,
    agent_name: message.agent_name || selectedAgentName.value,
    user_message: pendingUserMessage.value || '未知消息',
    response: message.content,
    session_id: message.session_id
  }
  
  // 清空待处理消息
  pendingUserMessage.value = ''
  
  chatHistory.value.push(historyItem)
  
  // 保存到本地存储
  saveHistoryToLocal()
}

// 历史记录处理
const handleHistorySelected = (_item: HistoryItem) => {
  // 可以在这里实现加载历史对话的功能
  ElMessage.info('历史对话加载功能待实现')
}

const handleHistoryCleared = () => {
  chatHistory.value = []
  saveHistoryToLocal()
}

// 本地存储管理
const saveHistoryToLocal = () => {
  try {
    localStorage.setItem('ai_chat_history', JSON.stringify(chatHistory.value))
  } catch (error) {
    console.error('保存历史记录失败:', error)
  }
}

const loadHistoryFromLocal = () => {
  try {
    const saved = localStorage.getItem('ai_chat_history')
    if (saved) {
      chatHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

onMounted(() => {
  loadAgents()
  loadHistoryFromLocal()
})
</script>

<style scoped>
.ai-container {
  height: 100%;
  padding: 16px;
}

.ai-layout {
  height: 100%;
}

.ai-sidebar {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}

.sidebar-section {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ai-main {
  height: calc(100vh - 120px);
}

:deep(.el-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-card__body) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>

