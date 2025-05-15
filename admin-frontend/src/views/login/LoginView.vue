<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="logo">
        <h2>管理系统</h2>
      </div>

      <el-form
        :model="loginForm"
        :rules="rules"
        ref="loginFormRef"
        label-width="0"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="el-icon-user"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="el-icon-lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user";
import type { FormInstance, FormRules } from "element-plus";

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const loginFormRef = ref<FormInstance>();

const loginForm = reactive({
  username: "",
  password: "",
});

const rules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const result = await userStore.login(
          loginForm.username,
          loginForm.password
        );
        if (result) {
          ElMessage.success("登录成功");
          router.push("/");
        } else {
          ElMessage.error("登录失败，请检查用户名和密码");
        }
      } catch (error) {
        ElMessage.error("登录出错");
        console.error(error);
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
}

.login-card {
  width: 350px;
}

.logo {
  text-align: center;
  margin-bottom: 30px;
}

.login-button {
  width: 100%;
}
</style>
