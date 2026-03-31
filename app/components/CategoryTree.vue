<template>
  <div class="w-full">
    <ul class="m-0 list-none p-0">
      <CategoryTreeItem
        v-for="category in categories"
        :key="category.id"
        :category="category"
      />
    </ul>
  </div>
</template>

<script setup>
import CategoryTreeItem from './CategoryTreeItem.vue'

defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
})
</script>
