<template>
  <div class="main-layout">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="logo-container">
        <h2 class="logo-text">知识图谱系统</h2>
      </div>
      <div class="sidebar-menu">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu-list"
          background-color="#1E293B"
          text-color="#ffffff"
          active-text-color="#ffffff"
          router
        >
          <el-menu-item index="/home">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/knowledge-graph">
            <el-icon><Share /></el-icon>
            <span>知识图谱</span>
          </el-menu-item>
          <el-menu-item index="/ai-assistant">
            <el-icon><ChatDotRound /></el-icon>
            <span>智能问答</span>
          </el-menu-item>
          <el-menu-item index="/learning-path">
            <el-icon><Compass /></el-icon>
            <span>学习路径</span>
          </el-menu-item>
          <el-menu-item index="/resources">
            <el-icon><Collection /></el-icon>
            <span>学习资源</span>
          </el-menu-item>
          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <span>个人设置</span>
          </el-menu-item>
          <el-menu-item index="/help">
            <el-icon><QuestionFilled /></el-icon>
            <span>帮助中心</span>
          </el-menu-item>
        </el-menu>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <div class="header">
        <div class="breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentPage">{{ currentPage }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="search-box">
          <el-input
            placeholder="搜索知识点、资源..."
            v-model="searchQuery"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="user-actions">
          <el-badge :value="3" class="notification-badge">
            <el-button icon="Bell" circle />
          </el-badge>
          <el-dropdown trigger="click">
            <div class="avatar-container">
              <el-avatar :size="40" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>我的学习</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 页面内容区 -->
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 定义响应式数据
const searchQuery = ref('')
const activeMenu = ref('')
const router = useRouter()
// 获取路由信息
const route = useRoute()

// 根据当前路由路径映射页面名称
const currentPage = computed(() => {
  const pathMap = {
    '/home': '学生主页',
    '/knowledge-graph': '知识图谱',
    '/ai-assistant': '智能问答',
    '/learning-path': '学习路径',
    '/resources': '学习资源',
    '/settings': '个人设置',
    '/help': '帮助中心'
  }
  
  activeMenu.value = route.path
  return pathMap[route.path] || ''
})

const handleLogout = () => {
  // 执行退出登录操作
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100%;
  width: 100%;
}

.sidebar {
  width: var(--sidebar-width);
  height: 100%;
  background-color: var(--sidebar-bg);
  color: var(--text-white);
  display: flex;
  flex-direction: column;
}

.logo-container {
  padding: var(--spacing-md);
  display: flex;
  justify-content: center;
  align-items: center;
  height: var(--header-height);
}

.logo-text {
  color: white;
  font-size: 18px;
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
}

.sidebar-menu-list {
  border-right: none;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: var(--header-height);
  padding: 0 var(--spacing-md);
  background-color: var(--card-bg);
  box-shadow: var(--shadow-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.breadcrumb {
  flex: 1;
}

.search-box {
  width: 300px;
  margin: 0 var(--spacing-md);
}

.user-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.notification-badge {
  margin-right: var(--spacing-sm);
}

.avatar-container {
  cursor: pointer;
}

.content {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
  background-color: var(--page-bg);
}
</style>
