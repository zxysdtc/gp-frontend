<template>
  <div class="login-container">
    <div class="form-section">
      <h2>欢迎回来</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名/邮箱</label>
          <input type="text" id="username" v-model="username" required />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit" class="login-button">登录</button>
      </form>
      <div class="links">
        <a href="#">忘记密码?</a>
        <router-link to="/register">注册账号</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api/axios';  // 修改导入为配置好的实例

const username = ref('');
const password = ref('');
const router = useRouter();

const handleLogin = async () => {
  // 实现登录逻辑
  console.log('尝试登录:', username.value, password.value);
  try {
    const response = await apiClient.post('/auth/login', {
      username: username.value,
      password: password.value
    });

    // 假设登录成功后，后端返回的数据在 response.data 中
    console.log('登录成功:', response.data);

    // --- 处理 Token ---
    // 示例：假设 token 在 response.data.token 中
    const token = response.data.token;
    if (token) {
      console.log('收到 Token:', token);
      console.log('当前路由器状态:', router);
      localStorage.setItem('authToken', token);
      
      // 严格的跳转调试代码，尝试多种方式
      console.log('准备跳转...');
      
      try {
        // 1. 检查路由定义情况
        console.log('所有路由:', router.getRoutes().map(r => ({path: r.path, name: r.name})));
        
        // 2. 尝试多种跳转方式
        console.log('尝试方式1: router.push 路径');
        const routePromise = router.push('/home');
        
        if (routePromise) {
          routePromise.catch(err => {
            console.error('方式1失败:', err);
            
            console.log('尝试方式2: router.push 命名路由');
            return router.push({name: 'home'}).catch(err2 => {
              console.error('方式2失败:', err2);
              
              console.log('尝试方式3: 使用window.location');
              // 使用最直接的方式
              setTimeout(() => {
                const baseUrl = window.location.origin;
                window.location.href = `${baseUrl}/home`;
              }, 100);
            });
          });
        }
      } catch (e) {
        console.error('跳转异常:', e);
        alert('跳转出现异常，查看控制台获取详情');
      }
      
      return;
    } else {
      // 如果后端成功响应但没有 token，需要处理这种情况
      alert('登录成功，但未收到认证令牌。');
      // 注意：这里不会跳转
    }
    // --- Token 处理结束 ---

  } catch (error) {
    // 处理登录失败的情况
    console.error('登录失败:', error.response || error.message);
    if (error.response) {
      // 后端返回了错误响应 (例如 401 Unauthorized, 400 Bad Request)
      // 你可以根据 error.response.data 中的信息显示更具体的错误提示
      alert(`登录失败: ${error.response.data.message || '用户名或密码错误'}`);
    } else if (error.request) {
      // 请求已发出，但没有收到响应 (网络问题)
      alert('登录失败: 无法连接到服务器，请检查网络。');
    } else {
      // 其他错误 (设置请求时发生错误)
      alert(`登录失败: ${error.message}`);
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  font-family: 'SF Pro Text', 'PingFang SC', sans-serif;
}

.brand-section {
  width: 40%;
  background: linear-gradient(to bottom right, #4285F4, #34A853);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 40px;
}

.brand-section h1 {
  font-family: 'SF Pro Display', 'PingFang SC', sans-serif;
  font-size: 28px; /* 调整大小以适应 */
  font-weight: bold;
  margin-bottom: 10px;
}

.brand-section p {
  font-size: 18px; /* 调整大小以适应 */
}

.form-section {
  width: 60%;
  background-color: #FFFFFF; /* 文档设计为白色背景 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.form-section h2 {
  font-family: 'SF Pro Display', 'PingFang SC', sans-serif;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #1E293B;
}

form {
  width: 100%;
  max-width: 350px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #5f6368; /* 辅助文本颜色 */
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #E0E0E0; /* 浅灰色边框 */
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box; /* 确保 padding 不会撑大元素 */
}

.form-group input:focus {
  outline: none;
  border-color: #4285F4; /* 主色 */
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2); /* 轻微辉光效果 */
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #4285F4; /* 主色 */
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #3367D6; /* 主色加深 */
}

.links {
  margin-top: 20px;
  font-size: 13px;
  width: 100%;
  max-width: 350px;
  display: flex;
  justify-content: space-between;
}

.links a {
  color: #4285F4; /* 主色 */
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
</style>
