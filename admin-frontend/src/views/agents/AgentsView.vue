<template>
  <div class="agents-container">
    <div class="agents-header">
      <h2>智能体列表</h2>
      <el-button type="primary" @click="$router.push('/agents/add')"
        >添加智能体</el-button
      >
    </div>

    <el-table :data="agents" v-loading="loading" border>
      <el-table-column label="头像" width="100">
        <template #default="scope">
          <el-avatar :src="scope.row.avatar" :size="40"></el-avatar>
        </template>
      </el-table-column>

      <el-table-column prop="name" label="名称" />

      <el-table-column prop="description" label="描述">
        <template #default="scope">
          <div class="description-cell">{{ scope.row.description }}</div>
        </template>
      </el-table-column>

      <el-table-column prop="url" label="网址">
        <template #default="scope">
          <el-link type="primary" :href="scope.row.url" target="_blank">{{
            scope.row.url
          }}</el-link>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button-group>
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
              >删除</el-button
            >
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { getAgents, deleteAgent, type Agent } from "@/api/agents";

const agents = ref<Agent[]>([]);
const loading = ref(true);

const fetchAgents = async () => {
  loading.value = true;
  try {
    agents.value = await getAgents();
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    ElMessage.error("获取智能体列表失败");
  } finally {
    loading.value = false;
  }
};

const handleEdit = (agent: Agent) => {
  // 在实际应用中，可以跳转到编辑页面
  console.log("Edit agent:", agent);
};

const handleDelete = async (agent: Agent) => {
  if (!agent.id) return;

  try {
    await ElMessageBox.confirm(`确认删除智能体 "${agent.name}"?`, "确认删除", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning",
    });

    await deleteAgent(agent.id);
    ElMessage.success("删除成功");
    await fetchAgents();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Failed to delete agent:", error);
      ElMessage.error("删除失败");
    }
  }
};

onMounted(fetchAgents);
</script>

<style scoped>
.agents-container {
  padding: 20px;
}

.agents-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.description-cell {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
