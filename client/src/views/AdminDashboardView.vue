<template>
  <v-container class="py-8">
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center">
          <h1 class="text-h4 font-weight-bold mr-3">Admin Dashboard</h1>
          <v-chip color="success" size="small" variant="flat" class="font-weight-bold">
              <v-icon start size="x-small" class="mr-1">mdi-circle</v-icon>
              LIVE
          </v-chip>
      </div>
      <!-- Refresh no longer strictly needed but okay to keep or remove -->
    </div>

    <!-- Stats Overview (Optional Placeholder) -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
         <v-card class="pa-4 bg-primary text-white" elevation="2">
             <div class="text-overline">Total Orders</div>
             <div class="text-h3 font-weight-black">{{ orderStore.allOrders.length }}</div>
         </v-card>
      </v-col>
    </v-row>

    <!-- Orders Table -->
    <v-card elevation="2" class="rounded-lg">
      <v-table>
        <thead>
          <tr>
            <th class="text-left">Order ID</th>
            <th class="text-left">Date</th>
            <th class="text-left">Total</th>
            <th class="text-left">Invoice</th>
            <th class="text-left">Status</th>
            <th class="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orderStore.allOrders" :key="order.id">
            <td class="font-weight-medium text-grey-darken-2">#{{ order.id.slice(0, 8) }}</td>
            <td>{{ formatDate(order.createdAt) }}</td>
            <td class="font-weight-bold">${{ order.total.toFixed(2) }}</td>
            <td>
                 <v-btn
                    icon="mdi-file-pdf-box"
                    color="error"
                    variant="text"
                    size="small"
                    @click="downloadInvoice(order.id)"
                  >
                    <v-tooltip activator="parent">Download</v-tooltip>
                  </v-btn>
            </td>
            <td>
              <v-chip
                size="small"
                :color="getStatusColor(order.status)"
                class="font-weight-bold text-uppercase"
              >
                {{ order.status }}
              </v-chip>
            </td>
            <td>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn size="small" variant="tonal" color="grey" v-bind="props">
                    Update Status
                  </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item @click="updateStatus(order.id, 'pending')" title="Pending"></v-list-item>
                  <v-list-item @click="updateStatus(order.id, 'shipped')" title="Shipped"></v-list-item>
                  <v-list-item @click="updateStatus(order.id, 'delivered')" title="Delivered"></v-list-item>
                  <v-list-item @click="updateStatus(order.id, 'cancelled')" title="Cancelled" color="error"></v-list-item>
                </v-list>
              </v-menu>
            </td>
          </tr>
        </tbody>
      </v-table>
      
      <div v-if="orderStore.loading" class="d-flex justify-center pa-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
      <div v-else-if="orderStore.allOrders.length === 0" class="text-center pa-4 text-grey">
          No orders found.
      </div>
    </v-card>

  </v-container>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useOrderStore } from '@/stores/orders';

const orderStore = useOrderStore();

// Replacing fetchData with subscription
// const fetchData = () => {
//    orderStore.fetchAllOrders();
// };

const updateStatus = async (id: string, status: string) => {
    // Optimistic UI updates happen automatically via Listener!
    await orderStore.updateStatus(id, status);
};

const downloadInvoice = async (id: string) => {
    await orderStore.downloadInvoice(id);
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const getStatusColor = (status: string) => {
    switch(status) {
        case 'pending': return 'warning';
        case 'shipped': return 'info';
        case 'delivered': return 'success';
        case 'cancelled': return 'error';
        default: return 'grey';
    }
};

onMounted(() => {
    // Start Live Listener
    orderStore.subscribeToAllOrders();
});

onUnmounted(() => {
    // Stop Listener
    orderStore.unsubscribeOrders();
});
</script>
