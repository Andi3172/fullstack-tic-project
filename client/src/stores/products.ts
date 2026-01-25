import { defineStore } from 'pinia';
import axios from 'axios';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number | null;
  image: string;
  description: string;
  stock: number;
  specs: Record<string, any>;
  metadata: {
    createdAt: string;
  };
}

interface ProductState {
  products: Product[];
  loading: boolean;
  hasMore: boolean;
  lastVisibleId: string | null;
  safetyBlock: boolean;
  error: string | null;
  totalItems: number;
}

interface FetchParams {
  category?: string;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  cores?: (string | number)[];
  vram?: (string | number)[];
  ramSize?: (string | number)[];
}

export const useProductStore = defineStore('products', {
  state: (): ProductState => ({
    products: [],
    loading: false,
    hasMore: true,
    lastVisibleId: null,
    safetyBlock: false,
    error: null,
    totalItems: 0,
  }),
  actions: {
    async fetchProducts(params: FetchParams = {}, isLoadMore = false) {
      // 1. Guard Clause: Prevent parallel or blocked requests
      if (this.loading || this.safetyBlock) return;

      // 2. Safety Debounce: Block subsequent calls for 1s
      this.safetyBlock = true;
      setTimeout(() => {
        this.safetyBlock = false;
      }, 1000);

      this.loading = true;
      this.error = null;

      if (!isLoadMore) {
        this.products = [];
        this.lastVisibleId = null;
        this.hasMore = true;
        this.totalItems = 0;
      }

      try {
        const queryParams: any = {
           limit: params.limit || 12,
           sortBy: params.sortBy || 'price',
           order: params.order || 'asc'
        };

        if (isLoadMore && this.lastVisibleId) {
            queryParams.lastVisibleId = this.lastVisibleId;
        }

        if (params.category && params.category !== 'All') {
          queryParams.category = params.category;
        }

        if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice;
        if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice;

        if (params.cores && params.cores.length > 0) queryParams.cores = params.cores.join(',');
        if (params.vram && params.vram.length > 0) queryParams.vram = params.vram.join(',');
        if (params.ramSize && params.ramSize.length > 0) queryParams.ramSize = params.ramSize.join(',');

        const response = await axios.get('http://localhost:3000/api/products', { params: queryParams });

        if (isLoadMore) {
            this.products.push(...response.data.products);
        } else {
            this.products = response.data.products;
        }

        this.lastVisibleId = response.data.lastVisibleId;
        this.hasMore = response.data.hasMore;
        if (response.data.total) this.totalItems = response.data.total;

      } catch (err: any) {
        console.error('Error fetching products:', err);
        this.error = 'Failed to load products';
        this.hasMore = false; // Stop scrolling on error
      } finally {
        this.loading = false;
      }
    },

    async fetchProductById(id: string) {
      try {
        const response = await axios.get(`http://localhost:3000/api/products/${id}`);
        return response.data;
      } catch (err: any) {
        console.error('Error fetching product:', err);
        throw err;
      }
    }
  }
});
