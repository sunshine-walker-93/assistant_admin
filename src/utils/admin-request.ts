import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { getToken, removeToken } from './storage'

// 创建专门用于网关管理服务的axios实例
const adminAxiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL || 'http://localhost:8081',
  timeout: 10000
})

// 请求拦截器
adminAxiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
adminAxiosInstance.interceptors.response.use(
  (response) => {
    // 204 No Content 响应没有响应体，直接返回
    if (response.status === 204) {
      return response
    }
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // token过期或无效，清除token并跳转到登录页
      removeToken()
      window.location.href = '/login'
      return Promise.reject(new Error('未授权，请重新登录'))
    }
    
    // 提取友好的错误消息
    let errorMessage = '请求失败，请稍后重试'
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      
      if (data?.message) {
        errorMessage = data.message
      } else if (data?.error) {
        errorMessage = data.error
      } else if (typeof data === 'string') {
        errorMessage = data
      } else {
        switch (status) {
          case 400:
            errorMessage = '请求参数错误'
            break
          case 403:
            errorMessage = '没有权限执行此操作'
            break
          case 404:
            errorMessage = '请求的资源不存在'
            break
          case 500:
            errorMessage = '服务器内部错误'
            break
          default:
            errorMessage = `请求失败 (${status})`
        }
      }
    } else if (error.request) {
      errorMessage = '网络错误，请检查网络连接'
    } else {
      errorMessage = error.message || '请求配置错误'
    }
    
    return Promise.reject(new Error(errorMessage))
  }
)

// 创建类型化的 admin request 对象
const adminRequest = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return adminAxiosInstance.get(url, config) as Promise<T>
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return adminAxiosInstance.post(url, data, config) as Promise<T>
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return adminAxiosInstance.put(url, data, config) as Promise<T>
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return adminAxiosInstance.delete(url, config) as Promise<T>
  },
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return adminAxiosInstance.patch(url, data, config) as Promise<T>
  }
}

export default adminRequest

