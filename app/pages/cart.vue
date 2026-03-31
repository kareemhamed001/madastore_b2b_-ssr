<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-8">
    <header class="mb-12 text-center">
      <h1 class="mb-2 text-3xl font-bold text-[var(--mada-dark)] md:text-4xl">{{ t('cart.title') }}</h1>
      <p class="text-base text-[var(--mada-muted)] md:text-lg">
        {{ t('cart.subtitle') }}
      </p>
    </header>

    <div v-if="cartStore.itemCount === 0" class="px-4 py-16 text-center">
      <p class="mb-6 text-xl text-[var(--mada-muted)]">{{ t('cart.empty') }}</p>
      <router-link to="/"
        class="inline-block rounded-md bg-[var(--mada-primary)] px-6 py-3 text-white transition hover:bg-[var(--mada-primary-hover)]">
        {{ t('common.browseCategories') }}
      </router-link>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          <h2 class="mb-6 text-2xl font-semibold text-[var(--mada-dark)]">
            {{ t('cart.cartItemsSummary', { products: cartStore.uniqueProductCount, items: cartStore.itemCount }) }}
          </h2>

          <div class="flex flex-col gap-4">
            <CartItem v-for="item in cartStore.cartItems" :key="item.product.id" :item="item"
              @update-quantity="handleUpdateQuantity" @remove="handleRemoveItem" />
          </div>

          <button @click="handleClearCart"
            class="mt-6 rounded-md bg-[var(--mada-soft)] px-8 py-3 font-medium text-[var(--mada-dark)] transition hover:bg-[var(--mada-border)]">
            {{ t('cart.clearCart') }}
          </button>
        </div>

        <aside class="h-fit rounded-2xl border border-[var(--mada-border)] bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <p class="text-sm font-semibold text-[var(--mada-muted)]">{{ t('cart.readyToSubmit') }}</p>
          <p class="mt-2 text-2xl font-bold text-[var(--mada-dark)]">{{ cartStore.itemCount }}</p>
          <p class="text-xs text-[var(--mada-muted)]">{{ t('cart.itemsLabel') }}</p>

          <button @click="handleRequestPriceList"
            class="mt-4 w-full rounded-md bg-[var(--mada-primary)] px-6 py-3 font-medium text-white transition hover:bg-[var(--mada-primary-hover)]">
            {{ t('cart.requestPriceList') }}
          </button>

          <router-link to="/"
            class="mt-3 inline-flex w-full items-center justify-center rounded-md border border-[var(--mada-border)] bg-[var(--mada-soft)] px-6 py-3 text-sm font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)]">
            {{ t('cart.continueBrowsing') }}
          </router-link>

          <div class="mt-4 rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)] p-3">
            <p class="text-xs font-semibold text-[var(--mada-dark)]">{{ t('cart.nextStepsTitle') }}</p>
            <p class="mt-1 text-xs leading-6 text-[var(--mada-muted)]">{{ t('cart.nextStepsText') }}</p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useLocaleStore } from '@/stores/locale'
import CartItem from '@/components/CartItem.vue'

const router = useRouter()
const cartStore = useCartStore()
const localeStore = useLocaleStore()
const t = localeStore.t

function handleUpdateQuantity(productId, quantity) {
  cartStore.updateQuantity(productId, quantity)
}

function handleRemoveItem(productId) {
  if (confirm(t('cart.confirmRemove'))) {
    cartStore.removeFromCart(productId)
  }
}

function handleClearCart() {
  if (confirm(t('cart.confirmClear'))) {
    cartStore.clearCart()
  }
}

function handleRequestPriceList() {
  router.push('/price-list-requests/create')
}
</script>
