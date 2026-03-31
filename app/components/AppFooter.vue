<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'

const props = defineProps({
  logo: { type: String, default: '' },
  logoAlt: { type: String, default: 'Mada Store' },
  footer: { type: Object, default: null },
})

const emit = defineEmits(['action'])

const authStore = useAuthStore()
const localeStore = useLocaleStore()

function resolveFooterInternalRoute(link) {
  const href = String(link?.href || '').trim()
  const label = String(link?.label || '').trim().toLowerCase()

  const labelRouteMap = [
    {
      test: (value) => /^(login|sign in|تسجيل الدخول)$/i.test(value),
      to: '/login',
    },
    {
      test: (value) => /(register|sign up|signup|إنشاء حساب|تسجيل جديد)/i.test(value),
      to: '/register',
    },
    {
      test: (value) => /(cart|basket|السلة)/i.test(value),
      to: '/cart',
    },
    {
      test: (value) => /(price request|price list|طلب قائمة أسعار)/i.test(value),
      to: '/price-list-request',
    },
    {
      test: (value) => /(home|الرئيسية)/i.test(value),
      to: '/',
    },
    {
      test: (value) => /(search|بحث)/i.test(value),
      to: '/search',
    },
  ]

  for (const rule of labelRouteMap) {
    if (rule.test(label)) {
      return rule.to
    }
  }

  if (!href) {
    return null
  }

  let parsedUrl
  try {
    const base = import.meta.client ? window.location.origin : 'https://madastore.net'
    parsedUrl = new URL(href, base)
  } catch {
    return null
  }

  const host = String(parsedUrl.hostname || '').toLowerCase()
  const path = String(parsedUrl.pathname || '').toLowerCase()
  const isMadastoreHost = !host || host.includes('madastore.net')

  if (!isMadastoreHost) {
    return null
  }

  const pathRouteMap = [
    {
      test: (value) => /^\/(users\/)?login\/?$/.test(value) || value === '/login',
      to: '/login',
    },
    {
      test: (value) =>
        /^\/(users\/)?(register|registration|signup)\/?$/.test(value) ||
        value === '/register',
      to: '/register',
    },
    {
      test: (value) => value === '/cart',
      to: '/cart',
    },
    {
      test: (value) => value === '/price-list-request',
      to: '/price-list-request',
    },
    {
      test: (value) => value === '/' || value === '/home',
      to: '/',
    },
    {
      test: (value) => value === '/search',
      to: '/search',
    },
  ]

  for (const rule of pathRouteMap) {
    if (rule.test(path)) {
      return rule.to
    }
  }

  return null
}

const footerSections = computed(() => {
  const sections = props.footer?.sections || []
  return sections
    .map((section) => {
      const sourceLinks = section?.links || []
      const links = sourceLinks
        .map((link) => {
          const internalRoute = resolveFooterInternalRoute(link)
          if (!internalRoute) {
            return null
          }

          const isGuestAuthRoute = internalRoute === '/login' || internalRoute === '/register'
          if (authStore.isAuthenticated && isGuestAuthRoute) {
            return null
          }

          return internalRoute
            ? {
              ...link,
              internalRoute,
              type: 'route',
            }
            : null
        })
        .filter(Boolean)

      const hadGuestAuthLinks = sourceLinks.some((link) => {
        const routePath = resolveFooterInternalRoute(link)
        return routePath === '/login' || routePath === '/register'
      })

      if (authStore.isAuthenticated && hadGuestAuthLinks) {
        links.push({
          label: localeStore.t('nav.logout'),
          action: 'logout',
          type: 'action',
        })
      }

      return {
        ...section,
        links,
      }
    })
    .filter((section) => section.links.length > 0)
})

function handleFooterAction(action) {
  emit('action', action)
}
</script>

<template>
  <footer :dir="localeStore.direction" class="mt-auto bg-[var(--mada-dark)] text-white">
    <div class="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-2 xl:grid-cols-4">
      <div>
        <img :src="logo" :alt="logoAlt" loading="lazy" class="mb-4 h-auto w-[200px] max-w-full object-contain" />
      </div>

      <div v-for="section in footerSections" :key="section.title">
        <h4 class="mb-4 text-xl font-semibold">{{ section.title }}</h4>
        <ul class="space-y-2 text-sm text-white/75">
          <li v-for="(link, idx) in section.links" :key="`${section.title}-${link.label}-${idx}`">
            <NuxtLink v-if="link.type === 'route'" class="transition hover:text-white" :to="link.internalRoute">
              {{ link.label }}
            </NuxtLink>
            <button v-else type="button" class="transition hover:text-white" @click="handleFooterAction(link.action)">
              {{ link.label }}
            </button>
          </li>
        </ul>
      </div>

      <div>
        <h4 class="mb-4 text-xl font-semibold">{{ localeStore.t('app.footerContact') }}</h4>
        <ul class="space-y-3 text-sm text-white/75">
          <li v-for="address in footer?.contact?.addresses || []" :key="address">{{ address }}</li>
          <li>{{ footer?.contact?.phone }}</li>
          <li>
            <a class="transition hover:text-white" :href="`mailto:${footer?.contact?.email}`">
              {{ footer?.contact?.email }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="mx-auto w-full max-w-7xl border-t border-white/30 px-4 py-5 text-center text-sm text-white/75">
      <p><b v-html="footer?.copyright"></b> © <b v-html="footer?.year"></b></p>
    </div>
    <div class="h-6 w-full bg-[var(--mada-primary)]"></div>
  </footer>
</template>
