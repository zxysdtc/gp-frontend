<template>
  <div class="not-found-container">
    <h1>404</h1>
    <h2>页面未找到</h2>
    <p>抱歉，您访问的页面不存在。</p>
    <router-link to="/" class="back-home-button">返回首页</router-link>
  </div>
</template>

<script setup>
// No script logic needed usually for a simple 404 page
</script>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 56px); /* 假设有顶部导航 */
  text-align: center;
  font-family: 'SF Pro Text', 'PingFang SC', sans-serif;
  background-color: #F7F9FC;
}

h1 {
  font-size: 6rem; /* 大号 404 */
  font-weight: bold;
  color: #EA4335; /* 强调色 */
  margin-bottom: 0;
  line-height: 1;
}

h2 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1E293B;
  margin-top: 10px;
  margin-bottom: 10px;
}

p {
  font-size: 1rem;
  color: #5f6368;
  margin-bottom: 30px;
}

.back-home-button {
  padding: 10px 20px;
  background-color: #4285F4; /* 主色 */
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.back-home-button:hover {
  background-color: #3367D6;
}
</style>
