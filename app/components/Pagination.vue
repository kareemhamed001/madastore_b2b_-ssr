<template>
  <nav v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-1 px-0 py-4 md:gap-2">
    <button
      @click="goToPage(1)"
      :disabled="currentPage === 1"
      class="flex h-9 min-w-9 items-center justify-center rounded-md border border-[var(--mada-border)] bg-white px-2 text-xs text-[var(--mada-dark)] transition hover:bg-[var(--mada-soft)] disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:min-w-10 md:text-sm"
      aria-label="Go to first page"
    >
      &laquo;
    </button>

    <button
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage === 1"
      class="flex h-9 min-w-9 items-center justify-center rounded-md border border-[var(--mada-border)] bg-white px-2 text-xs text-[var(--mada-dark)] transition hover:bg-[var(--mada-soft)] disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:min-w-10 md:text-sm"
      aria-label="Go to previous page"
    >
      &lsaquo;
    </button>

    <button
      v-for="page in visiblePages"
      :key="page"
      @click="goToPage(page)"
      :class="[
        'flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-xs transition md:h-10 md:min-w-10 md:text-sm',
        page === currentPage
          ? 'border-[var(--mada-primary)] bg-[var(--mada-primary)] font-semibold text-white'
          : 'border-[var(--mada-border)] bg-white text-[var(--mada-dark)] hover:bg-[var(--mada-soft)]',
      ]"
      :aria-label="`Go to page ${page}`"
      :aria-current="page === currentPage ? 'page' : undefined"
    >
      {{ page }}
    </button>

    <button
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="flex h-9 min-w-9 items-center justify-center rounded-md border border-[var(--mada-border)] bg-white px-2 text-xs text-[var(--mada-dark)] transition hover:bg-[var(--mada-soft)] disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:min-w-10 md:text-sm"
      aria-label="Go to next page"
    >
      &rsaquo;
    </button>

    <button
      @click="goToPage(totalPages)"
      :disabled="currentPage === totalPages"
      class="flex h-9 min-w-9 items-center justify-center rounded-md border border-[var(--mada-border)] bg-white px-2 text-xs text-[var(--mada-dark)] transition hover:bg-[var(--mada-soft)] disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:min-w-10 md:text-sm"
      aria-label="Go to last page"
    >
      &raquo;
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  maxVisiblePages: {
    type: Number,
    default: 5,
  },
})

const emit = defineEmits(['page-change'])

const visiblePages = computed(() => {
  const pages = []
  const half = Math.floor(props.maxVisiblePages / 2)

  let start = Math.max(1, props.currentPage - half)
  let end = Math.min(props.totalPages, start + props.maxVisiblePages - 1)

  if (end - start < props.maxVisiblePages - 1) {
    start = Math.max(1, end - props.maxVisiblePages + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

function goToPage(page) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}
</script>
