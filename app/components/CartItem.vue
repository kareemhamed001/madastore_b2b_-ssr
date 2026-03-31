<template>
  <div
    class="flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--mada-border)] bg-white p-4 shadow-sm transition hover:shadow-md md:flex-nowrap">
    <NuxtLink :to="`/product/${item.product.id}`"
      class="block h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--mada-soft)]">
      <img v-if="item.product.thumbnail_image" :src="item.product.thumbnail_image" :alt="localizedName" loading="lazy"
        class="h-full w-full object-cover" />
      <div v-else class="flex h-full w-full items-center justify-center text-xs text-[var(--mada-muted)]">
        #{{ item.product.id }}
      </div>
    </NuxtLink>

    <div class="order-first w-full min-w-0 flex-1 md:order-none md:w-auto">
      <NuxtLink :to="`/product/${item.product.id}`"
        class="mb-1 block text-base font-semibold text-[var(--mada-dark)] transition hover:text-[var(--mada-primary)]">
        {{ localizedName }}
      </NuxtLink>
      <p v-if="item.product.sku" class="my-0.5 text-xs text-[var(--mada-muted)]">SKU: {{ item.product.sku }}</p>
      <p v-if="item.product.barcode" class="my-0.5 text-xs text-[var(--mada-muted)]">Barcode: {{ item.product.barcode }}
      </p>
      <NuxtLink :to="`/product/${item.product.id}`"
        class="mt-2 inline-flex text-xs font-semibold text-[var(--mada-primary)] hover:underline">
        {{ t('product.viewDetails') }}
      </NuxtLink>
    </div>

    <div class="flex flex-1 items-center gap-2 md:flex-none">
      <button @click="decrementQuantity"
        class="h-8 w-8 rounded bg-[var(--mada-soft)] p-0 text-lg font-semibold text-[var(--mada-dark)] transition hover:bg-[var(--mada-border)]"
        aria-label="Decrease quantity">
        -
      </button>
      <input v-model.number="quantity" @change="handleQuantityChange" type="number" min="1"
        class="w-16 rounded border border-[var(--mada-border)] px-2 py-2 text-center text-sm focus:border-[var(--mada-primary)] focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label="Quantity" />
      <button @click="incrementQuantity"
        class="h-8 w-8 rounded bg-[var(--mada-soft)] p-0 text-lg font-semibold text-[var(--mada-dark)] transition hover:bg-[var(--mada-border)]"
        aria-label="Increase quantity">
        +
      </button>
    </div>

    <button @click="handleRemove" class="h-9 w-9 p-0 text-red-500 transition hover:text-red-700"
      aria-label="Remove item">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useLocaleStore } from '@/stores/locale'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update-quantity', 'remove'])

const cartStore = useCartStore()
const localeStore = useLocaleStore()
const t = localeStore.t

const quantity = ref(props.item.quantity)
const localizedName = computed(() => {
  return cartStore.getLocalizedProductName(props.item.product, localeStore.locale)
})

watch(() => props.item.quantity, (newQuantity) => {
  quantity.value = newQuantity
})

function handleQuantityChange() {
  if (quantity.value < 1) {
    quantity.value = 1
  }
  emit('update-quantity', props.item.product.id, quantity.value)
}

function incrementQuantity() {
  quantity.value++
  emit('update-quantity', props.item.product.id, quantity.value)
}

function decrementQuantity() {
  if (quantity.value > 1) {
    quantity.value--
    emit('update-quantity', props.item.product.id, quantity.value)
  }
}

function handleRemove() {
  emit('remove', props.item.product.id)
}
</script>
