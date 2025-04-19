<template>
  <div class="knowledge-node-view">
    <div v-if="node" class="card">
      <h1>知识点: {{ node.title }}</h1>
      <div class="node-meta">
        <span>类型: {{ node.type }}</span> |
        <span>难度: {{ '★'.repeat(node.difficulty) + '☆'.repeat(5 - node.difficulty) }}</span>
      </div>
      <hr>
      <div class="node-content">
        <h2>描述</h2>
        <p>{{ node.description }}</p>

        <h2>相关资源</h2>
        <ul>
            <li v-for="resource in node.resources" :key="resource.id"><a :href="resource.url">{{ resource.title }}</a></li>
        </ul>

        <h2>前置知识点</h2>
         <ul>
            <li v-for="pre in node.prerequisites" :key="pre.id">
                <router-link :to="`/knowledge-node/${pre.id}`">{{ pre.title }}</router-link>
            </li>
        </ul>

         <h2>后续知识点</h2>
         <ul>
            <li v-for="post in node.postrequisites" :key="post.id">
                 <router-link :to="`/knowledge-node/${post.id}`">{{ post.title }}</router-link>
            </li>
        </ul>
      </div>
       <router-link :to="'/knowledge-graph'">返回知识图谱</router-link>
    </div>
    <div v-else class="loading">
      <p>正在加载知识点信息...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const node = ref(null);

const fetchNodeData = (nodeId) => {
  console.log('Fetching data for node:', nodeId);
  // TODO: 根据 nodeId 从后端或数据源获取知识点信息
  // 模拟数据加载
  setTimeout(() => {
    // 假设这是获取到的数据
    if (nodeId === 'array') { // 示例 ID
        node.value = {
            id: 'array',
            title: '数组',
            type: '概念类',
            difficulty: 2,
            description: '数组是一种线性数据结构，它包含相同类型元素的集合。元素可以通过索引（通常是从0开始）来访问...',
            resources: [ { id: 'res1', title: '数组教程 - GeeksforGeeks', url: '#' } ],
            prerequisites: [],
            postrequisites: [{id: 'linkedlist', title: '链表'}, {id: 'stack', title: '栈'}]
        };
    } else {
        node.value = { /* 默认或错误状态 */ };
    }

  }, 500);
};

// 组件挂载时和路由参数变化时获取数据
onMounted(() => {
  fetchNodeData(route.params.id);
});

watch(() => route.params.id, (newNodeId) => {
  if (newNodeId) {
    fetchNodeData(newNodeId);
  }
});

</script>

<style scoped>
.knowledge-node-view {
  padding: 20px 30px;
}
.card { /* 复用通用卡片样式 */
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0px 1px 3px rgba(0,0,0,0.1);
  padding: 20px 30px;
}
.card h1 {
  font-size: 24px;
  margin-bottom: 5px;
  color: #1E293B;
}
.node-meta {
    font-size: 13px;
    color: #5f6368;
    margin-bottom: 15px;
}
.node-meta span {
    margin-right: 10px;
}
hr {
    border: none;
    border-top: 1px solid #E0E0E0;
    margin: 15px 0;
}
.node-content h2 {
    font-size: 18px;
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 10px;
}
.node-content p {
    font-size: 14px;
    line-height: 1.6;
    color: #3c4043; /* 正文颜色 */
}
.node-content ul {
    list-style: disc;
    padding-left: 20px;
}
.node-content li {
    margin-bottom: 8px;
    font-size: 14px;
}
.node-content a {
    color: #4285F4;
    text-decoration: none;
}
.node-content a:hover {
    text-decoration: underline;
}
.loading {
    text-align: center;
    padding: 50px;
    color: #5f6368;
}
.card > a { /* 返回链接 */
    display: inline-block;
    margin-top: 20px;
    color: #4285F4;
    text-decoration: none;
    font-size: 14px;
}
</style>
