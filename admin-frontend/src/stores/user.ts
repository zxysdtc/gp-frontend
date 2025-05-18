import { defineStore } from "pinia";
import { ref } from "vue";
import { login as loginApi } from "@/api/auth";
import apiClient from "@/api/http";

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(localStorage.getItem("authToken") || "");
  const isLoggedIn = ref<boolean>(!!localStorage.getItem("authToken"));
  const userRole = ref<string>(localStorage.getItem("userRole") || "");

  async function login(username: string, password: string) {
    try {
      const response = await apiClient.post("/auth/login", {
        username,
        password,
      });
      console.log("Login response:", response); // 添加调试日志

      // 修改: 正确访问response.data中的token和role
      if (!response || !response.data || !response.data|| !response.data.token) {
        console.error("Token not found in response:", response);
        return false;
      }

      // 设置token和角色
      token.value = response.data.token;
      userRole.value = response.data.role || "";

      // 保存到localStorage
      localStorage.setItem("authToken", token.value);
      if (response.data.role) {
        localStorage.setItem("userRole", response.data.role);
      }

      console.log("Token saved to localStorage:", token.value);
      console.log("Role saved:", userRole.value);

      isLoggedIn.value = true;
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  }

  function logout() {
    token.value = "";
    userRole.value = "";
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    isLoggedIn.value = false;
  }

  return {
    token,
    isLoggedIn,
    userRole,
    login,
    logout,
  };
});
