import { defineStore } from 'pinia';
import axios from 'axios';
import { auth, db } from '@/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';

const API_URL = import.meta.env.VITE_API_URL;

export interface Order {
  id: string;
// ... existing interface ...
// (We don't need to repeat the interface content if we match the start/end lines correctly)
  total: number;
  status: string;
  createdAt: string;
  invoiceUrl?: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
}

export const useOrderStore = defineStore('orders', {
  state: () => ({
    orders: [] as Order[],
    allOrders: [] as Order[],
    loading: false,
    error: null as string | null,
    unsubscribe: null as Unsubscribe | null,
  }),
  actions: {
    async fetchMyOrders() {
      this.loading = true;
      this.error = null;
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        
        const token = await user.getIdToken();



        const response = await axios.get(`${API_URL}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        this.orders = response.data;
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        this.error = 'Failed to load order history';
      } finally {
        this.loading = false;
      }
    },

    async fetchAllOrders() {
      // Legacy REST call - replaced by subscribeToAllOrders for Live
      this.loading = true;
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        const token = await user.getIdToken();
        
        const response = await axios.get(`${API_URL}/api/orders/admin/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.allOrders = response.data;
      } catch (err: any) {
        console.error('Error fetching all orders:', err);
        this.error = 'Failed to load admin orders';
      } finally {
        this.loading = false;
      }
    },
    
    subscribeToAllOrders() {
        this.loading = true;
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        
        // Unsubscribe if exists (prevent dupes)
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        this.unsubscribe = onSnapshot(q, (snapshot) => {
            this.allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            this.loading = false;
        }, (err) => {
            console.error("Firestore listener error:", err);
            this.error = "Failed to listen to orders";
            this.loading = false;
        });
    },

    unsubscribeOrders() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    },

    async updateStatus(orderId: string, status: string) {
      const API_URL = import.meta.env.VITE_API_URL; // Define API_URL here for all actions
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        const token = await user.getIdToken();

        await axios.patch(`${API_URL}/api/orders/${orderId}/status`, 
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Refresh list
        await this.fetchAllOrders();
      } catch (e) {
        console.error("Update status failed", e);
        throw e;
      }
    },

    async downloadInvoice(orderId: string) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');
            const token = await user.getIdToken();

            const response = await axios.get(`${API_URL}/api/orders/${orderId}/invoice`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${orderId}.pdf`); // Try to set filename
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Failed to download invoice", e);
            throw e;
        }
    }
  }
});
