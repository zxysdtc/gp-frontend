<template>
  <div class="knowledge-graph-container">
    <h2>知识图谱生成</h2>

    <el-card class="upload-container">
      <div class="upload-area">
        <el-upload
          class="pdf-uploader"
          drag
          action="#"
          :auto-upload="false"
          :http-request="handleGenerateGraph"
          accept=".pdf"
          :limit="1"
          :on-change="handleFileChange"
          :file-list="fileList"
        >
          <el-icon class="el-icon--upload"><el-icon-upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽PDF文件到此处，或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">仅支持PDF文件，单个文件最大 20MB</div>
          </template>
        </el-upload>

        <el-button
          type="primary"
          @click="submitUpload"
          :disabled="fileList.length === 0"
          :loading="loading"
        >
          生成知识图谱
        </el-button>
      </div>
    </el-card>

    <el-card v-if="knowledgeGraph.nodes.length > 0" class="graph-container">
      <h3>生成的知识图谱</h3>

      <div class="graph-stats">
        <el-tag type="success"
          >节点数: {{ knowledgeGraph.nodes.length }}</el-tag
        >
        <el-tag type="info">关系数: {{ knowledgeGraph.edges.length }}</el-tag>
      </div>

      <div ref="graphRef" class="graph-visualization"></div>

      <div class="graph-actions">
        <el-button
          type="primary"
          @click="$router.push('/knowledge-graph/nodes')"
          >管理节点</el-button
        >
        <el-button type="success" @click="downloadGraphData"
          >导出图谱数据</el-button
        >
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import {
  generateKnowledgeGraphFromPdf,
  type KnowledgeGraph,
} from "@/api/knowledgeGraph";
import type {
  UploadFile,
  UploadUserFile,
  UploadRequestOptions,
} from "element-plus";

const loading = ref(false);
const fileList = ref<UploadUserFile[]>([]);
const uploadRef = ref();
const graphRef = ref();

const knowledgeGraph = reactive<KnowledgeGraph>({
  nodes: [],
  edges: [],
});

const handleFileChange = (file: UploadFile) => {
  fileList.value = [file];
};

const submitUpload = () => {
  if (uploadRef.value) {
    uploadRef.value.submit();
  } else {
    handleGenerateGraph();
  }
};

const handleGenerateGraph = async (options?: UploadRequestOptions) => {
  if (!fileList.value.length && !options?.file) {
    ElMessage.warning("请先选择PDF文件");
    return;
  }

  loading.value = true;
  try {
    const file = (options?.file as File) || (fileList.value[0].raw as File);

    // 文件大小检查
    if (file.size > 20 * 1024 * 1024) {
      ElMessage.error("文件大小不能超过20MB");
      return;
    }

    const result = await generateKnowledgeGraphFromPdf(file);

    // 更新知识图谱数据
    knowledgeGraph.nodes = result.nodes;
    knowledgeGraph.edges = result.edges;

    ElMessage.success("知识图谱生成成功");

    // 在实际应用中，可以使用可视化库(如ECharts, D3.js等)渲染图谱
    renderGraph();
  } catch (error) {
    console.error("生成知识图谱失败:", error);
    ElMessage.error("生成知识图谱失败，请重试");
  } finally {
    loading.value = false;
  }
};

const renderGraph = () => {
  // 这里应该实现图谱的可视化渲染
  // 例如使用ECharts或D3.js等库
  // 这里只是一个示例，实际应用中需要根据具体的可视化库来实现
  console.log("渲染图谱", knowledgeGraph);
};

const downloadGraphData = () => {
  const dataStr = JSON.stringify(knowledgeGraph, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `knowledge-graph-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  link.click();

  URL.revokeObjectURL(url);
};
</script>

<style scoped>
.knowledge-graph-container {
  padding: 20px;
}

.upload-container {
  margin-bottom: 20px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.pdf-uploader {
  width: 100%;
  max-width: 500px;
  margin-bottom: 20px;
}

.graph-container {
  padding: 20px;
}

.graph-stats {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.graph-visualization {
  width: 100%;
  height: 500px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 14px;
}

.graph-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
</style>
