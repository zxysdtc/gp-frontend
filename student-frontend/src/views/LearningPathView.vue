<template>
  <div class="learning-path-container">
    <header class="lp-header">
      <h2>学习路径：数据结构从入门到精通</h2>
      <div class="lp-controls">
        <button>学习目标选择</button>
        <button>难度调整</button>
      </div>
    </header>

    <section class="path-visualization">
      <h3>学习阶段图示</h3>
      <!-- 时间线/流程图区域 (需要可视化库或自定义实现) -->
      <div class="timeline-placeholder">
        [阶段1: 基础] --> [阶段2: 线性] --> [阶段3: 树形] --> [阶段4: 图形] --> [阶段5: 高级]
        <br>
        (概念) --> (数组/链表/栈/队) --> (二叉树/...) --> (图遍历/...) --> (...)
        <div class="current-position">▲ 当前学习: 链表</div>
      </div>
    </section>

    <section class="steps-details">
      <h3>详细学习步骤</h3>
      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>知识点</th>
            <th>描述</th>
            <th>预计时间</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="step in learningSteps" :key="step.id">
            <td>{{ step.id }}</td>
            <td>{{ step.knowledgePoint }}</td>
            <td>{{ step.description }}</td>
            <td>{{ step.estimatedTime }}</td>
            <td><span :class="['status-badge', step.status]">{{ getStatusText(step.status) }}</span></td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const learningSteps = ref([
  { id: 1, knowledgePoint: '数组', description: '基本数据存储结构...', estimatedTime: '2小时', status: 'completed' },
  { id: 2, knowledgePoint: '链表', description: '动态数据结构...', estimatedTime: '3小时', status: 'in-progress' },
  { id: 3, knowledgePoint: '栈和队列', description: 'LIFO和FIFO结构...', estimatedTime: '2.5小时', status: 'not-started' },
  { id: 4, knowledgePoint: '哈希表', description: '键值对存储...', estimatedTime: '3小时', status: 'not-started' },
]);

const getStatusText = (status) => {
  switch (status) {
    case 'completed': return '已完成';
    case 'in-progress': return '进行中';
    case 'not-started': return '未开始';
    default: return '未知';
  }
};
</script>

<style scoped>
.learning-path-container {
  padding: 20px 30px;
  font-family: 'SF Pro Text', 'PingFang SC', sans-serif;
  background-color: #F7F9FC;
  height: calc(100vh - 56px); /* 假设顶部导航栏高度 */
  overflow-y: auto;
}

.lp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.lp-header h2 {
  font-family: 'SF Pro Display', 'PingFang SC', sans-serif;
  font-size: 20px;
  font-weight: bold;
  color: #1E293B;
  margin: 0;
}

.lp-controls button {
  margin-left: 10px;
  padding: 6px 12px;
  font-size: 13px;
  border: 1px solid #E0E0E0;
  background-color: #FFFFFF;
  border-radius: 4px;
  cursor: pointer;
}

.path-visualization {
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0px 1px 3px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 25px;
}

.path-visualization h3 {
  font-size: 16px;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 15px;
}

.timeline-placeholder {
  /* 这是一个简单的占位符，实际需要图形库 */
  padding: 30px;
  border: 1px dashed #E0E0E0;
  text-align: center;
  color: #5f6368;
  font-size: 14px;
  line-height: 1.6;
  position: relative; /* 为了定位当前位置标记 */
}
.current-position {
    margin-top: 15px;
    font-weight: bold;
    color: #4285F4; /* 主色 */
}
/* 模拟当前位置的标记 */
.current-position::before {
    content: '';
    display: inline-block; /* 或 block */
    /* position: absolute; */ /* 更精确控制位置 */
    /* bottom: -10px; */ /* 示例位置 */
    /* left: 50%; */
    /* transform: translateX(-50%); */
    width: 12px;
    height: 12px;
    background-color: #4285F4;
    border-radius: 50%;
    /* 动画效果：脉动光环 */
    box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.7);
	animation: pulse 1.5s infinite;
    margin-right: 5px;
}
@keyframes pulse {
	0% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.7); }
	70% { box-shadow: 0 0 0 10px rgba(66, 133, 244, 0); }
	100% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0); }
}

.steps-details {
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0px 1px 3px rgba(0,0,0,0.1);
  padding: 20px;
}

.steps-details h3 {
  font-size: 16px;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 15px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #E0E0E0;
}

thead th {
  background-color: #F7F9FC; /* 表头背景 */
  font-weight: bold;
  color: #5f6368; /* 表头文字颜色 */
  font-size: 13px;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
    background-color: #F0F2F5; /* 悬停行背景 */
}

td:nth-child(1) { width: 5%; } /* 序号列宽 */
td:nth-child(2) { width: 20%; } /* 知识点列宽 */
td:nth-child(3) { width: 40%; } /* 描述列宽 */
td:nth-child(4) { width: 15%; } /* 时间列宽 */
td:nth-child(5) { width: 10%; text-align: center;} /* 状态列宽 */


.status-badge {
  padding: 3px 8px;
  border-radius: 12px; /* 胶囊形状 */
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.status-badge.completed { background-color: #34A853; } /* 绿色 */
.status-badge.in-progress { background-color: #4285F4; } /* 蓝色 */
.status-badge.not-started { background-color: #9AA0A6; } /* 灰色 */
</style>
