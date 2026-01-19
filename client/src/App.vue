<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<template>
  <v-app>
    <v-app-bar color="primary" elevation="2">
      <v-app-bar-title>TechStore</v-app-bar-title>
      
      <v-spacer></v-spacer>
      
      <div v-if="authStore.user">
        <span class="mr-4 text-body-2 hidden-sm-and-down">Welcome, {{ authStore.user.email }}</span>
        <v-btn icon="mdi-logout" variant="text" @click="handleLogout" title="Logout"></v-btn>
      </div>
      
      <div v-else>
        <v-btn to="/login" variant="text">Login</v-btn>
        <v-btn to="/register" variant="text">Register</v-btn>
      </div>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
