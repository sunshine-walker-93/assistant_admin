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
  return request.post('/auth/login', params)
}

/**
 * 注册
 */
export function register(params: RegisterParams): Promise<RegisterResponse> {
  return request.post('/auth/register', params)
}

