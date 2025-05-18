<template>
  <div class="add-agent-container">
    <h2>{{ isEdit ? "编辑智能体" : "添加智能体" }}</h2>

    <el-form
      :model="agentForm"
      :rules="rules"
      ref="agentFormRef"
      label-width="100px"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="agentForm.name"
          placeholder="请输入智能体名称"
        ></el-input>
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="agentForm.description"
          type="textarea"
          :rows="4"
          placeholder="请输入智能体描述"
        ></el-input>
      </el-form-item>

      <el-form-item label="网址" prop="url">
        <el-input
          v-model="agentForm.url"
          placeholder="请输入智能体网址"
        ></el-input>
      </el-form-item>

      <el-form-item label="头像" prop="avatar">
        <el-upload
          class="avatar-uploader"
          action="#"
          :http-request="uploadImage"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
        >
          <el-img
            v-if="agentForm.avatar"
            :src="agentForm.avatar"
            class="avatar"
          />
          <el-icon v-else class="avatar-uploader-icon"
            ><el-icon-plus
          /></el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="loading">{{
          isEdit ? "更新" : "添加"
        }}</el-button>
        <el-button @click="$router.push('/agents')">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { createAgent, updateAgent, type Agent } from "@/api/agents";
import type {
  FormInstance,
  FormRules,
  UploadRequestOptions,
} from "element-plus";

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const agentFormRef = ref<FormInstance>();

const isEdit = computed(() => route.query.id !== undefined);

const agentForm = reactive<Agent>({
  name: "",
  description: "",
  url: "",
  avatar: "",
});

const rules: FormRules = {
  name: [
    { required: true, message: "请输入智能体名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
  ],
  description: [
    { required: true, message: "请输入智能体描述", trigger: "blur" },
  ],
  url: [
    { required: true, message: "请输入智能体网址", trigger: "blur" },
    {
      pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/,
      message: "请输入有效的URL",
      trigger: "blur",
    },
  ],
  avatar: [{ required: true, message: "请上传智能体头像", trigger: "change" }],
};

const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error("头像必须是图片文件!");
  }

  if (!isLt2M) {
    ElMessage.error("头像大小不能超过 2MB!");
  }

  return isImage && isLt2M;
};

// 在实际项目中，这里应该调用后端API上传图片
const uploadImage = async (options: UploadRequestOptions) => {
  const file = options.file;

  // 这里仅作为示例，真实项目中应该上传到服务器
  // 这里使用FileReader模拟图片上传后的URL
  const reader = new FileReader();
  reader.readAsDataURL(file as Blob);
  reader.onload = (e) => {
    agentForm.avatar = e.target?.result as string;
  };
};

const handleSubmit = async () => {
  if (!agentFormRef.value) return;

  await agentFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        if (isEdit.value) {
          const id = Number(route.query.id);
          await updateAgent(id, agentForm);
          ElMessage.success("智能体更新成功");
        } else {
          await createAgent(agentForm);
          ElMessage.success("智能体添加成功");
        }
        router.push("/agents");
      } catch (error) {
        console.error("提交失败:", error);
        ElMessage.error("操作失败，请重试");
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.add-agent-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  width: 178px;
  height: 178px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
