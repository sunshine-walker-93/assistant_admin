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
    const timeoutMs = 60000 // 60 秒超时
    
    // 创建 AbortController 用于超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      reject(new Error('请求超时，请稍后重试'))
    }, timeoutMs)
    
    fetch(`${baseURL}/v1/ai/process/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(req),
      signal: controller.signal
    })
      .then(response => {
        if (!response.ok) {
          clearTimeout(timeoutId)
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const reader = response.body?.getReader()
        if (!reader) {
          clearTimeout(timeoutId)
          throw new Error('Stream not supported')
        }
        
        const decoder = new TextDecoder()
        let buffer = ''
        
        const readChunk = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              clearTimeout(timeoutId)
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
          }).catch(err => {
            clearTimeout(timeoutId)
            reject(err)
          })
        }
        
        readChunk()
      })
      .catch(err => {
        clearTimeout(timeoutId)
        if (err.name === 'AbortError') {
          reject(new Error('请求超时，请稍后重试'))
        } else {
          reject(err)
        }
      })
  })
}

/**
 * 列出所有可用的 Agent
 */
export function listAgents(): Promise<ListAgentsResponse> {
  return request.get<ListAgentsResponse>('/v1/ai/agents')
}

