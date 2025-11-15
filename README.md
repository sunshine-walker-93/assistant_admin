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

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 环境配置

创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## API 接口

项目需要对接后端微服务，接口规范如下：

### 登录接口
- **URL**: `POST /auth/login`
- **请求体**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **响应**:
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
- **URL**: `POST /auth/register`
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
    "message": "string"
  }
  ```
  或
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

## 路由

- `/login` - 登录页面
- `/register` - 注册页面
- `/` - 主页（需要认证）

## 说明

这是一个前后端分离的项目，`assistant_admin` 仅包含前端代码。后端服务需要单独部署和配置。
