<template>
  <div class="add-agent-container">
    <h2>{{ isEdit ? "编辑智能体" : "添加智能体" }}</h2>

    <el-form
      :model="agentForm"
      :rules="rules"
      ref="agentFormRef"
      label-width="100px"
    >
      <el-form-item label="头像" prop="avatar">
        <el-upload
          action="#"
          :http-request="uploadImage"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
        >
          <el-avatar
            v-if="agentForm.avatar"
            :src="getAvatarSrc(agentForm.avatar)"
            :size="100"
          />
          <el-icon v-else class="avatar-uploader-icon" :size="100">
            <el-icon-plus />
          </el-icon>
        </el-upload>
      </el-form-item>

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

      <el-form-item label="apiKey" prop="apiKey">
        <el-input
          v-model="agentForm.apiKey"
          placeholder="请输入智能体apiKey"
        ></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="enabled">
        <el-switch v-model="agentForm.enabled" />
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
  apiKey: "",
  avatar: "",
  id: 0,
  enabled: true,
});

const rules: FormRules = {
  name: [
    { required: true, message: "请输入智能体名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
  ],
  description: [
    { required: true, message: "请输入智能体描述", trigger: "blur" },
  ],
  apiKey: [
    { required: true, message: "请输入智能体apiKey", trigger: "blur" },
    {
      min: 10,
      max: 100,
      message: "长度在 10 到 100 个字符",
      trigger: "blur",
    },
  ],
  avatar: [{ required: true, message: "请上传智能体头像", trigger: "change" }],
};

const beforeAvatarUpload = async (file: File) => {
  let valid = true;
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 10;

  if (!isImage) {
    ElMessage.error("头像必须是图片文件!");
    valid = false;
  }

  if (!isLt2M) {
    const compressedFile = await compressImage(file);
    if (!compressedFile) {
      valid = false;
    }
  }
  console.log("valid:", valid);
  return valid;
};

const compressImage = (file: File): Promise<File | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(null);
          }
        },
        file.type,
        0.7
      );
    };

    reader.readAsDataURL(file);
  });
};

// 在实际项目中，这里应该调用后端API上传图片
const uploadImage = async (options: UploadRequestOptions) => {
  const file = options.file;
  if (!file) return;
  // 这里使用FileReader模拟图片上传后的URL
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    // 提取Base64部分，去掉MIME前缀
    const base64Data = result.split(',')[1];
    console.log( 'avatar result:', base64Data)
    agentForm.avatar = base64Data;
  };
  // 添加这一行来启动文件读取
  reader.readAsDataURL(file);
};
const getAvatarSrc = (avatarData: string) => {
  console.log("avatarData:", avatarData);
  if (!avatarData) return "";

  // 如果已经是完整的data URL，则直接返回
  if (avatarData.startsWith("data:")) {
    return avatarData;
  }

  // 否则添加前缀
  return `data:image/png;base64,${avatarData}`;
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

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  background-color: #f5f7fa;
}
</style>
