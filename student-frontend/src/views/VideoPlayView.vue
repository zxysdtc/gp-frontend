<template>
  <div v-if="loading">
    <p>正在加载视频资源...</p>
  </div>
  <div v-if="error">
    <p>加载视频资源失败: {{ error }}</p>
  </div>
  <div v-else-if="video.url">
    <h1>{{ video.title }}</h1>
    <!-- 在这里添加视频播放器或其他相关内容 -->
    <video class="video-player" :src="video.url" controls></video>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import apiClient from "@/api/axios";

const route = useRoute();
const videoResource = ref(null);
const video = ref({
  title: "",
  url: "",
});
const loading = ref(null);
const error = ref(null);

console.log("脚本加载完成，开始处理视频资源");
console.log("route", route);
onMounted(() => {
  console.log("route", route);
  const query = route.query;
  console.log("query", query);
  console.log("query.videoResource", query.videoResource);
  try {
    if (!query.videoResource) {
      throw new Error("videoResource 参数未传递");
    }
    videoResource.value = JSON.parse(query.videoResource);
    console.log("videoResource", videoResource.value);

    if (!videoResource.value.id || !videoResource.value.title) {
      throw new Error("videoResource 参数缺少 id 或 title");
    }

    fetchVideoUrl(videoResource.value)
      .then(() => {
        console.log("视频 URL 获取成功");
      })
      .catch((err) => {
        console.error("获取视频 URL 失败:", err);
        error.value = err.message;
      })
      .finally(() => {
        loading.value = false;
      });
  } catch (err) {
    console.error("解析 videoResource 参数失败:", err);
    error.value = err.message;
    loading.value = false;
  }
});

const fetchVideoUrl = async (resourceData) => {
  try {
    if (!resourceData || !resourceData.id || !resourceData.title) {
      throw new Error("无效的视频资源数据");
    }
    console.log("开始获取视频 URL", resourceData);
    const response = await apiClient.get(`/files/video/${resourceData.id}`, {
      responseType: "blob",
    });
    const fileName =
      resourceData.title.split(".").slice(0, -1).join(".") ||
      `视频-${resourceData.id}`;
    video.value = {
      title: fileName,
      url: URL.createObjectURL(response.data),
    };
    return video.value;
  } catch (err) {
    console.error("API 请求失败:", err);
    throw err;
  }
};
</script>

<style scoped>
.video-player {
  max-width: 100%;
  margin-top: 1rem;
}
</style>
