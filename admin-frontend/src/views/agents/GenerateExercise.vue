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
        <select id="type" v-model="type">
          <option value="multiple-choice">选择题</option>
          <option value="true-false">判断题</option>
          <option value="short-answer">简答题</option>
        </select>
      </div>
      <button type="submit">生成习题</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      difficulty: 'easy',
      type: 'multiple-choice'
    };
  },
  methods: {
    async generateExercise() {
      const request = {
        difficulty: this.difficulty,
        type: this.type
      };
      try {
        const response = await this.$http.post('/v1/agent/generateExercise', request);
        console.log('习题生成成功:', response.data);
      } catch (error) {
        console.error('习题生成失败:', error);
      }
    }
  }
};
</script>

<style scoped>
/* 样式可以根据需要添加 */
</style>
