<template>
  <div class="register-container">
    <div class="brand-section">
      <h1>知识图谱与智能体系统</h1>
      <p>数据结构原理</p>
    </div>
    <div class="form-section">
      <h2>创建新账号</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="email">邮箱</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="username">用户名</label>
          <input type="text" id="username" v-model="username" required />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" required />
        </div>
        <button type="submit" class="register-button">注册</button>
      </form>
      <div class="links">
        <span>已有账号? </span>
        <router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const router = useRouter();

const handleRegister = () => {
  if (password.value !== confirmPassword.value) {
    alert('两次输入的密码不一致！');
    return;
  }
  // 实现注册逻辑
  console.log('注册:', email.value, username.value, password.value);
  // 示例：注册成功后跳转到登录页
  // router.push('/login');
};
</script>

<style scoped>
/* 复用 LoginView 的大部分样式 */
.register-container {
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
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}

.brand-section p {
  font-size: 18px;
}

.form-section {
  width: 60%;
  background-color: #FFFFFF;
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
  margin-bottom: 15px; /* 注册表单项较多，减少间距 */
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #5f6368;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #4285F4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.register-button {
  width: 100%;
  padding: 12px;
  background-color: #34A853; /* 辅助色 */
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px; /* 与上方输入框增加间距 */
}

.register-button:hover {
  background-color: #2a8c44; /* 辅助色加深 */
}

.links {
  margin-top: 20px;
  font-size: 13px;
  text-align: center; /* 居中显示 */
}

.links span {
  color: #5f6368;
}

.links a {
  color: #4285F4;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
</style>
