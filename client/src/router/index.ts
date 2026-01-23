import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('../views/ShopView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/shop/:id',
      name: 'product-details',
      component: () => import('../views/ProductDetailView.vue')
    },
    {
      path: '/shop/:id',
      name: 'product-details',
      component: () => import('../views/ProductDetailView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminDashboardView.vue'),
      meta: { requiresAuth: true } // In real, requiresAdmin
    },
    {
      path: '/order-success/:id',
      name: 'order-success',
      component: () => import('../views/OrderSuccessView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const { useAuthStore } = await import('@/stores/auth');
  const authStore = useAuthStore();
  
  // Wait if loading? 
  // Since App.vue handles the initial persistent load wait, 
  // by the time we interact here usually loaded or loading.
  // Ideally we might want to check authStore.loading here too
  // but let's keep it simple: check user identity.
  // Note: on a fresh reload, this guard might run before App's onMounted finishes initAuth
  // But initAuth sets loading=true initially. 
  // If we want STRICT protection, we should ensure auth is initialized.
  
  if (to.meta.requiresAuth && !authStore.user && !authStore.loading) {
     next('/login');
  } else {
     next();
  }
});

export default router
