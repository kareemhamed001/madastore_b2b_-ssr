<template>
  <NuxtLink :to="`/category/${category.id}`"
    class="block overflow-hidden rounded-lg bg-white text-inherit no-underline shadow-sm transition hover:-translate-y-1 hover:shadow-md">

    <div v-if="category.banner || category.icon || category.image"
      class="h-44 w-full overflow-hidden bg-[var(--mada-soft)]">
      <img :src="category.banner || category.icon || category.image" :alt="category.name" loading="lazy"
        class="h-full w-full object-cover" />
    </div>
    <div class="p-5">
      <h3 class="mb-2 text-xl font-semibold text-[var(--mada-dark)]">{{ category.name }}</h3>
      <p v-if="category.description" class="mb-4 text-sm text-[var(--mada-muted)]">
        {{ truncateDescription(category.description) }}
      </p>
      <div class="flex items-center justify-between">
        <span v-if="category.product_count" class="text-sm font-medium text-[var(--mada-primary)]">
          {{ category.product_count }} products
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  category: {
    type: Object,
    required: true,
  },
})



function truncateDescription(text, maxLength = 100) {
  if (!text || text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}
</script>
