<template>
  <v-layout class="fill-height bg-grey-lighten-4">
    <!-- Sidebar Drawer (Collapsible) -->
    <v-navigation-drawer
      v-model="drawer"
      width="300"
      class="pa-4 bg-surface"
      elevation="2"
      floating
    >
      <div class="d-flex align-center justify-space-between mb-4">
        <h2 class="text-h6 font-weight-bold">Filters</h2>
        <v-btn v-if="hasActiveFilters" variant="text" size="small" color="error" @click="clearFilters">
          Clear All
        </v-btn>
      </div>

      <v-divider class="mb-4"></v-divider>

      <!-- 1. Category -->
      <v-select
        v-model="selectedCategory"
        :items="categories"
        label="Category"
        variant="outlined"
        density="compact"
        class="mb-4"
      ></v-select>

      <!-- 2. Sort -->
      <v-select
        v-model="selectedSort"
        :items="sortOptions"
        item-title="label"
        item-value="value"
        label="Sort By"
        variant="outlined"
        density="compact"
        class="mb-4"
      ></v-select>

      <!-- 3. Price Range -->
      <div class="mb-2 text-subtitle-2 font-weight-bold">Price Range</div>
      <div class="d-flex justify-space-between text-caption text-grey mb-2">
        <span>${{ priceRange[0] }}</span>
        <span>${{ priceRange[1] }}</span>
      </div>
      <v-range-slider
        v-model="priceRange"
        :min="0"
        :max="3000"
        :step="50"
        color="primary"
        density="compact"
        hide-details
        class="mb-6"
        @end="applyServerFilters"
      ></v-range-slider>

      <v-divider class="mb-4"></v-divider>

      <!-- 4. Dynamic Spec Filters -->
      <v-expansion-panels variant="accordion" multiple>
        
        <!-- CPU Cores -->
        <v-expansion-panel v-if="selectedCategory === 'cpu'" title="Cores" elevation="0">
          <v-expansion-panel-text>
            <v-checkbox
              v-for="core in coreOptions" :key="core"
              v-model="filterCores"
              :label="String(core)"
              :value="core"
              density="compact"
              hide-details
              color="primary"
            ></v-checkbox>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- GPU VRAM -->
        <v-expansion-panel v-if="selectedCategory === 'video-card'" title="VRAM" elevation="0">
           <v-expansion-panel-text>
            <v-checkbox
              v-for="vram in vramOptions" :key="vram"
              v-model="filterVram"
              :label="vram"
              :value="vram"
              density="compact"
              hide-details
              color="primary"
            ></v-checkbox>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- RAM Size -->
        <v-expansion-panel v-if="selectedCategory === 'memory'" title="Size" elevation="0">
           <v-expansion-panel-text>
            <v-checkbox
              v-for="size in ramSizeOptions" :key="size"
              v-model="filterRamSize"
              :label="size"
              :value="size"
              density="compact"
              hide-details
              color="primary"
            ></v-checkbox>
          </v-expansion-panel-text>
        </v-expansion-panel>

      </v-expansion-panels>

    </v-navigation-drawer>

    <!-- Main Content Area -->
    <v-main>
      <v-container fluid class="pa-4 h-100 d-flex flex-column">
        
        <!-- Toolbar with Toggle -->
        <v-row class="mb-2 align-center">
            <v-col cols="auto">
                <v-btn 
                    v-if="!drawer"
                    variant="text" 
                    color="primary" 
                    prepend-icon="mdi-filter" 
                    @click="drawer = true"
                >
                    Show Filters
                </v-btn>
            </v-col>
            <v-col class="text-right text-caption text-grey">
                Showing {{ productStore.products.length }} of {{ productStore.pagination.totalItems }} items
            </v-col>
        </v-row>
        
        <!-- Loading State -->
        <v-row v-if="productStore.loading" justify="center" align="center" style="min-height: 400px;">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </v-row>

        <div v-else>
           <!-- Product Grid -->
           <v-row>
            <v-col
              v-for="product in productStore.products"
              :key="product.name"
              cols="12"
              sm="6"
              md="4"
              lg="3"
              xl="3"
            >
              <v-card
                class="mx-auto rounded-xl product-card h-100 d-flex flex-column shadow-hover"
                elevation="3"
              >
                <!-- Image / Icon Header -->
                <div class="gradient-bg d-flex align-center justify-center position-relative" style="height: 180px;">
                  <v-icon size="64" color="white">{{ getCategoryIcon(product.category) }}</v-icon>
                  <v-chip
                    v-if="!product.price"
                    color="error"
                    size="x-small"
                    class="position-absolute top-0 right-0 ma-3 font-weight-bold"
                  >
                    OUT OF STOCK
                  </v-chip>
                </div>

                <v-card-title class="text-subtitle-1 font-weight-bold pt-4 text-truncate">
                  {{ product.name }}
                </v-card-title>
                
                <v-card-text class="flex-grow-1">
                   <div class="text-h6 font-weight-black text-primary mb-2">
                    {{ product.price ? `$${product.price.toFixed(2)}` : 'N/A' }}
                   </div>
                   
                   <!-- Smart Spec Preview -->
                   <div class="d-flex flex-wrap gap-1" style="max-height: 60px; overflow: hidden;">
                     <v-chip v-for="(val, key) in getImportantSpecs(product)" :key="key" size="x-small" variant="tonal" class="mr-1 mb-1">
                        {{ val }}
                     </v-chip>
                   </div>
                </v-card-text>

                <v-divider></v-divider>
                
                <v-card-actions class="pa-3">
                  <v-btn text="Details" variant="outlined" size="small" color="primary" class="flex-grow-1 border-opacity-25">
                    Details
                  </v-btn>
                  <v-btn 
                    icon="mdi-cart-plus" 
                    variant="tonal" 
                    color="secondary" 
                    size="small" 
                    class="ml-2"
                    @click="addToCart(product)"
                  ></v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
           </v-row>

           <!-- Empty State -->
           <v-row v-if="productStore.products.length === 0" justify="center" class="mt-16 text-center">
             <v-col cols="12">
               <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-package-variant-closed</v-icon>
               <h3 class="text-h5 text-grey">No products found.</h3>
               <p class="text-body-2 text-grey-darken-1">Try adjusting your filters.</p>
             </v-col>
           </v-row>

           <!-- Pagination -->
           <v-row v-if="productStore.pagination.totalPages > 1" justify="center" class="mt-8 mb-4">
             <v-pagination
               v-model="currentPage"
               :length="productStore.pagination.totalPages"
               :total-visible="5"
               active-color="primary"
               density="comfortable"
               @update:model-value="changePage"
             ></v-pagination>
           </v-row>
        </div>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useProductStore } from '@/stores/products';
import { useCartStore } from '@/stores/cart';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';

const productStore = useProductStore();
const cartStore = useCartStore();
const route = useRoute();
const router = useRouter();
const { mobile } = useDisplay();

// Drawer State
const drawer = ref(!mobile.value);

// Filters State
const selectedCategory = ref((route.query.category as string) || 'All');
const categories = ['All', 'cpu', 'video-card', 'motherboard', 'memory', 'internal-hard-drive'];
const priceRange = ref([0, 3000]);
const currentPage = ref(1);

const sortOptions = [
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name: A-Z', value: 'name_asc' }
];
const selectedSort = ref('price_asc');

// Dynamic Spec Filters
const filterCores = ref<number[]>([]);
const coreOptions = [4, 6, 8, 10, 12, 14, 16, 20, 24];

const filterVram = ref<string[]>([]);
const vramOptions = ['8 GB', '10 GB', '12 GB', '16 GB', '20 GB', '24 GB'];

const filterRamSize = ref<string[]>([]);
const ramSizeOptions = ['16 GB', '32 GB', '48 GB', '64 GB', '96 GB'];

const hasActiveFilters = computed(() => {
  return filterCores.value.length > 0 || filterVram.value.length > 0 || filterRamSize.value.length > 0;
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

const getImportantSpecs = (product: any) => {
  const specs = product.specs || {};
  const important: any = {};
  
  if (specs.core_count) important['Cores'] = `${specs.core_count}`;
  if (specs.boost_clock) important['Boost'] = `${specs.boost_clock} GHz`;
  if (specs.memory && product.category === 'video-card') important['VRAM'] = `${specs.memory} GB`;
  if (specs.memory && product.category === 'memory') important['Size'] = parseRamSize(specs);
  if (specs.capacity) important['Capacity'] = specs.capacity;
  
  return important;
};

// --- LOGIC HELPERS ---

const parseSpecValue = (val: string): number => {
  if (!val) return 0;
  // Extract number from "24 GB", "3.5 GHz" etc
  const match = String(val).match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : 0;
};

const parseRamSize = (specs: any): string => {
  if (Array.isArray(specs.modules)) {
    // modules: [2, 16] -> 32
    const total = specs.modules[0] * specs.modules[1];
    return `${total} GB`;
  }
  return '';
};


// --- API / FILTERING LOGIC ---

const applyServerFilters = () => {
  const [sortBy, order] = selectedSort.value.split('_');
  
  // Parse numeric values from string options
  // e.g. "24 GB" -> 24
  const parsedVram = filterVram.value.map(v => parseSpecValue(v));
  const parsedRam = filterRamSize.value.map(s => parseSpecValue(s));

  productStore.fetchProducts({
    category: selectedCategory.value,
    limit: 12,
    page: currentPage.value,
    sortBy,
    order: order as 'asc' | 'desc',
    minPrice: priceRange.value[0],
    maxPrice: priceRange.value[1],
    // Pass Clean Numeric Arrays to Server
    cores: filterCores.value,
    vram: parsedVram, 
    ramSize: parsedRam
  });

  router.replace({ 
      query: { ...route.query, category: selectedCategory.value } 
  });
};

const changePage = (page: number) => {
  currentPage.value = page;
  applyServerFilters();
};

const clearFilters = () => {
  filterCores.value = [];
  filterVram.value = [];
  filterRamSize.value = [];
  priceRange.value = [0, 3000];
  // This will trigger watchers? No, ref changes trigger watchers below
};

const addToCart = (product: any) => {
  cartStore.addToCart(product);
  cartStore.openCart();
};

// Watchers for Sidebar changes to auto-refresh
watch([selectedCategory, selectedSort], () => {
  currentPage.value = 1; // Reset page on category/sort change
  clearFilters(); // Clear specific specs on cat change? Or maybe just keep logic simple
  applyServerFilters();
});

watch([filterCores, filterVram, filterRamSize], () => {
    currentPage.value = 1;
    applyServerFilters();
}, { deep: true });


onMounted(() => {
  applyServerFilters();
});
</script>

<style scoped>
.product-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.shadow-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px -10px rgba(0,0,0,0.2) !important;
}
.gradient-bg {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
</style>
