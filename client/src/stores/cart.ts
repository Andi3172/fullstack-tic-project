import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import { auth } from '@/firebase'; 
import router from '@/router';

// Using a local interface that matches the expected product structure
// We identify products by 'name' since our current seed/model doesn't enforce a client-side ID
export interface CartProduct {
  id: string;
  name: string;
  category: string;
  price: number | null;
  image: string;
  description: string;
  specs: Record<string, any>;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([]);
  const isOpen = ref(false);

  // Hydrate from localStorage on init
  const stored = localStorage.getItem('cart');
  if (stored) {
    try {
      items.value = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse cart from localStorage', e);
    }
  }

  // Persistence Watcher
  watch(items, (newItems) => {
    localStorage.setItem('cart', JSON.stringify(newItems));
  }, { deep: true });

  // Getters
  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0));
  
  const subtotal = computed(() => {
    return items.value.reduce((sum, item) => {
      const price = item.product.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  });

  const tax = computed(() => subtotal.value * 0.10); // 10% Tax
  
  const totalPrice = computed(() => subtotal.value + tax.value);

  // Actions
  function addToCart(product: CartProduct) {
    const existing = items.value.find(i => i.product.name === product.name);
    if (existing) {
      existing.quantity++;
    } else {
      items.value.push({ product, quantity: 1 });
    }
    return true;
  }

  function removeFromCart(productName: string) {
    items.value = items.value.filter(i => i.product.name !== productName);
  }

  function updateQuantity(productName: string, delta: number) {
    const item = items.value.find(i => i.product.name === productName);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        removeFromCart(productName);
      }
    }
  }



// ... state ...

  function clearCart() {
    items.value = [];
  }

  function openCart() {
    isOpen.value = true;
  }

  function toggleCart() {
    isOpen.value = !isOpen.value;
  }

 // Import the router instance directly

// ...

  async function checkout() {
    // Check if user is logged in via Firebase Auth direct check or useAuthStore
    const user = auth.currentUser;
    if (!user) {
      alert("Please login to checkout.");
      return;
    }

    try {
      const token = await user.getIdToken();
      
      // Map Items to API structure
      const orderItems = items.value.map(i => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.product.price || 0,
        quantity: i.quantity,
        image: i.product.image
      }));

      const response = await axios.post('http://localhost:3000/api/orders', 
        { items: orderItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        clearCart();
        isOpen.value = false;
        
        // Redirect to Success Page
        router.push({ 
            name: 'order-success', 
            params: { id: response.data.orderId } 
        });
        
        return response.data.orderId;
      }
    } catch (error) {
      console.error("Checkout failed", error);
      alert("Checkout failed. See console for details.");
      throw error;
    }
  }

  return {
    items,
    isOpen,
    totalItems,
    subtotal,
    tax,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCart,
    toggleCart,
    checkout
  };
});
