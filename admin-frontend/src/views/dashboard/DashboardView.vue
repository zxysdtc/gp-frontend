<template>
  <div class="dashboard-container">
    <h2>仪表盘</h2>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>智能体总数</span>
            </div>
          </template>
          <div class="stat-value">
            {{ stats.agentsCount }}
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>知识图谱总数</span>
            </div>
          </template>
          <div class="stat-value">
            {{ stats.graphsCount }}
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>节点总数</span>
            </div>
          </template>
          <div class="stat-value">
            {{ stats.nodesCount }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
            </div>
          </template>
          <div class="activity-list">
            <el-timeline>
              <el-timeline-item
                v-for="(activity, index) in activities"
                :key="index"
                :timestamp="activity.time"
                :type="activity.type"
              >
                {{ activity.content }}
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>快速操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button @click="$router.push('/agents/add')" type="primary"
              >添加智能体</el-button
            >
            <el-button @click="$router.push('/knowledge-graph')" type="success"
              >生成知识图谱</el-button
            >
            <el-button
              @click="$router.push('/knowledge-graph/nodes')"
              type="warning"
              >管理节点</el-button
            >
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";

const stats = reactive({
  agentsCount: 0,
  graphsCount: 0,
  nodesCount: 0,
});

const activities = reactive([
  {
    content: "生成了新的知识图谱",
    time: "2023-10-25 14:35",
    type: "success",
  },
  {
    content: '添加了新的智能体 "智能助手"',
    time: "2023-10-24 11:20",
    type: "primary",
  },
  {
    content: "编辑了知识图谱节点",
    time: "2023-10-23 16:45",
    type: "info",
  },
  {
    content: "系统更新完成",
    time: "2023-10-22 09:10",
    type: "warning",
  },
]);

const fetchDashboardData = async () => {
  // 这里应该从后端API获取数据
  // 这里使用模拟数据
  setTimeout(() => {
    stats.agentsCount = 5;
    stats.graphsCount = 3;
    stats.nodesCount = 127;
  }, 500);
};

onMounted(fetchDashboardData);
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.stat-card {
  height: 150px;
}

.chart-card {
  height: 350px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  text-align: center;
  color: #409eff;
  margin-top: 20px;
}

.activity-list {
  padding: 10px;
  height: 250px;
  overflow-y: auto;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
}
</style>
