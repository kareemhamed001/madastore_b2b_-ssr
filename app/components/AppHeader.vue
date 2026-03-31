<script setup>
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'
import { useClickOutside } from '@/composables/useClickOutside'

const props = defineProps({
  logo: { type: String, default: '' },
  logoAlt: { type: String, default: 'Madastore' },
})

const searchQuery = defineModel('searchQuery', { type: String, default: '' })

const emit = defineEmits(['search', 'logout', 'toggle-locale'])

const cartStore = useCartStore()
const authStore = useAuthStore()
const localeStore = useLocaleStore()
const isUserMenuOpen = ref(false)
const userMenuRef = useClickOutside(() => {
  isUserMenuOpen.value = false
})

function handleSearch() {
  emit('search', searchQuery.value)
}

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

function closeUserMenu() {
  isUserMenuOpen.value = false
}

function handleLogout() {
  closeUserMenu()
  emit('logout')
}
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-[var(--mada-border)] bg-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-xl">
    <div class="mx-auto w-full max-w-7xl px-4 py-3">
      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="inline-flex w-[150px] items-center no-underline md:w-[190px]">
          <img :src="logo" :alt="logoAlt" class="h-auto w-full object-contain" />
        </NuxtLink>

        <form
          class="hidden max-w-xl flex-1 items-center gap-2 rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)] p-1.5 lg:flex"
          @submit.prevent="handleSearch">
          <input v-model.trim="searchQuery" type="search" :placeholder="localeStore.t('nav.searchProductsPlaceholder')"
            class="w-full border-0 bg-transparent px-2 py-1 text-sm text-[var(--mada-dark)] outline-none placeholder:text-[var(--mada-muted)]" />
          <button type="submit"
            class="rounded-lg bg-[var(--mada-primary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--mada-primary-hover)]">
            {{ localeStore.t('nav.search') }}
          </button>
        </form>

        <div class="ms-auto flex items-center gap-2">
          <NuxtLink to="/cart"
            class="relative inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--mada-border)] bg-white px-3 text-xs font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)] md:text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 md:h-5 md:w-5">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span class="hidden sm:inline">{{ localeStore.t('nav.cart') }}</span>
            <span v-if="cartStore.itemCount > 0"
              class="absolute -right-2 -top-2 min-w-5 rounded-full bg-[var(--mada-primary)] px-1.5 py-0.5 text-center text-xs font-semibold text-white">
              {{ cartStore.itemCount }}
            </span>
          </NuxtLink>

          <button type="button"
            class="h-9 rounded-lg border border-[var(--mada-border)] bg-white px-2.5 text-xs font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)] md:text-sm"
            @click="$emit('toggle-locale')">
            {{ localeStore.languageLabel }}
          </button>
        </div>
      </div>

      <div class="mt-3 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <form
          class="flex items-center gap-2 rounded-xl border border-[var(--mada-border)] bg-[var(--mada-soft)] p-1.5 lg:hidden"
          @submit.prevent="handleSearch">
          <input v-model.trim="searchQuery" type="search" :placeholder="localeStore.t('nav.searchProductsPlaceholder')"
            class="w-full border-0 bg-transparent px-2 py-1 text-sm text-[var(--mada-dark)] outline-none placeholder:text-[var(--mada-muted)]" />
          <button type="submit"
            class="rounded-lg bg-[var(--mada-primary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--mada-primary-hover)]">
            {{ localeStore.t('nav.search') }}
          </button>
        </form>

        <nav class="flex flex-wrap items-center gap-2">
          <NuxtLink to="/"
            class="rounded-full border border-transparent px-3 py-1.5 text-sm font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-border)] hover:bg-white hover:text-[var(--mada-primary)] [&.router-link-active]:border-[var(--mada-primary)] [&.router-link-active]:bg-[var(--mada-soft)] [&.router-link-active]:text-[var(--mada-primary)]">
            {{ localeStore.t('nav.home') }}
          </NuxtLink>
          <NuxtLink to="/price-list-requests/create"
            class="rounded-full border border-transparent px-3 py-1.5 text-sm font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-border)] hover:bg-white hover:text-[var(--mada-primary)] [&.router-link-active]:border-[var(--mada-primary)] [&.router-link-active]:bg-[var(--mada-soft)] [&.router-link-active]:text-[var(--mada-primary)]">
            {{ localeStore.t('nav.priceRequest') }}
          </NuxtLink>
          <NuxtLink to="/search"
            class="rounded-full border border-transparent px-3 py-1.5 text-sm font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-border)] hover:bg-white hover:text-[var(--mada-primary)] [&.router-link-active]:border-[var(--mada-primary)] [&.router-link-active]:bg-[var(--mada-soft)] [&.router-link-active]:text-[var(--mada-primary)]">
            {{ localeStore.t('nav.search') }}
          </NuxtLink>

          <div v-if="authStore.isAuthenticated" ref="userMenuRef" class="relative ms-auto">
            <button type="button"
              class="inline-flex items-center gap-2 rounded-full border border-[var(--mada-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)] md:text-sm"
              :aria-expanded="isUserMenuOpen" aria-haspopup="menu" @click="toggleUserMenu">
              <span class="max-w-[130px] truncate">{{ authStore.userName }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 transition"
                :class="isUserMenuOpen ? 'rotate-180' : ''">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <div v-if="isUserMenuOpen"
              class="absolute end-0 top-[calc(100%+0.5rem)] z-50 min-w-[210px] overflow-hidden rounded-2xl border border-[var(--mada-border)] bg-white p-2 shadow-xl">
              <NuxtLink to="/profile"
                class="block rounded-xl px-3 py-2 text-sm font-semibold text-[var(--mada-dark)] transition hover:bg-[var(--mada-soft)] hover:text-[var(--mada-primary)]"
                @click="closeUserMenu">
                {{ localeStore.t('nav.profile') }}
              </NuxtLink>
              <NuxtLink to="/price-list-requests"
                class="block rounded-xl px-3 py-2 text-sm font-semibold text-[var(--mada-dark)] transition hover:bg-[var(--mada-soft)] hover:text-[var(--mada-primary)]"
                @click="closeUserMenu">
                {{ localeStore.t('nav.priceRequests') }}
              </NuxtLink>
              <NuxtLink to="/orders"
                class="block rounded-xl px-3 py-2 text-sm font-semibold text-[var(--mada-dark)] transition hover:bg-[var(--mada-soft)] hover:text-[var(--mada-primary)]"
                @click="closeUserMenu">
                {{ localeStore.t('nav.orders') }}
              </NuxtLink>
              <button type="button"
                class="mt-1 block w-full rounded-xl px-3 py-2 text-start text-sm font-semibold text-[var(--mada-dark)] transition hover:bg-[var(--mada-soft)] hover:text-[var(--mada-primary)]"
                @click="handleLogout">
                {{ localeStore.t('nav.logout') }}
              </button>
            </div>
          </div>

          <div v-else class="ms-auto flex items-center gap-2">
            <NuxtLink to="/login"
              class="rounded-full border border-[var(--mada-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--mada-dark)] transition hover:border-[var(--mada-primary)] hover:text-[var(--mada-primary)] md:text-sm">
              {{ localeStore.t('nav.login') }}
            </NuxtLink>
            <NuxtLink to="/register"
              class="rounded-full bg-[var(--mada-primary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--mada-primary-hover)] md:text-sm">
              {{ localeStore.t('nav.register') }}
            </NuxtLink>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>
