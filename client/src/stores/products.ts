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
  pagination: {
    lastVisible: string | null;
    hasMore: boolean;
    totalItems: number;
    loadingNext: boolean;
  };
  loading: boolean;
  error: string | null;
}

interface FetchParams {
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  
  // Spec Filters
  cores?: (string | number)[];
  vram?: (string | number)[];
  ramSize?: (string | number)[];
}

export const useProductStore = defineStore('products', {
  state: (): ProductState => ({
    products: [],
    pagination: {
      lastVisible: null,
      hasMore: true,
      totalItems: 0,
      loadingNext: false
    },
    loading: false,
    error: null,
  }),
  actions: {
    async fetchProducts(params: FetchParams = {}, isLoadMore = false) {
      if (isLoadMore) {
          this.pagination.loadingNext = true;
      } else {
          this.loading = true;
          this.pagination.lastVisible = null; // Reset
          this.pagination.hasMore = true;
          this.products = []; // Clear list for smooth transition or skeleton
      }
      
      this.error = null;
      try {
        const queryParams: any = {
           limit: params.limit || 12,
           sortBy: params.sortBy || 'price',
           order: params.order || 'asc'
        };
        
        // If loading more, pass the cursor
        if (isLoadMore && this.pagination.lastVisible) {
            queryParams.lastVisible = this.pagination.lastVisible;
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
        
        this.pagination.lastVisible = response.data.lastVisible;
        this.pagination.hasMore = response.data.hasMore;
        this.pagination.totalItems = response.data.total;
        
      } catch (err: any) {
        console.error('Error fetching products:', err);
        this.error = 'Failed to load products';
      } finally {
        this.loading = false;
        this.pagination.loadingNext = false;
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
