<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { useRouter } from 'vue-router';
import CartDrawer from '@/components/CartDrawer.vue';
import { onMounted, ref } from 'vue';

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

// Mobile Navigation State
const mobileMenu = ref(false);

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

onMounted(() => {
  authStore.initAuth();
});
</script>

<template>
  <div v-if="authStore.loading" class="d-flex justify-center align-center" style="height: 100vh;">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
  </div>

  <v-app v-else>
    <!-- MOBILE DRAWER -->
    <v-navigation-drawer
        v-model="mobileMenu"
        location="left"
        temporary
    >
        <v-list>
            <v-img src="https://placehold.co/300x150?text=TechStore" cover class="mb-4"></v-img>
            
            <v-list-item to="/" prepend-icon="mdi-home" title="Home"></v-list-item>
            
            <div v-if="authStore.user">
                 <v-list-item to="/shop" prepend-icon="mdi-store" title="Shop"></v-list-item>
                 <v-list-item to="/profile" prepend-icon="mdi-account" title="My Orders"></v-list-item>
                 <div v-if="authStore.isAdmin">
                    <v-list-item to="/admin" prepend-icon="mdi-shield-crown" title="Admin Panel" color="error"></v-list-item>
                 </div>
                 <v-divider class="my-2"></v-divider>
                 <v-list-item @click="handleLogout" prepend-icon="mdi-logout" title="Logout"></v-list-item>
            </div>
            <div v-else>
                 <v-list-item to="/login" prepend-icon="mdi-login" title="Login"></v-list-item>
                 <v-list-item to="/register" prepend-icon="mdi-account-plus" title="Register"></v-list-item>
            </div>
        </v-list>
    </v-navigation-drawer>


    <!-- APP BAR -->
    <v-app-bar color="primary" elevation="2">
      <!-- Mobile Toggle -->
      <v-app-bar-nav-icon class="d-md-none" @click="mobileMenu = !mobileMenu"></v-app-bar-nav-icon>

      <v-app-bar-title>TechStore</v-app-bar-title>
      
      <v-spacer></v-spacer>

      <!-- Cart Button (Always Visible) -->
      <v-btn icon class="mr-2" @click="cartStore.toggleCart()">
        <v-badge
          :content="cartStore.totalItems"
          :model-value="cartStore.totalItems > 0"
          color="error"
        >
          <v-icon>mdi-cart</v-icon>
        </v-badge>
      </v-btn>
      
      <!-- DESKTOP MENU (Hidden on Mobile) -->
      <div class="d-none d-md-flex align-center">
          <div v-if="authStore.user">
            <v-btn to="/shop" variant="text" class="mr-1">Shop</v-btn>
            <v-btn to="/profile" variant="text" class="mr-1">My Orders</v-btn>
            
            <v-btn 
                v-if="authStore.isAdmin" 
                to="/admin" 
                variant="flat" 
                color="error" 
                size="small" 
                class="mr-4"
            >
                Admin Panel
            </v-btn>

            <span class="mr-4 text-body-2">Welcome, {{ authStore.user.email }}</span>
            <v-btn icon="mdi-logout" variant="text" @click="handleLogout" title="Logout"></v-btn>
          </div>
          
          <div v-else>
            <v-btn to="/login" variant="text">Login</v-btn>
            <v-btn to="/register" variant="text">Register</v-btn>
          </div>
      </div>
    </v-app-bar>

    <CartDrawer />

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
