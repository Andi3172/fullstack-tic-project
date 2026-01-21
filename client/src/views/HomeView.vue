<template>
  <div class="home-container">
    <!-- Parallax Hero Section -->
    <div class="parallax-hero d-flex align-center justify-center text-center">
      <div class="hero-content">
        <h1 class="text-h2 font-weight-black text-white mb-4 text-shadow-lg">
          BUILD YOUR DREAM MACHINE
        </h1>
        <p class="text-h5 text-white mb-8 text-shadow-md">
          Premium components for the ultimate gaming experience.
        </p>
        <v-btn
          to="/shop"
          color="secondary"
          size="x-large"
          elevation="8"
          class="font-weight-bold px-8"
        >
          SHOP NOW
        </v-btn>
      </div>
    </div>

    <!-- Featured Section -->
    <v-container class="py-16">
      <v-row>
        <v-col cols="12" class="text-center mb-8">
          <h2 class="text-h3 font-weight-bold text-primary">Explore Categories</h2>
          <div class="divider mx-auto mt-4 bg-secondary"></div>
        </v-col>
      </v-row>
      
      <v-row justify="center">
        <v-col cols="12" sm="6" md="3" v-for="category in categories" :key="category.title">
           <v-card 
             class="rounded-lg elevation-4 h-100 hover-card" 
             :to="category.link"
           >
             <v-img 
               height="200" 
               :src="category.image" 
               cover
               class="align-end"
               gradient="to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%"
             >
               <v-card-title class="text-white font-weight-bold">{{ category.title }}</v-card-title>
             </v-img>
             <v-card-text class="pt-4">
               {{ category.subtitle }}
             </v-card-text>
           </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
const categories = [
  {
    image: 'https://cdn.mos.cms.futurecdn.net/uAAwJgqRrDBpWsWdvncSjd-650-80.jpg.webp',
    title: 'Graphics Cards',
    subtitle: 'RTX 4090 & 50 Series Ready',
    link: '/shop?category=video-card'
  },
  {
    image: 'https://images.unsplash.com/photo-1611275484976-52812441218a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Processors',
    subtitle: 'Ryzen 9000 & Intel Ultra',
    link: '/shop?category=cpu'
  },
  {
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670',
    title: 'Motherboards',
    subtitle: 'High Performance AM5 & LGA1851',
    link: '/shop?category=motherboard'
  },
  {
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?q=80&w=2669',
    title: 'Memory',
    subtitle: 'DDR5 & NVMe Gen 5',
    link: '/shop?category=memory'
  }
];
</script>

<style scoped>
.home-container {
  overflow-x: hidden;
}

.parallax-hero {
  height: 90vh;
  background-image: url('https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=2574');
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
}

.parallax-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.hero-content {
  position: relative;
  z-index: 1;
}

.text-shadow-lg {
  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
}

.text-shadow-md {
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}

.divider {
  width: 80px;
  height: 4px;
}

.hover-card {
  transition: transform 0.3s ease-in-out;
}

.hover-card:hover {
  transform: translateY(-5px);
}
</style>
