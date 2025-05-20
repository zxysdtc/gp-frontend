<template>
  <div class="ai-assistant-container">
    <aside class="history-panel">
      <div class="view-switcher">
        <button
          class="view-button"
          :class="{ active: currentView === 'assistant' }"
          @click="switchView('assistant')"
        >
          学习助手
        </button>
        <button
          class="view-button"
          :class="{ active: currentView === 'chat' }"
          @click="switchView('chat')"
        >
          历史会话
        </button>

      </div>
      <div v-if="currentView === 'chat'">
        <button
          class="new-chat-button"
          @click="createNewChat"
          :disabled="isLoading"
        >
          <span v-if="isLoading">正在创建...</span>
          <span v-else>+ 新建会话</span>
        </button>
        <ul>
          <li
            v-for="chat in chatHistory"
            @contextmenu="(e) => treeRightClick(e, chat)"
            :key="chat.id"
            :class="{ active: chat.id === currentChatId }"
            @click="isManagingChats ? null : switchChat(chat.id)"
          >
            <span>{{ chat.title }}</span>
            <div class="chat-item-right">
              <small>{{ chat.time }}</small>
              <button
                v-if="isManagingChats"
                class="delete-btn"
                @click.stop="deleteChat(chat.id)"
              >
                &times;
              </button>
            </div>
          </li>
        </ul>
      </div>
      <div v-if="currentView === 'assistant'">
        <div class="assistant-list">
          <div
            v-for="assistant in assistants"
            :key="assistant.id"
            class="assistant-item"
            :class="{ active: assistant.id === currentAssistantId }"
            @click="switchAssistant(assistant.id)"
          >
            <div class="assistant-info">
              <div style="display: flex; align-items: center;">
                <img :src="imgSrc(assistant.avatar)" alt="助手头像" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">
                <div style="display: flex; flex-direction: column;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <h4 style="font-size: 16px; font-weight: bold;">{{ assistant.name }}</h4>
                    <div style="display: flex; gap: 4px;">
                      <span
                        v-for="tag in assistant.tags"
                        :key="tag"
                        class="tag"
                        :style="{ backgroundColor: getRandomColor() }"
                      >
                        {{ tag }}
                      </span>
                    </div>
                  </div>
                  <p style="font-size: 12px; color: #666; margin-top: 0px;">{{ assistant.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
    <main class="chat-main">
      <header class="chat-header">
        <span v-if="!isEditingTitle">当前会话：{{ currentChatTitle }}</span>
        <div v-else class="title-edit-container" style="position: relative; flex: 1; margin-right: 5px;">
          <input
            v-model="editingTitle"
            @keydown.enter="saveTitle"
            class="title-input"
            style="width: 100%; padding-right: 5px; margin-right: 5px;"
          />
          <button class="star-button" @click="autoRenameTitle" style="position: absolute; right: 1px; top: 50%; transform: translateY(-50%); z-index: 2; background-color: white;">✨</button>
        </div>
        <button class="icon-button" @click="toggleEditTitle">
          <span v-if="!isEditingTitle">✏️</span>
          <span v-else @click="saveTitle">保存</span>
        </button>
      </header>
      <div class="message-area">
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message-bubble', msg.sender]"
        >
          <div v-if="msg.type === 'code'" class="code-block-wrapper">
            <pre>
              <div class="code-copy-button" @click="copyMessage(msg.content)">
                <span>⎘</span>
              </div>
              <code>{{ msg.content }}</code>
            </pre>
          </div>
          <div
            v-else
            class="markdown-body"
            v-html="marked.parse(msg.content)"
          />
          <div class="message-actions">
            <button class="copy-button" @click="copyMessage(msg.content)">
              <span>⎘</span>
            </button>
            <button
              v-if="msg.sender === 'ai'"
              class="regenerate-button"
              @click="regenerateMessage(index)"
            >
              <span>↻</span>
            </button>
          </div>
        </div>
      </div>
      <footer class="input-area">
        <textarea
          v-model="newMessage"
          placeholder="输入您的问题..."
          @keydown.enter.prevent="sendMessage"
          :disabled="isLoading"
        >
        </textarea>
        <button
          @click="sendMessage"
          class="send-button"
          :disabled="isLoading || !newMessage.trim()"
        >
          <span v-if="isLoading">发送中...</span>
          <span v-else>发送</span>
        </button>
      </footer>
    </main>
    <aside class="reference-panel" :class="{ collapsed: isReferenceCollapsed }">
      <button @click="toggleReferencePanel" class="collapse-toggle">
        {{ isReferenceCollapsed ? "🡸" : "🡺" }}
      </button>
      <br>
      <br>
      <div v-if="!isReferenceCollapsed">
        <h4>知识图谱</h4>
        <div class="graph-visualization">
          <div ref="chart" style="width: 100%; height: 100%"></div>
        </div>
      </div>
    </aside>
    <!-- 右键菜单 -->
    <div
      v-if="rightMenuVisible"
      class="right-menu"
      :style="rightMenuStyle"
    >
      <ul>
        <li @click="handleDeleteChat">删除</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import apiClient from "@/api/axios";
import { marked } from "marked";
import * as echarts from 'echarts';
import "github-markdown-css";
const chart = ref(null);
let myChart = null;

// 鼠标右键菜单
const rightMenuVisible = ref(false);
const rightNodeData = ref(null);
const contextmenuLeft = ref(0);
const contextmenuTop = ref(0);


const userApi = {
  getParameters: (assistantId) =>
    apiClient.get(`/chat/parameters?assistantId=${assistantId}`),
  getConversation: (params) => apiClient.get("/chat/get", params),
  sendMessage: (params) => apiClient.post("/chat/sse", params),
  getConversationList: (assistantId, lastChatId) =>
    apiClient.get(
      `/chat/list?assistantId=${assistantId}${
        lastChatId ? `&lastChatId=${lastChatId}` : ""
      }`
    ),
  deleteConversation: (assistantId, chatId) =>
    apiClient.delete(
      `/chat/delete?assistantId=${assistantId}&chat_id=${chatId}`
    ),
  getConversationMessage: (assistantId, conversationId, firstId, limit) =>
    apiClient.get(
      `/chat/messageList?assistantId=${assistantId}&conversationId=${conversationId}${
        firstId ? `&firstId=${firstId}` : ""
      }${limit ? `&limit=${limit}` : ""}`
    ),
  renameConversation: (assistantId, chatId, newName) =>
    apiClient.post(
      `/chat/rename?assistantId=${assistantId}&chat_id=${chatId}&newName=${newName}`
    ),
  autoRenameConversation: (assistantId, chatId) =>
    apiClient.post(
      `/chat/rename?assistantId=${assistantId}&chat_id=${chatId}`
    ),
  getAssistantList: () => apiClient.get("/dify/chatbots"),
};

const newTitle = ref("新会话");
const currentChatId = ref(""); // 当前会话ID
const chatHistory = ref([]);

const messages = ref([]);
const newMessage = ref("");
const isReferenceCollapsed = ref(true);
const isLoading = ref(false); // 添加加载状态
const errorMessage = ref(""); // 添加错误信息
const isManagingChats = ref(false);
const isEditingTitle = ref(false);
const editingTitle = ref("");
const newChatId = ref(0);
const assistantOpeningStatement = ref("");
const currentAssistantId = ref(1); // 添加助手ID变量，可以从配置或状态中获取

const currentChatTitle = computed(() => {
  const current = chatHistory.value.find(
    (chat) => chat.id === currentChatId.value
  );
  return current ? current.title : newTitle.value;
});

const currentView = ref('chat'); // 当前视图，默认为会话视图
const assistants = ref([]); // 助手列表

const imgSrc = (avatar) => {
  if(avatar){
    return `data:image/jpeg;base64,${avatar}`;
  }
  return require('@/assets/images/default-avatar.png');
};

// 鼠标右键菜单
const treeRightClick = (mouseEvent, data) => {
  mouseEvent.preventDefault();
  rightMenuVisible.value = true;
  rightNodeData.value = data;
  contextmenuLeft.value = mouseEvent.clientX;
  contextmenuTop.value = mouseEvent.clientY;
};

// 关闭右键菜单
const closeRightMenu = () => {
  rightMenuVisible.value = false;
};

// 监听点击事件，关闭右键菜单
document.addEventListener('click', closeRightMenu);

const createNewChat = async () => {
  if(chatHistory.value.find(chat => chat.id === newChatId.value)){
    return;
  }
  if (isLoading.value) return;
  isLoading.value = true;
  errorMessage.value = "";
  
  try {
    const response = await userApi.getParameters(currentAssistantId.value);
    assistantOpeningStatement.value = response.data.openingStatement;
    console.log(`openingStatement: ${assistantOpeningStatement.value}`);
    chatHistory.value.unshift({
      id: newChatId.value,
      title: "新会话",
      time: new Date().toLocaleDateString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      introduction: assistantOpeningStatement.value,
    });
    switchChat(newChatId.value);
  } catch (error) {
    console.error("创建新会话出错:", error);
    errorMessage.value = `创建失败：${error.message}`;
  } finally {
    isLoading.value = false;
  }
};

const toggleManageMode = () => {
  isManagingChats.value = !isManagingChats.value;
};

const sendMessage = async () => {
  if (newMessage.value.trim() === "" || isLoading.value) return;

  const userMessageContent = newMessage.value;
  messages.value.push({
    sender: "user",
    type: "text",
    content: userMessageContent,
  });
  newMessage.value = "";

  isLoading.value = true;
  errorMessage.value = "";
 

  // 滚动到底部以显示新消息和"正在思考"
  await nextTick(); // 等待DOM更新
  // 可能需要一个方法来滚动聊天区域到底部，例如：scrollToBottom();

  try {
    const response = await fetch("http://localhost:8080/api/v1/chat/sse", {
      method: "POST",
      body: JSON.stringify({
        ...(currentChatId.value !== 0 && { chatId: currentChatId.value }),
        assistantId: currentAssistantId.value,
        message: userMessageContent,
      }),
      headers: {
        Authorization: "Bearer " + localStorage.getItem("authToken"),
        "Content-Type": "application/json",
      },
    });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let answer = "";
    const aiMessageIndex =
      messages.value.push({
        sender: "ai",
        type: "text",
        content: "", // 初始化为空
      }) - 1;

    // 添加 AI 的实际回复
    while (!done) {
      const { done: doneRead, value } = await reader.read();
      if (value) {
        const text = decoder.decode(value, { stream: true });
        for (const line of text.split("\n")) {
          if (line.startsWith("event:")) {
            // 如果 currentChatId 等于 newChatId，更新为事件中的 event 值
            if (currentChatId.value === newChatId.value) {
              const currentNewChatId = line.slice(6);
              if (currentNewChatId) {
                currentChatId.value = currentNewChatId;
                chatHistory.value.shift();
                if (chatHistory.value[0]) {
                  chatHistory.value[0].chatId = currentNewChatId;
                } else {
                  // 获取 openingStatement
                  chatHistory.value.unshift({
                    id: currentNewChatId,
                    title: "新会话",
                    time: new Date().toLocaleDateString("zh-CN", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    introduction: assistantOpeningStatement.value,
                  });
                }
              }
            }
          }

          if (line.startsWith("data:")) {
            // 提取 data 后面的内容
            let encoded = line.slice(5);
            console.log("encoded:", encoded);
            let binaryString = atob(encoded); // 解码为二进制字符串
            let data = new TextDecoder('utf-8').decode(new Uint8Array([...binaryString].map(char => char.charCodeAt(0)))); // 将二进制字符串转换为 UTF-8 字符串
   
            console.log("answer:", data);

            answer += data;

            // 不立即使用 marked.parse，而是在 UI 上显示原始 Markdown
            messages.value[aiMessageIndex].content = answer;
          }
        }
      }
      if (doneRead) {
        done = true;
      }
    }
  } catch (error) {
    console.error("获取AI回复出错:", error);
    errorMessage.value = `获取回复失败：${
      error?.response?.data?.message || error.message
    }`; // 尝试获取更详细的错误信息
    messages.value.push({
      sender: "ai",
      type: "text",
      content: `抱歉，获取回复时出错：${errorMessage.value} 请稍后再试。`,
    });
  } finally {
    isLoading.value = false;
    // 再次滚动到底部，确保AI的回复可见
    await nextTick();
    // scrollToBottom();
  }
};

const toggleReferencePanel = () => {
  isReferenceCollapsed.value = !isReferenceCollapsed.value;
};

const deleteChat = async (chatId) => {
  try {
    console.log("删除会话:", chatId);
    if (!confirm("确定要删除这个会话吗？")) {
      return;
    }

    isLoading.value = true;
    errorMessage.value = "";

    await userApi.deleteConversation(currentAssistantId.value, chatId);

    // 更新本地状态
    chatHistory.value = chatHistory.value.filter((chat) => chat.id !== chatId);

    // 如果删除的是当前会话，自动切换到第一个会话或创建新会话
    if (chatId === currentChatId.value) {
      if (chatHistory.value.length > 0) {
        messages.value = [];
        switchChat(chatHistory.value[0].id);
      } else {
        // 没有会话了，可以创建一个新的
        await createNewChat();
      }
    }
  } catch (error) {
    console.error("删除会话失败:", error);
    errorMessage.value = `删除会话失败: ${error.message}`;
  } finally {
    isLoading.value = false;
  }
};

const switchChat = (chatId) => {
  // if (currentChatId.value === chatId) return;
  currentChatId.value = chatId;
  console.log(`切换到会话: ${chatId}`);
  // 处理示例会话
  fetchConversationMessage(chatId);
};

const fetchConversationList = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";

    console.log(`获取会话中，当前助手: ${currentAssistantId.value}`);
    currentChatId.value = "";
    chatHistory.value = [];
    messages.value = [];
    console.log("清空会话，chatHistory.value:", chatHistory.value);
    // 注意：API参数已变更，不再需要startPage和pageSize
    const response = await userApi.getConversationList(currentAssistantId.value);

    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data)
    ) {
      chatHistory.value = response.data.data.map((item) => ({
        id: item.id,
        title: item.name,
        time: new Date(item.createdAt * 1000).toLocaleDateString("zh-CN", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        introduction: item.introduction,
      }));
      console.log("成功获取会话列表，chatHistory.value:", chatHistory.value);

      if (chatHistory.value.length > 0) {
        currentChatId.value = chatHistory.value[0].id;
        fetchConversationMessage(currentChatId.value);
      } else {
        createNewChat();
        currentChatId.value = newChatId.value;
      }
    }
  } catch (error) {
    console.error("获取会话列表失败:", error);
    errorMessage.value = `获取会话列表失败: ${error.message}`;
  } finally {
    isLoading.value = false;
  }
};

const fetchConversationMessage = async (chatId) => {
  try {
    console.log("chatId:", chatId);
    console.log("chatHistory.value:", chatHistory.value);
    const introduction = chatHistory.value.find(chat => chat.id === chatId).introduction;
    console.log(`introduction: ${introduction}`);
    messages.value = [];
    if(introduction){
      messages.value.push({
        sender: "ai",
        type: "text",
        content: introduction,
      });
    }
    if(chatId == newChatId.value){
      return;
    }
    const response = await userApi.getConversationMessage(currentAssistantId.value, chatId);

    // 根据API响应结构调整处理方式
    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data)
    ) {
      response.data.data.flatMap((item) => {
        messages.value.push({
          sender: "user",
          type: "text",
          content: item.query,
        });

        messages.value.push({
          sender: "ai",
          type: "text",
          content: item.answer,
        });
      });
    }
  } catch (error) {
    console.error("获取会话消息失败:", error);
    errorMessage.value = `获取会话消息失败: ${error.message}`;
  }
};

const toggleEditTitle = () => {
  isEditingTitle.value = !isEditingTitle.value;
  if (isEditingTitle.value) {
    editingTitle.value = currentChatTitle.value;
  }
};

const saveTitle = async () => {
  if (editingTitle.value.trim() === "") return;

  try {
    await userApi.renameConversation(
      currentAssistantId.value,
      currentChatId.value,
      editingTitle.value
    );

    const chat = chatHistory.value.find(
      (chat) => chat.id === currentChatId.value
    );
    if (chat) {
      chat.title = editingTitle.value;
    }
    isEditingTitle.value = false;
  } catch (error) {
    console.error("重命名会话失败:", error);
    errorMessage.value = `重命名会话失败: ${error.message}`;
  }
};

const autoRenameTitle = async () => {
  if (editingTitle.value.trim() === "") return;

  try {
    const response = await userApi.autoRenameConversation(
      currentAssistantId.value,
      currentChatId.value,
    );

    const chat = chatHistory.value.find(
      (chat) => chat.id === currentChatId.value
    );
    if (chat) {
      chat.title = response.data.name;
    }
    isEditingTitle.value = false;
  } catch (error) {
    console.error("重命名会话失败:", error);
    errorMessage.value = `重命名会话失败: ${error.message}`;
  }
};

const copyMessage = (content) => {
  navigator.clipboard.writeText(content)
  .then(() => {
    const notification = document.createElement('div');
    notification.textContent = '已复制到剪贴板';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = '#f0f0f0';
    notification.style.color = '#000';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '1000';
    document.body.appendChild(notification);

    setTimeout(() => {
      document.body.removeChild(notification);
    }, 1000);
  })
  .catch((err) => {
    console.error("复制失败:", err);
  });
};

const regenerateMessage = (index) => {
  // 这里可以添加重新回答的逻辑
  console.log("重新回答消息:", index);
};

const switchView = (view) => {
  currentView.value = view;
};

const fetchAssistantList = async () => {
  try {
    const response = await userApi.getAssistantList();
    assistants.value = response.data;
  } catch (error) {
    console.error("获取助手列表失败:", error);
    errorMessage.value = `获取助手列表失败: ${error.message}`;
  }
};

// 生成随机背景色
const getRandomColor = () => {
  const hue = Math.floor(Math.random() * 360); // 随机色相
  const saturation = 70 + Math.floor(Math.random() * 20); // 饱和度在70-90之间
  const lightness = 80 + Math.floor(Math.random() * 10); // 亮度在80-90之间
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// 切换助手
const switchAssistant =  async (assistantId) => {
  currentAssistantId.value = assistantId;
  console.log(`切换到助手: ${assistantId}`);
  // 这里可以添加切换助手的逻辑，例如重新获取会话列表等
  
  fetchConversationList();
  const response = await userApi.getParameters(assistantId);
  assistantOpeningStatement.value = response.data.openingStatement;

};

// 初始化 ECharts 图表
const initChart = () => {
  if (chart.value) {
    myChart = echarts.init(chart.value);
    myChart.setOption({
      tooltip: {},
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'force',
          force: {
            repulsion: 100,
            edgeLength: 100,
          },
          data: [],
          links: [],
          roam: true,
          label: {
            show: true,
          },
          lineStyle: {
            color: 'source',
            curveness: 0.3,
          },
        },
      ],
    });
  }
};

// 更新图表数据
const updateChart = (data) => {
  if (myChart) {
    myChart.setOption({
      series: [
        {
          data: data.nodes,
          links: data.links,
        },
      ],
    });
  }
};

// 发送 Cypher 查询并更新图表
const sendCypherQuery = async (cypherQuery) => {
  try {
    const response = await apiClient.post('/graph/query', { query: cypherQuery });
    updateChart(response.data);
  } catch (error) {
    console.error('Cypher 查询失败:', error);
  }
};

// 在组件加载时初始化图表
onMounted(async () => {
  await fetchAssistantList();
  currentAssistantId.value = assistants.value[0].id;
  await fetchConversationList();
  initChart();
});

// 在组件销毁时销毁图表
onUnmounted(() => {
  if (myChart) {
    myChart.dispose();
  }
});

// 右键菜单的样式
const rightMenuStyle = computed(() => ({
  left: `${contextmenuLeft.value}px`,
  top: `${contextmenuTop.value}px`,
}));

// 处理删除会话
const handleDeleteChat = () => {
  if (rightNodeData.value && rightNodeData.value.id) {
    deleteChat(rightNodeData.value.id);
    closeRightMenu(); // 关闭右键菜单
  }
};
</script>

<style scoped>
.ai-assistant-container {
  display: flex;
  height: calc(100vh - var(--header-height)); /* 减去顶部导航栏的高度 */
  background-color: #f7f9fc;
  overflow: hidden; /* 确保容器不会滚动 */
}

/* History Panel */
.history-panel {
  width: 280px;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto; /* 允许历史面板内部滚动 */
  height: 100%; /* 确保历史面板高度占满父容器 */
}

.toggle-mock-mode input[type="checkbox"] {
  margin-right: 5px;
}

.view-switcher {
  display: flex;
  margin-bottom: 15px;
}

.view-button {
  flex: 1;
  padding: 8px;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  margin-right: 5px;
}

.view-button.active {
  background-color: #e7f1fd;
  border-color: #4285f4;
}

.new-chat-button {
  width: 100%;
  padding: 10px;
  background-color: #e7f1fd;
  color: #4285f4;
  border: 1px solid #4285f4;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 15px;
}

.new-chat-button:disabled {
  background-color: #f0f0f0;
  color: #999;
  border-color: #ddd;
  cursor: not-allowed;
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
  flex-grow: 1;
  overflow-y: hidden;
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
  background-color: #e7f1fd;
  font-weight: bold;
}

.history-panel li:hover {
  background-color: #f0f2f5;
}

.history-panel li small {
  font-size: 12px;
  color: #9aa0a6;
}

.manage-button {
  width: 100%;
  padding: 8px;
  background: none;
  border: 1px solid #e0e0e0;
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
  background-color: #ffffff;
  overflow: hidden; /* 确保聊天主区域不会滚动 */
  height: 100%; /* 确保聊天主区域高度占满父容器 */
}

.chat-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  color: #1e293b;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #5f6368;
}

.message-area {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto; /* 允许消息区域内部滚动 */
  display: flex;
  flex-direction: column;
  gap: 30px; /* 增加消息间距 */
}

.error-message {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  padding: 10px;
  border-radius: 4px;
  color: #cf1322;
  margin-bottom: 10px;
}

.message-bubble {
  position: relative;
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  margin-bottom: 15px; /* 增加底部间距给按钮 */
}

.message-bubble:hover .message-actions {
  display: flex;
  opacity: 1;
  transition: opacity 1s ease;
}

.message-bubble.user {
  background-color: #e7f1fd;
  color: #1e293b;
  border-bottom-right-radius: 2px;
  align-self: flex-end;
}

.message-bubble.ai {
  background-color: #f0f2f5;
  color: #1e293b;
  border-bottom-left-radius: 2px;
  align-self: flex-start;
}

/* 代码块容器样式 */
.code-block-wrapper {
  position: relative;
  margin: 0;
  padding: 0;
}

.code-block-wrapper pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  background-color: #1f2937;
  color: #e6edf3;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.45;
}

.code-block-wrapper code {
  background-color: transparent;
  padding: 0;
  margin: 0;
  border-radius: 0;
  font-family: inherit;
  white-space: pre;
}

.code-copy-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #e6edf3;
  font-size: 14px;
  cursor: pointer;
  padding: 2px 5px;
  border-radius: 3px;
  display: none;
}

.code-block-wrapper:hover .code-copy-button {
  display: block;
}

/* 输入区域相关样式 */
.input-area {
  display: flex;
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  gap: 10px;
  flex-shrink: 0;
}

.input-area textarea {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  resize: none;
  font-size: 14px;
  min-height: 40px;
  max-height: 120px;
  line-height: 1.4;
  font-family: inherit;
}

.input-area textarea:focus {
  outline: none;
  border-color: #4285f4;
}

.input-area textarea:disabled {
  background-color: #f5f5f5;
  color: #999;
}

.send-button {
  padding: 0 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  align-self: flex-end;
  height: 42px;
}

.send-button:hover {
  background-color: #3367d6;
}

.send-button:disabled {
  background-color: #a4c2f4;
  cursor: not-allowed;
}

/* Reference Panel */
.reference-panel {
  width: 320px;
  background-color: #ffffff;
  border-left: 1px solid #e0e0e0;
  padding: 15px;
  flex-shrink: 0;
  transition: width 0.3s ease;
  position: relative;
  overflow-y: auto; /* 允许参考面板内部滚动 */
  height: 100%; /* 确保参考面板高度占满父容器 */
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
.reference-panel.collapsed {
  width: 40px;
  padding: 15px 5px;
}

.reference-panel.collapsed > div {
  display: none;
}

.collapse-toggle {
  position: absolute;
  top: 10px;
  left: 5px;
  background: none;
  border: none;
  font-size: 12px;
  cursor: pointer;
  color: #5f6368;
  z-index: 1;
  padding: 5px;
  writing-mode: horizontal-tb;
  transform: none;
}

.reference-panel.collapsed .collapse-toggle {
  writing-mode: horizontal-tb;
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
  padding-left: 10px;
  margin-bottom: 15px;
}

.reference-panel li {
  font-size: 13px;
  color: #4285f4;
  margin-bottom: 5px;
  cursor: pointer;
}

.reference-panel li:hover {
  text-decoration: underline;
}

/* GitHub Markdown CSS 自定义覆盖样式 */
:deep(.markdown-body) {
  background-color: transparent !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  color: inherit !important;
  box-shadow: none !important;
  max-width: 100% !important;
}

:deep(.markdown-body pre) {
  background-color: #1f2937 !important;
  border-radius: 6px !important;
  margin-top: 8px !important;
  margin-bottom: 8px !important;
}

:deep(.markdown-body code) {
  background-color: rgba(175, 184, 193, 0.2) !important;
  color: #c7254e !important;
  border-radius: 3px !important;
}

:deep(.markdown-body pre code) {
  background-color: transparent !important;
  color: #d1d5db !important;
  padding: 0 !important;
  border-radius: 0 !important;
}

:deep(.markdown-body h1:first-child),
:deep(.markdown-body h2:first-child),
:deep(.markdown-body h3:first-child) {
  margin-top: 0 !important;
}

:deep(.markdown-body table) {
  display: block;
  width: 100%;
  overflow-x: auto;
}

:deep(.markdown-body img) {
  max-width: 100%;
  height: auto;
}

.chat-item-right {
  display: flex;
  align-items: center;
}

.delete-btn {
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 14px;
  line-height: 18px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 5px;
}

.delete-btn:hover {
  background-color: #ff7875;
}

/* 管理模式下的会话样式调整 */
.history-panel li.managing {
  cursor: default;
}

.title-input {
  padding: 5px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  width: 200px;
}

.title-input:focus {
  outline: none;
  border-color: #4285f4;
}

.message-actions {
  display: flex;
  position: absolute;
  bottom: -25px;
  left: 0;
  gap: 10px;
  opacity: 1; /* 始终显示 */
}

.copy-button,
.regenerate-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 16px; /* 增加图标大小 */
  padding: 0;
}

.copy-button:hover,
.regenerate-button:hover {
  color: #4285f4;
}

.title-edit-container {
  display: flex;
  align-items: center;
  margin-right: 5px;
}

.star-button {
  background: none;
  border: none;
  color: #f8c01a;
  font-size: 18px;
  cursor: pointer;
  padding: 0 5px;
  margin-right: 5px;
}

.assistant-list {
  flex-grow: 1;
  overflow-y: auto;
}

.assistant-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.assistant-info {
  flex: 1;
}

.add-assistant-button {
  width: 100%;
  padding: 10px;
  background-color: #e7f1fd;
  color: #4285f4;
  border: 1px solid #4285f4;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
}

.tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
  margin-left: 5px;
}

.assistant-item.active {
  background-color: #e7f1fd; /* 浅蓝色背景 */
  border-left: 3px solid #4285f4; /* 左侧蓝色边框 */
}

/* 右键菜单样式 */
.right-menu {
  position: absolute;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.right-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.right-menu li {
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}

.right-menu li:hover {
  background-color: #f0f2f5;
}

</style>
