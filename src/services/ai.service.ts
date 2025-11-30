import request from '../utils/request'

export interface ProcessRequest {
  user_id: string
  message: string
  agent_name?: string
  context?: Record<string, string>
  session_id?: string
}

export interface ProcessResponse {
  agent_name: string
  response: string
  metadata?: Record<string, string>
  is_streaming?: boolean
  session_id?: string
}

export interface AgentInfo {
  name: string
  description: string
  capabilities: string[]
  isActive: boolean
}

export interface ListAgentsResponse {
  agents: AgentInfo[]
}

/**
 * 处理用户请求（非流式）
 */
export function process(req: ProcessRequest): Promise<ProcessResponse> {
  return request.post<ProcessResponse>('/v1/ai/process', req)
}

/**
 * 处理用户请求（流式响应）
 * 注意：如果 Gateway 不支持流式响应，可能需要使用轮询或其他方式
 */
export function processStream(
  req: ProcessRequest,
  onChunk: (chunk: ProcessResponse) => void
): Promise<void> {
  // 使用 fetch API 处理流式响应
  return new Promise((resolve, reject) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
    const token = localStorage.getItem('token')
    
    fetch(`${baseURL}/v1/ai/process/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(req)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('Stream not supported')
        }
        
        const decoder = new TextDecoder()
        let buffer = ''
        
        const readChunk = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              resolve()
              return
            }
            
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''
            
            for (const line of lines) {
              if (line.trim()) {
                try {
                  const chunk = JSON.parse(line) as ProcessResponse
                  onChunk(chunk)
                } catch (e) {
                  console.error('Failed to parse chunk:', e)
                }
              }
            }
            
            readChunk()
          }).catch(reject)
        }
        
        readChunk()
      })
      .catch(reject)
  })
}

/**
 * 列出所有可用的 Agent
 */
export function listAgents(): Promise<ListAgentsResponse> {
  return request.get<ListAgentsResponse>('/v1/ai/agents')
}

