<template>
  <div class="resources-view">
    <div class="search-container">
      <div class="search-wrapper">
        <el-input
          v-model="searchQuery"
          placeholder="搜索学习资源..."
          class="search-input"
          @keyup.enter="handleSearch"
          :disabled="loading"
        >
          <template #append>
            <el-button @click="handleSearch" :loading="loading">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
      
      <!-- 搜索提示 -->
      <div class="search-tips" v-if="!isSearched">
        <el-empty description="输入关键词开始搜索学习资源">
          <template #description>
            <div>
              <p>输入关键词开始搜索学习资源</p>
              <p class="search-examples">示例：数据结构、数组、链表、算法复杂度...</p>
            </div>
          </template>
        </el-empty>
      </div>
    </div>

    <div v-if="isSearched" class="content-container">
      <!-- 将内容区域分为左右两栏 -->
      <div class="two-column-layout">
        <!-- 左侧资源列表 -->
        <div v-if="!isFullscreen" class="resources-column">
          <h3>相关资源</h3>
          
          <el-card
            v-for="(resource, index) in videoResources"
            :key="index"
            class="resource-card"
          >
            <div class="resource-content">
              <div class="resource-type">
                <el-icon v-if="resource.type === 'video'">
                  <VideoCamera />
                </el-icon>
              </div>
              <div class="resource-info">
                <h4>{{ resource.title }}</h4>
              </div>
              <el-button type="primary" @click="handleView(resource)">
                查看
              </el-button>
            </div>
          </el-card>

          <el-empty
            v-if="resources.length === 0"
            description="未找到相关资源"
          />
        </div>

        <!-- 右侧知识图谱和解析说明 -->
        <div class="right-column" :class="{ 'fullscreen-mode': isFullscreen }">
          <!-- 知识图谱区域 -->
          <div class="knowledge-graph-container">
            <div class="echarts-header">
              <h3>知识图谱</h3>
              <div class="echarts-actions">
                <el-button size="small" @click="toggleFullscreen">
                  <el-icon v-if="!isFullscreen"><FullScreen /></el-icon>
                  <el-icon v-else><Aim /></el-icon>
                  {{ isFullscreen ? '退出全屏' : '全屏显示' }}
                </el-button>
              </div>
            </div>
            <div class="echarts-wrapper" :class="{ 'fullscreen': isFullscreen }">
              <div ref="chart" class="chart"></div>
            </div>
          </div>

          <!-- 解析说明区域 -->
          <div v-if="!isFullscreen" class="answer-container">
            <h3>解析说明</h3>
            <div class="answer-content" v-if="answer">
              <p>{{ answer }}</p>
            </div>
            <el-empty v-else description="暂无解析说明" />
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <el-spin class="loading-spinner" />
      <p>正在分析您的查询，构建知识图谱中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { Search, VideoCamera, Document, FullScreen, Aim, Link } from "@element-plus/icons-vue";
import * as echarts from "echarts";
import apiClient from "@/api/axios";

const searchQuery = ref("");
const nodesLinks = ref([]);
const resources = ref([]);
const isSearched = ref(false);
const chart = ref(null);
const answer = ref("");
const loading = ref(false);
const isFullscreen = ref(false);
let myChart = null;

// 资源
const videoResources = ref([]);

// 获取资源类型显示文本
const getResourceTypeText = (type) => {
  const typeMap = {
    'video': '视频',
    'document': '文档',
    'article': '文章',
    'website': '网站',
    'book': '书籍'
  };
  return typeMap[type] || type;
};

const handleSearch = async () => {
  if (!searchQuery.value.trim() || loading.value) return;

  try {
    loading.value = true;
    
    // 清空之前的结果
    nodesLinks.value = [];
    answer.value = "";
    
    // 设置已搜索状态
    isSearched.value = true;
    
    // 发起请求
    const response = await apiClient.post("/agent/workflow", {
      inputs: {
        query: searchQuery.value,
      },
      scenery: "KNOWLEDGE_GRAPH",
    });
    
    // 处理响应数据
    try {
      console.log('response', response.data.data.outputs)
      const testData = response.data.data.outputs.test;
      if (typeof testData === 'string') {
        nodesLinks.value = JSON.parse(testData)[0].result;
      } else {
        nodesLinks.value = testData;
      }
    } catch (parseError) {
      console.error("解析资源数据失败:", parseError);
      nodesLinks.value = [];
    }
    
    answer.value = response.data.data.outputs.answer || "";
    console.log('answer', answer.value)
    console.log('nodes', nodesLinks.value)
    const nodeIds = nodesLinks.value.nodes.map(node => node.id);
    console.log('nodeIds', nodeIds)
    const resourcesResponse = await apiClient.get("/graph/entities/resources", {
      params: {
        nodeIds: nodeIds.join(',')
      },
      paramsSerializer: params => {
        return Object.keys(params)
          .map(key => `${key}=${params[key]}`)
          .join('&');
      }
    });
    
    // 处理返回的视频资源
    videoResources.value = resourcesResponse.data.videoFile.map(video => ({
      id: video.fileId,
      title: video.fileName,
      type: 'video',
      description: '视频资源',
      url: video.filePath || '#' // 如果 filePath 为 null，使用 '#' 作为占位符
    }));
    
    console.log("搜索到的数据:", videoResources.value);

    // 等待DOM更新后初始化图表
    await nextTick();
    
    // 提取 result 字段并传递给 initChart
    if (nodesLinks.value) {
      initChart(nodesLinks.value);
    } else {
      console.error("数据格式不符合预期:", nodesLinks.value);
    }
  } catch (error) {
    console.error("搜索资源失败:", error);
    nodesLinks.value = [];
    // 显示错误提示
    answer.value = `搜索失败: ${error.message || '未知错误'}`;
  } finally {
    loading.value = false;
  }
};

const handleView = (resource) => {
  if (resource.url) {
    window.open(resource.url, "_blank");
  } else {
    // 处理没有URL的资源
    console.log("该资源没有可访问的URL:", resource);
    // 可以显示一个提示
    ElMessage({
      message: '该资源暂无可访问链接',
      type: 'warning'
    });
  }
};

// 切换全屏模式
const toggleFullscreen = async () => {
  // 保存当前滚动位置和布局状态
  if (!isFullscreen.value) {
    // 进入全屏前保存滚动位置
    window._savedScrollPosition = window.scrollY || document.documentElement.scrollTop;
  }
  
  isFullscreen.value = !isFullscreen.value;
  
  // 等待DOM更新后重新调整图表大小
  await nextTick();
  
  if (myChart && !myChart.isDisposed()) {
    myChart.resize();
    console.log("图表大小已调整");
  }
  
  // 恢复滚动位置
  if (!isFullscreen.value && window._savedScrollPosition !== undefined) {
    // 延迟执行，确保DOM已更新
    setTimeout(() => {
      window.scrollTo({
        top: window._savedScrollPosition,
        behavior: 'auto'
      });
    }, 50);
  }
};

const initChart = (data) => {
  if (!chart.value) {
    console.warn("图表容器未找到，尝试延迟初始化");
    // 如果没有找到容器，可能是因为DOM还没有完全渲染，可以尝试延迟初始化
    setTimeout(() => {
      if (chart.value) {
        initChart(data);
      } else {
        console.error("图表容器仍未找到，放弃初始化");
      }
    }, 300);
    return;
  }

  console.log("图表容器已找到，开始初始化图表");

  // 确保清除旧图表实例
  if (myChart) {
    myChart.dispose();
  }
  
  try {
    myChart = echarts.init(chart.value);
    
    // 如果数据为空或无效，显示提示
    if (!data || !data.nodes || !data.links || data.nodes.length === 0) {
      console.error("图表数据无效:", data);
      myChart.setOption({
        title: {
          text: "没有可显示的知识图谱数据",
          left: "center",
          top: "center",
          textStyle: { fontSize: 14 },
        },
      });
      return;
    }

    // 数据验证和预处理，确保节点有唯一标识
    const uniqueIds = new Set();
    const uniqueNames = new Set();

    const processedNodes = data.nodes
      .filter(node => node && (node.id !== undefined && node.id !== null) && node.name) // 过滤无效节点
      .map((node, index) => {
        // 确保ID唯一
        let nodeId = node.id !== undefined ? node.id.toString() : `node_${index}`;
        while (uniqueIds.has(nodeId)) {
          nodeId = `${nodeId}_${index}`;
        }
        uniqueIds.add(nodeId);

        // 确保名称唯一
        let nodeName = node.name || `节点_${index}`;
        while (uniqueNames.has(nodeName)) {
          nodeName = `${nodeName}_${index}`;
        }
        uniqueNames.add(nodeName);

        return {
          ...node,
          id: nodeId,
          name: nodeName,
          symbolSize: 45,
          itemStyle: {
            color: node.label === "数据结构" ? "#91cc75" : "#5470c6",
          },
        };
      });

    // 创建节点ID集合，用于验证链接
    const nodeIds = new Set(processedNodes.map(node => node.id));

    // 处理链接数据，确保source和target使用正确的ID引用
    const processedLinks = data.links
      .filter(link => {
        // 过滤无效链接
        if (!link || link.source === undefined || link.target === undefined) {
          console.warn("发现无效链接:", link);
          return false;
        }
        
        const sourceId = link.source.toString();
        const targetId = link.target.toString();
        
        // 检查链接的源和目标节点是否存在
        if (!nodeIds.has(sourceId) || !nodeIds.has(targetId)) {
          console.warn("链接引用了不存在的节点:", { source: sourceId, target: targetId });
          return false;
        }
        
        return true;
      })
      .map((link) => ({
        source: link.source.toString(),
        target: link.target.toString(),
        relation: link.relation || "", // 确保关系字段存在
        label: {
          show: true,
          formatter: link.relation || "",
        },
        lineStyle: {
          width: 2,
          curveness: 0.2,
        },
      }));

    // 如果处理后没有有效数据，显示提示
    if (processedNodes.length === 0) {
      console.error("没有有效的节点数据");
      myChart.setOption({
        title: {
          text: "没有有效的知识图谱节点数据",
          left: "center",
          top: "center",
          textStyle: { fontSize: 14 },
        },
      });
      return;
    }

    const option = {
      backgroundColor: "#f5f5f5",
      tooltip: {
        trigger: "item",
        confine: false,
        appendToBody: true,
        position: function (point, params, dom, rect, size) {
          // 始终在鼠标左侧显示
          return [point[0] - size.contentSize[0] - 20, point[1]];
        },
        formatter: (params) => {
          if (params.dataType === "node") {
            // 为节点提供更详细、更好格式化的提示
            const properties = params.data.properties || {};
            let content = `<div style="max-width: 300px; word-wrap: break-word;">`;
            content += `<strong style="font-size: 16px;">${params.data.name}</strong>`;

            if (properties.内容) {
              content += `<p style="margin: 5px 0; font-size: 14px;">${properties.内容}</p>`;
            }

            // 添加其他可能有用的属性
            const additionalProps = ["难度", "核心特性", "存储开销"];
            additionalProps.forEach((prop) => {
              if (properties[prop]) {
                content += `<p style="margin: 3px 0; font-size: 13px;"><strong>${prop}：</strong>${properties[prop]}</p>`;
              }
            });

            content += `</div>`;
            return content;
          } else {
            return `<span style="font-weight: bold;">${
              params.data.relation || ""
            }</span>`;
          }
        },
        extraCssText:
          "max-width: 300px; white-space: normal; box-shadow: 0 2px 10px rgba(0,0,0,0.2); padding: 10px; border-radius: 5px;",
      },
      legend: {
        show: false, // 隐藏图例以节省空间
      },
      animationDurationUpdate: 1500,
      animationEasingUpdate: "quinticInOut",
      series: [
        {
          type: "graph",
          layout: "force",
          force: {
            repulsion: 150, // 减小斥力
            gravity: 0.1,
            edgeLength: 100, // 减小边长
            layoutAnimation: true,
          },
          roam: true,
          zoom: 1.2, // 稍微放大以便在小区域中看清
          draggable: true,
          data: processedNodes,
          links: processedLinks,
          label: {
            show: true,
            position: "inside",
            fontSize: 12, // 减小字体大小
            color: "#000",
            fontWeight: "bold",
            formatter: ({ name }) => name,
          },
          emphasis: {
            focus: "adjacency",
            lineStyle: {
              width: 3,
            },
          },
          edgeSymbol: ["none", "arrow"],
          edgeLabel: {
            show: true,
            position: "middle",
            formatter: ({ data }) => data?.relation || "",
            fontSize: 11, // 减小字体大小
            backgroundColor: "rgba(255,255,255,0.7)",
            padding: [3, 6],
            borderRadius: 3,
          },
          lineStyle: {
            color: "#666",
            width: 1.5,
            opacity: 0.9,
            curveness: 0,
          },
        },
      ],
    };

    // 应用配置
    myChart.setOption(option);
    
    // 强制立即渲染
    myChart.renderToCanvas();
    
  } catch (error) {
    console.error("图表初始化失败:", error);
  }
};

// 自适应调整图表大小
const resizeChart = () => {
  if (myChart && !myChart.isDisposed()) {
    myChart.resize();
  }
};

// 添加窗口大小变化监听
onMounted(() => {
  window.addEventListener('resize', resizeChart);
  
  // ESC键退出全屏
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFullscreen.value) {
      isFullscreen.value = false;
      nextTick().then(resizeChart);
    }
  });
});

// 移除监听器
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart);
  if (myChart) {
    myChart.dispose();
    myChart = null;
  }
});
</script>

<style scoped>
.resources-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  min-height: 80vh;
}

.search-container {
  margin-bottom: 30px;
}

.search-wrapper {
  display: flex;
  justify-content: center;
}

.search-input {
  width: 100%;
  max-width: 600px;
}

.search-tips {
  margin-top: 40px;
  text-align: center;
}

.search-examples {
  font-size: 14px;
  color: #666;
  margin-top: 10px;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 两栏布局 */
.two-column-layout {
  display: flex;
  gap: 20px;
}

/* 左侧资源列表 */
.resources-column {
  width: 60%;
  min-width: 400px;
}

/* 右侧内容 */
.right-column {
  width: 40%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.3s ease;
  margin-right: 10%;
  margin-bottom: 10%;
}

/* 全屏模式 */
.right-column.fullscreen-mode {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  background-color: #fff;
  padding: 20px;
  margin: 0;
  overflow: auto;
}

.knowledge-graph-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.echarts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.echarts-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.echarts-actions {
  display: flex;
  gap: 10px;
}

.echarts-wrapper {
  width: 100%;
  height: 300px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: visible;
  transition: all 0.3s ease;
}

.echarts-wrapper.fullscreen {
  height: calc(100vh - 80px);
}

.chart {
  width: 100%;
  height: 100%;
}

.answer-container {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow-y: auto;
  max-height: 300px;
  width: 100%;
}

.answer-container h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
}

.answer-content {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}

.resources-list h3,
.resources-column h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
}

.resource-card {
  margin-bottom: 15px;
  transition: all 0.3s;
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.resource-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.resource-type {
  font-size: 24px;
  color: #409eff;
}

.resource-info {
  flex: 1;
}

.resource-info h4 {
  margin: 0 0 8px;
  font-size: 18px;
}

.resource-info p {
  margin: 0 0 8px;
  color: #666;
}

.resource-meta {
  display: flex;
  gap: 12px;
  font-size: 14px;
  color: #999;
  flex-wrap: wrap;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  font-size: 32px;
  margin-bottom: 20px;
}

/* 媒体查询支持不同屏幕尺寸 */
@media (max-width: 900px) {
  .two-column-layout {
    flex-direction: column;
  }
  
  .resources-column,
  .right-column:not(.fullscreen-mode) {
    width: 100%;
    min-width: auto;
  }
}
</style>
