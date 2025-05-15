<template>
  <div class="auth-layout">
    <!-- 左侧品牌区域 -->
    <div class="brand-section">
      <div class="brand-content">
        <h1 class="system-name">知识图谱与智能体系统</h1>
        <h2 class="subject-name">数据结构原理</h2>
        <div class="background-graphics"></div>
      </div>
    </div>

    <!-- 右侧表单区域 -->
    <div class="form-section">
      <div class="form-container">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
// 组件逻辑
</script>

<style scoped>
.auth-layout {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.brand-section {
  width: 40%;
  background: linear-gradient(135deg, var(--primary-color), var(--success-color));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xl);
  color: var(--text-white);
  position: relative;
}

.brand-content {
  text-align: center;
  z-index: 1;
  position: relative;
}

.system-name {
  font-size: 28px;
  margin-bottom: var(--spacing-md);
}

.subject-name {
  font-size: 22px;
  opacity: 0.9;
}

.background-graphics {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.3;
  z-index: 0;
}

.form-section {
  width: 60%;
  background-color: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}

.form-container {
  width: 80%;
  max-width: 450px;
}

@media (max-width: 768px) {
  .auth-layout {
    flex-direction: column;
  }
  
  .brand-section {
    width: 100%;
    height: 30%;
    min-height: 200px;
  }
  
  .form-section {
    width: 100%;
    height: 70%;
  }
  
  .form-container {
    width: 90%;
  }
}
</style>
