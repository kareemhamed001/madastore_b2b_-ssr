<template>
  <div class="w-full">
    <div v-if="loading" class="px-4 py-12 text-center text-[var(--mada-muted)]">
      <p>Loading products...</p>
    </div>

    <div v-else-if="products.length === 0" class="px-4 py-12 text-center text-[var(--mada-muted)]">
      <p>{{ emptyMessage || 'No products found.' }}</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>

<script setup>
import ProductCard from './ProductCard.vue'

defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyMessage: {
    type: String,
    default: '',
  },
})
</script>
