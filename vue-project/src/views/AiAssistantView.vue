<template>
  <div class="ai-assistant-container">
    <aside class="history-panel">
      <button class="new-chat-button">+ 新建会话</button>
      <h4>历史会话</h4>
      <ul>
        <li v-for="chat in chatHistory" :key="chat.id" :class="{ active: chat.id === currentChatId }">
          <span>{{ chat.title }}</span>
          <small>{{ chat.time }}</small>
        </li>
      </ul>
      <button class="manage-button">管理会话</button>
    </aside>
    <main class="chat-main">
      <header class="chat-header">
        <span>当前会话：{{ currentChatTitle }}</span>
        <button class="icon-button">设置</button>
      </header>
      <div class="message-area">
        <div v-for="(msg, index) in messages" :key="index" :class="['message-bubble', msg.sender]">
          <pre v-if="msg.type === 'code'"><code>{{ msg.content }}</code></pre>
          <p v-else>{{ msg.content }}</p>
        </div>
      </div>
      <footer class="input-area">
        <textarea v-model="newMessage" placeholder="输入您的问题..." @keydown.enter.prevent="sendMessage"></textarea>
        <button @click="sendMessage" class="send-button">发送</button>
      </footer>
    </main>
    <aside class="reference-panel" :class="{ collapsed: isReferenceCollapsed }">
       <button @click="toggleReferencePanel" class="collapse-toggle">
        {{ isReferenceCollapsed ? '展开' : '收起' }}
      </button>
      <div v-if="!isReferenceCollapsed">
          <h4>相关知识</h4>
          <h5>推荐知识点：</h5>
          <ul>
            <li>栈和队列</li>
            <li>链表</li>
          </ul>
          <h5>学习资源：</h5>
          <ul>
            <li>视频：链表详解</li>
            <li>文档：数据结构基础</li>
          </ul>
          <h5>相似问题：</h5>
          <ul>
            <li>数组和树的区别</li>
            <li>如何实现栈</li>
          </ul>
       </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const currentChatId = ref('chat1'); // 当前会话ID
const chatHistory = ref([ // 示例历史会话数据
  { id: 'chat1', title: '数据结构基础问答', time: '12:30' },
  { id: 'chat2', title: '排序算法', time: '昨天' },
  { id: 'chat3', title: '树结构', time: '3天前' },
]);

const messages = ref([ // 示例消息数据
  { sender: 'ai', type: 'text', content: '欢迎提问关于数据结构的问题' },
  { sender: 'user', type: 'text', content: '请解释链表和数组的区别' },
  { sender: 'ai', type: 'text', content: '链表和数组的主要区别在于内存存储方式和元素访问/修改效率。\n数组使用连续内存，访问快(O(1))，插入删除慢(O(n))。\n链表使用非连续内存，通过指针链接，访问慢(O(n))，插入删除快(O(1))。' },
  { sender: 'ai', type: 'code', content: `// 示例代码\nstruct Node {\n  int data;\n  struct Node* next;\n};` }
]);

const newMessage = ref('');
const isReferenceCollapsed = ref(false);

const currentChatTitle = computed(() => {
  const current = chatHistory.value.find(chat => chat.id === currentChatId.value);
  return current ? current.title : '新会话';
});

const sendMessage = () => {
  if (newMessage.value.trim() === '') return;
  messages.value.push({ sender: 'user', type: 'text', content: newMessage.value });
  // TODO: 调用 AI 接口获取回复
  // 模拟 AI 回复
  setTimeout(() => {
      messages.value.push({ sender: 'ai', type: 'text', content: '正在思考...' });
  }, 500);
  newMessage.value = '';
};

const toggleReferencePanel = () => {
    isReferenceCollapsed.value = !isReferenceCollapsed.value;
}

</script>

<style scoped>
.ai-assistant-container {
  display: flex;
  height: calc(100vh - 56px); /* 假设顶部导航栏高度 */
  background-color: #F7F9FC;
}

/* History Panel */
.history-panel {
  width: 280px;
  background-color: #FFFFFF;
  border-right: 1px solid #E0E0E0;
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.new-chat-button {
  width: 100%;
  padding: 10px;
  background-color: #E7F1FD; /* 浅蓝 */
  color: #4285F4; /* 主色 */
  border: 1px solid #4285F4;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 15px;
}

.history-panel h4 {
  font-size: 13px;
  color: #5f6368;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.history-panel ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1; /* 占据剩余空间 */
  overflow-y: auto; /* 历史记录多时滚动 */
}

.history-panel li {
  padding: 10px 8px;
  margin-bottom: 5px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.history-panel li.active {
  background-color: #E7F1FD;
  font-weight: bold;
}
.history-panel li:hover {
  background-color: #F0F2F5; /* 悬停效果 */
}
.history-panel li small {
    font-size: 12px;
    color: #9AA0A6;
}

.manage-button {
  width: 100%;
  padding: 8px;
  background: none;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  margin-top: 10px;
}

/* Chat Main */
.chat-main {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
}

.chat-header {
  padding: 15px 20px;
  border-bottom: 1px solid #E0E0E0;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  color: #1E293B;
}
.icon-button { /* 复用 HomeView 的样式或单独定义 */
   background: none; border: none; cursor: pointer; color: #5f6368;
}

.message-area {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px; /* 消息间距 */
}

.message-bubble {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word; /* 长单词换行 */
}

.message-bubble.user {
  background-color: #E7F1FD; /* 蓝色背景 */
  color: #1E293B; /* 深色文本 */
  border-bottom-right-radius: 2px; /* 设计细节 */
  align-self: flex-end; /* 右对齐 */
}

.message-bubble.ai {
  background-color: #F0F2F5; /* 浅灰背景 */
  color: #1E293B; /* 黑色文本 */
  border-bottom-left-radius: 2px; /* 设计细节 */
  align-self: flex-start; /* 左对齐 */
}
.message-bubble pre {
    margin: 0;
    white-space: pre-wrap; /* 代码换行 */
    font-family: 'Courier New', Courier, monospace;
    background-color: #2d2d2d; /* 深色代码块背景 */
    color: #cccccc; /* 浅色代码文本 */
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto; /* 水平滚动长代码 */
}
.message-bubble code {
    font-family: inherit; /* 继承 pre 的字体 */
}


.input-area {
  display: flex;
  padding: 15px 20px;
  border-top: 1px solid #E0E0E0;
  gap: 10px;
  flex-shrink: 0;
}

.input-area textarea {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  resize: none; /* 禁止调整大小 */
  font-size: 14px;
  min-height: 40px; /* 最小高度 */
  max-height: 120px; /* 最大高度，可滚动 */
  line-height: 1.4;
  font-family: inherit;
}
.input-area textarea:focus {
  outline: none;
  border-color: #4285F4;
}

.send-button {
  padding: 0 20px;
  background-color: #4285F4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  align-self: flex-end; /* 对齐到文本区域底部 */
  height: 42px; /* 与文本框高度类似 */
}
.send-button:hover {
    background-color: #3367D6;
}

/* Reference Panel */
.reference-panel {
  width: 320px;
  background-color: #FFFFFF;
  border-left: 1px solid #E0E0E0;
  padding: 15px;
  flex-shrink: 0;
  transition: width 0.3s ease;
  position: relative; /* 为了定位折叠按钮 */
  overflow: hidden;
}
.reference-panel.collapsed {
    width: 40px; /* 折叠后的宽度 */
    padding: 15px 5px; /* 调整内边距 */
}
.reference-panel.collapsed > div {
    display: none; /* 隐藏内容 */
}

.collapse-toggle {
    position: absolute;
    top: 10px;
    left: 5px; /* 调整位置 */
    background: none;
    border: none;
    font-size: 12px;
    cursor: pointer;
    color: #5f6368;
    z-index: 1; /* 确保在内容上方 */
    padding: 5px;
    writing-mode: vertical-rl; /* 文字垂直显示 */
    text-orientation: mixed;
}
.reference-panel.collapsed .collapse-toggle {
    writing-mode: horizontal-tb; /* 折叠后水平显示 */
    left: Calc(50% - 15px);
}


.reference-panel h4 {
  font-size: 13px;
  color: #5f6368;
  margin-bottom: 10px;
  text-transform: uppercase;
}
.reference-panel h5 {
    font-size: 14px;
    font-weight: bold;
    margin: 15px 0 5px 0;
}
.reference-panel ul {
  list-style: none;
  padding-left: 10px; /* 轻微缩进 */
  margin-bottom: 15px;
}
.reference-panel li {
  font-size: 13px;
  color: #4285F4; /* 可点击链接颜色 */
  margin-bottom: 5px;
  cursor: pointer;
}
.reference-panel li:hover {
    text-decoration: underline;
}
</style>
