<template>
  <v-container class="py-8">
    <div class="mb-6">
       <h1 class="text-h3 font-weight-bold">My Profile</h1>
       <div v-if="authStore.user" class="text-subtitle-1 text-grey">
         Welcome back, <span class="text-primary font-weight-bold">{{ authStore.user.email }}</span>
       </div>
    </div>

    <v-divider class="mb-6"></v-divider>

    <h2 class="text-h5 font-weight-bold mb-4">Order History</h2>

    <!-- Loading State -->
    <div v-if="orderStore.loading" class="d-flex justify-center py-8">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Empty State -->
    <div v-else-if="orderStore.orders.length === 0" class="text-center py-8 bg-grey-lighten-4 rounded-lg">
        <v-icon size="64" color="grey">mdi-history</v-icon>
        <div class="text-h6 text-grey mt-2">No orders yet</div>
        <v-btn to="/shop" variant="text" color="primary" class="mt-2">Start Shopping</v-btn>
    </div>

    <!-- Orders List -->
    <v-expansion-panels v-else variant="popout">
      <v-expansion-panel
        v-for="order in orderStore.orders"
        :key="order.id"
        elevation="1"
      >
        <v-expansion-panel-title>
           <v-row no-gutters align="center" class="w-100">
              <v-col cols="6" sm="4">
                  <div class="font-weight-bold">{{ formatDate(order.createdAt) }}</div>
                  <div class="text-caption text-grey">#{{ order.id.slice(0, 8) }}...</div>
              </v-col>
              
              <v-col cols="6" sm="8" class="d-flex align-center justify-end">
                  <v-chip
                    size="small"
                    :color="getStatusColor(order.status)"
                    variant="flat"
                    class="font-weight-bold text-uppercase mr-3 hidden-xs-only"
                  >
                    {{ order.status }}
                  </v-chip>

                  <div class="text-subtitle-1 font-weight-black mr-2">${{ order.total.toFixed(2) }}</div>
                  
                  <v-btn
                    icon
                    size="small"
                    variant="tonal"
                    color="error"
                    class="ml-2"
                    @click.stop="downloadInvoice(order.id)"
                  >
                     <v-icon>mdi-file-pdf-box</v-icon>
                     <v-tooltip activator="parent">Download Invoice</v-tooltip>
                  </v-btn>
              </v-col>
           </v-row>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
            <v-list lines="two">
                <v-list-item v-for="(item, i) in order.items" :key="i" class="px-0">
                    <template v-slot:prepend>
                        <v-avatar rounded size="48" class="mr-3 bg-grey-lighten-3">
                            <v-img :src="item.image" cover></v-img>
                        </v-avatar>
                    </template>
                    
                    <v-list-item-title class="font-weight-bold text-body-2">{{ item.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                        Qty: {{ item.quantity }} &mdash; ${{ item.price.toFixed(2) }} / unit
                    </v-list-item-subtitle>
                    
                    <template v-slot:append>
                        <span class="font-weight-bold">${{ (item.price * item.quantity).toFixed(2) }}</span>
                    </template>
                </v-list-item>
            </v-list>
            
            <div class="d-flex justify-end mt-2 pt-2 border-t">
                <v-btn variant="text" size="small" color="primary" append-icon="mdi-refresh">
                    Re-Order
                </v-btn>
            </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useOrderStore } from '@/stores/orders';

const authStore = useAuthStore();
const orderStore = useOrderStore();

const downloadInvoice = async (id: string) => {
    // We could add a local loading state per item if we wanted, 
    // or just let the global loader spin if we hooked it up.
    // simpler: just call it.
    await orderStore.downloadInvoice(id);
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
        case 'pending': return 'warning';
        case 'shipped': return 'info';
        case 'delivered': return 'success';
        case 'cancelled': return 'error';
        default: return 'grey';
    }
};

onMounted(() => {
    orderStore.fetchMyOrders();
});
</script>

<style scoped>
.border-t {
    border-top: 1px solid rgba(0,0,0,0.12);
}
</style>
