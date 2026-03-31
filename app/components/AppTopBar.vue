<script setup>
import { computed } from 'vue'
import { useLocaleStore } from '@/stores/locale'

const props = defineProps({
  branding: { type: Object, default: null },
})

const localeStore = useLocaleStore()

const topBarText = computed(() => {
  return props.branding?.banners?.top_bar_text || localeStore.t('app.topBarDefault')
})

const topBarItems = computed(() => {
  const source = String(topBarText.value || '').trim()
  if (!source) {
    return [localeStore.t('app.topBarDefault')]
  }

  const parsed = source
    .split(/[\n|•]+/)
    .map((item) => item.trim())
    .filter(Boolean)

  return parsed.length > 0 ? parsed : [source]
})

const marqueeTrackClass = computed(() => {
  return localeStore.isArabic ? 'mada-marquee-track-rtl' : 'mada-marquee-track-ltr'
})
</script>

<template>
  <div class="bg-[var(--mada-primary)] px-2 py-2 text-xs font-semibold text-white sm:text-sm">
    <div class="relative overflow-hidden">
      <div class="mada-marquee-track" :class="marqueeTrackClass">
        <div class="mada-marquee-segment">
          <span
            v-for="(item, index) in topBarItems"
            :key="`top-bar-item-a-${index}-${item}`"
            class="inline-flex shrink-0 items-center gap-3 px-5"
          >
            <span class="whitespace-nowrap">{{ item }}</span>
            <span class="h-1.5 w-1.5 rounded-full bg-white/70"></span>
          </span>
        </div>
        <div class="mada-marquee-segment" aria-hidden="true">
          <span
            v-for="(item, index) in topBarItems"
            :key="`top-bar-item-b-${index}-${item}`"
            class="inline-flex shrink-0 items-center gap-3 px-5"
          >
            <span class="whitespace-nowrap">{{ item }}</span>
            <span class="h-1.5 w-1.5 rounded-full bg-white/70"></span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
