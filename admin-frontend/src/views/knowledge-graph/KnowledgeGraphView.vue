<template>
  <div class="knowledge-graph-container">
    <header class="kg-header">
      <h2>知识图谱</h2>
      <input
        type="search"
        placeholder="搜索知识点..."
        class="kg-search"
        v-model="searchQuery"
        @input="handleSearch"
      />
      <select
        v-model="selectedChapterKey"
        style="
          margin-left: 10px;
          margin-right: auto;
          width: 100px;
          height: 30px;
        "
        @change="handleChapterChange"
      >
        <option value="all">所有章节</option>
        <option v-for="i in 8" :key="i" :value="i">第{{ i }}章</option>
      </select>
      <div class="node-relation-count">
        当前展示：<span
          style="color: #4285f4; font-weight: bold; margin: 0 15px"
          >节点数: {{ nodeCount }}</span
        >
        |
        <span style="margin-left: 15px; color: #34a853; font-weight: bold"
          >关系数: {{ relationCount }}</span
        >
      </div>
    </header>
    <div class="kg-main">
      <div class="graph-visualization">
        <div ref="chart" style="width: 100%; height: 100%"></div>
        <div class="graph-controls">
          <button @click="handleZoomIn">放大</button>
          <button @click="handleZoomOut">缩小</button>
          <button @click="fitView">适应屏幕</button>
          <button @click="toggleFullscreen">全屏</button>
        </div>
      </div>
      <aside class="details-panel">
        <div class="tab-bar">
          <button
            :class="{ active: activeTab === 'details' }"
            @click="activeTab = 'details'"
          >
            详情
          </button>
          <button
            :class="{ active: activeTab === 'related' }"
            @click="activeTab = 'related'"
          >
            相关知识
          </button>
          <button
            :class="{ active: activeTab === 'resources' }"
            @click="activeTab = 'resources'"
          >
            学习资料
          </button>
        </div>
        <div class="details-panel-content">
          <div v-if="activeTab === 'details'">
            <div v-if="selectedNode">
              <h4>{{ selectedNode.title }}</h4>
              <p><strong>章节：</strong>{{ selectedNode.chapterKey }}</p>
              <p><strong>描述：</strong>{{ selectedNode.description }}</p>
              <p>
                <strong>难度：</strong
                >{{
                  "★".repeat(selectedNode.difficulty) +
                  "☆".repeat(5 - selectedNode.difficulty)
                }}
              </p>
              <p><strong>类型：</strong>{{ selectedNode.type }}</p>
              <div v-if="selectedNode.type === '算法'">
                <p>
                  <strong>时间复杂度：</strong
                  >{{ selectedNode.properties.时间复杂度 }}
                </p>
                <p>
                  <strong>空间复杂度：</strong
                  >{{ selectedNode.properties.空间复杂度 }}
                </p>
                <p>
                  <strong>设计思想：</strong
                  >{{ selectedNode.properties.设计思想 }}
                </p>
                <p>
                  <strong>适用场景：</strong
                  >{{ selectedNode.properties.适用场景 }}
                </p>
              </div>
              <div v-if="selectedNode.type === '数据结构'">
                <p>
                  <strong>核心特性：</strong
                  >{{ selectedNode.properties.核心特性 }}
                </p>
                <p>
                  <strong>存储开销：</strong
                  >{{ selectedNode.properties.存储开销 }}
                </p>
              </div>
            </div>
            <div v-else>
              <p>请在左侧选择一个知识点查看详情。</p>
            </div>
          </div>
          <div v-if="activeTab === 'related'">
            <h4>{{ selectedNode.title }}</h4>
            <div
              v-if="
                selectedNode && (selectedNode.inNodes || selectedNode.outNodes)
              "
            >
              <div
                v-if="selectedNode.inNodes && selectedNode.inNodes.length > 0"
              >
                <h6
                  style="
                    font-size: 14px;
                    font-weight: bold;
                    margin-top: 10px;
                    margin-bottom: 5px;
                    color: #666;
                  "
                >
                  入节点
                </h6>
                <ul style="margin-left: 20px">
                  <li
                    @click="handleRelatedNodeClick(related)"
                    @mouseenter="handleRelatedNodeHover(related, true)"
                    @mouseleave="handleRelatedNodeHover(related, false)"
                    v-for="related in selectedNode.inNodes"
                    :key="related.id"
                    style="margin-bottom: 5px; color: #333"
                  >
                    - {{ related.title }} ({{ related.relationType }})
                  </li>
                </ul>
              </div>
              <div
                v-if="selectedNode.outNodes && selectedNode.outNodes.length > 0"
              >
                <h6
                  style="
                    font-size: 14px;
                    font-weight: bold;
                    margin-top: 10px;
                    margin-bottom: 5px;
                    color: #666;
                  "
                >
                  出节点
                </h6>
                <ul style="margin-left: 20px">
                  <li
                    @click="handleRelatedNodeClick(related)"
                    @mouseenter="handleRelatedNodeHover(related, true)"
                    @mouseleave="handleRelatedNodeHover(related, false)"
                    v-for="related in selectedNode.outNodes"
                    :key="related.id"
                    style="margin-bottom: 5px; color: #333"
                  >
                    - {{ related.title }} ({{ related.relationType }})
                  </li>
                </ul>
              </div>
            </div>
            <p v-else>暂无相关知识点。</p>
          </div>

          <div v-if="activeTab === 'resources'">
            <h4>{{ selectedNode.title }}</h4>
            <div class="resources-container">
              <p
                v-if="
                  !normalResources &&
                  normalResources.length === 0 &&
                  !videoUrls &&
                  videoUrls.length === 0
                "
                class="resources-empty"
              >
                暂无学习资料，请上传相关文件
              </p>
              <div v-if="normalResources && normalResources.length > 0">
                <p class="resources-title">文档资料</p>
                <div v-for="file in normalResources" :key="file.id">
                  <a
                    target="_blank"
                    @click="openFileInNewWindow(file)"
                    class="file-link"
                    :title="file.fileName"
                    style="
                      display: inline-block;
                      max-width: 250px;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    "
                    >{{ file.fileName }}</a
                  >
                </div>
              </div>
              <div v-if="videoUrls && videoUrls.length > 0">
                <p class="resources-title">视频资料</p>
                <div v-for="videoUrl in videoUrls" :key="videoUrl">
                  <p
                    style="
                      margin-bottom: 10px;
                      font-size: 10px;
                      font-weight: bold;
                      color: #666;
                    "
                  >
                    {{ videoUrl.fileName }}
                  </p>
                  <video
                    :src="videoUrl.filePath"
                    controls
                    style="width: 100%; max-width: 250px; height: auto"
                  ></video>
                </div>
              </div>

              <div class="upload-action">
                <el-button
                  type="primary"
                  @click="showUploadDialog = true"
                  :disabled="!selectedNode"
                  class="upload-button"
                  icon="el-icon-upload2"
                >
                  上传学习资料
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
    <!-- <video :src="videoUrl" controls v-if="videoUrl"></video> -->

    <!-- 添加上传弹窗 -->
    <el-dialog
      v-model="showUploadDialog"
      title="上传学习资料"
      width="500px"
      :before-close="handleCloseUploadDialog"
    >
      <div class="upload-dialog-content">
        <p class="upload-tip">
          为 <strong>{{ selectedNode?.title }}</strong> 上传学习资料
        </p>

        <el-upload
          class="resource-uploader"
          drag
          action="#"
          :http-request="handleUploadRequest"
          accept=".pdf,.mp4,.docx,.doc"
          :on-change="handleFileChange"
          :file-list="fileList"
          :limit="5"
          multiple
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">拖拽文件至此处或 <em>点击上传</em></div>
          <div class="resource-uploader-tip">
            <div class="file-types">
              <span class="file-type pdf"
                ><i class="el-icon-document"></i> PDF</span
              >
              <span class="file-type video"
                ><i class="el-icon-video-camera"></i> MP4</span
              >
              <span class="file-type doc"
                ><i class="el-icon-document-copy"></i> DOC/DOCX</span
              >
            </div>
          </div>
        </el-upload>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseUploadDialog">取消</el-button>
          <el-button
            type="primary"
            @click="uploadResources"
            :disabled="!fileList || fileList.length === 0"
            :loading="uploading"
          >
            {{ uploading ? "上传中..." : "确认上传" }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts";
import apiClient from "@/api/http";
import { ElMessage } from "element-plus";
const chart = ref(null);
let myChart = null;
const selectedNode = ref(null);
const nodeSizeFactor = ref(1);
const fontSizeFactor = ref(1);
const edgeLengthFactor = ref(1);
const searchQuery = ref("");
const allNodes = ref([]);
const allLinks = ref([]);
const activeTab = ref("details");
const fileList = ref([]);
const resources = ref([]);
const normalResources = ref([]);
const videoResources = ref([]);
const videoUrl = ref("");
const videoUrls = ref([]);
const selectedChapterKey = ref("all");
const nodeCount = ref(0);
const relationCount = ref(0);
const showUploadDialog = ref(false);
const uploading = ref(false);

const handleUploadRequest = (options) => {
  console.log("上传学习资料handleUploadRequest", options.file);
  // 这里可以添加上传进度模拟
};

const handleFileChange = (file, uploadFileList) => {
  fileList.value = uploadFileList;
  console.log("上传学习资料handleFileChange", file, fileList.value);
  console.log("fileList.length", fileList.value.length);
};

const uploadResources = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning("请先选择文件");
    return;
  }

  if (!selectedNode.value) {
    ElMessage.warning("请先选择一个知识点");
    return;
  }

  uploading.value = true;
  const formData = new FormData();
  fileList.value.forEach((file) => {
    formData.append("files", file.raw);
  });

  formData.append("nodeId", selectedNode.value.id);
  try {
    console.log("上传学习资料uploadResources", formData);
    const response = await apiClient.post(
      `/graph/entities/${selectedNode.value.id}/uploadResources`,
      formData
    );
    if (response.status === 200) {
      ElMessage.success("文件上传成功");
      fileList.value = [];
      showUploadDialog.value = false;
      // 重新获取资源列表
      if (selectedNode.value) {
        fetchResources(selectedNode.value);
      }
    } else {
      ElMessage.error("文件上传失败");
    }
  } catch (error) {
    ElMessage.error("文件上传失败");
  } finally {
    uploading.value = false;
  }
};

// 获取知识图谱数据
const fetchGraphData = async () => {
  try {
    const response = await apiClient.get("/graph/entities/all", {
      params: {
        id: null,
        relationType: null,
      },
    });
    const processedData = processGraphData(response.data);
    allNodes.value = processedData.nodes;
    allLinks.value = processedData.links;
    return processedData;
  } catch (error) {
    console.error("获取知识图谱数据失败:", error);
    return { nodes: [], links: [] };
  }
};

// 转换Neo4j数据为ECharts格式
const processGraphData = (data) => {
  const nodeMap = new Map();
  const nodes = data.nodes
    .map((node) => {
      if (nodeMap.has(node.id)) {
        console.warn(`发现重复节点ID: ${node.id}`);
        return null;
      }
      nodeMap.set(node.id, true);

      const baseSize = 40 + (node.properties.difficulty || 0) * 5;
      return {
        id: node.id,
        name: node.name.replace(/['"]/g, ""),
        chapterKey: node.properties.ID.substring(0, 2),
        type: node.label[0],
        properties: node.properties,
        title: node.properties.name,
        description: node.properties.内容,
        difficulty: convertDifficulty(node.properties.难度),
        baseSize: baseSize,
        symbolSize: baseSize * nodeSizeFactor.value,
        itemStyle: {
          color: getNodeColor(node.label[0]),
        },
        baseFontSize: 12,
        label: {
          show: true,
          position: "inside",
          fontSize: 12 * fontSizeFactor.value,
          color: "#333",
          formatter: ({ name }) => name,
        },
      };
    })
    .filter(Boolean);

  const links = data.links.map((rel) => ({
    source: rel.source,
    target: rel.target,
    label: rel.type.replace(/['"]/g, ""),
    lineStyle: {
      color: rel.properties.必需性 === "是" ? "#FF6B6B" : "#A0A0A0",
      width: rel.properties.必需性 === "是" ? 2 : 1,
      curveness: 0.2 * edgeLengthFactor.value,
    },
  }));

  return { nodes, links };
};

// 新增难度转换函数
const convertDifficulty = (text) => {
  const levels = { 入门: 1, 中等: 3, 困难: 5 };
  return levels[text] || 1;
};

// 节点类型颜色映射
const getNodeColor = (type) => {
  const colors = {
    概念: "#5470C6",
    算法: "#91CC75",
    数据结构: "#FAC858",
  };
  return colors[type] || "#EE6666";
};

// 初始化图表
const initChart = async () => {
  if (!chart.value) return;

  myChart = echarts.init(chart.value);
  const { nodes, links } = await fetchGraphData();

  const option = {
    tooltip: {},
    series: [
      {
        type: "graph",
        roam: true,
        layout: "force",
        force: {
          repulsion: 200,
          edgeLength: 100,
        },
        draggable: true,
        data: nodes,
        links: links,
        label: {
          show: true,
          position: "inside",
          fontSize: 30,
          color: "#333",
          formatter: ({ name }) => name,
        },
        emphasis: {
          focus: "adjacency",
          label: {
            show: true,
            position: "right",
          },
        },
        edgeSymbol: ["none", "arrow"],
        edgeLabel: {
          show: true,
          formatter: ({ data }) => data.label,
          fontSize: 12,
          color: "#666",
          backgroundColor: "rgba(255,255,255,0.9)",
          padding: [4, 8],
          borderRadius: 4,
          distance: 15,
        },
      },
    ],
  };

  myChart.setOption(option);

  // 点击节点事件处理
  myChart.on("click", "series.graph", async (params) => {
    const node = params.data;
    console.log("点击节点", node);
    const inNodes = allLinks.value
      .filter((link) => link.target === node.id)
      .map((link) => {
        const relatedNode = allNodes.value.find((n) => n.id === link.source);
        if (!relatedNode) {
          console.warn(`未找到相关节点: ${link.source}`);
          return null;
        }
        return {
          id: relatedNode.id,
          title: relatedNode.title,
          relationType: link.label,
        };
      })
      .filter(Boolean);

    const outNodes = allLinks.value
      .filter((link) => link.source === node.id)
      .map((link) => {
        const relatedNode = allNodes.value.find((n) => n.id === link.target);
        if (!relatedNode) {
          console.warn(`未找到相关节点: ${link.target}`);
          return null;
        }
        return {
          id: relatedNode.id,
          title: relatedNode.title,
          relationType: link.label,
        };
      })
      .filter(Boolean);

    selectedNode.value = { ...node, inNodes, outNodes };

    // 获取与当前节点相关的文件
    fetchResources(node);
  });
};

// 获取资源列表
const fetchResources = async (node) => {
  try {
    const response = await apiClient.get(
      `/graph/entities/${node.id}/resources`
    );
    resources.value = response.data; // 假设返回的数据是一个文件列表
    videoResources.value = response.data.videoFile;
    normalResources.value = response.data.normalFile;
    fetchVideoResource();
  } catch (error) {
    console.error("获取文件失败:", error);
    resources.value = [];
  }
};

// 修改缩放方法
const handleZoomIn = () => {
  nodeSizeFactor.value *= 1.2;
  fontSizeFactor.value *= 1.2;
  edgeLengthFactor.value *= 1.2;
  updateAllSizes();
};

const handleZoomOut = () => {
  nodeSizeFactor.value *= 0.8;
  fontSizeFactor.value *= 0.8;
  edgeLengthFactor.value *= 0.8;
  updateAllSizes();
};

// 重写更新方法
const updateAllSizes = () => {
  if (myChart) {
    const option = myChart.getOption();

    // 更新节点尺寸和字体
    option.series[0].data = option.series[0].data.map((node) => ({
      ...node,
      symbolSize: node.baseSize * nodeSizeFactor.value,
      label: {
        ...node.label,
        fontSize: node.baseFontSize * fontSizeFactor.value,
      },
    }));

    // 更新边线配置
    option.series[0].force.edgeLength = 100 * edgeLengthFactor.value;
    option.series[0].links = option.series[0].links.map((link) => ({
      ...link,
      lineStyle: {
        ...link.lineStyle,
        curveness: 0.2 * edgeLengthFactor.value,
      },
    }));

    myChart.setOption({
      series: [
        {
          data: option.series[0].data,
          links: option.series[0].links,
          force: option.series[0].force,
        },
      ],
    });

    // 触发重新布局
    myChart.dispatchAction({ type: "forceLayout" });
  }
};

const fitView = () => {
  if (myChart) {
    myChart.dispatchAction({
      type: "legendScroll",
      scrollDataIndex: 0,
    });
    myChart.resize();
  }
};

const toggleFullscreen = () => {
  const element = chart.value.parentElement;
  if (!document.fullscreenElement) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

// 获取视频资源
const testfetchVideoResource = async () => {
  try {
    // 使用apiClient获取视频资源的blob
    const response = await apiClient.get("/files/video/test", {
      responseType: "blob",
    });
    // 创建一个本地Blob URL
    videoUrl.value = URL.createObjectURL(response.data);
  } catch (error) {
    console.error("获取视频资源失败:", error);
    videoUrl.value = "";
  }
};

const fetchVideoResource = async () => {
  try {
    videoUrls.value = [];
    console.log("获取视频资源fetchVideoResource", videoResources.value);
    if (videoResources.value && videoResources.value.length > 0) {
      videoResources.value.forEach(async (video) => {
        const response = await apiClient.get(`/files/video/${video.fileId}`, {
          responseType: "blob",
        });
        videoUrls.value.push({
          fileName: video.fileName.split(".").slice(0, -1).join("."),
          filePath: URL.createObjectURL(response.data),
        });
      });
    }
  } catch (error) {
    console.error("获取视频资源失败:", error);
    videoUrl.value = "";
  }
};

// 添加全屏状态监听
onMounted(() => {
  initChart();
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  // testfetchVideoResource(); // 加载视频资源
});

onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose();
    myChart = null;
  }
  document.removeEventListener("fullscreenchange", handleFullscreenChange);

  // 释放Blob URL以避免内存泄漏
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value);
  }
  if (videoResources.value) {
    videoResources.value.forEach((video) => {
      if (video.filePath) {
        URL.revokeObjectURL(video.filePath);
      }
    });
  }
});

const handleFullscreenChange = () => {
  if (document.fullscreenElement) {
    myChart.resize();
  }
};

// 处理搜索输入
const handleSearch = () => {
  if (!myChart) return;

  const filteredNodes = allNodes.value.filter((node) =>
    node.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );

  const filteredLinks = allLinks.value.filter((link) =>
    filteredNodes.some(
      (node) => node.id === link.source || node.id === link.target
    )
  );

  myChart.setOption({
    series: [
      {
        data: filteredNodes,
        links: filteredLinks,
      },
    ],
  });
};

// 新增相关知识点分组函数
const groupRelatedByType = (related) => {
  return related.reduce((groups, item) => {
    const type = item.relationType || "未分类";
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(item);
    return groups;
  }, {});
};

const openFileInNewWindow = (file) => {
  // 将 file.fileBlobString 转换为 Blob 对象
  const byteCharacters = atob(file.fileBlobString);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: file.fileType });

  // 创建 Blob URL
  const blobUrl = URL.createObjectURL(blob);

  // 在新页面中打开文件
  window.open(blobUrl, "_blank");
};

const handleChapterChange = () => {
  const nodes =
    selectedChapterKey.value === "all"
      ? allNodes.value
      : allNodes.value.filter(
          (node) => node.chapterKey == selectedChapterKey.value
        );

  const links = allLinks.value.filter((link) =>
    nodes.some((node) => node.id === link.source || node.id === link.target)
  );

  nodeCount.value = nodes.length;
  relationCount.value = links.length;

  myChart.setOption({
    series: [
      {
        data: nodes,
        links: links,
      },
    ],
  });
};

const handleRelatedNodeClick = (related) => {
  console.log("点击相关节点:", related);
  const node = allNodes.value.find((n) => n.id === related.id);
  if (node) {
    selectedNode.value = processRelatedNodes(node);
    myChart.dispatchAction({
      type: "focusNodeAdjacency",
      dataIndex: allNodes.value.findIndex((n) => n.id === node.id),
    });
  }
};

const handleRelatedNodeHover = (related, isHover) => {
  const node = allNodes.value.find((n) => n.id === related.id);
  if (node && myChart) {
    myChart.dispatchAction({
      type: isHover ? "highlight" : "downplay",
      seriesIndex: 0,
      dataIndex: allNodes.value.findIndex((n) => n.id === node.id),
    });
  }
};

const processRelatedNodes = (node) => {
  const inNodes = allLinks.value
    .filter((link) => link.target === node.id)
    .map((link) => {
      const relatedNode = allNodes.value.find((n) => n.id === link.source);
      if (!relatedNode) {
        console.warn(`未找到相关节点: ${link.source}`);
        return null;
      }
      return {
        id: relatedNode.id,
        title: relatedNode.title,
        relationType: link.label,
      };
    })
    .filter(Boolean);

  const outNodes = allLinks.value
    .filter((link) => link.source === node.id)
    .map((link) => {
      const relatedNode = allNodes.value.find((n) => n.id === link.target);
      if (!relatedNode) {
        console.warn(`未找到相关节点: ${link.target}`);
        return null;
      }
      return {
        id: relatedNode.id,
        title: relatedNode.title,
        relationType: link.label,
      };
    })
    .filter(Boolean);

  return { ...node, inNodes, outNodes };
};

const handleCloseUploadDialog = () => {
  showUploadDialog.value = false;
  fileList.value = [];
};
</script>

<style scoped>
.details-panel-content h4 {
  margin-bottom: 0px; /* 减少底部边距 */
  margin-top: 0; /* 移除顶部边距 */
}
.knowledge-graph-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px); /* 假设顶部导航栏高度为 56px */
  font-family: "SF Pro Text", "PingFang SC", sans-serif;
  padding: 20px;
  background-color: #f7f9fc;
}

.kg-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  flex-shrink: 0;
}

.kg-header h2 {
  font-family: "SF Pro Display", "PingFang SC", sans-serif;
  font-size: 20px;
  font-weight: bold;
  color: #1e293b;
  margin: 0 20px 0 0;
}

.kg-search {
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  width: 50%;
  margin-right: auto; /* 将视图切换按钮推到右边 */
}

.view-toggles button {
  margin-left: 10px;
  padding: 6px 12px;
  font-size: 13px;
  border: 1px solid #e0e0e0;
  background-color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
}
.view-toggles button:hover /* 或 .active */ {
  background-color: #e7f1fd;
  border-color: #4285f4;
  color: #4285f4;
}

.kg-main {
  display: flex;
  flex-grow: 1;
  gap: 20px;
  overflow: hidden; /* 防止内部元素溢出 */
}

.graph-visualization {
  flex: 3; /* 占 75% */
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  width: 100%;
  height: 100%;
  cursor: grab;
}

.graph-visualization:active {
  cursor: grabbing;
}

.graph-controls {
  position: absolute;
  bottom: 15px;
  left: 15px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.graph-controls button {
  margin: 0 3px;
  padding: 4px 8px;
  font-size: 12px;
  /* 图标化更好 */
}

.details-panel {
  flex: 1; /* 占 25% */
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.details-panel h3 {
  font-family: "SF Pro Display", "PingFang SC", sans-serif;
  font-size: 16px;
  font-weight: bold;
  color: #1e293b;
  margin-top: 0;
  margin-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}
.details-panel h4 {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 10px;
}
.details-panel p,
.details-panel li {
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
  color: #4285f4;
}
.details-panel li:hover {
  text-decoration: underline;
}

.start-learning-button {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
  background-color: #4285f4; /* 主色 */
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.start-learning-button:hover {
  background-color: #3367d6;
}

.details-panel > div > p {
  /* 未选择节点时的提示 */
  color: #9aa0a6;
  font-style: italic;
}

.tab-bar {
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.tab-bar button {
  flex: 1;
  padding: 10px;
  font-size: 14px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  color: #666;
  transition: color 0.3s ease, border-bottom 0.3s ease;
}

.tab-bar button.active {
  color: #4285f4;
  border-bottom: 2px solid #4285f4;
}

.tab-bar button:hover {
  color: #4285f4;
}

.details-panel-content {
  overflow-y: auto; /* 内容过多则滚动 */
  overflow-x: auto; /* 添加水平滚动 */
  flex-grow: 1;
  height: calc(100% - 45px); /* 减去tab-bar的高度 */
  word-break: normal; /* 防止文字强制断行 */
  white-space: nowrap; /* 对于纯文本内容保持在一行 */
}

/* 对详情面板内的内容容器设置最小宽度，确保有足够空间显示内容 */
.details-panel-content > div {
  min-width: min-content; /* 根据内容设置最小宽度 */
  white-space: normal; /* 恢复文本的正常换行 */
}

/* 对表格或其他可能溢出的元素应用特殊处理 */
.details-panel-content table,
.details-panel-content video,
.details-panel-content img {
  max-width: 100%;
  white-space: nowrap;
}

.upload-container {
  margin-bottom: 20px;
}

.upload-tip {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.upload-button {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
  background-color: #4caf50; /* 绿色背景 */
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.resources-container {
  padding: 0px 0;
}

.resources-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 2px;
  color: #333;
}

.resources-empty {
  color: #909399;
  text-align: center;
  padding: 20px 0;
  font-style: italic;
}

.resource-uploader {
  width: 100%;
}

.resource-uploader .el-upload {
  width: 100%;
}

.resource-uploader .el-upload-dragger {
  width: 100%;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  background-color: #f8fafc;
  transition: all 0.3s;
}

.resource-uploader .el-upload-dragger:hover {
  border-color: #409eff;
  background-color: #f1f7ff;
}

.resource-uploader .el-icon-upload {
  font-size: 40px;
  color: #c0c4cc;
  margin-bottom: 10px;
}

.resource-uploader .el-upload__text {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.resource-uploader .el-upload__text em {
  color: #409eff;
  font-style: normal;
  text-decoration: underline;
  cursor: pointer;
}

.resource-uploader-tip {
  margin-top: 8px;
  text-align: center;
}

.file-types {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.file-type {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
}

.file-type i {
  margin-right: 4px;
}

.file-type.pdf {
  background-color: #ffebee;
  color: #f44336;
}

.file-type.video {
  background-color: #e3f2fd;
  color: #2196f3;
}

.file-type.doc {
  background-color: #e8f5e9;
  color: #4caf50;
}

.upload-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  gap: 10px;
}

.upload-button {
  font-weight: 500;
}

/* 改进文件列表样式 */
:deep(.el-upload-list__item) {
  transition: all 0.3s;
}

:deep(.el-upload-list__item:hover) {
  background-color: #f5f7fa;
}

:deep(.el-upload-list__item-name) {
  color: #606266;
}

:deep(.el-upload-list__item .el-icon-close) {
  color: #909399;
  background-color: #f2f6fc;
}

.file-link {
  color: #8d949b; /* 链接颜色 */
  text-decoration: none; /* 去掉下划线 */
  cursor: pointer; /* 鼠标悬停时显示为手型 */
  transition: color 0.3s ease; /* 颜色过渡效果 */
}

.file-link:hover {
  color: #85888c; /* 鼠标悬停时的颜色 */
  text-decoration: underline; /* 鼠标悬停时显示下划线 */
}

.node-relation-count {
  margin-left: 10px; /* 与搜索框保持一定距离 */
  padding: 0px 10px;
  font-size: 14px;
  color: #333;
  display: inline-block; /* 确保与搜索框在同一行 */
  vertical-align: middle; /* 垂直居中 */
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #ffffff;
  height: 30px;
  line-height: 30px;
  text-align: center;
  width: 27%;
}

.generate-questions-button {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
  background-color: #4caf50; /* 绿色背景 */
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.generate-questions-button:hover {
  background-color: #45a049; /* 鼠标悬停时的背景色 */
}

.upload-dialog-content {
  padding: 20px 0;
}

.upload-tip {
  margin-bottom: 20px;
  font-size: 14px;
  color: #606266;
  text-align: center;
}

.upload-tip strong {
  color: #409eff;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 弹窗内的上传组件样式调整 */
.el-dialog .resource-uploader {
  width: 100%;
}

.el-dialog .resource-uploader .el-upload-dragger {
  width: 100%;
  height: 160px;
}
</style>
