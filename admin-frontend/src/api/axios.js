import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1/admin',
  headers: {
    'Content-Type': 'application/json'
  }
})

// 添加请求拦截器
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem  ('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器
apiClient.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response && error.response.status === 401) {
      // 未授权，清除token并重定向到登录页
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient 