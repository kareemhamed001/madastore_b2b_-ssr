<template>
  <li class="m-0 list-none">
    <div class="flex items-center gap-2 py-2" @click="toggleExpanded">
      <button v-if="hasChildren"
        class="flex h-6 w-6 items-center justify-center p-0 text-[var(--mada-muted)] transition hover:text-[var(--mada-dark)]"
        :aria-expanded="isExpanded" aria-label="Toggle category">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 transition"
          :class="{ 'rotate-90': isExpanded }">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
      <span v-else class="w-6"></span>

      <NuxtLink :to="`/category/${category.id}`"
        class="font-medium text-[var(--mada-dark)] transition hover:text-[var(--mada-primary)] hover:underline">
        {{ category.name }}
      </NuxtLink>

      <span v-if="category.product_count" class="ml-1 text-sm text-[var(--mada-muted)]">
        ({{ category.product_count }})
      </span>
    </div>

    <ul v-if="hasChildren && isExpanded" class="m-0 ml-6 list-none border-l border-[var(--mada-border)] pl-6">
      <CategoryTreeItem v-for="child in category.children" :key="child.id" :category="child" />
    </ul>
  </li>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  category: {
    type: Object,
    required: true,
  },
})

const isExpanded = ref(false)

const hasChildren = computed(() => {
  return props.category.children && props.category.children.length > 0
})

function toggleExpanded() {
  if (hasChildren.value) {
    isExpanded.value = !isExpanded.value
  }
}
</script>
