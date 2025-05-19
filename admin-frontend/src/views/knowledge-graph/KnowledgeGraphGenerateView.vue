<template>
  <div class="knowledge-graph-container">
    <h2>知识图谱生成</h2>

    <!-- 步骤1：章节数量设置 -->
    <el-card v-if="currentStep === 1" class="chapter-setup-container">
      <div class="chapter-setup-area">
        <h3>设置章节数量</h3>
        <el-form :model="chapterForm" label-width="120px">
          <el-form-item label="章节数量">
            <el-input-number 
              v-model="chapterForm.chapterCount" 
              :min="1" 
              :max="20"
              @change="handleChapterCountChange"
            />
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="goToNextStep">下一步</el-button>
      </div>
    </el-card>

    <!-- 步骤2：上传PDF并设置页码 -->
    <el-card v-if="currentStep === 2" class="upload-container">
      <div class="upload-flex-container">
        <div class="upload-area">
          <el-upload
            class="pdf-uploader"
            drag
            action="#"
            :auto-upload="false"
            :on-exceed="handleExceed"
            :http-request="handleUploadRequest"
            accept=".pdf"
            :limit="1"
            :on-change="handleFileChange"
            :file-list="fileList"
          >
            <el-icon class="el-icon--upload"><el-icon-upload-filled /></el-icon>
            <div class="el-upload__text">
              <div class="upload-hint">拖拽PDF文件到此处，或 <em>点击上传</em></div>
            </div>
            <template #tip>
              <div class="el-upload__tip">仅支持上传一个pdf文件</div>
            </template>
          </el-upload>
        </div>

        <div class="chapters-setup-area">
          <h3>设置章节页码范围</h3>
          <el-form :model="chapterForm" label-width="100px">
            <el-form-item 
              v-for="(chapter, index) in chapterForm.chapters" 
              :key="index" 
              :label="`第 ${index + 1} 章`"
            >
              <div class="page-range-input">
                <el-input-number 
                  v-model="chapter.startPage" 
                  :min="1" 
                  placeholder="起始页"
                  size="small"
                />
                <span class="page-range-separator">至</span>
                <el-input-number 
                  v-model="chapter.endPage" 
                  :min="chapter.startPage || 1" 
                  placeholder="结束页"
                  size="small"
                />
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <div class="action-buttons">
        <el-button @click="goToPreviousStep">返回</el-button>
        <el-button
          type="primary"
          @click="submitUpload"
          :disabled="fileList.length === 0 || !isChapterSetupValid"
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
import { ref, reactive, computed } from "vue";
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
import axios from "axios";

const currentStep = ref(1); // 当前步骤：1=设置章节数量，2=上传PDF和设置页码
const loading = ref(false);
const fileList = ref<UploadUserFile[]>([]);
const uploadRef = ref();
const graphRef = ref();

// 服务器地址
const API_URL = "http://localhost:5000/process";

// 章节相关表单
const chapterForm = reactive({
  chapterCount: 1,
  chapters: [{ startPage: 1, endPage: null }]
});

// 处理超出上传限制
const handleExceed = () => {
  ElMessage.warning("只能上传一个PDF文件");
};

// 更新章节数量
const handleChapterCountChange = (value: number) => {
  // 保留现有章节的页码设置
  const existingChapters = [...chapterForm.chapters];
  
  chapterForm.chapters = Array(value).fill(0).map((_, index) => {
    if (index < existingChapters.length) {
      return existingChapters[index];
    }
    return { startPage: null, endPage: null };
  });
};

// 检查章节设置是否有效
const isChapterSetupValid = computed(() => {
  return chapterForm.chapters.every(chapter => 
    chapter.startPage && chapter.endPage && chapter.startPage <= chapter.endPage
  );
});

// 步骤控制
const goToNextStep = () => {
  if (currentStep.value === 1) {
    if (chapterForm.chapterCount < 1) {
      ElMessage.warning("请设置至少一个章节");
      return;
    }
    currentStep.value = 2;
  }
};

const goToPreviousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

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
    handleUploadRequest();
  }
};

// 处理上传请求
const handleUploadRequest = async (options?: UploadRequestOptions) => {
  if (!fileList.value.length && !options?.file) {
    ElMessage.warning("请先选择PDF文件");
    return;
  }

  if (!isChapterSetupValid.value) {
    ElMessage.warning("请正确设置所有章节的页码范围");
    return;
  }

  loading.value = true;
  try {
    const file = (options?.file as File) || (fileList.value[0].raw as File);

    // 文件大小检查
    if (file.size > 20 * 1024 * 1024) {
      ElMessage.error("文件大小不能超过20MB");
      loading.value = false;
      return;
    }

    // 从章节信息生成页码数组，只包含起始页和结束页
    const pages = chapterForm.chapters.map(chapter => [chapter.startPage, chapter.endPage]);

    // 创建FormData对象，遵循图片中的格式
    const formData = new FormData();
    formData.append("file", file);
    formData.append("params", JSON.stringify({ pages }));

    // 使用axios发送POST请求
    const response = await axios.post(API_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // 处理响应数据
    const result = response.data;

    // 更新知识图谱数据
    knowledgeGraph.nodes = result.nodes || [];
    knowledgeGraph.edges = result.edges || [];

    ElMessage.success("知识图谱生成成功");

    // 渲染图谱
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

.chapter-setup-container,
.upload-container {
  margin-bottom: 20px;
}

.chapter-setup-area {
  display: flex;
  flex-direction: column;
  padding: 20px;
  align-items: center;
}

.upload-flex-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  margin-bottom: 20px;
}

.upload-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 40%;
}

.chapters-setup-area {
  flex: 1;
  padding: 20px;
  border-left: 1px solid #ebeef5;
}

.pdf-uploader {
  width: 100%;
  max-width: 500px;
  margin-bottom: 20px;
}

.page-range-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-range-separator {
  color: #909399;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
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

.file-name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
  color: #606266;
}

.upload-title {
  margin-bottom: 15px;
  font-weight: 500;
}

.upload-hint {
  margin-top: 5px;
}

.el-upload__text {
  margin-top: -10px;
  padding-top: 0;
}

.el-icon--upload {
  margin-bottom: 5px;
}
</style>
