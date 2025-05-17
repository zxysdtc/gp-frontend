import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://40.81.18.144:8080/api/v1', // 设置基础URL
  headers: {
    'Content-Type': 'application/json',
    // 你可以在这里添加其他全局 headers，例如认证 token
  },
});

// 可选：添加请求拦截器，例如自动附加 Token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('authToken');
    // 跳转到登录页面或刷新令牌
    window.location.href = '/login';
  }
  return Promise.reject(error);
});
// 可选：添加响应拦截器，例如处理全局错误
apiClient.interceptors.response.use(response => {
  return response;
}, error => {
  // 在这里处理全局错误，例如 401 未授权跳转到登录页
  if (error.response && error.response.status === 401) {
    // 处理未授权逻辑，比如清除 token 并跳转到登录页
    localStorage.removeItem('authToken');
    // 注意：在 JS 模块中直接操作路由可能需要引入 router 实例或使用 window.location
    window.location.href = '/login';
    console.error('未授权访问，请重新登录');
  }
  return Promise.reject(error);
});


export default apiClient;
