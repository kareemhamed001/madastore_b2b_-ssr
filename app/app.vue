<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'
import { useSiteConfig } from '@/composables/useSiteConfig'
import { useNavigationLoader } from '@/composables/useNavigationLoader'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import AppTopBar from '@/components/AppTopBar.vue'
import madastoreLogo from '@/assets/madastore-logo.svg'
import madastoreFooterLogo from '@/assets/madastore-footer-logo.png'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const localeStore = useLocaleStore()
const { isNavigationLoading } = useNavigationLoader()
const headerSearchQuery = ref('')
const appBootLoading = ref(true)
const year = new Date().getFullYear()

const defaults = {
  branding: {
    logo: {
      header: {
        svg_url: madastoreLogo,
        png_url: madastoreLogo,
        alt: 'Madastore',
      },
      footer: {
        png_url: madastoreFooterLogo,
        alt: 'Mada Store',
      },
      favicon_url: '',
    },
    colors: {
      primary: '#068AE8',
      primary_hover: '#0577C6',
      dark: '#242424',
      background: '#FDFDFD',
      surface: '#FFFFFF',
      soft: '#F6F6F6',
      border: '#E5E5E5',
      muted: '#6B6B6B',
    },
    typography: {
      font_family: 'Cairo, sans-serif',
      font_url: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap',
    },
    banners: {
      top_bar_text: '',
    },
  },
  footer: {
    sections: [
      {
        title: 'الحساب',
        links: [
          { label: 'تسجيل الدخول', href: 'https://madastore.net/users/login' },
          { label: 'سجل الطلب', href: 'https://madastore.net/purchase_history' },
          { label: 'قائمة أمنياتي', href: 'https://madastore.net/wishlists' },
          { label: 'تتبع الطلب', href: 'https://madastore.net/track-your-order' },
          { label: 'المدونه', href: 'https://madastore.net/blog' },
          { label: 'كن شريكًا تابعًا', href: 'https://madastore.net/affiliate/apply-form' },
          { label: 'التقدم لوظيفة', href: 'https://madastore.net/job-application' },
        ],
      },
      {
        title: 'الدعم والمساعدة',
        links: [
          { label: 'من نحن', href: 'https://madastore.net/pages/about' },
          { label: 'سياسة الخصوصية', href: 'https://madastore.net/privacypolicy' },
          { label: 'الشروط والأحكام', href: 'https://madastore.net/terms' },
          { label: 'سياسة الاسترجاع والاستبدال', href: 'https://madastore.net/returnpolicy' },
          { label: 'سياسة الشحن والتوصيل', href: 'https://madastore.net/supportpolicy' },
        ],
      },
    ],
    contact: {
      addresses: [
        'عنوان الإدارة : 4 شارع مطر متفرع من جوزيف تيتو , النزهة , القاهرة',
        'عنوان المصنع : 25 شارع إبراهيم أبو النجا , متفرع من شارع مؤسسة الزكاة , خلف نادي أبو صير , القاهرة',
      ],
      phone: '01015535855',
      email: 'help@madastore.net',
    },
    social: [
      { label: 'Facebook', href: 'https://www.facebook.com/madastore.eg' },
      { label: 'X', href: 'https://twitter.com/madastoreeg' },
      { label: 'Instagram', href: 'https://www.instagram.com/madastore.eg/' },
      { label: 'YouTube', href: 'https://www.youtube.com/channel/UCmn2Zyt7IHhGDOlO3tROgmA' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/madastoreeg/' },
      { label: 'TikTok', href: 'https://www.tiktok.com/@madastore.eg' },
      { label: 'Pinterest', href: 'https://www.pinterest.com/madastoreeg' },
    ],
    apps: {
      google_play: 'https://play.google.com/store/apps/details?id=net.madastore.www&pli=1',
      app_store: 'https://apps.apple.com/eg/app/mada-store/id6450849226',
      google_play_badge: 'https://madastore.net/assets/img/play.png',
      app_store_badge: 'https://madastore.net/assets/img/app.png',
    },
    copyright: 'جميع الحقوق محفوظة لموقع مدى ستور',
    year,
  },
}

const { branding, footer, load, loading: siteConfigLoading } = useSiteConfig(defaults)

const showTopProgress = computed(() => {
  return appBootLoading.value || siteConfigLoading.value || isNavigationLoading.value
})

const headerLogo = computed(() => {
  return branding.value?.logo?.header?.svg_url || branding.value?.logo?.header?.png_url || madastoreLogo
})

const headerLogoAlt = computed(() => {
  return branding.value?.logo?.header?.alt || 'Madastore'
})

const footerLogo = computed(() => {
  return branding.value?.logo?.footer?.png_url || madastoreFooterLogo
})

const footerLogoAlt = computed(() => {
  return branding.value?.logo?.footer?.alt || 'Mada Store'
})

onMounted(async () => {
  appBootLoading.value = true
  await Promise.allSettled([
    load(localeStore.locale),
    authStore.initialize(),
  ])
  appBootLoading.value = false
})

watch(
  () => route.fullPath,
  () => {
    if (String(route.path || '').startsWith('/search')) {
      headerSearchQuery.value = typeof route.query.q === 'string' ? route.query.q : ''
      return
    }
    headerSearchQuery.value = ''
  },
  { immediate: true },
)

watch(
  () => localeStore.locale,
  async (nextLocale) => {
    await load(nextLocale)
    if (authStore.isAuthenticated) {
      try {
        await authStore.fetchProfile()
      } catch {
        // Keep current session if profile endpoint is unavailable.
      }
    }
  },
)

async function handleLogout() {
  await authStore.logout()
  if (route.meta?.requiresAuth) {
    router.push('/')
  }
}

function handleHeaderSearch(query) {
  const trimmed = (typeof query === 'string' ? query : headerSearchQuery.value).trim()
  if (!trimmed) {
    router.push('/search')
    return
  }
  router.push({
    path: '/search',
    query: { q: trimmed },
  })
}

function handleFooterAction(action) {
  if (action === 'logout') {
    handleLogout()
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[var(--mada-bg)] text-[var(--mada-dark)]" :dir="localeStore.direction">
    <!-- Progress bar -->
    <div class="pointer-events-none fixed inset-x-0 top-0 z-[90] h-1 overflow-hidden transition-opacity duration-200"
      :class="showTopProgress ? 'opacity-100' : 'opacity-0'">
      <div
        class="h-full w-[28%] rounded-r-full bg-gradient-to-r from-[var(--mada-primary)] via-cyan-400 to-[var(--mada-primary-hover)] shadow-[0_0_16px_rgba(6,138,232,0.55)] animate-[mada_loader_slide_1.1s_ease-in-out_infinite]" />
    </div>

    <!-- Boot loading overlay -->
    <transition name="mada-loader-fade">
      <div v-if="appBootLoading"
        class="fixed inset-0 z-[95] grid place-items-center bg-[var(--mada-bg)]/90 backdrop-blur-sm">
        <div
          class="flex items-center gap-3 rounded-2xl border border-[var(--mada-border)] bg-white px-5 py-4 shadow-xl">
          <span
            class="h-6 w-6 animate-spin rounded-full border-2 border-[var(--mada-border)] border-t-[var(--mada-primary)]" />
          <span class="text-sm font-semibold text-[var(--mada-dark)]">
            {{ localeStore.t('common.loading') }}
          </span>
        </div>
      </div>
    </transition>

    <AppTopBar :branding="branding" />

    <AppHeader v-model:search-query="headerSearchQuery" :logo="headerLogo" :logo-alt="headerLogoAlt"
      @search="handleHeaderSearch" @logout="handleLogout" @toggle-locale="localeStore.toggleLocale()" />

    <main class="flex-1">
      <NuxtPage :key="localeStore.locale" />
    </main>

    <AppFooter :logo="footerLogo" :logo-alt="footerLogoAlt" :footer="footer" @action="handleFooterAction" />
  </div>
</template>
