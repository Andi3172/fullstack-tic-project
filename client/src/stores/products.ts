import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

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
    currentPage: number;
    totalPages: number;
    totalItems: number;
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
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
    },
    loading: false,
    error: null,
  }),
  actions: {
    async fetchProducts(params: FetchParams = {}) {
      this.loading = true;
      this.error = null;
      try {
        const queryParams: any = {
           limit: params.limit || 12,
           page: params.page || 1,
           sortBy: params.sortBy || 'price',
           order: params.order || 'asc'
        };

        if (params.category && params.category !== 'All') {
          queryParams.category = params.category;
        }

        if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice;
        if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice;

        if (params.cores && params.cores.length > 0) queryParams.cores = params.cores.join(',');
        if (params.vram && params.vram.length > 0) queryParams.vram = params.vram.join(',');
        if (params.ramSize && params.ramSize.length > 0) queryParams.ramSize = params.ramSize.join(',');
        

        
        const response = await axios.get(`${API_URL}/api/products`, { params: queryParams });
        
        this.products = response.data.products;
        this.pagination.currentPage = response.data.currentPage;
        this.pagination.totalPages = response.data.totalPages;
        this.pagination.totalItems = response.data.totalItems;
        
      } catch (err: any) {
        console.error('Error fetching products:', err);
        this.error = 'Failed to load products';
      } finally {
        this.loading = false;
      }
    },
    
    async fetchProductById(id: string) {
      try {
        const response = await axios.get(`${API_URL}/api/products/${id}`);
        return response.data;
      } catch (err: any) {
        console.error('Error fetching product:', err);
        throw err;
      }
    }
  }
});
