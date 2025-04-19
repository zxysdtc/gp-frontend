<template>
  <div class="help-view">
    <h1>帮助中心</h1>
    <p>在这里您可以找到常见问题解答、使用教程和联系支持的方式。</p>
     <div class="faq-section card">
        <h3>常见问题 (FAQ)</h3>
        <details class="faq-item">
            <summary>如何查看我的学习进度？</summary>
            <p>您可以在学生主页的"学习进度概览"卡片中查看您的整体进度。详细步骤请访问"学习路径"页面。</p>
        </details>
         <details class="faq-item">
            <summary>知识图谱如何使用？</summary>
            <p>点击知识图谱页面上的节点可以查看详情。您可以使用顶部的搜索框查找特定知识点，并使用底部的控件进行缩放和平移。</p>
        </details>
        <!-- 更多 FAQ -->
    </div>
    <div class="contact-section card">
         <h3>联系支持</h3>
         <p>如果遇到问题无法解决，请通过以下方式联系我们：</p>
         <p>邮箱：support@example.com</p>
         <p>电话：123-456-7890</p>
    </div>
  </div>
</template>

<script setup>
// 帮助视图逻辑
</script>

<style scoped>
.help-view {
  padding: 20px 30px;
}
.help-view h1 {
  font-size: 20px;
  margin-bottom: 20px;
}
.card { /* 复用通用卡片样式 */
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0px 1px 3px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 25px;
}
.card h3 {
    font-size: 16px;
    margin-top: 0;
    margin-bottom: 15px;
}
.faq-item {
    border-bottom: 1px solid #E0E0E0;
    padding: 10px 0;
}
.faq-item:last-child {
    border-bottom: none;
}
.faq-item summary {
    font-weight: bold;
    cursor: pointer;
    font-size: 14px;
    color: #1E293B;
}
.faq-item p {
    margin-top: 10px;
    font-size: 14px;
    color: #5f6368;
    padding-left: 20px; /* 缩进内容 */
}
.contact-section p {
    font-size: 14px;
    color: #5f6368;
    line-height: 1.6;
}
</style>
