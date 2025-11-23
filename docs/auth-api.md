## 认证接口文档（Auth API）

### 一、通用说明

- **Base URL**：`VITE_API_BASE_URL`（前端 `.env` 中配置，例如 `http://localhost:3000/api`）
- **认证方式**：JWT，前端会在请求头带上  
  `Authorization: Bearer <token>`
- **响应格式**：全部为 JSON
- **错误码约定（建议）**：
  - `400`：参数校验失败
  - `401`：未认证 / Token 无效或过期（前端会自动登出并跳转登录页）
  - `409`：用户名或邮箱已存在
  - `500`：服务器内部错误

统一错误响应（建议）：

```json
{
  "message": "错误说明"
}
```

---

### 二、注册接口：`POST /auth/register`

**用途**：用户注册新账号。

- **URL**：`POST /auth/register`
- **请求头**：
  - `Content-Type: application/json`
- **请求体**：

```json
{
  "username": "string",   // 必填，长度 >= 3
  "email": "string",      // 必填，有效邮箱格式
  "password": "string"    // 必填，长度 >= 6
}
```

- **成功响应（方案一：仅返回提示，前端跳转到登录页）**：

```json
{
  "message": "注册成功"
}
```

- **成功响应（方案二：直接返回登录态，前端也能兼容）**：

```json
{
  "token": "jwt-token-string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
```

> 说明：前端支持这两种返回方式，推荐后端与前端约定 **其一**，不要混用。

- **可能的错误响应**：
  - `400`：参数不合法（用户名太短、密码太短、邮箱格式错误等）
  - `409`：用户名或邮箱已被占用
  - `500`：服务器错误

---

### 三、登录接口：`POST /auth/login`

**用途**：用户使用用户名（或邮箱）+密码登录。

- **URL**：`POST /auth/login`
- **请求头**：
  - `Content-Type: application/json`
- **请求体**：

```json
{
  "username": "string",   // 前端填写的是“用户名或邮箱”，后端可支持两者其一
  "password": "string"
}
```

- **成功响应（前端必须要的字段）**：

```json
{
  "token": "jwt-token-string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
```

- **可能的错误响应**：
  - `400`：参数缺失
  - `401`：用户名/邮箱或密码错误
  - `500`：服务器错误

前端在登录失败时会读取 `error.response.data.message` 来展示错误信息。

---

### 四、认证校验约定（行为约定）

当前前端没有调用 `/auth/me` 等接口，但有如下行为约定：

- 对所有需要登录才能访问的接口，前端会在请求头携带：

```http
Authorization: Bearer <token>
```

- 若后端发现 Token 无效或过期，需返回 **`401`**。  
  前端会在拦截器中：
  - 清除本地 Token
  - 自动跳转到 `/login`

---

### 五、字段与校验规则建议

- **username**
  - 类型：`string`
  - 规则：必填，长度 ≥ 3
- **email**
  - 类型：`string`
  - 规则：必填，标准邮箱格式
- **password**
  - 类型：`string`
  - 规则：必填，长度 ≥ 6
- **user.id**
  - 类型：`string`（后端可以用 UUID 或数字 ID，前端不做假设）


