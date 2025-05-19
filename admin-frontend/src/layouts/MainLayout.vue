<template>
  <div class="main-layout">
    <el-container>
      <el-aside width="200px">
        <el-menu
          :router="true"
          :default-active="$route.path"
          class="aside-menu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          style="height: 100vh"
        >
          <el-menu-item index="/dashboard">
            <el-icon><Menu /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>

          <el-sub-menu index="/agents">
            <template #title>
              <el-icon><User /></el-icon>
              <span>智能体管理</span>
            </template>
            <el-menu-item index="/agents">查看智能体</el-menu-item>
            <el-menu-item index="/agents/add">添加智能体</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="/knowledge-graph">
            <template #title>
              <el-icon><Connection /></el-icon>
              <span>知识图谱管理</span>
            </template>
            <el-menu-item index="/knowledge-graph">知识图谱</el-menu-item>
            <el-menu-item index="/knowledge-graph-generate">生成知识图谱</el-menu-item>
            <el-menu-item index="/knowledge-graph/nodes">节点管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="/exercises">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>习题管理</span>
            </template>
            <el-menu-item index="/exercises/generate">生成习题</el-menu-item>
            <el-menu-item index="/exercises/list">习题列表</el-menu-item>
            <el-menu-item index="/exercises/analysis">习题分析</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header style="height: 60px">
          <div class="header-container">
            <h2>管理系统</h2>
            <div class="header-right">
              <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                  管理员<el-icon class="el-icon--right">
                    <ArrowDown />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="logout"
                      >退出登录</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import {
  Menu,
  User,
  Connection,
  ArrowDown,
  Document,
} from "@element-plus/icons-vue";

const router = useRouter();
const userStore = useUserStore();

const handleCommand = (command: string) => {
  if (command === "logout") {
    userStore.logout();
    router.push("/login");
  }
};
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.aside-menu {
  height: 100%;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-right {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
  display: flex;
  align-items: center;
}
</style>
