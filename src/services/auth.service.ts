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

