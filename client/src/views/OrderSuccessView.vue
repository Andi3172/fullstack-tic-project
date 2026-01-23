<template>
  <v-container class="fill-height justify-center text-center">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-icon
          icon="mdi-check-circle"
          color="success"
          size="128"
          class="mb-6"
        ></v-icon>
        
        <h1 class="text-h3 font-weight-bold mb-2">Order Placed Successfully!</h1>
        <p class="text-h6 text-grey-darken-1 mb-8">
          Thank you for your purchase. Your Order ID is: <br>
          <span class="font-weight-bold text-black">{{ orderId }}</span>
        </p>

        <div class="d-flex justify-center gap-4 flex-wrap">
          <v-btn
            to="/profile"
            size="large"
            color="primary"
            elevation="2"
            prepend-icon="mdi-file-document-outline"
            class="mr-4"
          >
            View My Order
          </v-btn>
          
          <v-btn
            to="/shop"
            size="large"
            variant="text"
            color="primary"
            prepend-icon="mdi-shopping-outline"
          >
            Continue Shopping
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const orderId = computed(() => route.params.id);
</script>
