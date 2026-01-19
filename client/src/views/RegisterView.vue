<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Register</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleRegister">
              <v-row>
                <v-col cols="6">
                   <v-text-field v-model="firstName" label="First Name" required></v-text-field>
                </v-col>
                <v-col cols="6">
                   <v-text-field v-model="lastName" label="Last Name" required></v-text-field>
                </v-col>
              </v-row>
              
              <v-text-field
                v-model="email"
                label="Email"
                prepend-icon="mdi-email"
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

              <v-alert v-if="error" type="error" density="compact" class="mb-4" closable>{{ error }}</v-alert>

              <v-btn type="submit" color="primary" block class="mt-4">Register</v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center">
             <router-link to="/login" style="text-decoration: none;">
              <v-btn variant="text" size="small" color="primary">Already have an account? Login</v-btn>
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

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();
const authStore = useAuthStore();

const handleRegister = async () => {
  try {
    error.value = '';
    await authStore.register(email.value, password.value, firstName.value, lastName.value);
    router.push('/');
  } catch (err: any) {
    console.error(err);
    error.value = "Registration failed: " + (err.message || "Unknown error");
  }
};
</script>
