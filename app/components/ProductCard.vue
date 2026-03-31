<template>
  <div
    class="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
    <NuxtLink :to="`/product/${product.id}`" class="block h-56 w-full overflow-hidden bg-[var(--mada-soft)]">
      <img v-if="mainImage" :src="mainImage" :alt="localizedName" loading="lazy"
        class="h-full w-full object-cover transition duration-300 hover:scale-105" />
    </NuxtLink>
    <div class="flex flex-1 flex-col p-5">
      <NuxtLink :to="`/product/${product.id}`"
        class="mb-3 text-lg font-semibold text-[var(--mada-dark)] transition hover:text-[var(--mada-primary)]">
        {{ localizedName }}
      </NuxtLink>

      <div class="mb-3 text-xs text-[var(--mada-muted)]">
        <p v-if="product.sku" class="my-1"><strong>{{ t('product.sku') }}:</strong> {{ product.sku }}</p>
        <p v-if="product.barcode" class="my-1"><strong>{{ t('product.barcode') }}:</strong> {{ product.barcode }}</p>
      </div>

      <div class="mt-auto space-y-2">
        <NuxtLink :to="`/product/${product.id}`"
          class="block w-full rounded-md border border-[var(--mada-border)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)]">
          {{ t('product.viewDetails') }}
        </NuxtLink>
        <button @click="handleAddToCart" class="w-full rounded-md px-4 py-3 text-sm font-medium text-white transition"
          :class="isInCart ? 'cursor-default bg-[var(--mada-primary)]' : 'bg-[var(--mada-primary)] hover:bg-[var(--mada-primary-hover)]'">
          {{ isInCart ? t('product.inCart') : t('product.addToCart') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useLocaleStore } from '@/stores/locale'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const cartStore = useCartStore()
const localeStore = useLocaleStore()
const t = localeStore.t

const mainImage = computed(() => {
  return props.product.thumbnail_image || props.product.image || props.product.banner || ''
})

const isInCart = computed(() => {
  return cartStore.isProductInCart(props.product.id)
})

const localizedName = computed(() => {
  return cartStore.getLocalizedProductName(props.product, localeStore.locale)
})

function handleAddToCart() {
  if (!isInCart.value) {
    cartStore.addToCart(props.product, 1)
  }
}
</script>
