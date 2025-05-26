import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { layout: 'auth' }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { layout: 'auth' }
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { layout: 'main', requiresAuth: true }
    },
    {
      path: '/knowledge-graph',
      name: 'knowledgeGraph',
      component: () => import('@/views/KnowledgeGraphView.vue'),
      meta: { layout: 'main', requiresAuth: true }
    },
    {
      path: '/ai-assistant',
      name: 'aiAssistant',
      component: () => import('@/views/AiAssistantView.vue'),
      meta: { layout: 'main', requiresAuth: true }
    },
    {
      path: '/algorithm-visualize',
      name: 'algorithmVisualize',
      component: () => import('@/views/AlgorithmVisualizeView.vue'),
      meta: { layout: 'main', requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { layout: 'main', requiresAuth: true }
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('@/views/HelpView.vue'),
      meta: { layout: 'main', requiresAuth: true }
    },
    // 知识点详情页
    {
      path: '/knowledge-graph/node/:id',
      name: 'knowledgeNode',
      component: () => import('@/views/KnowledgeNodeView.vue'),
      meta: { layout: 'main', requiresAuth: true }
    },
    // 捕获所有未匹配路径
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('@/views/NotFoundView.vue')
    },
    {
      path: '/resources',
      name: 'resources',
      component: () => import('@/views/ResourcesView.vue'),
      meta: { layout: 'main', requiresAuth: true }
    }
  ]
})

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

export default router
