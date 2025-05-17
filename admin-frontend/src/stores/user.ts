import { defineStore } from "pinia";
import { ref } from "vue";
import { login as loginApi } from "@/api/auth";

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(localStorage.getItem("authToken") || "");
  const isLoggedIn = ref<boolean>(!!localStorage.getItem("authToken"));
  async function login(username: string, password: string) {
    try {
      const response = await loginApi(username, password);
      token.value = response.token;
      localStorage.setItem("authToken", token.value);
      isLoggedIn.value = true;
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  }
  function logout() {
    token.value = "";
    localStorage.removeItem("authToken");
    isLoggedIn.value = false;
  }

  return {
    token,
    isLoggedIn,
    login,
    logout,
  };
});
