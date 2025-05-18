<template>
  <div>
    <h1>生成习题</h1>
    <form @submit.prevent="generateExercise">
      <div>
        <label for="difficulty">难度：</label>
        <select id="difficulty" v-model="difficulty">
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </div>
      <div>
        <label for="type">题目类型：</label>
        <el-select
          id="type"
          v-model="type"
          multiple
          placeholder="请选择题型"
          style="width: 240px"
        >
          <el-option
            v-for="item in [
              { value: 'multiple-choice', label: '选择题', count: 0 },
              { value: 'true-false', label: '判断题', count: 0 },
              { value: 'short-answer', label: '简答题', count: 0 },
              { value: 'fill-in-the-blank', label: '填空题', count: 0 },
              { value: 'program', label: '编程题', count: 0 },
            ]"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div>
        <label for="topic">题目主题：</label>
        <input id="topic" v-model="topic" />
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? "生成中..." : "生成习题" }}
      </button>
    </form>

    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在生成习题，请稍候...</p>
    </div>

    <div v-if="exerciseResult" class="result-container">
      <h2>生成结果</h2>
      <div class="exercise-content">
        <pre>{{ exerciseResult }}</pre>
      </div>
    </div>

    <div v-if="errorMessage" class="error-container">
      <p>{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import http from "../../api/http";

export default defineComponent({
  data() {
    return {
      difficulty: "medium",
      type: [], // 改为数组以支持多选
      topic: "",
      exerciseResult: null,
      isLoading: false,
      errorMessage: null,
    };
  },
  methods: {
    async generateExercise() {
      this.isLoading = true;
      this.exerciseResult = null;
      this.errorMessage = null;

      const request = {
        assistantId: this.$route.params.id,
        input:{
          difficulty: this.difficulty,
          type: this.type,
          topic: this.topic,
        },
      };      try {
        const response = await http.post(
          "/v1/agent/generateExercise",
          request
        );
        console.log("习题生成成功:", response.data);

        // 处理返回的结果
        if (response.data) {
          this.exerciseResult = this.formatExerciseResult(response.data);
        } else {
          this.errorMessage = "未获取到习题内容";
        }
      } catch (error) {
        console.error("习题生成失败:", error);
        this.errorMessage = `习题生成失败: ${
          error.response?.data?.message || error.message || "未知错误"
        }`;
      } finally {
        this.isLoading = false;
      }
    },

    formatExerciseResult(data) {
      // 根据实际后端返回的数据结构进行格式化
      // 假设数据结构中有 content 或类似字段包含习题内容
      if (data.content) {
        return data.content;
      } else if (data.exercise) {
        return data.exercise;
      } else if (typeof data === "string") {
        return data;
      } else {
        // 如果是复杂的对象，可以对其进行格式化
        return JSON.stringify(data, null, 2);
      }
    },
  },
});
</script>

<style scoped>
.loading-container {
  margin-top: 20px;
  text-align: center;
  padding: 20px;
}

.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.result-container {
  margin-top: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  background-color: #f9f9f9;
}

.exercise-content {
  max-height: 400px;
  overflow-y: auto;
  background-color: white;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  white-space: pre-wrap;
}

.error-container {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #ffecec;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #333;
}

form {
  margin-bottom: 20px;
}

button {
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

select,
input {
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  max-width: 300px;
}

label {
  display: inline-block;
  margin-bottom: 5px;
  font-weight: bold;
}

div > div {
  margin-bottom: 15px;
}
</style>
