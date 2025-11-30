# AI 服务网关配置指南

本文档说明如何在 Gateway 管理界面中手动配置 assistant_ai 服务的路由映射。

## 前置条件

1. **assistant_ai 服务已启动**
   - 服务地址：`assistant-ai-app:50051` (Docker 环境) 或 `127.0.0.1:50051` (本地开发)
   - 确保服务正常运行并监听 gRPC 端口

2. **Gateway 管理服务已启动**
   - 访问地址：`http://localhost:8081` (默认)
   - 确保可以访问 Gateway 管理界面

## 配置步骤

### 步骤 1：添加后端服务

在 Gateway 管理界面的"后端服务"标签页中，点击"添加后端服务"，填写以下信息：

```yaml
服务名称: ai
服务地址: assistant-ai-app:50051  # Docker 环境
          # 或 127.0.0.1:50051   # 本地开发
描述: AI Service with LangChain/LangGraph agents
启用: ✓
```

**注意**：
- 服务名称必须为 `ai`（小写）
- Docker 环境使用容器名称 `assistant-ai-app:50051`
- 本地开发使用 `127.0.0.1:50051`
- 确保 Gateway 和 AI 服务在同一 Docker 网络中（`assistant_assistant-net`）
- 在容器环境中，所有服务统一使用 50051 端口，通过容器名区分不同服务

### 步骤 2：添加路由配置

在 Gateway 管理界面的"路由配置"标签页中，依次添加以下 3 个路由：

#### 路由 1：AI 处理接口（非流式）

```yaml
HTTP方法: POST
HTTP路径: /v1/ai/process
后端服务: ai
gRPC服务: ai.v1.AIService
gRPC方法: Process
超时时间(ms): 60000
描述: Unified entry point for AI processing
启用: ✓
```

#### 路由 2：AI 处理接口（流式响应）

```yaml
HTTP方法: POST
HTTP路径: /v1/ai/process/stream
后端服务: ai
gRPC服务: ai.v1.AIService
gRPC方法: ProcessStream
超时时间(ms): 60000
描述: Streaming AI response
启用: ✓
```

**注意**：流式响应需要 Gateway 支持 gRPC 流式转发功能。

#### 路由 3：Agent 列表接口

```yaml
HTTP方法: GET
HTTP路径: /v1/ai/agents
后端服务: ai
gRPC服务: ai.v1.AIService
gRPC方法: ListAgents
超时时间(ms): 5000
描述: List available AI agents
启用: ✓
```

## 快速配置提示

在 Gateway 管理界面添加路由时，如果选择后端服务为 `ai`，系统会自动显示配置提示和快速模板按钮，可以一键填充以下配置：

- **Process 路由**：点击 `/v1/ai/process → Process` 按钮
- **ProcessStream 路由**：点击 `/v1/ai/process/stream → ProcessStream` 按钮
- **ListAgents 路由**：点击 `/v1/ai/agents → ListAgents` 按钮

## 配置验证

### 1. 检查后端服务

```bash
# 通过 Gateway Admin API 检查
curl http://localhost:8081/api/v1/backends/ai
```

预期返回：
```json
{
  "name": "ai",
  "addr": "assistant-ai-app:50052",
  "description": "AI Service with LangChain/LangGraph agents",
  "enabled": true
}
```

### 2. 检查路由配置

```bash
# 通过 Gateway Admin API 检查
curl http://localhost:8081/api/v1/routes?enabled=true
```

应该能看到 3 个 AI 相关的路由配置。

### 3. 测试接口

#### 测试 Agent 列表接口

```bash
curl http://localhost:8080/v1/ai/agents
```

预期返回：
```json
{
  "agents": [
    {
      "name": "simple",
      "description": "Simple echo agent",
      "capabilities": [],
      "is_active": true
    }
  ]
}
```

#### 测试处理接口

```bash
curl -X POST http://localhost:8080/v1/ai/process \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test123",
    "message": "Hello, AI!"
  }'
```

预期返回：
```json
{
  "agent_name": "simple",
  "response": "Echo: Hello, AI!",
  "metadata": {},
  "is_streaming": false,
  "session_id": ""
}
```

## 配置参数说明

### 后端服务参数

| 参数 | 说明 | 示例 |
|------|------|------|
| 服务名称 | 后端服务的唯一标识 | `ai` |
| 服务地址 | gRPC 服务地址 | `assistant-ai-app:50051` |
| 描述 | 服务描述信息 | `AI Service with LangChain/LangGraph agents` |

### 路由参数

| 参数 | 说明 | 示例 |
|------|------|------|
| HTTP方法 | HTTP 请求方法 | `POST`, `GET` |
| HTTP路径 | HTTP 请求路径 | `/v1/ai/process` |
| 后端服务 | 关联的后端服务名称 | `ai` |
| gRPC服务 | gRPC 服务全名 | `ai.v1.AIService` |
| gRPC方法 | gRPC 方法名 | `Process`, `ProcessStream`, `ListAgents` |
| 超时时间 | 请求超时时间（毫秒） | `30000` |

## 常见问题

### 1. 无法连接到 AI 服务

**检查项**：
- AI 服务是否正常运行
- 服务地址是否正确
- Docker 网络配置是否正确
- 端口是否被占用

**解决方案**：
```bash
# 检查 AI 服务状态
docker ps | grep assistant-ai

# 检查网络连接
docker network inspect assistant_assistant-net

# 测试 gRPC 连接
grpcurl -plaintext assistant-ai-app:50051 ai.v1.AIService/ListAgents
```

### 2. 路由配置后无法访问

**检查项**：
- 路由是否已启用
- Gateway 服务是否已重新加载配置
- HTTP 路径是否正确

**解决方案**：
- 确保路由的 `enabled` 字段为 `true`
- 检查 Gateway 日志，确认配置已加载
- 验证 HTTP 路径格式（必须以 `/` 开头）

### 3. 流式响应不工作

**原因**：
- Gateway 可能不支持 gRPC 流式响应转发
- 超时时间设置过短

**解决方案**：
- 检查 Gateway 是否支持流式响应
- 增加超时时间（建议 60000ms 或更长）
- 如果 Gateway 不支持，前端会自动降级到普通请求

## 通过 API 配置（可选）

如果不想通过界面配置，也可以通过 Gateway Admin API 直接配置：

### 添加后端服务

```bash
curl -X POST http://localhost:8081/api/v1/backends \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ai",
    "addr": "assistant-ai-app:50051",
    "description": "AI Service with LangChain/LangGraph agents",
    "enabled": true
  }'
```

### 添加路由

```bash
# Process 路由
curl -X POST http://localhost:8081/api/v1/routes \
  -H "Content-Type: application/json" \
  -d '{
    "http_method": "POST",
    "http_pattern": "/v1/ai/process",
    "backend_name": "ai",
    "backend_service": "ai.v1.AIService",
    "backend_method": "Process",
    "timeout_ms": 60000,
    "description": "Unified entry point for AI processing",
    "enabled": true
  }'

# ProcessStream 路由
curl -X POST http://localhost:8081/api/v1/routes \
  -H "Content-Type: application/json" \
  -d '{
    "http_method": "POST",
    "http_pattern": "/v1/ai/process/stream",
    "backend_name": "ai",
    "backend_service": "ai.v1.AIService",
    "backend_method": "ProcessStream",
    "timeout_ms": 60000,
    "description": "Streaming AI response",
    "enabled": true
  }'

# ListAgents 路由
curl -X POST http://localhost:8081/api/v1/routes \
  -H "Content-Type: application/json" \
  -d '{
    "http_method": "GET",
    "http_pattern": "/v1/ai/agents",
    "backend_name": "ai",
    "backend_service": "ai.v1.AIService",
    "backend_method": "ListAgents",
    "timeout_ms": 5000,
    "description": "List available AI agents",
    "enabled": true
  }'
```

## 配置完成后的使用

配置完成后，可以在前端"智能助手"菜单中使用 AI 功能：

1. 访问 `http://localhost:5173/ai`（前端地址）
2. 查看可用 Agent 列表
3. 选择 Agent 并开始对话
4. 查看对话历史

## 参考

- [Gateway 集成文档](../assistant_ai/GATEWAY_INTEGRATION.md)
- [AI 服务 API 文档](../assistant_ai/README.md)

