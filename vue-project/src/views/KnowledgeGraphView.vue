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
        <div ref="chart" style="width: 100%; height: 100%"></div>
        <div class="graph-controls">
          <button @click="handleZoomIn">放大</button>
          <button @click="handleZoomOut">缩小</button>
          <button @click="fitView">适应屏幕</button>
          <button @click="toggleFullscreen">全屏</button>
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
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import apiClient from '@/api/axios';
const chart = ref(null);
let myChart = null;
const selectedNode = ref(null);
const nodeSizeFactor = ref(1);
const fontSizeFactor = ref(1);
const edgeLengthFactor = ref(1);

// 获取知识图谱数据
const fetchGraphData = async () => {
  try {
    const response = await apiClient.get('/graph/entities/all',{
      params:{
        // id:selectedNode.value?.id,
        // relationType:selectedNode.value?.relationType
        id:null,
        relationType:null
      }
    });
    return processGraphData(response.data);
  } catch (error) {
    console.error('获取知识图谱数据失败:', error);
    return { nodes: [], links: [] }; 
  }
};

// 转换Neo4j数据为ECharts格式
const processGraphData = (data) => {
  const nodeMap = new Map();
  const nodes = data.nodes.map(node => {
    if (nodeMap.has(node.id)) {
      console.warn(`发现重复节点ID: ${node.id}`);
      return null;
    }
    nodeMap.set(node.id, true);
    
    const baseSize = 40 + (node.properties.difficulty || 0) * 5;
    return {
      id: node.id,
      name: node.name.replace(/['"]/g, ''),
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
        position: 'inside',
        fontSize: 12 * fontSizeFactor.value,
        color: '#333',
        formatter: ({ name }) => name
      }
    };
  }).filter(Boolean);

  const links = data.links.map(rel => ({
    source: rel.source,
    target: rel.target,
    label: rel.type.replace(/['"]/g, ''),
    lineStyle: {
      color: rel.properties.必需性 === '是' ? '#FF6B6B' : '#A0A0A0',
      width: rel.properties.必需性 === '是' ? 2 : 1,
      curveness: 0.2 * edgeLengthFactor.value
    }
  }));

  return { nodes, links };
};

// 新增难度转换函数
const convertDifficulty = (text) => {
  const levels = { '入门': 1, '中等': 3, '困难': 5 };
  return levels[text] || 1;
};

// 节点类型颜色映射
const getNodeColor = (type) => {
  const colors = {
    '概念': '#5470C6',
    '算法': '#91CC75', 
    '数据结构': '#FAC858'
  };
  return colors[type] || '#EE6666';
};

// 初始化图表
const initChart = async () => {
  if (!chart.value) return;
  
  myChart = echarts.init(chart.value);
  const { nodes, links } = await fetchGraphData();

  const option = {
    tooltip: {},
    series: [{
      type: 'graph',
      roam: true,
      layout: 'force',
      force: {
        repulsion: 200,
        edgeLength: 100
      },
      draggable: true,
      data: nodes,
      links: links,
      label: {
        show: true,
        position: 'inside',
        fontSize: 30,
        color: '#333',
        formatter: ({ name }) => name
      },
      emphasis: {
        focus: 'adjacency',
        label: {
          show: true,
          position: 'right'
        }
      },
      edgeSymbol: ['none', 'arrow'],
      edgeLabel: {
        show: true,
        formatter: ({ data }) => data.label,
        fontSize: 12,
        color: '#666',
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: [4, 8],
        borderRadius: 4,
        distance: 15
      }
    }]
  };

  myChart.setOption(option);
  
  // 点击节点事件处理
  myChart.on('click', 'series.graph', (params) => {
    selectedNode.value = params.data;
  });
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
    option.series[0].data = option.series[0].data.map(node => ({
      ...node,
      symbolSize: node.baseSize * nodeSizeFactor.value,
      label: {
        ...node.label,
        fontSize: node.baseFontSize * fontSizeFactor.value
      }
    }));

    // 更新边线配置
    option.series[0].force.edgeLength = 100 * edgeLengthFactor.value;
    option.series[0].links = option.series[0].links.map(link => ({
      ...link,
      lineStyle: {
        ...link.lineStyle,
        curveness: 0.2 * edgeLengthFactor.value
      }
    }));

    myChart.setOption({
      series: [{
        data: option.series[0].data,
        links: option.series[0].links,
        force: option.series[0].force
      }]
    });
    
    // 触发重新布局
    myChart.dispatchAction({ type: 'forceLayout' });
  }
};

const fitView = () => {
  if (myChart) {
    myChart.dispatchAction({
      type: 'legendScroll',
      scrollDataIndex: 0
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

// 添加全屏状态监听
onMounted(() => {
  initChart();
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose();
    myChart = null;
  }
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});

const handleFullscreenChange = () => {
  if (document.fullscreenElement) {
    myChart.resize();
  }
};
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
