<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Login</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Email"
                prepend-icon="mdi-account"
                type="email"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                prepend-icon="mdi-lock"
                type="password"
                required
              ></v-text-field>
              
              <v-alert v-if="error" type="error" density="compact" class="mb-4" closable >{{ error }}</v-alert>

              <v-btn type="submit" color="primary" block class="mt-4">Login</v-btn>
            </v-form>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="pa-4">
             <v-btn block variant="outlined" color="secondary" @click="handleGoogle">
               <v-icon start>mdi-google</v-icon> Sign in with Google
             </v-btn>
          </v-card-actions>
          <v-card-actions class="justify-center">
            <router-link to="/register" style="text-decoration: none;">
              <v-btn variant="text" size="small" color="primary">No account? Register</v-btn>
            </router-link>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
  try {
    error.value = '';
    await authStore.loginWithEmail(email.value, password.value);
    router.push('/');
  } catch (err: any) {
    console.error(err);
    error.value = "Login failed: " + (err.message || "Unknown error");
  }
};

const handleGoogle = async () => {
  try {
    error.value = '';
    await authStore.loginWithGoogle();
    router.push('/');
  } catch (err: any) {
    console.error(err);
    error.value = "Google Login failed: " + (err.message || "Unknown error");
  }
};
</script>
