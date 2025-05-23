<template>
  <div class="algorithm-visualize-container">
    <header class="av-header">
      <h2>算法详解</h2>
    </header>

    <div class="av-content">
      <!-- 代码输入区 -->
      <div class="code-section">
        <h3>代码区</h3>
        <div class="code-editor-container">
          <div class="code-header">
            <select v-model="selectedLanguage">
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="c++">C++</option>
            </select>
            <input type="text" v-model="algorithm" placeholder="请输入算法类型" />
            <button style="padding: 5px 10px;" @click="generateCode" :disabled="isLoading">生成代码</button>
          </div>
          <textarea 
            v-model="algorithmCode"
            class="code-editor"
            placeholder="// 在此输入您的算法代码"
          ></textarea>
        </div>
        <div class="algorithm-templates">
          <h4>算法模板</h4>
          <button @click="loadTemplate('排序')">排序算法</button>
          <button @click="loadTemplate('搜索')">搜索算法</button>
          <button @click="loadTemplate('图')">图算法</button>
          <button @click="loadTemplate('动态规划')">动态规划</button>
        </div>
      </div>

      <!-- 可视化展示区 -->
      <div class="visualization-section">
        <h3>算法详解区</h3>
        
        <div v-if="isLoading" class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>生成算法详解中...</p>
        </div>
        <div v-else-if="visualizationHtml" class="visualization-container" v-html="visualizationHtml"></div>
        <div v-else class="empty-state">
          <p>在代码区输入算法并点击生成算法详解按钮查看算法详解结果</p>
        </div>
        <button @click="visualizeAlgorithm" :disabled="isLoading"
        class="generate-algorithm-visualize-button"
        >生成算法详解</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import apiClient from '@/api/axios';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

const route = useRoute();
const algorithmCode = ref('');
const selectedLanguage = ref('javascript');
const visualizationHtml = ref('');
const isLoading = ref(false);
const algorithm = ref('');

onMounted(() => {
  if (route.query.algorithm) {
    algorithm.value = route.query.algorithm;
  }
});

// 生成代码
const generateCode = async () => {
  if (!algorithm.value) {
    ElMessage.error('请输入算法类型');
    return;
  }
  const response = await apiClient.post('/agent/completion', {
    inputs: {
      language: selectedLanguage.value,
      algorithm: algorithm.value
    },
    scenery: 'ALGORITHM_CODE'
  });

  algorithmCode.value = response.data.answer.replace(/```\w+\n/, '').replace(/```$/, '');
}

// 算法模板加载函数
const loadTemplate = (type) => {
  switch (type) {
    case '排序':
      if (selectedLanguage.value === 'javascript') {
        algorithmCode.value = `// 冒泡排序示例
function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // 交换元素
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

// 测试数据
const array = [64, 34, 25, 12, 22, 11, 90];
bubbleSort(array);`;
      } else if (selectedLanguage.value === 'python') {
        algorithmCode.value = `# 冒泡排序示例
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# 测试数据
array = [64, 34, 25, 12, 22, 11, 90]
bubble_sort(array)`;
      }
      break;
    case '搜索':
      if (selectedLanguage.value === 'javascript') {
        algorithmCode.value = `// 二分查找示例
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid; // 找到目标，返回索引
    } else if (arr[mid] < target) {
      left = mid + 1; // 目标在右半部分
    } else {
      right = mid - 1; // 目标在左半部分
    }
  }
  
  return -1; // 未找到目标
}

// 测试数据（已排序数组）
const sortedArray = [11, 12, 22, 25, 34, 64, 90];
const target = 25;
binarySearch(sortedArray, target);`;
      } else if (selectedLanguage.value === 'python') {
        algorithmCode.value = `# 二分查找示例
def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid  # 找到目标，返回索引
        elif arr[mid] < target:
            left = mid + 1  # 目标在右半部分
        else:
            right = mid - 1  # 目标在左半部分
    
    return -1  # 未找到目标

# 测试数据（已排序数组）
sorted_array = [11, 12, 22, 25, 34, 64, 90]
target = 25
binary_search(sorted_array, target)`;
      }
      break;
    case '图':
      if (selectedLanguage.value === 'javascript') {
        algorithmCode.value = `// 广度优先搜索(BFS)示例
function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  const result = [];
  
  visited.add(start);
  
  while (queue.length > 0) {
    const vertex = queue.shift();
    result.push(vertex);
    
    for (const neighbor of graph[vertex]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  
  return result;
}

// 测试数据：邻接表表示的图
const graph = {
  'A': ['B', 'C'],
  'B': ['A', 'D', 'E'],
  'C': ['A', 'F'],
  'D': ['B'],
  'E': ['B', 'F'],
  'F': ['C', 'E']
};

bfs(graph, 'A');`;
      } else if (selectedLanguage.value === 'python') {
        algorithmCode.value = `# 广度优先搜索(BFS)示例
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    result = []
    
    visited.add(start)
    
    while queue:
        vertex = queue.popleft()
        result.append(vertex)
        
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    
    return result

# 测试数据：邻接表表示的图
graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E']
}

bfs(graph, 'A')`;
      }
      break;
    case '动态规划':
      if (selectedLanguage.value === 'javascript') {
        algorithmCode.value = `// 斐波那契数列（动态规划方法）
function fibonacci(n) {
  // 创建DP表
  const dp = new Array(n + 1);
  
  // 基本情况
  dp[0] = 0;
  dp[1] = 1;
  
  // 填充DP表
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  
  return dp[n];
}

// 计算第10个斐波那契数
fibonacci(10);`;
      } else if (selectedLanguage.value === 'python') {
        algorithmCode.value = `# 斐波那契数列（动态规划方法）
def fibonacci(n):
    # 创建DP表
    dp = [0] * (n + 1)
    
    # 基本情况
    dp[0] = 0
    dp[1] = 1
    
    # 填充DP表
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    
    return dp[n]

# 计算第10个斐波那契数
fibonacci(10)`;
      }
      break;
    default:
      algorithmCode.value = '// 请在此输入您的算法代码';
  }

  // 高亮加载的模板代码
  nextTick(() => {
    const codeElement = document.querySelector('.code-editor');
    if (codeElement) {
      hljs.highlightBlock(codeElement);
    }
  });
};

const visualizeAlgorithm = async () => {
  if (!algorithmCode.value.trim()) return;
  
  isLoading.value = true;
  try {
    const response = await apiClient.post('/agent/completion', {
      inputs: {
        code: algorithmCode.value,
        language: selectedLanguage.value
      },
      scenery: 'ALGORITHM_VISUALIZATION',
    });
    
    const code = response.data.answer.replace(/```\w+\n/, '').replace(/```$/, '');
    visualizationHtml.value = code;
  } catch (error) {
    console.error('获取算法详解结果失败:', error);
    visualizationHtml.value = `<div class="error-message">算法详解生成失败，请检查您的代码或稍后重试</div>`;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.algorithm-visualize-container {
  padding: 20px;
  height: calc(100vh - 56px);
  overflow: hidden;
  background-color: #f7f9fc;
}

.av-header {
  margin-bottom: 20px;
}

.av-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.av-content {
  display: flex;
  gap: 20px;
  height: calc(100% - 60px);
}

.code-section, .visualization-section {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.code-section h3, .visualization-section h3 {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.code-editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.code-header select, .code-header button {
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.code-header select {
  background-color: white;
  font-size: 13px;
}

.code-header button {
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.code-header button:hover:not(:disabled) {
  background-color: #3e9142;
}

.code-header button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.code-editor {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 10px;
  resize: none;
  border: none;
  outline: none;
  line-height: 1.5;
}

.algorithm-templates {
  margin-top: 15px;
}

.algorithm-templates h4 {
  font-size: 14px;
  margin: 0 0 10px 0;
  color: #555;
}

.algorithm-templates button {
  margin-right: 8px;
  margin-bottom: 5px;
  padding: 5px 10px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.algorithm-templates button:hover {
  background-color: #e0e0e0;
  border-color: #ccc;
}

.visualization-container {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 15px;
  overflow: auto;
  font-family: 'SF Pro Text', 'PingFang SC', sans-serif;
}

.generate-algorithm-visualize-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 15px;
  transition: background-color 0.2s;
}
.generate-algorithm-visualize-button:hover:not(:disabled) {
  background-color: #3e9142;
}
.generate-algorithm-visualize-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
/* 预定义可视化区域内的样式 */
:deep(.visualization-header) {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

:deep(.visualization-header h2) {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

:deep(.visualization-header p) {
  font-size: 14px;
  color: #555;
  line-height: 1.5;
  margin: 0;
}

:deep(.complexity-analysis) {
  background-color: #f8f9fa;
  padding: 12px 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  border-left: 3px solid #4285f4;
}

:deep(.complexity-analysis h3) {
  font-size: 15px;
  margin: 0 0 10px 0;
  color: #333;
}

:deep(.complexity-analysis ul) {
  margin: 0;
  padding-left: 20px;
}

:deep(.complexity-analysis li) {
  margin-bottom: 5px;
  line-height: 1.5;
}

:deep(.algorithm-steps) {
  margin-bottom: 20px;
}

:deep(.algorithm-steps h3) {
  font-size: 15px;
  margin: 0 0 12px 0;
  color: #333;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}

:deep(.algorithm-steps ol) {
  padding-left: 20px;
  margin: 0;
}

:deep(.algorithm-steps li) {
  margin-bottom: 8px;
  line-height: 1.5;
}

:deep(.visualization-graphic) {
  text-align: center;
  margin: 20px 0;
  padding: 15px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

:deep(.visualization-graphic h3) {
  font-size: 15px;
  margin: 0 0 15px 0;
  color: #333;
}

:deep(.algorithm-example) {
  background-color: #f0f4f8;
  padding: 15px;
  border-radius: 6px;
  margin-top: 20px;
  border-left: 3px solid #34a853;
}

:deep(.algorithm-example h3) {
  font-size: 15px;
  margin: 0 0 10px 0;
  color: #333;
}

:deep(.example-data) {
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  border: 1px solid #eee;
  overflow-x: auto;
}

:deep(.example-data pre) {
  margin: 0;
  font-family: 'Courier New', monospace;
}

:deep(.array-visualization) {
  display: flex;
  justify-content: center;
  margin: 15px 0;
  flex-wrap: wrap;
  gap: 5px;
}

:deep(.array-element) {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-weight: bold;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  transition: all 0.2s;
  background-color: #fff;
}

:deep(.array-element-container) {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 2px;
}

:deep(.array-element-index) {
  font-size: 11px;
  color: #777;
  margin-top: 4px;
}

:deep(.array-step-description) {
  margin: 15px 0;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
  text-align: center;
  font-size: 13px;
}

:deep(.highlight) {
  background-color: #ffeb3b;
  transform: translateY(-3px);
}

:deep(.swapped) {
  background-color: #4caf50;
  color: white;
}

:deep(.compared) {
  background-color: #2196f3;
  color: white;
}

:deep(.pivot) {
  background-color: #ff9800;
  color: white;
}

:deep(.current) {
  border: 2px solid #f44336;
}

:deep(.searched) {
  background-color: #e91e63;
  color: white;
}

:deep(.array-sequence) {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 20px 0;
}

:deep(.graph-container) {
  width: 100%;
  height: 320px;
  margin: 20px 0;
  background-color: #f9f9f9;
  border-radius: 6px;
  position: relative;
}

:deep(.graph-node) {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4285f4;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

:deep(.graph-edge) {
  position: absolute;
  background-color: #ccc;
  height: 2px;
  transform-origin: left center;
}

:deep(.graph-node.visited) {
  background-color: #34a853;
}

:deep(.graph-node.current) {
  background-color: #ea4335;
}

:deep(.graph-edge.traversed) {
  background-color: #34a853;
  height: 3px;
}

:deep(table.dp-table) {
  border-collapse: collapse;
  width: 100%;
  margin: 15px 0;
  border: 1px solid #ddd;
}

:deep(table.dp-table th),
:deep(table.dp-table td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

:deep(table.dp-table th) {
  background-color: #f2f2f2;
  font-weight: 600;
}

:deep(table.dp-table .index-cell) {
  background-color: #f2f2f2;
  font-weight: 600;
}

:deep(table.dp-table .current-cell) {
  background-color: #ffeb3b;
}

:deep(table.dp-table .calculated-cell) {
  background-color: #e8f5e9;
}

:deep(.code-snippet) {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  border-left: 3px solid #ccc;
}

:deep(.explanation) {
  margin: 15px 0;
  padding: 10px;
  background-color: #e8f4fd;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.6;
}

:deep(.legend) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 15px 0;
  justify-content: center;
}

:deep(.legend-item) {
  display: flex;
  align-items: center;
  font-size: 12px;
}

:deep(.legend-color) {
  width: 16px;
  height: 16px;
  margin-right: 5px;
  border-radius: 3px;
}

.empty-state {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #888;
  border: 1px dashed #ddd;
  border-radius: 4px;
}

.loading-spinner {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #666;
}

.error-message {
  color: #d32f2f;
  text-align: center;
  padding: 20px;
}

:deep(.hljs) {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  border-left: 3px solid #ccc;
}
</style>
