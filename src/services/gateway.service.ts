import adminRequest from '../utils/admin-request'

export interface Backend {
  id?: number
  name: string
  addr: string
  description?: string
  enabled?: boolean
  created_at?: string
  updated_at?: string
}

export interface Route {
  id: number
  http_method: string
  http_pattern: string
  backend_name: string
  backend_service: string
  backend_method: string
  timeout_ms?: number
  description?: string
  enabled?: boolean
  created_at?: string
  updated_at?: string
  request_type?: string
  response_type?: string
}

export interface CreateBackendRequest {
  name: string
  addr: string
  description?: string
  enabled?: boolean
}

export interface UpdateBackendRequest {
  addr: string
  description?: string
  enabled?: boolean
}

export interface CreateRouteRequest {
  http_method: string
  http_pattern: string
  backend_name: string
  backend_service: string
  backend_method: string
  timeout_ms?: number
  description?: string
  enabled?: boolean
}

export interface UpdateRouteRequest {
  http_method: string
  http_pattern: string
  backend_name: string
  backend_service: string
  backend_method: string
  timeout_ms?: number
  description?: string
  enabled?: boolean
}

/**
 * 获取所有 Backend
 */
export function getBackends(): Promise<Backend[]> {
  return adminRequest.get<Backend[]>('/api/v1/backends?enabled=true')
}

/**
 * 创建 Backend
 */
export function createBackend(backend: CreateBackendRequest): Promise<Backend> {
  return adminRequest.post<Backend>('/api/v1/backends', backend)
}

/**
 * 更新 Backend
 */
export function updateBackend(name: string, backend: UpdateBackendRequest): Promise<Backend> {
  return adminRequest.put<Backend>(`/api/v1/backends/${name}`, backend)
}

/**
 * 删除 Backend（软删除）
 * 注意：网关管理服务返回 204 No Content 表示成功
 */
export function deleteBackend(name: string): Promise<void> {
  return adminRequest.delete<void>(`/api/v1/backends/${name}`)
}

/**
 * 获取所有路由
 */
export function getRoutes(): Promise<Route[]> {
  return adminRequest.get<Route[]>('/api/v1/routes?enabled=true')
}

/**
 * 获取单个路由
 */
export function getRoute(id: number): Promise<Route> {
  return adminRequest.get<Route>(`/api/v1/routes/${id}`)
}

/**
 * 创建路由
 */
export function createRoute(route: CreateRouteRequest): Promise<Route> {
  return adminRequest.post<Route>('/api/v1/routes', route)
}

/**
 * 更新路由
 */
export function updateRoute(id: number, route: UpdateRouteRequest): Promise<Route> {
  return adminRequest.put<Route>(`/api/v1/routes/${id}`, route)
}

/**
 * 删除路由（软删除）
 * 注意：网关管理服务返回 204 No Content 表示成功
 */
export function deleteRoute(id: number): Promise<void> {
  return adminRequest.delete<void>(`/api/v1/routes/${id}`)
}

