import axios from "axios";

/**
 * 专门用于处理流式响应的API客户端
 * 特别适用于聊天流式输出等场景
 */
const streamApiClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "X-Requested-With": "XMLHttpRequest",
    Connection: "keep-alive",
  },
  // 关键配置：启用流式响应处理
  responseType: "stream",
  // 较长的超时时间
  timeout: 120000, // 2分钟
  // HTTP/2支持
  httpAgent: new (require("http").Agent)({
    keepAlive: true,
    keepAliveMsecs: 30000, // 保持连接打开30秒
  }),
  httpsAgent: new (require("https").Agent)({
    keepAlive: true,
    keepAliveMsecs: 30000,
  }),
});

// 请求拦截器 - 添加认证token
streamApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    console.log("流式请求:", config.url, "是否有token:", Boolean(token));

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理认证错误和令牌更新
streamApiClient.interceptors.response.use(
  (response) => {
    // 检查响应头中是否有新令牌
    const newToken = response.headers["authorization"];
    if (newToken && newToken.startsWith("Bearer ")) {
      const token = newToken.substring(7);
      console.log("从流式响应收到新令牌, 更新本地存储");
      localStorage.setItem("authToken", token);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/**
 * 发送聊天消息并处理流式响应
 * @param {Object} message - 聊天消息对象
 * @param {Function} onChunk - 处理每个数据块的回调
 * @param {Function} onComplete - 流结束时的回调
 * @param {Function} onError - 错误处理回调
 */
export const sendChatMessage = (message, onChunk, onComplete, onError) => {
  return streamApiClient
    .post("/chat/sendMessage", message, {
      responseType: "stream",
      onDownloadProgress: (progressEvent) => {
        // 处理流式数据
        const chunk = progressEvent.currentTarget.response;
        if (chunk) {
          onChunk(chunk);
        }
      },
    })
    .then((response) => {
      onComplete(response);
      return response;
    })
    .catch((error) => {
      onError(error);
      return Promise.reject(error);
    });
};

export default streamApiClient;
