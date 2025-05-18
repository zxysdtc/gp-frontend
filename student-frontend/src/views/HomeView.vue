<template>
  <div class="home-container">
    <main class="main-content">

      <div class="content-area">
        <section class="card overview-card">
          <h3>学习进度概览</h3>
          <!-- 环形进度条和数据 -->
          <p>这里显示进度...</p>
        </section>
        <div class="card-row">
          <section class="card recommended-paths">
            <h3>推荐学习路径</h3>
            <!-- 水平滚动卡片 -->
            <p>路径1, 路径2, ...</p>
          </section>
          <section class="card recent-knowledge">
            <h3>最近访问的知识点</h3>
            <!-- 列表形式 -->
            <ul>
              <li>知识点 A - 昨天 10:00</li>
              <li>知识点 B - 前天 15:30</li>
            </ul>
          </section>
        </div>
        <section class="card upcoming-tasks">
          <h3>即将开始的任务/课程</h3>
          <!-- 任务列表 -->
          <p>任务1, 任务2, ...</p>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
// 可以在这里导入需要的组件或逻辑
</script>

<style scoped>
.home-container {
  display: flex;
  height: 100vh;
  background-color: #F7F9FC; /* 页面背景色 */
}

.sidebar {
  width: 220px;
  background-color: #1E293B; /* 深蓝灰 */
  color: white;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0; /* 防止侧边栏被压缩 */
}

.logo {
  padding: 0 20px 20px 20px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); /* 分隔线 */
}

nav ul {
  list-style: none;
  padding: 0;
  margin: 20px 0 0 0;
}

nav li a {
  display: block;
  padding: 12px 20px;
  color: white;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.2s ease;
  position: relative; /* 为了高亮条 */
}

nav li.active a {
  background-color: rgba(255, 255, 255, 0.1); /* 选中背景色 */
}

nav li.active a::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background-color: #4285F4; /* 主色 */
}

nav li a:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 如果内容过多则滚动 */
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: #FFFFFF; /* 白色顶栏 */
  border-bottom: 1px solid #E0E0E0; /* 分隔线 */
  box-shadow: 0 1px 3px rgba(0,0,0,0.05); /* 轻微阴影 */
  flex-shrink: 0; /* 防止顶栏被压缩 */
}

.breadcrumb {
  font-size: 14px;
  color: #5f6368;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 15px; /* 元素间距 */
}

.search-box {
  padding: 6px 10px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-size: 13px;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px; /* 示例，可以用图标代替 */
  color: #5f6368;
}

.content-area {
  padding: 30px;
  flex-grow: 1;
}

.card {
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0px 1px 3px rgba(0,0,0,0.1); /* 轻微阴影 */
  margin-bottom: 20px;
  padding: 20px;
}

.card h3 {
  font-family: 'SF Pro Display', 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: bold;
  color: #1E293B;
  margin-top: 0;
  margin-bottom: 15px;
}

.card p, .card ul {
  font-size: 14px;
  color: #5f6368;
}

.card ul {
  list-style: none;
  padding-left: 0;
}
.card ul li {
  margin-bottom: 8px;
}

.card-row {
  display: flex;
  gap: 20px; /* 卡片间距 */
}

.card-row > .card {
  flex: 1; /* 让两个卡片平分宽度 */
}

.overview-card {
  /* 特定样式 */
}
.recommended-paths {
  /* 特定样式 */
}
.recent-knowledge {
  /* 特定样式 */
}
.upcoming-tasks {
  /* 特定样式 */
}
</style>
