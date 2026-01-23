<template>
  <v-navigation-drawer
    v-model="cartStore.isOpen"
    location="right"
    temporary
    width="400"
    class="cart-drawer"
  >
    <div class="d-flex flex-column h-100">
      <!-- Header -->
      <div class="pa-4 d-flex align-center justify-space-between bg-white elevation-1 z-index-1">
        <h2 class="text-h6 font-weight-bold">Your Cart</h2>
        <v-btn icon="mdi-close" variant="text" size="small" @click="cartStore.isOpen = false"></v-btn>
      </div>

      <!-- Content -->
      <v-divider></v-divider>
      
      <div v-if="cartStore.items.length === 0" class="flex-grow-1 d-flex flex-column align-center justify-center text-center pa-6 text-grey">
        <v-icon size="80" class="mb-4 text-grey-lighten-2">mdi-cart-outline</v-icon>
        <div class="text-h6">Your cart is empty</div>
        <div class="text-body-2 mt-2">Looks like you haven't added any gear yet.</div>
        <v-btn variant="tonal" color="primary" class="mt-6" @click="cartStore.isOpen = false">
          Start Shopping
        </v-btn>
      </div>

      <v-list v-else class="flex-grow-1 overflow-y-auto pa-2" lines="two">
        <template v-for="(item, index) in cartStore.items" :key="item.product.name">
          <v-list-item class="rounded-lg mb-2 cart-item">
            <template v-slot:prepend>
               <v-avatar size="64" rounded="0" class="mr-2">
                 <!-- Placeholder or Category Icon if image is generic -->
                 <v-img 
                   :src="item.product.image.startsWith('http') ? item.product.image : 'https://placehold.co/100x100?text=No+Img'" 
                   cover
                   class="rounded"
                 ></v-img>
               </v-avatar>
            </template>

            <v-list-item-title class="font-weight-bold text-subtitle-2 mb-1 pl-2">
              {{ item.product.name }}
            </v-list-item-title>
            
            <v-list-item-subtitle class="pl-2">
              <div class="d-flex align-center justify-space-between w-100">
                <span class="text-primary font-weight-bold">
                   {{ item.product.price ? `$${item.product.price.toFixed(2)}` : 'N/A' }}
                </span>
              </div>
            </v-list-item-subtitle>
            
            <template v-slot:append>
               <div class="d-flex align-center gap-2 mt-2">
                  <v-btn 
                    icon="mdi-minus" 
                    size="x-small" 
                    variant="tonal" 
                    density="comfortable"
                    @click="cartStore.updateQuantity(item.product.name, -1)"
                  ></v-btn>
                  <span class="mx-2 font-weight-medium">{{ item.quantity }}</span>
                  <v-btn 
                    icon="mdi-plus" 
                    size="x-small" 
                    variant="tonal" 
                    density="comfortable"
                    @click="cartStore.updateQuantity(item.product.name, 1)"
                  ></v-btn>
                  
                  <v-btn 
                    icon="mdi-delete-outline" 
                    size="small" 
                    variant="text" 
                    color="error"
                    class="ml-2"
                     @click="cartStore.removeFromCart(item.product.name)"
                  ></v-btn>
               </div>
            </template>
          </v-list-item>
          <v-divider v-if="index < cartStore.items.length - 1" class="my-1"></v-divider>
        </template>
      </v-list>

      <!-- Footer -->
      <div v-if="cartStore.items.length > 0" class="pa-4 bg-white elevation-4 z-index-1">
        <div class="d-flex justify-space-between mb-2 text-body-2">
          <span class="text-grey">Subtotal</span>
          <span class="font-weight-bold">${{ cartStore.subtotal.toFixed(2) }}</span>
        </div>
        <div class="d-flex justify-space-between mb-4 text-body-2">
          <span class="text-grey">Estimated Tax (10%)</span>
          <span class="font-weight-bold">${{ cartStore.tax.toFixed(2) }}</span>
        </div>
        <v-divider class="mb-4"></v-divider>
        <div class="d-flex justify-space-between mb-6 text-h6 font-weight-black">
          <span>Total</span>
          <span class="text-primary">${{ cartStore.totalPrice.toFixed(2) }}</span>
        </div>
        
        <v-btn 
          block 
          color="primary" 
          size="large" 
          class="font-weight-bold" 
          elevation="4"
          @click="checkout"
        >
          Checkout
        </v-btn>
      </div>

    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart';

const cartStore = useCartStore();

const checkout = async () => {
    try {
      await cartStore.checkout();
      // Navigation is handled in the store
    } catch (e) {
      // handled in store
    }
};
</script>

<style scoped>
.z-index-1 {
  z-index: 1;
}
.cart-drawer {
    /* Ensure it interacts nicely */
}
.cart-item {
    transition: background-color 0.2s;
}
</style>
