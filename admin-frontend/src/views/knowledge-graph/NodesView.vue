<template>
  <div class="nodes-container">
    <h2>知识图谱节点管理</h2>

    <div class="nodes-header">
      <el-button type="primary" @click="openNodeDialog()">添加节点</el-button>

      <el-input
        v-model="searchQuery"
        placeholder="搜索节点"
        clearable
        class="search-input"
        @input="filterNodes"
      >
        <template #prefix>
          <el-icon><el-icon-search /></el-icon>
        </template>
      </el-input>
    </div>

    <el-card class="node-list">
      <el-table :data="filteredNodes" border v-loading="loading">
        <el-table-column prop="label" label="标签" />

        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag>{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="属性">
          <template #default="scope">
            <div v-if="Object.keys(scope.row.properties).length">
              <el-tooltip
                v-for="(value, key) in scope.row.properties"
                :key="key"
                :content="`${key}: ${value}`"
              >
                <el-tag size="small" type="info" class="property-tag">
                  {{ key }}:
                  {{
                    typeof value === "string"
                      ? value.length > 10
                        ? value.substring(0, 10) + "..."
                        : value
                      : value
                  }}
                </el-tag>
              </el-tooltip>
            </div>
            <span v-else>无</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button-group>
              <el-button
                size="small"
                type="primary"
                @click="openNodeDialog(scope.row)"
                >编辑</el-button
              >
              <el-button
                size="small"
                type="danger"
                @click="handleDeleteNode(scope.row)"
                >删除</el-button
              >
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑节点对话框 -->
    <el-dialog
      v-model="nodeDialogVisible"
      :title="currentNode.id ? '编辑节点' : '添加节点'"
      width="600px"
    >
      <el-form
        :model="currentNode"
        :rules="nodeRules"
        ref="nodeFormRef"
        label-width="80px"
      >
        <el-form-item label="标签" prop="label">
          <el-input v-model="currentNode.label" />
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-select v-model="currentNode.type" placeholder="选择节点类型">
            <el-option label="概念" value="concept" />
            <el-option label="实体" value="entity" />
            <el-option label="属性" value="attribute" />
          </el-select>
        </el-form-item>

        <el-divider>属性</el-divider>

        <div
          v-for="(value, key) in currentNode.properties"
          :key="key"
          class="property-item"
        >
          <el-input
            v-model="propertyKeys[key]"
            placeholder="属性名"
            class="property-key"
          />
          <el-input
            v-model="currentNode.properties[key]"
            placeholder="属性值"
            class="property-value"
          />
          <el-button
            type="danger"
            icon="el-icon-delete"
            circle
            @click="removeProperty(key)"
          />
        </div>

        <div class="add-property">
          <el-button type="primary" icon="el-icon-plus" @click="addProperty"
            >添加属性</el-button
          >
        </div>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="nodeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveNode" :loading="saveLoading"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getKnowledgeGraphs,
  createNode,
  updateNode,
  deleteNode,
  type KnowledgeGraphNode,
} from "@/api/knowledgeGraph";
import type { FormInstance, FormRules } from "element-plus";

const nodes = ref<KnowledgeGraphNode[]>([]);
const filteredNodes = ref<KnowledgeGraphNode[]>([]);
const loading = ref(true);
const saveLoading = ref(false);
const searchQuery = ref("");
const nodeDialogVisible = ref(false);
const nodeFormRef = ref<FormInstance>();

const currentNode = reactive<KnowledgeGraphNode>({
  label: "",
  type: "concept",
  properties: {},
});

const propertyKeys = reactive<Record<string, string>>({});

const nodeRules: FormRules = {
  label: [{ required: true, message: "请输入节点标签", trigger: "blur" }],
  type: [{ required: true, message: "请选择节点类型", trigger: "change" }],
};

// 监听搜索查询变化
watch(searchQuery, () => {
  filterNodes();
});

const filterNodes = () => {
  if (!searchQuery.value) {
    filteredNodes.value = nodes.value;
    return;
  }

  const query = searchQuery.value.toLowerCase();
  filteredNodes.value = nodes.value.filter(
    (node) =>
      node.label.toLowerCase().includes(query) ||
      node.type.toLowerCase().includes(query) ||
      Object.entries(node.properties).some(
        ([key, value]) =>
          key.toLowerCase().includes(query) ||
          String(value).toLowerCase().includes(query)
      )
  );
};

const fetchNodes = async () => {
  loading.value = true;
  try {
    // 这里假设我们使用getKnowledgeGraphs API获取所有图谱数据
    // 在实际应用中，应该有专门的API来获取节点
    const graphs = await getKnowledgeGraphs();
    if (graphs && graphs.length > 0) {
      // 取第一个图谱的节点
      nodes.value = graphs[0].nodes || [];
      filteredNodes.value = [...nodes.value];
    }
  } catch (error) {
    console.error("获取节点数据失败:", error);
    ElMessage.error("获取节点数据失败");
  } finally {
    loading.value = false;
  }
};

const openNodeDialog = (node?: KnowledgeGraphNode) => {
  if (node) {
    // 编辑模式
    Object.assign(currentNode, JSON.parse(JSON.stringify(node)));
    // 初始化属性键
    Object.keys(currentNode.properties).forEach((key) => {
      propertyKeys[key] = key;
    });
  } else {
    // 添加模式
    Object.assign(currentNode, {
      label: "",
      type: "concept",
      properties: {},
    });
    Object.keys(propertyKeys).forEach((key) => delete propertyKeys[key]);
  }

  nodeDialogVisible.value = true;
};

const addProperty = () => {
  const newKey = `property_${Object.keys(currentNode.properties).length + 1}`;
  currentNode.properties[newKey] = "";
  propertyKeys[newKey] = "";
};

const removeProperty = (key: string) => {
  delete currentNode.properties[key];
  delete propertyKeys[key];
  // 强制更新视图
  currentNode.properties = { ...currentNode.properties };
};

const saveNode = async () => {
  if (!nodeFormRef.value) return;

  await nodeFormRef.value.validate(async (valid) => {
    if (valid) {
      saveLoading.value = true;

      try {
        // 处理属性键重命名
        const newProperties: Record<string, any> = {};
        Object.keys(currentNode.properties).forEach((oldKey) => {
          const newKey = propertyKeys[oldKey] || oldKey;
          newProperties[newKey] = currentNode.properties[oldKey];
        });

        currentNode.properties = newProperties;

        if (currentNode.id) {
          // 更新节点
          await updateNode(currentNode.id, currentNode);

          // 更新本地数据
          const index = nodes.value.findIndex((n) => n.id === currentNode.id);
          if (index !== -1) {
            nodes.value[index] = { ...currentNode };
          }

          ElMessage.success("节点更新成功");
        } else {
          // 创建节点
          const newNode = await createNode(currentNode);

          // 添加到本地数据
          nodes.value.push(newNode);

          ElMessage.success("节点添加成功");
        }

        nodeDialogVisible.value = false;
        filterNodes(); // 更新过滤后的列表
      } catch (error) {
        console.error("保存节点失败:", error);
        ElMessage.error("保存失败，请重试");
      } finally {
        saveLoading.value = false;
      }
    }
  });
};

const handleDeleteNode = async (node: KnowledgeGraphNode) => {
  if (!node.id) return;

  try {
    await ElMessageBox.confirm(`确认删除节点 "${node.label}"?`, "确认删除", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning",
    });

    await deleteNode(node.id);

    // 更新本地数据
    nodes.value = nodes.value.filter((n) => n.id !== node.id);
    filterNodes(); // 更新过滤后的列表

    ElMessage.success("节点删除成功");
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除节点失败:", error);
      ElMessage.error("删除失败，请重试");
    }
  }
};

onMounted(fetchNodes);
</script>

<style scoped>
.nodes-container {
  padding: 20px;
}

.nodes-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.node-list {
  margin-bottom: 20px;
}

.property-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.property-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.property-key {
  flex: 2;
  margin-right: 10px;
}

.property-value {
  flex: 3;
  margin-right: 10px;
}

.add-property {
  margin-top: 10px;
}
</style>
