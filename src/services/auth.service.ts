import request from '../utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  email: string
  password: string
}

// gRPC 响应格式（protojson 会将 snake_case 转换为 camelCase）
interface LoginResponseRaw {
  accessToken: string  // gRPC 中的 access_token
  user: {
    id: string
    username: string
    email: string
    passwordHash?: string  // 前端不需要，但可能出现在响应中
  }
}

interface RegisterResponseRaw {
  user: {
    id: string
    username: string
    email: string
    passwordHash?: string  // 前端不需要，但可能出现在响应中
  }
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    username: string
    email: string
  }
}

export interface RegisterResponse {
  message?: string
  token?: string
  user?: {
    id: string
    username: string
    email: string
  }
}

/**
 * 登录
 */
export function login(params: LoginParams): Promise<LoginResponse> {
  return request.post<LoginResponseRaw>('/v1/user/login', params).then((res) => ({
    token: res.accessToken,
    user: {
      id: res.user.id,
      username: res.user.username,
      email: res.user.email
    }
  }))
}

/**
 * 注册
 */
export function register(params: RegisterParams): Promise<RegisterResponse> {
  return request.post<RegisterResponseRaw>('/v1/user/register', params).then((res) => ({
    user: {
      id: res.user.id,
      username: res.user.username,
      email: res.user.email
    }
    // 注册接口不返回 token，需要用户登录
  }))
}

// gRPC 响应格式
interface GetUserResponseRaw {
  user: {
    id: string
    username: string
    email: string
    passwordHash?: string
  }
}

export interface GetUserResponse {
  user: {
    id: string
    username: string
    email: string
  }
}

export interface UpdateUserParams {
  id: string
  username?: string
  email?: string
  password?: string
}

interface UpdateUserResponseRaw {
  user: {
    id: string
    username: string
    email: string
    passwordHash?: string
  }
}

export interface UpdateUserResponse {
  user: {
    id: string
    username: string
    email: string
  }
}

/**
 * 获取用户信息
 * 注意：由于网关将HTTP请求转换为gRPC，GetUser使用POST请求，路径中的id需要在请求体中传递
 */
export function getUser(id: string): Promise<GetUserResponse> {
  // 网关路由应配置为 POST /v1/user/get，请求体包含 { id: "..." }
  // 或者如果网关支持路径参数提取，可以配置为 GET /v1/user/{id}
  // 这里使用POST方式，路径为 /v1/user/get，请求体包含id
  return request.post<GetUserResponseRaw>('/v1/user/get', { id }).then((res) => ({
    user: {
      id: res.user.id,
      username: res.user.username,
      email: res.user.email
    }
  }))
}

/**
 * 更新用户信息
 * 使用protobuf StringValue格式，只发送非空字段
 */
export function updateUser(params: UpdateUserParams): Promise<UpdateUserResponse> {
  // 构建请求体，只有非空字段才包含
  const requestBody: any = { id: params.id }
  
  if (params.username !== undefined && params.username !== '') {
    requestBody.username = params.username
  }
  if (params.email !== undefined && params.email !== '') {
    requestBody.email = params.email
  }
  if (params.password !== undefined && params.password !== '') {
    requestBody.password = params.password
  }

  return request.post<UpdateUserResponseRaw>('/v1/user/update', requestBody).then((res) => ({
    user: {
      id: res.user.id,
      username: res.user.username,
      email: res.user.email
    }
  }))
}

