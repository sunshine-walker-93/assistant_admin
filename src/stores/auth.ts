import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, register as registerApi } from '../services/auth.service'
import type { LoginParams, RegisterParams } from '../services/auth.service'
import { setToken, getToken, removeToken, setUserInfo, getUserInfo, removeUserInfo } from '../utils/storage'

export interface UserInfo {
  id: string
  username: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const tokenFromStorage = getToken()
  const userFromStorage = getUserInfo<UserInfo | null>()

  const token = ref<string | null>(tokenFromStorage)
  const userInfo = ref<UserInfo | null>(userFromStorage)
  const isAuthenticated = ref<boolean>(!!tokenFromStorage)

  /**
   * 登录
   */
  async function login(params: LoginParams) {
    try {
      const response = await loginApi(params)
      token.value = response.token
      userInfo.value = response.user
      isAuthenticated.value = true
      setToken(response.token)
      setUserInfo(response.user)
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * 注册
   */
  async function register(params: RegisterParams) {
    try {
      const response = await registerApi(params)
      // 如果注册后直接返回token，则自动登录
      if (response.token && response.user) {
        token.value = response.token
        userInfo.value = response.user
        isAuthenticated.value = true
        setToken(response.token)
        setUserInfo(response.user)
      }
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * 登出
   */
  function logout() {
    token.value = null
    userInfo.value = null
    isAuthenticated.value = false
    removeToken()
    removeUserInfo()
  }

  return {
    token,
    userInfo,
    isAuthenticated,
    login,
    register,
    logout
  }
})

