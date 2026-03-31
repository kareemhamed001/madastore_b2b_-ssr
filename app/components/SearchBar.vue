<template>
  <div class="mx-auto w-full max-w-3xl">
    <form @submit.prevent="handleSubmit" class="flex gap-2">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search products by name, SKU, or barcode..."
        class="flex-1 rounded-lg border-2 border-[var(--mada-border)] px-5 py-3 text-sm md:text-base focus:border-[var(--mada-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--mada-primary)]/20"
        aria-label="Search products"
      />
      <button
        type="submit"
        class="flex items-center justify-center rounded-lg bg-[var(--mada-primary)] px-5 py-3 text-white transition hover:bg-[var(--mada-primary-hover)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span class="sr-only">Search</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  initialQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['search'])

const searchQuery = ref(props.initialQuery)

onMounted(() => {
  searchQuery.value = props.initialQuery
})

function handleSubmit() {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value.trim())
  }
}
</script>
