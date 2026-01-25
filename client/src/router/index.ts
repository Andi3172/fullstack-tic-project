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
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminDashboardView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/order-success/:id',
      name: 'order-success',
      component: () => import('../views/OrderSuccessView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const { useAuthStore } = await import('@/stores/auth');
  const authStore = useAuthStore();
  
  // Wait for Auth to Initialize if refreshing
  if (authStore.loading) {
     // A simple poll to wait for auth to settle (or could use a promise in store)
     // For now, prompt the store to init if not already
     // But usually App.vue handles this. The guard might run too fast.
     // We will wait up to 2 seconds for loading to become false.
     await new Promise<void>(resolve => {
        const check = setInterval(() => {
            if (!authStore.loading) {
                clearInterval(check);
                resolve();
            }
        }, 50);
        setTimeout(() => { clearInterval(check); resolve(); }, 2000);
     });
  }

  // 1. Strict Auth Check
  if (to.meta.requiresAuth && !authStore.user) {
     return next('/login');
  }

  // 2. Strict Admin Check
  if (to.meta.requiresAdmin) {
      // Must be logged in (checked above, but double check)
      if (!authStore.user) return next('/login');
      
      // Check Admin Email (or Claims in a real app)
      const isAdmin = authStore.user.email === 'admin@tic.com' || authStore.firebaseUser?.email === 'admin@tic.com';
      if (!isAdmin) {
          return next('/'); // Not authorized -> Home
      }
  }

  next();
});

export default router
