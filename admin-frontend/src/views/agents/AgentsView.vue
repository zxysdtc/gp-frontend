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
          <el-avatar
            :src="getAvatarSrc(scope.row.avatar)"
            :size="40"
          ></el-avatar>
        </template>
      </el-table-column>

      <el-table-column prop="name" label="名称" />

      <el-table-column prop="description" label="描述">
        <template #default="scope">
          <div class="description-cell">{{ scope.row.description }}</div>
        </template>
      </el-table-column>

      <el-table-column prop="apiKey" label="apiKey">
        <template #default="scope">
          <el-link type="primary" :href="scope.row.apiKey" target="_blank">{{
            scope.row.apiKey
          }}</el-link>
        </template>
      </el-table-column>

      <el-table-column prop="enabled" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.enabled ? 'success' : 'info'">
            {{ scope.row.enabled ? "已启用" : "已禁用" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="250">
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
            <el-button
              size="small"
              :type="scope.row.enabled ? 'warning' : 'success'"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.enabled ? "禁用" : "启用" }}
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑智能体对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑智能体"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action=""
            :show-file-list="false"
            :on-change="handleAvatarChange"
            :auto-upload="false"
          >
            <el-avatar
              v-if="editForm.avatarBase64"
              :src="getAvatarSrc(editForm.avatarBase64)"
              :size="100"
            />
            <con v-else class="avatar-uploader-icon"><Plus /></con>
          </el-upload>
        </el-form-item>
        <el-form-item label="名称">
          <el-input
            v-model="editForm.name"
            placeholder="请输入智能体名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入智能体描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="API Key">
          <el-input
            v-model="editForm.apiKey"
            placeholder="请输入API Key"
          ></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="editForm.enabled"
            :active-text="editForm.enabled ? '启用' : '禁用'"
            :inactive-text="editForm.enabled ? '启用' : '禁用'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="editLoading"
            >确认</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import {
  ElMessageBox,
  ElMessage,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSwitch,
  ElTag,
} from "element-plus";
import { getAgents, deleteAgent, updateAgent, type Agent } from "@/api/agents";
import { Plus } from "@element-plus/icons-vue";

const agents = ref<Agent[]>([]);
const loading = ref(true);

const editDialogVisible = ref(false);
const editForm = reactive({
  id: 0,
  name: "",
  description: "",
  apiKey: "",
  avatarBase64: "",
  enabled: false,
});
const editLoading = ref(false);

const fetchAgents = async () => {
  loading.value = true;
  try {
    const response = await getAgents();
    // 处理接收到的数据
    agents.value = response.data.map((agent: any) => ({
      ...agent,
      // 确保头像字段名称一致
      avatar: agent.avatar || agent.avatarBase64 || "",
    }));
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    ElMessage.error("获取智能体列表失败");
  } finally {
    loading.value = false;
  }
};

const handleEdit = (agent: Agent) => {
  editForm.id = agent.id;
  editForm.name = agent.name;
  editForm.description = agent.description;
  editForm.apiKey = agent.apiKey;
  editForm.avatarBase64 = agent.avatar; // 使用avatar字段
  editForm.enabled = agent.enabled;
  editDialogVisible.value = true;
};

const handleAvatarChange = (file: any) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    console.log("头像base64：", result);
    // 提取Base64部分，去掉MIME前缀
    if (typeof result === "string" && result.includes("base64,")) {
      editForm.avatarBase64 = result.split("base64,")[1];
    } else {
      editForm.avatarBase64 = result;
    }
  };
  reader.readAsDataURL(file.raw);
};

// 定义本地接口以适应实际需求
interface UpdateAgentPayload {
  name: string;
  description: string;
  apiKey: string;
  avatar: string; // 只使用字符串类型，不再使用File类型
  enabled: boolean;
}

const submitEdit = async () => {
  editLoading.value = true;
  try {
    // 构建基本请求体
    const updateRequest: UpdateAgentPayload = {
      name: editForm.name,
      description: editForm.description,
      apiKey: editForm.apiKey,
      avatar: "", // 默认为空字符串
      enabled: editForm.enabled,
    };

    // 处理头像数据 - 始终使用Base64字符串
    if (editForm.avatarBase64) {
      // 确保avatarBase64没有MIME前缀
      updateRequest.avatar = editForm.avatarBase64.startsWith("data:")
        ? editForm.avatarBase64.split("base64,")[1]
        : editForm.avatarBase64;
    }

    await updateAgent(editForm.id, updateRequest as any);
    ElMessage.success("智能体更新成功");
    editDialogVisible.value = false;
    await fetchAgents();
  } catch (error) {
    console.error("Failed to update agent:", error);
    ElMessage.error("更新智能体失败");
  } finally {
    editLoading.value = false;
  }
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

const handleToggleStatus = async (agent: Agent) => {
  try {
    const statusText = agent.enabled ? "禁用" : "启用";
    await ElMessageBox.confirm(
      `确认${statusText}智能体 "${agent.name}"?`,
      `确认${statusText}`,
      {
        confirmButtonText: statusText,
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    const updateRequest: UpdateAgentPayload = {
      name: agent.name,
      description: agent.description,
      apiKey: agent.apiKey,
      // 正确处理头像数据
      avatar:
        agent.avatar && agent.avatar.startsWith("data:")
          ? agent.avatar.split("base64,")[1]
          : agent.avatar || "",
      enabled: !agent.enabled,
    };

    await updateAgent(agent.id, updateRequest as any);
    ElMessage.success(`${statusText}成功`);
    await fetchAgents();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Failed to toggle agent status:", error);
      ElMessage.error("操作失败");
    }
  }
};

const getAvatarSrc = (avatarData: string) => {
  if (!avatarData) return "";

  // 如果已经是完整的data URL，则直接返回
  if (avatarData.startsWith("data:")) {
    return avatarData;
  }

  // 否则添加前缀
  return `data:image/png;base64,${avatarData}`;
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
