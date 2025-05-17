import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useUserStore } from "@/stores/user";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/LoginView.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    component: () => import("@/layouts/MainLayout.vue"),
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/DashboardView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "generate-exercise",
        name: "GenerateExercise",
        component: () => import("@/views/agents/GenerateExercise.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "agents",
        name: "Agents",
        component: () => import("@/views/agents/AgentsView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "agents/add",
        name: "AddAgent",
        component: () => import("@/views/agents/AddAgentView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "knowledge-graph",
        name: "KnowledgeGraph",
        component: () =>
          import("@/views/knowledge-graph/KnowledgeGraphView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "knowledge-graph/nodes",
        name: "KnowledgeGraphNodes",
        component: () => import("@/views/knowledge-graph/NodesView.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('authToken')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 需要登录但未认证，重定向到登录页
    next({ name: 'login' })
  } else if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    // 已登录用户尝试访问登录页，重定向到首页
    next({ name: 'home' })
  } else {
    // 正常导航
    next()
  }
})

export default router;
