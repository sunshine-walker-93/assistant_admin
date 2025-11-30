<template>
  <div class="agent-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>可用 Agent</span>
          <el-button size="small" :icon="Refresh" @click="loadAgents" :loading="loading">
            刷新
          </el-button>
        </div>
      </template>
      <div v-loading="loading" class="agent-list-content">
        <el-empty v-if="!loading && agents.length === 0" description="暂无可用 Agent" />
        <div v-else class="agent-cards">
          <el-card
            v-for="agent in agents"
            :key="agent.name"
            :class="['agent-card', { 'agent-card-active': selectedAgent === agent.name }]"
            @click="selectAgent(agent)"
            shadow="hover"
          >
            <div class="agent-header">
              <h4>{{ agent.name }}</h4>
              <el-tag v-if="agent.is_active" type="success" size="small">活跃</el-tag>
              <el-tag v-else type="info" size="small">未激活</el-tag>
            </div>
            <p class="agent-description">{{ agent.description || '暂无描述' }}</p>
            <div v-if="agent.capabilities && agent.capabilities.length > 0" class="agent-capabilities">
              <el-tag
                v-for="capability in agent.capabilities"
                :key="capability"
                size="small"
                style="margin-right: 4px; margin-bottom: 4px"
              >
                {{ capability }}
              </el-tag>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { listAgents, type AgentInfo } from '../services/ai.service'

defineProps<{
  selectedAgent?: string
}>()

const emit = defineEmits<{
  (e: 'agent-selected', agent: AgentInfo): void
}>()

const agents = ref<AgentInfo[]>([])
const loading = ref(false)

const loadAgents = async () => {
  try {
    loading.value = true
    const response = await listAgents()
    agents.value = response.agents || []
  } catch (error: any) {
    ElMessage.error(error.message || '加载 Agent 列表失败')
  } finally {
    loading.value = false
  }
}

const selectAgent = (agent: AgentInfo) => {
  if (!agent.is_active) {
    ElMessage.warning('该 Agent 未激活，无法使用')
    return
  }
  emit('agent-selected', agent)
}

onMounted(() => {
  loadAgents()
})
</script>

<style scoped>
.agent-list {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.agent-list-content {
  min-height: 200px;
}

.agent-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.agent-card {
  cursor: pointer;
  transition: all 0.3s;
}

.agent-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.agent-card-active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.agent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.agent-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.agent-description {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.agent-capabilities {
  margin-top: 8px;
}
</style>

