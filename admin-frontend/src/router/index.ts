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
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: "Login" });
  } else {
    next();
  }
});

export default router;
