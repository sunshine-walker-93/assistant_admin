<template>
  <div class="chat-container">
    <el-card class="chat-card">
      <template #header>
        <div class="chat-header">
          <div class="header-left">
            <span>AI 对话</span>
            <el-select
              v-model="selectedAgentName"
              placeholder="选择 Agent"
              size="small"
              style="width: 200px; margin-left: 16px"
              @change="handleAgentChange"
            >
              <el-option
                v-for="agent in availableAgents"
                :key="agent.name"
                :label="agent.name"
                :value="agent.name"
                :disabled="!agent.isActive"
              >
                <span>{{ agent.name }}</span>
                <el-tag v-if="!agent.isActive" type="info" size="small" style="margin-left: 8px">
                  未激活
                </el-tag>
              </el-option>
            </el-select>
          </div>
          <el-button size="small" :icon="Refresh" @click="clearChat">清空对话</el-button>
        </div>
      </template>

      <div class="chat-messages" ref="messagesContainerRef">
        <div v-if="messages.length === 0" class="empty-message">
          <el-empty description="开始与 AI 对话吧" />
        </div>
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message-item', message.role === 'user' ? 'message-user' : 'message-assistant']"
        >
          <div class="message-avatar">
            <el-icon v-if="message.role === 'user'"><User /></el-icon>
            <el-icon v-else><ChatLineRound /></el-icon>
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-role">{{ message.role === 'user' ? '我' : message.agent_name || 'AI' }}</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="message-text" v-html="formatMessage(message.content)"></div>
            <div v-if="message.role === 'assistant' && message.isStreaming" class="message-streaming">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>正在输入...</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="3"
          placeholder="输入消息..."
          @keydown.enter.exact.prevent="handleSend"
          @keydown.enter.shift.exact="inputMessage += '\n'"
          :disabled="sending"
        />
        <div class="input-actions">
          <el-button type="primary" @click="handleSend" :loading="sending" :disabled="!inputMessage.trim()">
            发送
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, ChatLineRound, Refresh, Loading } from '@element-plus/icons-vue'
import { process, processStream, type AgentInfo, type ProcessRequest } from '../services/ai.service'
import { useAuthStore } from '../stores/auth'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  agent_name?: string
  isStreaming?: boolean
}

const props = defineProps<{
  availableAgents: AgentInfo[]
  selectedAgent?: AgentInfo | null
}>()

const emit = defineEmits<{
  (e: 'message-sent', message: ChatMessage): void
  (e: 'response-received', message: ChatMessage): void
  (e: 'agent-changed', agentName: string): void
}>()

const authStore = useAuthStore()
const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const sending = ref(false)
const selectedAgentName = ref<string>('')
const messagesContainerRef = ref<HTMLElement>()

// 监听选中的 Agent
watch(
  () => props.selectedAgent,
  (agent) => {
    if (agent) {
      selectedAgentName.value = agent.name
    }
  },
  { immediate: true }
)

// 监听可用 Agent 列表
watch(
  () => props.availableAgents,
  (agents) => {
    if (agents.length > 0 && !selectedAgentName.value) {
      const activeAgent = agents.find((a) => a.isActive)
      if (activeAgent) {
        selectedAgentName.value = activeAgent.name
      }
    }
  },
  { immediate: true }
)

const handleAgentChange = (agentName: string) => {
  emit('agent-changed', agentName)
}

const handleSend = async () => {
  const message = inputMessage.value.trim()
  if (!message || sending.value) {
    return
  }

  if (!selectedAgentName.value) {
    ElMessage.warning('请先选择一个 Agent')
    return
  }

  // 添加用户消息
  const userMessage: ChatMessage = {
    role: 'user',
    content: message,
    timestamp: Date.now()
  }
  messages.value.push(userMessage)
  emit('message-sent', userMessage)

  // 清空输入框
  const messageToSend = message
  inputMessage.value = ''
  sending.value = true

  // 滚动到底部
  await scrollToBottom()

  // 添加占位的助手消息
  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: '',
    timestamp: Date.now(),
    agent_name: selectedAgentName.value,
    isStreaming: true
  }
  messages.value.push(assistantMessage)

  try {
    const request: ProcessRequest = {
      user_id: authStore.userInfo?.id || 'anonymous',
      message: messageToSend,
      agent_name: selectedAgentName.value
    }

    // 尝试使用流式响应
    try {
      let fullResponse = ''
      await processStream(request, (chunk) => {
        if (chunk.response) {
          fullResponse += chunk.response
          assistantMessage.content = fullResponse
          assistantMessage.agent_name = chunk.agent_name || selectedAgentName.value
          scrollToBottom()
        }
      })
      assistantMessage.content = fullResponse || '无响应'
      assistantMessage.isStreaming = false
    } catch (streamError) {
      // 流式响应失败，使用普通请求
      console.warn('Stream failed, using regular request:', streamError)
      const response = await process(request)
      assistantMessage.content = response.response || '无响应'
      assistantMessage.agent_name = response.agent_name || selectedAgentName.value
      assistantMessage.isStreaming = false
    }

    emit('response-received', assistantMessage)
  } catch (error: any) {
    assistantMessage.content = `错误: ${error.message || '请求失败'}`
    assistantMessage.isStreaming = false
    ElMessage.error(error.message || '发送消息失败')
  } finally {
    sending.value = false
    await scrollToBottom()
  }
}

const clearChat = () => {
  messages.value = []
  ElMessage.success('已清空对话')
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainerRef.value) {
    messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
  }
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

const formatMessage = (content: string): string => {
  // 简单的换行处理
  return content.replace(/\n/g, '<br>')
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  min-height: 400px;
  max-height: 600px;
  background-color: #f5f7fa;
}

.empty-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin: 0 12px;
}

.message-user .message-avatar {
  background-color: #409eff;
  color: #fff;
}

.message-assistant .message-avatar {
  background-color: #67c23a;
  color: #fff;
}

.message-content {
  flex: 1;
  max-width: 70%;
  background-color: #fff;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-user .message-content {
  background-color: #409eff;
  color: #fff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
}

.message-role {
  font-weight: 600;
}

.message-time {
  opacity: 0.7;
}

.message-text {
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.message-streaming {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  background-color: #fff;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>

