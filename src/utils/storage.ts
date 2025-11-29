/**
 * 本地存储工具
 */

const TOKEN_KEY = 'assistant_admin_token'
const USER_INFO_KEY = 'assistant_admin_user_info'

/**
 * 设置token
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 获取token
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 删除token
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 设置用户信息
 */
export function setUserInfo(userInfo: unknown): void {
  try {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
  } catch (error) {
    console.error('Failed to set user info in localStorage:', error)
  }
}

/**
 * 获取用户信息
 */
export function getUserInfo<T = unknown>(): T | null {
  const raw = localStorage.getItem(USER_INFO_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as T
  } catch (error) {
    console.error('Failed to parse user info from localStorage:', error)
    return null
  }
}

/**
 * 删除用户信息
 */
export function removeUserInfo(): void {
  localStorage.removeItem(USER_INFO_KEY)
}

