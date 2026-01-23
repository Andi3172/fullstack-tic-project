<template>
  <v-container v-if="loading" class="fill-height justify-center">
    <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
  </v-container>

  <v-container v-else-if="error" class="fill-height justify-center text-center">
    <div>
      <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
      <h3 class="text-h5 text-grey">Product not found</h3>
      <v-btn to="/shop" variant="text" color="primary" class="mt-4">Back to Shop</v-btn>
    </div>
  </v-container>

  <v-container v-else class="py-8">
    <!-- Breadcrumbs -->
    <v-breadcrumbs :items="breadcrumbs" class="px-0 mb-4"></v-breadcrumbs>

    <v-row>
      <!-- Left Column: Image -->
      <v-col cols="12" md="6">
        <v-sheet
          class="rounded-xl d-flex align-center justify-center gradient-bg elevation-3"
          height="500"
          style="overflow: hidden;"
        >
          <v-img
             v-if="product?.image && product.image.startsWith('http')"
             :src="product.image"
             cover
             class="w-100 h-100"
          ></v-img>
          <v-icon v-else size="150" color="white">{{ getCategoryIcon(product?.category || '') }}</v-icon>
        </v-sheet>
      </v-col>

      <!-- Right Column: Info -->
      <v-col cols="12" md="6" class="pl-md-8">
        <div class="d-flex align-center mb-2">
            <v-chip color="secondary" size="small" class="font-weight-bold text-uppercase mr-2">
                {{ product?.category }}
            </v-chip>
            <v-chip
                :color="isAvailable ? 'success' : 'error'"
                size="small"
                variant="outlined"
                class="font-weight-bold"
            >
                {{ isAvailable ? 'Available to Order' : 'Out of Stock' }}
            </v-chip>
        </div>

        <h1 class="text-h3 font-weight-black mb-2">{{ product?.name }}</h1>
        <div class="text-h4 text-primary font-weight-bold mb-6">
            {{ product?.price ? `$${product.price.toFixed(2)}` : 'N/A' }}
        </div>

        <p class="text-body-1 text-grey-darken-1 mb-8">
            This high-performance {{ product?.category }} is perfect for your next build. 
            Engineered for speed, reliability, and efficiency.
        </p>

        <v-btn
            block
            size="x-large"
            color="primary"
            elevation="4"
            class="mb-8 font-weight-bold text-uppercase"
            @click="handleAddToCart"
            :disabled="!isAvailable"
        >
            <v-icon left class="mr-2">mdi-cart-plus</v-icon>
            Add to Cart
        </v-btn>

        <v-divider class="mb-6"></v-divider>

        <h3 class="text-h5 font-weight-bold mb-4">Technical Specifications</h3>
        
        <v-table density="compact" class="specs-table rounded-lg border">
            <tbody>
                <tr v-for="(value, key) in formattedSpecs" :key="key">
                    <td class="font-weight-medium text-grey-darken-2 py-3 bg-grey-lighten-4" style="width: 40%">
                        {{ key }}
                    </td>
                    <td class="font-weight-bold py-3 pl-4">
                        {{ value }}
                    </td>
                </tr>
            </tbody>
        </v-table>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProductStore, type Product } from '@/stores/products';
import { useCartStore } from '@/stores/cart';

const route = useRoute();
const productStore = useProductStore();
const cartStore = useCartStore();

const product = ref<Product | null>(null);
const loading = ref(true);
const error = ref(false);

const isAvailable = computed(() => product.value && product.value.price !== null);

const breadcrumbs = computed(() => {
    if (!product.value) return [];
    return [
        { title: 'Home', disabled: false, to: '/' },
        { title: 'Shop', disabled: false, to: '/shop' },
        { title: product.value.category, disabled: true },
        { title: product.value.name, disabled: true },
    ];
});

const formattedSpecs = computed(() => {
    if (!product.value?.specs) return {};
    const specs: Record<string, any> = {};
    for (const [key, val] of Object.entries(product.value.specs)) {
        // Format key: "core_count" -> "Core Count"
        const readableKey = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        specs[readableKey] = val;
    }
    return specs;
});

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'cpu': return 'mdi-cpu-64-bit';
    case 'video-card': return 'mdi-expansion-card';
    case 'motherboard': return 'mdi-motherboard';
    case 'memory': return 'mdi-memory';
    case 'internal-hard-drive': return 'mdi-harddisk';
    default: return 'mdi-package-variant';
  }
};

const handleAddToCart = () => {
    if (product.value) {
        cartStore.addToCart(product.value);
        cartStore.openCart();
    }
};

onMounted(async () => {
    const id = route.params.id as string;
    if (id) {
        try {
            product.value = await productStore.fetchProductById(id);
        } catch (e) {
            error.value = true;
        } finally {
            loading.value = false;
        }
    }
});
</script>

<style scoped>
.gradient-bg {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
}
.specs-table {
    border: 1px solid rgba(0,0,0,0.12);
}
</style>
