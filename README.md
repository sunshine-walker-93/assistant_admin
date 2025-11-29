# 个人助理管理后台

基于 Vue 3 + TypeScript + Vite 的前端管理后台项目，支持账号注册和登录功能。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理器
- **Pinia** - 状态管理
- **Element Plus** - Vue 3 组件库
- **Axios** - HTTP 客户端

## 功能特性

- ✅ 用户注册
- ✅ 用户登录
- ✅ JWT Token 认证
- ✅ 路由守卫
- ✅ 表单验证

## 项目结构

```
src/
├── views/           # 页面组件
│   ├── Login.vue    # 登录页面
│   ├── Register.vue # 注册页面
│   └── Home.vue     # 主页
├── components/      # 通用组件
├── router/          # 路由配置
│   └── index.ts
├── stores/          # 状态管理（Pinia）
│   └── auth.ts      # 认证状态
├── services/        # API服务
│   └── auth.service.ts
├── utils/           # 工具函数
│   ├── request.ts   # Axios请求封装
│   └── storage.ts   # Token存储
├── App.vue
└── main.ts
```

## 开发

### 使用 Makefile（推荐）

项目提供了 Makefile 来简化常用操作：

```bash
# 安装依赖
make npm-install

# 启动开发服务器
make dev

# 本地构建项目
make build

# 构建 Docker 镜像
make docker-build

# 使用 docker-compose 启动服务
make run

# 查看容器日志
make logs

# 停止容器
make stop

# 删除容器
make down
```

### 使用 npm 命令

也可以直接使用 npm 命令：

#### 安装依赖

```bash
npm install
```

#### 启动开发服务器

```bash
npm run dev
```

#### 构建生产版本

```bash
npm run build
```

#### 预览生产构建

```bash
npm run preview
```

## 容器化部署

项目支持使用 Docker 和 docker-compose 进行容器化部署。

### 前置要求

- Docker 和 Docker Compose 已安装
- 确保 `assistant-net` 网络已创建（通常由 `assistant_gateway` 项目的 docker-compose 创建）

### 使用 Docker Compose 部署

#### 方式一：使用 Makefile（推荐）

```bash
# 构建并启动服务
make run

# 查看日志
make logs

# 停止服务
make stop

# 删除容器
make down
```

#### 方式二：直接使用 docker-compose

1. **构建并启动服务**

```bash
docker-compose up -d
```

2. **查看服务状态**

```bash
docker-compose ps
```

3. **查看日志**

```bash
docker-compose logs -f frontend-admin
```

4. **停止服务**

```bash
docker-compose down
```

### 使用 Docker 直接部署

1. **构建镜像**

```bash
docker build -t assistant-admin:latest \
  --build-arg VITE_API_BASE_URL=http://assistant-gateway-app:8080 \
  --build-arg VITE_ADMIN_API_BASE_URL=http://assistant-gateway-admin-app:8081 \
  .
```

2. **运行容器**

```bash
docker run -d \
  --name assistant-admin-app \
  --network assistant_assistant-net \
  -p 3000:3000 \
  assistant-admin:latest
```

### 环境变量配置

在容器化部署时，可以通过构建参数配置 API 基础地址：

#### 网关服务地址 (`VITE_API_BASE_URL`)
- **网关在容器内**：使用容器服务名，如 `http://assistant-gateway-app:8080`
- **网关在宿主机**：使用宿主机地址，如 `http://host.docker.internal:8080` 或 `http://localhost:8080`

#### 网关管理服务地址 (`VITE_ADMIN_API_BASE_URL`)
- **管理服务在容器内**：使用容器服务名，如 `http://assistant-gateway-admin-app:8081`
- **管理服务在宿主机**：使用宿主机地址，如 `http://host.docker.internal:8081` 或 `http://localhost:8081`

在 `docker-compose.yml` 中可以通过环境变量覆盖默认值：

```bash
VITE_API_BASE_URL=http://your-gateway-url:8080 \
VITE_ADMIN_API_BASE_URL=http://your-admin-url:8081 \
docker-compose up -d
```

### 访问应用

部署成功后，访问 `http://localhost:3000` 即可使用管理后台。

## 环境配置

创建 `.env` 文件（可参考 `.env.example`）：

```env
# 网关服务 API 基础地址（用于用户认证等业务接口）
VITE_API_BASE_URL=http://localhost:8080

# 网关管理服务 API 基础地址（用于后端服务和路由配置管理接口）
VITE_ADMIN_API_BASE_URL=http://localhost:8081
```

**说明**：
- `VITE_API_BASE_URL`：用于通过网关（assistant_gateway）调用后端业务服务，默认地址为 `http://localhost:8080`
- `VITE_ADMIN_API_BASE_URL`：用于调用网关管理服务（assistant_gateway_admin）的配置管理接口，默认地址为 `http://localhost:8081`

## API 接口

项目通过网关调用后端微服务，接口规范如下：

### 登录接口
- **URL**: `POST /v1/user/login`
- **请求体**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **响应**（gRPC 响应，前端会自动适配）:
  ```json
  {
    "accessToken": "string",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string"
    }
  }
  ```
- **前端适配后**:
  ```json
  {
    "token": "string",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string"
    }
  }
  ```

### 注册接口
- **URL**: `POST /v1/user/register`
- **请求体**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **响应**:
  ```json
  {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string"
    }
  }
  ```
- **说明**：注册成功后需要用户手动登录，注册接口不返回 token。

## 路由

- `/login` - 登录页面
- `/register` - 注册页面
- `/` - 主页（需要认证）

## 说明

这是一个前后端分离的项目，`assistant_admin` 仅包含前端代码。后端服务需要单独部署和配置。
