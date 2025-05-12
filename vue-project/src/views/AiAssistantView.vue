<template>
  <div class="ai-assistant-container">
    <aside class="history-panel">
      <button
        class="new-chat-button"
        @click="createNewChat"
        :disabled="isLoading"
      >
        <span v-if="isLoading">正在创建...</span>
        <span v-else>+ 新建会话</span>
      </button>
      <h4>历史会话</h4>
      <ul>
        <li
          v-for="chat in chatHistory"
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
      <button
        class="manage-button"
        @click="toggleManageMode"
        :class="{ active: isManagingChats }"
      >
        管理会话
      </button>
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
          <button class="star-button" @click="autoRenameTitle" style="position: absolute; right: 1px; top: 50%; transform: translateY(-50%); z-index: 2; background-color: white;">✧</button>
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
        {{ isReferenceCollapsed ? "展开" : "收起" }}
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
import { ref, computed, nextTick, onMounted } from "vue";
import apiClient from "@/api/axios";
import { marked } from "marked";
import "github-markdown-css";

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
};

const newTitle = ref("新会话");
const currentChatId = ref(""); // 当前会话ID
const chatHistory = ref([]);

const messages = ref([]);
const newMessage = ref("");
const isReferenceCollapsed = ref(false);
const isLoading = ref(false); // 添加加载状态
const errorMessage = ref(""); // 添加错误信息
const isManagingChats = ref(false);
const isEditingTitle = ref(false);
const editingTitle = ref("");
const newChatId = ref(0);

const assistantId = 1; // 添加助手ID变量，可以从配置或状态中获取

const currentChatTitle = computed(() => {
  const current = chatHistory.value.find(
    (chat) => chat.id === currentChatId.value
  );
  return current ? current.title : newTitle.value;
});

const createNewChat = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  errorMessage.value = "";
  
  try {
    const response = await userApi.getParameters(assistantId);
    const openingStatement = response.data.openingStatement;
    console.log(`openingStatement: ${openingStatement}`);
    chatHistory.value.unshift({
      id: newChatId.value,
      title: "新会话",
      time: new Date().toLocaleDateString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      introduction: openingStatement,
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
  newMessage.value = ""; // 发送后立即清空输入框

  isLoading.value = true;
  errorMessage.value = "";

  // 滚动到底部以显示新消息和"正在思考"
  await nextTick(); // 等待DOM更新
  // 可能需要一个方法来滚动聊天区域到底部，例如：scrollToBottom();

  try {
    const response = await fetch("http://localhost:8080/api/v1/chat/sse", {
      method: "POST",
      body: JSON.stringify({
        chatId: currentChatId.value,
        assistantId: assistantId,
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
        text.split("\n").forEach((line) => {
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
        });
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
    if (!confirm("确定要删除这个会话吗？")) {
      return;
    }

    isLoading.value = true;
    errorMessage.value = "";

    await userApi.deleteConversation(assistantId, chatId);

    // 更新本地状态
    chatHistory.value = chatHistory.value.filter((chat) => chat.id !== chatId);

    // 如果删除的是当前会话，自动切换到第一个会话或创建新会话
    if (chatId === currentChatId.value) {
      if (chatHistory.value.length > 0) {
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
  if (currentChatId.value === chatId) return;
  currentChatId.value = chatId;
  console.log(`切换到会话: ${chatId}`);
  // 处理示例会话
  fetchConversationMessage(chatId);
};

const fetchConversationList = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";

    // 注意：API参数已变更，不再需要startPage和pageSize
    const response = await userApi.getConversationList(assistantId);

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

      if (chatHistory.value.length > 0) {
        currentChatId.value = chatHistory.value[0].id;
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
    messages.value.push({
      sender: "ai",
      type: "text",
      content: introduction,
    });
    if(chatId == newChatId.value){
      return;
    }
    const response = await userApi.getConversationMessage(assistantId, chatId);

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
      assistantId,
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
      assistantId,
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

// 组件加载时获取会话列表
onMounted(async () => {
  await fetchConversationList();
  if (currentChatId.value) {
    fetchConversationMessage(currentChatId.value);
  }
});
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
  overflow-y: auto;
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
  writing-mode: vertical-rl;
  text-orientation: mixed;
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
</style>
