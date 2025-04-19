<template>
  <div class="knowledge-graph-container">
    <header class="kg-header">
      <h2>知识图谱</h2>
      <input type="search" placeholder="搜索知识点..." class="kg-search"/>
      <div class="view-toggles">
        <button>网络视图</button>
        <button>树形视图</button>
        <button>列表视图</button>
      </div>
    </header>
    <div class="kg-main">
      <div class="graph-visualization">
        <!-- 交互式知识图谱可视化区域 -->
        <p>知识图谱可视化区域 (需要集成图表库)</p>
        <div class="graph-controls">
          <button>放大</button>
          <button>缩小</button>
          <button>适应屏幕</button>
          <button>全屏</button>
        </div>
      </div>
      <aside class="details-panel">
        <h3>知识点详情</h3>
        <div v-if="selectedNode">
          <h4>{{ selectedNode.title }}</h4>
          <p>描述：{{ selectedNode.description }}</p>
          <p>难度：{{ '★'.repeat(selectedNode.difficulty) + '☆'.repeat(5 - selectedNode.difficulty) }}</p>
          <p>类型：{{ selectedNode.type }}</p>
          <h5>相关知识点：</h5>
          <ul>
            <li v-for="related in selectedNode.related" :key="related.id">
              {{ related.title }}
            </li>
          </ul>
          <button class="start-learning-button">开始学习此知识点</button>
        </div>
        <div v-else>
          <p>请在左侧选择一个知识点查看详情。</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 示例：模拟选中的节点数据
const selectedNode = ref(null);
// selectedNode.value = {
//   id: '001',
//   title: '数组',
//   description: '基本数据存储结构，...',
//   difficulty: 2, // 1-5
//   type: '概念类', // 概念类, 算法类, 应用类
//   related: [
//     { id: '002', title: '链表' },
//     { id: '003', title: '栈' }
//   ]
// };

// TODO: 需要集成图表库（如 D3.js, ECharts, G6等）来实现可视化和交互
</script>

<style scoped>
.knowledge-graph-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px); /* 假设顶部导航栏高度为 56px */
  font-family: 'SF Pro Text', 'PingFang SC', sans-serif;
  padding: 20px;
  background-color: #F7F9FC;
}

.kg-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  flex-shrink: 0;
}

.kg-header h2 {
  font-family: 'SF Pro Display', 'PingFang SC', sans-serif;
  font-size: 20px;
  font-weight: bold;
  color: #1E293B;
  margin: 0 20px 0 0;
}

.kg-search {
  padding: 6px 10px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-size: 13px;
  margin-right: auto; /* 将视图切换按钮推到右边 */
}

.view-toggles button {
  margin-left: 10px;
  padding: 6px 12px;
  font-size: 13px;
  border: 1px solid #E0E0E0;
  background-color: #FFFFFF;
  border-radius: 4px;
  cursor: pointer;
}
.view-toggles button:hover /* 或 .active */ {
  background-color: #E7F1FD;
  border-color: #4285F4;
  color: #4285F4;
}

.kg-main {
  display: flex;
  flex-grow: 1;
  gap: 20px;
  overflow: hidden; /* 防止内部元素溢出 */
}

.graph-visualization {
  flex: 3; /* 占 75% */
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0px 1px 3px rgba(0,0,0,0.1);
  position: relative;
  display: flex; /* 使内部元素可布局 */
  justify-content: center;
  align-items: center;
  overflow: hidden; /* 图谱可能会很大 */
}

.graph-visualization > p { /* 占位符文本 */
  color: #9AA0A6;
}

.graph-controls {
  position: absolute;
  bottom: 15px;
  left: 15px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.graph-controls button {
  margin: 0 3px;
  padding: 4px 8px;
  font-size: 12px;
  /* 图标化更好 */
}

.details-panel {
  flex: 1; /* 占 25% */
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0px 1px 3px rgba(0,0,0,0.1);
  padding: 20px;
  overflow-y: auto; /* 如果详情内容过多则滚动 */
}

.details-panel h3 {
  font-family: 'SF Pro Display', 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: bold;
  color: #1E293B;
  margin-top: 0;
  margin-bottom: 15px;
  border-bottom: 1px solid #E0E0E0;
  padding-bottom: 10px;
}
.details-panel h4 {
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 10px;
}
.details-panel p, .details-panel li {
    font-size: 14px;
    color: #5f6368;
    margin-bottom: 8px;
    line-height: 1.5;
}
.details-panel h5 {
    font-size: 14px;
    font-weight: bold;
    margin-top: 15px;
    margin-bottom: 5px;
}
.details-panel ul {
  list-style: none;
  padding-left: 5px;
}
.details-panel li {
    margin-bottom: 5px;
    cursor: pointer; /* 可点击跳转 */
    color: #4285F4;
}
.details-panel li:hover {
    text-decoration: underline;
}

.start-learning-button {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
  background-color: #4285F4; /* 主色 */
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.start-learning-button:hover {
    background-color: #3367D6;
}

.details-panel > div > p { /* 未选择节点时的提示 */
    color: #9AA0A6;
    font-style: italic;
}
</style>
